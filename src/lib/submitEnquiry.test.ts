import { describe, expect, it, vi } from "vitest";
import {
  type EnquiryFormData,
  generateEnquiryMailto,
  isValidAustralianPhone,
  isValidEmail,
  submitEnquiry,
  validateEnquiryForm,
} from "./submitEnquiry";

const RECIPIENT = "info@example.com.au";

const valid = (overrides: Partial<EnquiryFormData> = {}): EnquiryFormData => ({
  fullName: "Jordan Smith",
  phone: "0412 345 678",
  email: "jordan@example.com",
  role: "participant",
  planType: "plan",
  serviceOfInterest: "Supported Independent Living (SIL)",
  ndisNumber: "",
  preferredContact: "phone",
  message: "I would like to talk about daily living supports.",
  consent: true,
  honeypot: "",
  ...overrides,
});

describe("isValidAustralianPhone", () => {
  it.each([
    "0412 345 678",
    "0412345678",
    "(02) 9876 5432",
    "02 9876 5432",
    "+61 412 345 678",
    "61412345678",
    "1300 123 456",
    "1800 035 544",
    "0412-345-678",
  ])("accepts %s", (n) => expect(isValidAustralianPhone(n)).toBe(true));

  it.each(["", "12345", "0512 345 678", "0412 345 67", "+1 415 555 0100", "phone"])("rejects %s", (n) =>
    expect(isValidAustralianPhone(n)).toBe(false),
  );
});

describe("isValidEmail", () => {
  it("accepts a normal address, ignoring surrounding spaces", () => {
    expect(isValidEmail("  name@example.com.au ")).toBe(true);
  });
  it.each(["", "name", "name@", "name@example", "a b@example.com"])("rejects %s", (e) => expect(isValidEmail(e)).toBe(false));
});

describe("validateEnquiryForm", () => {
  it("passes a complete enquiry", () => {
    expect(validateEnquiryForm(valid())).toEqual({});
  });

  it("flags every required field on an empty form", () => {
    const errors = validateEnquiryForm(
      valid({ fullName: "", phone: "", email: "", role: "", planType: "", serviceOfInterest: "", message: "", consent: false }),
    );
    expect(Object.keys(errors).sort()).toEqual(
      ["consent", "email", "fullName", "message", "phone", "planType", "role", "serviceOfInterest"].sort(),
    );
  });

  it("requires a message of at least 10 characters", () => {
    expect(validateEnquiryForm(valid({ message: "too short" })).message).toBeDefined();
  });
});

describe("generateEnquiryMailto", () => {
  it("addresses the recipient and encodes the body", () => {
    const url = generateEnquiryMailto(valid({ message: "Needs & goals: 50% more support?" }), RECIPIENT);
    expect(url.startsWith(`mailto:${RECIPIENT}?subject=`)).toBe(true);
    const body = decodeURIComponent(url.split("&body=")[1]);
    expect(body).toContain("Needs & goals: 50% more support?");
    expect(body).toContain("Phone: 0412 345 678");
  });
});

describe("submitEnquiry", () => {
  it("silently ignores bots that fill the honeypot and sends nothing", async () => {
    const fetchImpl = vi.fn();
    const result = await submitEnquiry(valid({ honeypot: "http://spam" }), { recipient: RECIPIENT, endpoint: "https://x", fetchImpl });
    expect(result.delivery).toBe("ignored");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns validation errors without sending", async () => {
    const fetchImpl = vi.fn();
    const result = await submitEnquiry(valid({ email: "bad" }), { recipient: RECIPIENT, endpoint: "https://x", fetchImpl });
    expect(result.success).toBe(false);
    expect(result.errors?.email).toBeDefined();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("falls back to mailto when no endpoint is configured", async () => {
    const result = await submitEnquiry(valid(), { recipient: RECIPIENT, endpoint: "" });
    expect(result.delivery).toBe("mailto");
    expect(result.mailtoUrl).toContain(RECIPIENT);
  });

  it("reports sent only when the endpoint returns 2xx, and never posts the honeypot", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    const result = await submitEnquiry(valid(), { recipient: RECIPIENT, endpoint: "https://forms.example/f", fetchImpl });
    expect(result.delivery).toBe("sent");
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://forms.example/f");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).not.toHaveProperty("honeypot");
  });

  it("falls back to mailto on a non-2xx response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    const result = await submitEnquiry(valid(), { recipient: RECIPIENT, endpoint: "https://forms.example/f", fetchImpl });
    expect(result.delivery).toBe("mailto");
    expect(result.message).toContain("500");
  });

  it("falls back to mailto on a network error", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const result = await submitEnquiry(valid(), { recipient: RECIPIENT, endpoint: "https://forms.example/f", fetchImpl });
    expect(result.delivery).toBe("mailto");
  });

  it("aborts a hung request after the timeout and falls back to mailto", async () => {
    const fetchImpl = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        }),
    );
    const result = await submitEnquiry(valid(), {
      recipient: RECIPIENT,
      endpoint: "https://forms.example/f",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      timeoutMs: 20,
    });
    expect(result.delivery).toBe("mailto");
  });
});
