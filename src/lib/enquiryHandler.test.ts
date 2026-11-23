import { describe, expect, it, vi } from "vitest";
import { BUSINESS_EMAIL } from "../content/contact";
import { buildEnquiryEmail, handleEnquiry, MAX_BODY_BYTES, parseEnquiry, RATE_LIMIT, type OutgoingEmail } from "./enquiryHandler";
import { FEEDBACK_OPTION } from "./submitEnquiry";

const URL_ = "https://empowerwellsupport.com.au/api/enquiry";
const valid = {
  fullName: "Jordan Smith",
  phone: "0412 345 678",
  email: "jordan@example.com",
  role: "participant",
  planType: "plan",
  serviceOfInterest: "Community Participation",
  ndisNumber: "430000000",
  preferredContact: "phone",
  message: "I would like to know more about community support.",
  consent: true,
  honeypot: "",
};

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request(URL_, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://empowerwellsupport.com.au", "X-Forwarded-For": "203.0.113.9", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function deps(overrides: Partial<Parameters<typeof handleEnquiry>[1]> = {}) {
  const sent: OutgoingEmail[] = [];
  const send = vi.fn(async (e: OutgoingEmail) => {
    sent.push(e);
  });
  return { sent, send, d: { send, configured: true, rateStore: new Map<string, number[]>(), now: () => new Date("2026-11-23T01:00:00Z"), ...overrides } };
}

describe("handleEnquiry", () => {
  it("emails a valid enquiry to the business inbox and returns 200", async () => {
    const { d, sent } = deps();
    const res = await handleEnquiry(post(valid), d);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe(BUSINESS_EMAIL);
    expect(sent[0].from).toBe(BUSINESS_EMAIL);
    expect(sent[0].replyTo).toBe("jordan@example.com");
    expect(sent[0].subject).toBe("New website enquiry: Jordan Smith (Community Participation)");
    expect(sent[0].text).toContain("Phone: 0412 345 678");
  });

  it("rejects other methods, cross-site origins and non-JSON bodies", async () => {
    const { d, send } = deps();
    expect((await handleEnquiry(new Request(URL_), d)).status).toBe(405);
    expect((await handleEnquiry(post(valid, { Origin: "https://evil.example" }), d)).status).toBe(403);
    expect((await handleEnquiry(post(valid, { "Content-Type": "text/plain" }), d)).status).toBe(415);
    expect((await handleEnquiry(post("{not json"), d)).status).toBe(400);
    expect((await handleEnquiry(post([1, 2]), d)).status).toBe(400);
    expect((await handleEnquiry(post({ ...valid, message: "x".repeat(MAX_BODY_BYTES) }), d)).status).toBe(413);
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 422 with field errors for an invalid enquiry", async () => {
    const { d, send } = deps();
    const res = await handleEnquiry(post({ ...valid, phone: "123", consent: false }), d);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.errors.phone).toBeTruthy();
    expect(body.errors.consent).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it("silently accepts but never sends when the honeypot is filled", async () => {
    const { d, send } = deps();
    const res = await handleEnquiry(post({ ...valid, honeypot: "http://spam" }), d);
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 503 when SMTP is not configured, so the form falls back to email", async () => {
    const { d, send } = deps({ configured: false });
    expect((await handleEnquiry(post(valid), d)).status).toBe(503);
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 502 when Zoho rejects the message, without logging personal details", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const { d } = deps({ send: vi.fn(async () => Promise.reject(Object.assign(new Error("Jordan Smith"), { code: "EAUTH" }))) });
    expect((await handleEnquiry(post(valid), d)).status).toBe(502);
    expect(JSON.stringify(err.mock.calls)).not.toContain("Jordan");
    expect(JSON.stringify(err.mock.calls)).toContain("EAUTH");
    err.mockRestore();
  });

  it("rate-limits repeated submissions from one address", async () => {
    const { d } = deps();
    for (let i = 0; i < RATE_LIMIT; i++) expect((await handleEnquiry(post(valid), d)).status).toBe(200);
    expect((await handleEnquiry(post(valid), d)).status).toBe(429);
    expect((await handleEnquiry(post(valid, { "X-Forwarded-For": "198.51.100.4" }), d)).status).toBe(200);
  });

  it("allows same-origin requests without an Origin header", async () => {
    const { d } = deps();
    const req = new Request(URL_, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(valid) });
    expect((await handleEnquiry(req, d)).status).toBe(200);
  });
});

describe("parseEnquiry", () => {
  it("drops unknown fields and unknown option values", () => {
    const parsed = parseEnquiry({ ...valid, role: "admin", planType: "x", preferredContact: "fax", extra: "x" });
    expect(parsed).not.toHaveProperty("extra");
    expect(parsed?.role).toBe("");
    expect(parsed?.planType).toBe("");
    expect(parsed?.preferredContact).toBe("either");
  });

  it("only accepts consent when it is exactly true", () => {
    expect(parseEnquiry({ ...valid, consent: "true" })?.consent).toBe(false);
  });
});

describe("buildEnquiryEmail", () => {
  const opts = { to: BUSINESS_EMAIL, from: BUSINESS_EMAIL, receivedAt: new Date("2026-11-23T01:00:00Z") };

  it("escapes HTML and strips line breaks from headers", () => {
    const data = parseEnquiry({ ...valid, fullName: "Jo <b>\r\nBcc: x@evil.example", message: "<script>alert(1)</script> hello there" })!;
    const email = buildEnquiryEmail(data, opts);
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).not.toContain("<b>");
  });

  it("labels feedback separately and shows Sydney time", () => {
    const email = buildEnquiryEmail(parseEnquiry({ ...valid, serviceOfInterest: FEEDBACK_OPTION, planType: "" })!, opts);
    expect(email.subject.startsWith("Website feedback:")).toBe(true);
    expect(email.text).toContain("Received: Monday, 23 November 2026 at 12:00");
  });
});
