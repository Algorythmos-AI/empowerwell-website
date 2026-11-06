import { useState, useEffect, useRef, type ChangeEvent, type SyntheticEvent } from "react";
import { CheckCircle2, Send, AlertCircle, Mail, ArrowRight } from "lucide-react";
import {
  type EnquiryFormData,
  type SubmissionResult,
  type ValidationErrors,
  validateEnquiryForm,
  submitEnquiry,
  FEEDBACK_OPTION,
  MESSAGE_MAX_LENGTH,
} from "../../lib/submitEnquiry";
import { FORM_EXAMPLES } from "../../content/forms";

interface ServiceOption {
  slug: string;
  title: string;
}

interface EnquiryFormProps {
  services: ServiceOption[];
  /** Inbox for the mailto fallback and the no-JS form action (SITE.email). */
  recipient: string;
  /** POST endpoint (SITE.formEndpoint); empty means mailto fallback only. */
  endpoint: string;
  phone: string;
  phoneHref: string;
}

export default function EnquiryForm({ services, recipient, endpoint, phone, phoneHref }: EnquiryFormProps) {
  const [formData, setFormData] = useState<EnquiryFormData>({
    fullName: "",
    phone: "",
    email: "",
    role: "",
    planType: "",
    serviceOfInterest: "",
    ndisNumber: "",
    preferredContact: "phone",
    message: "",
    consent: false,
    honeypot: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);

  // Before hydration the browser's own validation applies; once React runs, it takes over.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHydrated(true), []);

  const scrollBehavior = (): ScrollBehavior =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  // Bumped on every failed submit, so the summary is focused after React has rendered it.
  const [failedSubmits, setFailedSubmits] = useState(0);
  useEffect(() => {
    if (failedSubmits === 0) return;
    errorSummaryRef.current?.focus({ preventScroll: true });
    errorSummaryRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
  }, [failedSubmits]);

  // Move focus (and the viewport) to the outcome so keyboard, screen-reader and mobile users see it.
  useEffect(() => {
    if (!result) return;
    const heading = resultHeadingRef.current;
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
  }, [result]);

  // Check URL query parameters on mount to pre-select service
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const serviceParam = params.get("service");
      if (serviceParam?.toLowerCase() === "feedback") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData((prev) => ({ ...prev, serviceOfInterest: FEEDBACK_OPTION }));
      } else if (serviceParam) {
        const matched = services.find(
          (s) => s.slug.toLowerCase() === serviceParam.toLowerCase() || s.title.toLowerCase() === serviceParam.toLowerCase()
        );
        if (matched) {
          // The ?service= query is only readable after hydration (static HTML has no URL params),
          // so syncing it into state from an effect is intended here.
          setFormData((prev) => ({ ...prev, serviceOfInterest: matched.title }));
        }
      }
    }
  }, [services]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear individual error as user types
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const clientErrors = validateEnquiryForm(formData);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setIsSubmitting(false);

      // One summary announcement (focused in an effect), then the visitor can jump to each field.
      setFailedSubmits((n) => n + 1);
      return;
    }

    try {
      const outcome = await submitEnquiry(formData, { recipient, endpoint });
      if (outcome.success) {
        setResult(outcome);
      } else if (outcome.errors) {
        setErrors(outcome.errors);
      }
    } catch {
      setErrors({
        general: "An unexpected error occurred while preparing your submission. Please call us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      role: "",
      planType: "",
      serviceOfInterest: "",
      ndisNumber: "",
      preferredContact: "phone",
      message: "",
      consent: false,
      honeypot: "",
    });
  };

  if (result) {
    const sent = result.delivery !== "mailto";
    return (
      <div
        role="status"
        aria-live="polite"
        className={`rounded-[12px] bg-white border-2 p-8 sm:p-10 text-center shadow-soft ${sent ? "border-green-500" : "border-purple-700"}`}
      >
        <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-6">
          {sent ? (
            <CheckCircle2 className="w-10 h-10 text-green-700" aria-hidden="true" />
          ) : (
            <Mail className="w-9 h-9 text-purple-700" aria-hidden="true" />
          )}
        </div>

        <h3
          ref={resultHeadingRef}
          tabIndex={-1}
          className="text-2xl sm:text-3xl font-heading font-extrabold text-green-900 mb-3 focus:outline-none"
        >
          {sent ? "Enquiry received" : "One more step: send your email"}
        </h3>

        <p className="text-lg text-ink mb-6 max-w-xl mx-auto leading-relaxed">{result.message}</p>

        {!sent && result.mailtoUrl && (
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={result.mailtoUrl}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-full bg-purple-700 text-white font-bold hover:bg-purple-800 transition-colors focus-visible:outline-3 focus-visible:outline-purple-700 focus-visible:outline-offset-2"
            >
              <Mail className="w-5 h-5" aria-hidden="true" />
              <span>Open pre-filled email</span>
            </a>
            <a
              href={phoneHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-full border-2 border-purple-700 text-purple-700 font-bold hover:bg-purple-50 transition-colors focus-visible:outline-3 focus-visible:outline-purple-700 focus-visible:outline-offset-2"
            >
              <span>Call {phone}</span>
            </a>
          </div>
        )}

        {sent && (
          <div className="bg-surface-tint p-5 rounded-[12px] border border-green-200 text-left max-w-lg mx-auto mb-8 space-y-2 text-sm sm:text-base">
            <p className="font-bold text-green-900">What happens next</p>
            <ul className="list-disc list-inside text-ink space-y-1">
              <li>We will read your enquiry.</li>
              <li>
                We will contact you by {formData.preferredContact === "either" ? "phone or email" : formData.preferredContact} to arrange a free meet and greet.
              </li>
              <li>There is no obligation.</li>
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {!sent && (
            <button
              type="button"
              onClick={() => setResult(null)}
              className="text-purple-700 font-bold underline underline-offset-4 inline-flex items-center gap-1.5 min-h-[44px] focus-visible:outline-3 focus-visible:outline-purple-700 rounded-md px-2"
            >
              <span>Edit my details</span>
            </button>
          )}
          <button
            type="button"
            onClick={resetForm}
            className="text-purple-700 font-bold hover:underline inline-flex items-center gap-1.5 min-h-[44px] focus-visible:outline-3 focus-visible:outline-purple-700 rounded-md px-2"
          >
            <span>{sent ? "Send another enquiry" : "Clear the form and start again"}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  const errorEntries = Object.entries(errors).filter(([key, msg]) => key !== "general" && msg) as [string, string][];

  // Without JavaScript: with an endpoint, the browser POSTs the form there (never a GET, which would put
  // personal details in the URL). Without an endpoint the form is hidden (js-only) and the page's
  // <noscript> block offers phone and email instead.
  return (
    <form
      onSubmit={handleSubmit}
      noValidate={hydrated}
      method="post"
      action={endpoint || undefined}
      className={`rounded-[12px] bg-white border border-border-card p-6 sm:p-10 shadow-soft${endpoint ? "" : " js-only"}`}
      aria-labelledby="enquiry-form-heading"
    >
      <p className="text-base text-ink mb-6">
        Fields marked <span className="text-purple-700 font-bold">*</span> are required.
      </p>

      {errorEntries.length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 p-5 rounded-[12px] bg-purple-50 border-2 border-purple-700 text-ink focus:outline-none"
        >
          <p className="font-bold text-purple-900">
            Please fix {errorEntries.length === 1 ? "1 thing" : `${errorEntries.length} things`} before sending:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {errorEntries.map(([field, message]) => (
              <li key={field}>
                <a href={`#${field}`} className="text-purple-700 font-bold underline underline-offset-4">
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Honeypot field for bot protection (hidden from assistive tech and humans) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-url-guard">Leave this field blank</label>
        <input
          type="text"
          id="website-url-guard"
          name="honeypot"
          value={formData.honeypot}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {errors.general && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-[12px] bg-purple-50 border border-purple-300 text-purple-900 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm font-bold">{errors.general}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Name & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-base font-bold text-ink">
              Full Name <span className="text-purple-700" aria-hidden="true">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              maxLength={100}
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Jordan Smith"
              aria-invalid={errors.fullName ? "true" : "false"}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-[12px] bg-surface text-ink text-base border transition-colors
                ${errors.fullName ? "border-purple-700 ring-1 ring-purple-700" : "border-border-card hover:border-green-600"}
                focus-visible:outline-3 focus-visible:outline-purple-700`}
            />
            {errors.fullName && (
              <p id="fullName-error" className="text-base font-bold text-purple-700">
                {errors.fullName}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-base font-bold text-ink">
              Phone Number <span className="text-purple-700" aria-hidden="true">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              maxLength={20}
              value={formData.phone}
              onChange={handleChange}
              placeholder={`e.g. ${FORM_EXAMPLES.mobile}`}
              aria-invalid={errors.phone ? "true" : "false"}
              aria-describedby={errors.phone ? "phone-error" : "phone-help"}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-[12px] bg-surface text-ink text-base border transition-colors
                ${errors.phone ? "border-purple-700 ring-1 ring-purple-700" : "border-border-card hover:border-green-600"}
                focus-visible:outline-3 focus-visible:outline-purple-700`}
            />
            {errors.phone ? (
              <p id="phone-error" className="text-base font-bold text-purple-700">
                {errors.phone}
              </p>
            ) : (
              <p id="phone-help" className="text-sm text-muted">
                Australian mobile or landline
              </p>
            )}
          </div>
        </div>

        {/* Email & Role Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-base font-bold text-ink">
              Email Address <span className="text-purple-700" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              maxLength={120}
              value={formData.email}
              onChange={handleChange}
              placeholder={FORM_EXAMPLES.email}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-[12px] bg-surface text-ink text-base border transition-colors
                ${errors.email ? "border-purple-700 ring-1 ring-purple-700" : "border-border-card hover:border-green-600"}
                focus-visible:outline-3 focus-visible:outline-purple-700`}
            />
            {errors.email && (
              <p id="email-error" className="text-base font-bold text-purple-700">
                {errors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-base font-bold text-ink">
              I am a... <span className="text-purple-700" aria-hidden="true">*</span>
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              aria-invalid={errors.role ? "true" : "false"}
              aria-describedby={errors.role ? "role-error" : undefined}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-[12px] bg-surface text-ink text-base border transition-colors cursor-pointer
                ${errors.role ? "border-purple-700 ring-1 ring-purple-700" : "border-border-card hover:border-green-600"}
                focus-visible:outline-3 focus-visible:outline-purple-700`}
            >
              <option value="" disabled>Please choose your role</option>
              <option value="participant">NDIS Participant (for myself)</option>
              <option value="carer_family">Family Member or Carer</option>
              <option value="support_coordinator">Support Coordinator or LAC</option>
              <option value="other">Health Professional / Advocate / Other</option>
            </select>
            {errors.role && (
              <p id="role-error" className="text-base font-bold text-purple-700">
                {errors.role}
              </p>
            )}
          </div>
        </div>

        {/* Plan Type & Service of Interest Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="planType" className="text-base font-bold text-ink">
              NDIS Plan Management Type <span className="text-purple-700" aria-hidden="true">*</span>
            </label>
            <select
              id="planType"
              name="planType"
              required
              value={formData.planType}
              onChange={handleChange}
              aria-invalid={errors.planType ? "true" : "false"}
              aria-describedby={errors.planType ? "planType-error" : undefined}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-[12px] bg-surface text-ink text-base border transition-colors cursor-pointer
                ${errors.planType ? "border-purple-700 ring-1 ring-purple-700" : "border-border-card hover:border-green-600"}
                focus-visible:outline-3 focus-visible:outline-purple-700`}
            >
              <option value="" disabled>Please select plan type</option>
              <option value="plan">Plan-Managed</option>
              <option value="self">Self-Managed</option>
              <option value="ndia">NDIA-Managed (Agency Managed)</option>
              <option value="exploring">Not sure / still applying</option>
            </select>
            {errors.planType && (
              <p id="planType-error" className="text-base font-bold text-purple-700">
                {errors.planType}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="serviceOfInterest" className="text-base font-bold text-ink">
              Primary Service of Interest <span className="text-purple-700" aria-hidden="true">*</span>
            </label>
            <select
              id="serviceOfInterest"
              name="serviceOfInterest"
              required
              value={formData.serviceOfInterest}
              onChange={handleChange}
              aria-invalid={errors.serviceOfInterest ? "true" : "false"}
              aria-describedby={errors.serviceOfInterest ? "serviceOfInterest-error" : undefined}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-[12px] bg-surface text-ink text-base border transition-colors cursor-pointer
                ${errors.serviceOfInterest ? "border-purple-700 ring-1 ring-purple-700" : "border-border-card hover:border-green-600"}
                focus-visible:outline-3 focus-visible:outline-purple-700`}
            >
              <option value="" disabled>Choose a service</option>
              {services.map((s) => (
                <option key={s.slug} value={s.title}>
                  {s.title}
                </option>
              ))}
              <option value="Multiple Supports / General Enquiry">More than one / not sure yet</option>
              <option value={FEEDBACK_OPTION}>{FEEDBACK_OPTION}</option>
            </select>
            {errors.serviceOfInterest && (
              <p id="serviceOfInterest-error" className="text-base font-bold text-purple-700">
                {errors.serviceOfInterest}
              </p>
            )}
          </div>
        </div>

        {/* NDIS Number (Optional) & Preferred Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ndisNumber" className="text-sm font-bold text-ink flex items-center justify-between">
              <span>NDIS Number</span>
              <span className="text-xs text-muted font-normal">(Optional)</span>
            </label>
            <input
              id="ndisNumber"
              name="ndisNumber"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={9}
              pattern="[0-9]{9}"
              title="Your 9-digit NDIS number"
              value={formData.ndisNumber}
              onChange={handleChange}
              placeholder="e.g. 430000000"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-[12px] bg-surface text-ink text-base border border-border-card hover:border-green-600 focus-visible:outline-3 focus-visible:outline-purple-700"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <fieldset>
              <legend className="text-sm font-bold text-ink mb-2">
                Preferred Contact Method
              </legend>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 min-h-[44px]">
                <label className="inline-flex items-center gap-2 min-h-[44px] cursor-pointer text-base font-medium text-ink">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="phone"
                    checked={formData.preferredContact === "phone"}
                    onChange={handleChange}
                    className="w-5 h-5 accent-purple-700"
                  />
                  <span>Phone</span>
                </label>
                <label className="inline-flex items-center gap-2 min-h-[44px] cursor-pointer text-base font-medium text-ink">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="email"
                    checked={formData.preferredContact === "email"}
                    onChange={handleChange}
                    className="w-5 h-5 accent-purple-700"
                  />
                  <span>Email</span>
                </label>
                <label className="inline-flex items-center gap-2 min-h-[44px] cursor-pointer text-base font-medium text-ink">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="either"
                    checked={formData.preferredContact === "either"}
                    onChange={handleChange}
                    className="w-5 h-5 accent-purple-700"
                  />
                  <span>Either</span>
                </label>
              </div>
            </fieldset>
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-base font-bold text-ink">
            How can we support you? <span className="text-purple-700" aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            maxLength={MESSAGE_MAX_LENGTH}
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us about the supports you are looking for, your preferred routine, or any specific goals..."
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={`w-full p-4 rounded-[12px] bg-surface text-ink text-base border transition-colors resize-y
              ${errors.message ? "border-purple-700 ring-1 ring-purple-700" : "border-border-card hover:border-green-600"}
              focus-visible:outline-3 focus-visible:outline-purple-700`}
          />
          <p className="text-sm text-muted text-right" aria-live="polite">
            {formData.message.length}/{MESSAGE_MAX_LENGTH} characters
          </p>
          {errors.message && (
            <p id="message-error" className="text-base font-bold text-purple-700">
              {errors.message}
            </p>
          )}
        </div>

        {/* Privacy Collection Notice & Consent Checkbox */}
        <div className="pt-2 border-t border-green-100 space-y-4">
          <div className="p-4 rounded-[12px] bg-surface-tint border border-green-200 text-base text-ink leading-relaxed">
            <p className="font-bold text-green-900 mb-1">Privacy Collection Notice</p>
            <p>
              We collect these details to answer your enquiry. We will not sell your information. We only share it with your consent, or when the law requires or allows it. Read our{" "}
              <a href="/privacy" className="text-purple-700 font-bold underline hover:text-purple-900 focus-visible:outline-3 focus-visible:outline-purple-700 rounded">
                Privacy Policy
              </a>.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              required
              checked={formData.consent}
              onChange={handleChange}
              aria-invalid={errors.consent ? "true" : "false"}
              aria-describedby={errors.consent ? "consent-error" : undefined}
              className="w-5 h-5 mt-1 accent-green-900 cursor-pointer shrink-0"
            />
            <label htmlFor="consent" className="text-base text-ink leading-snug cursor-pointer">
              I agree to Empowerwell Support contacting me about this enquiry and keeping my details safely.{" "}
              <span className="text-purple-700 font-bold" aria-hidden="true">*</span>
            </label>
          </div>
          {errors.consent && (
            <p id="consent-error" className="text-base font-bold text-purple-700">
              {errors.consent}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:min-w-[16rem] inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-green-900 text-white font-heading font-extrabold text-lg hover:bg-green-800 active:bg-green-950 transition-all duration-150 shadow-soft disabled:opacity-50 cursor-pointer min-h-[48px] focus-visible:outline-3 focus-visible:outline-purple-700"
          >
            {isSubmitting ? (
              <span>Sending…</span>
            ) : (
              <>
                <Send className="w-5 h-5" aria-hidden="true" />
                <span>Send enquiry</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
