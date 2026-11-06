import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { CheckCircle2, Send, AlertCircle, Mail, ArrowRight } from "lucide-react";
import {
  type EnquiryFormData,
  type ValidationErrors,
  validateEnquiryForm,
  submitEnquiry,
} from "../../lib/submitEnquiry";

interface ServiceOption {
  slug: string;
  title: string;
}

interface EnquiryFormProps {
  services: ServiceOption[];
  defaultServiceSlug?: string;
}

export default function EnquiryForm({ services, defaultServiceSlug }: EnquiryFormProps) {
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
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [mailtoFallbackUrl, setMailtoFallbackUrl] = useState<string | null>(null);

  // Check URL query parameters on mount to pre-select service
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const serviceParam = params.get("service") || defaultServiceSlug;
      if (serviceParam) {
        const matched = services.find(
          (s) => s.slug.toLowerCase() === serviceParam.toLowerCase() || s.title.toLowerCase() === serviceParam.toLowerCase()
        );
        if (matched) {
          setFormData((prev) => ({ ...prev, serviceOfInterest: matched.title }));
        }
      }
    }
  }, [services, defaultServiceSlug]);

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const clientErrors = validateEnquiryForm(formData);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setIsSubmitting(false);

      // Focus first error field for screen reader accessibility
      const firstErrorKey = Object.keys(clientErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.focus();
      }
      return;
    }

    try {
      const result = await submitEnquiry(formData);
      if (result.success) {
        setSubmissionSuccess(result.message || "Thank you! Your enquiry has been received.");
        if (result.mailtoUrl) {
          setMailtoFallbackUrl(result.mailtoUrl);
        }
      } else if (result.errors) {
        setErrors(result.errors);
      }
    } catch (err) {
      setErrors({
        general: "An unexpected error occurred while preparing your submission. Please call us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-[12px] bg-white border-2 border-green-500 p-8 sm:p-10 text-center shadow-soft"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-900 mx-auto flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" aria-hidden="true" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-green-900 mb-3">
          Referral Prepared Successfully
        </h3>

        <p className="text-lg text-ink mb-6 max-w-xl mx-auto leading-relaxed">
          {submissionSuccess}
        </p>

        <div className="bg-surface-tint p-5 rounded-[12px] border border-green-200 text-left max-w-lg mx-auto mb-8 space-y-2 text-sm sm:text-base">
          <p className="font-bold text-green-900">Next Steps with Empowerwell Support:</p>
          <ul className="list-disc list-inside text-ink space-y-1">
            <li>Our intake team will review your enquiry within 24 business hours.</li>
            <li>We will contact you via {formData.preferredContact === "either" ? "phone or email" : formData.preferredContact} to schedule your free meet & greet.</li>
            <li>No obligation or commitment required.</li>
          </ul>
        </div>

        {mailtoFallbackUrl && (
          <div className="mb-6">
            <a
              href={mailtoFallbackUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-700 text-white font-bold hover:bg-purple-800 transition-colors focus-visible:outline-3 focus-visible:outline-green-900"
            >
              <Mail className="w-5 h-5" aria-hidden="true" />
              <span>Open Email Summary in Your Mail Client</span>
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setSubmissionSuccess(null);
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
          }}
          className="text-purple-700 font-bold hover:underline inline-flex items-center gap-1.5 focus-visible:outline-3 focus-visible:outline-purple-700 rounded-md p-1"
        >
          <span>Submit another referral</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[12px] bg-white border border-border-card p-6 sm:p-10 shadow-soft"
      aria-label="Make an NDIS Referral or Enquiry"
    >
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
            <label htmlFor="fullName" className="text-sm font-bold text-ink">
              Full Name <span className="text-purple-700" aria-hidden="true">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
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
              <p id="fullName-error" className="text-xs font-bold text-purple-700" role="alert">
                {errors.fullName}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-bold text-ink">
              Phone Number <span className="text-purple-700" aria-hidden="true">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 0400 000 000 or (02) 9831 0000"
              aria-invalid={errors.phone ? "true" : "false"}
              aria-describedby={errors.phone ? "phone-error" : "phone-help"}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-[12px] bg-surface text-ink text-base border transition-colors
                ${errors.phone ? "border-purple-700 ring-1 ring-purple-700" : "border-border-card hover:border-green-600"}
                focus-visible:outline-3 focus-visible:outline-purple-700`}
            />
            {errors.phone ? (
              <p id="phone-error" className="text-xs font-bold text-purple-700" role="alert">
                {errors.phone}
              </p>
            ) : (
              <p id="phone-help" className="text-xs text-muted">
                Australian mobile or landline
              </p>
            )}
          </div>
        </div>

        {/* Email & Role Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-bold text-ink">
              Email Address <span className="text-purple-700" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-[12px] bg-surface text-ink text-base border transition-colors
                ${errors.email ? "border-purple-700 ring-1 ring-purple-700" : "border-border-card hover:border-green-600"}
                focus-visible:outline-3 focus-visible:outline-purple-700`}
            />
            {errors.email && (
              <p id="email-error" className="text-xs font-bold text-purple-700" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-bold text-ink">
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
              <p id="role-error" className="text-xs font-bold text-purple-700" role="alert">
                {errors.role}
              </p>
            )}
          </div>
        </div>

        {/* Plan Type & Service of Interest Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="planType" className="text-sm font-bold text-ink">
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
              <option value="exploring">Exploring NDIS / Awaiting Plan</option>
            </select>
            {errors.planType && (
              <p id="planType-error" className="text-xs font-bold text-purple-700" role="alert">
                {errors.planType}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="serviceOfInterest" className="text-sm font-bold text-ink">
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
              <option value="Multiple Supports / General Enquiry">Multiple Supports / General Advice</option>
            </select>
            {errors.serviceOfInterest && (
              <p id="serviceOfInterest-error" className="text-xs font-bold text-purple-700" role="alert">
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
              <div className="flex items-center gap-6 min-h-[44px]">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-ink">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="phone"
                    checked={formData.preferredContact === "phone"}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-700 focus:ring-purple-700"
                  />
                  <span>Phone</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-ink">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="email"
                    checked={formData.preferredContact === "email"}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-700 focus:ring-purple-700"
                  />
                  <span>Email</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-ink">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="either"
                    checked={formData.preferredContact === "either"}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-700 focus:ring-purple-700"
                  />
                  <span>Either</span>
                </label>
              </div>
            </fieldset>
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-sm font-bold text-ink">
            How can we support you? <span className="text-purple-700" aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us about the supports you are looking for, your preferred routine, or any specific goals..."
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={`w-full p-4 rounded-[12px] bg-surface text-ink text-base border transition-colors resize-y
              ${errors.message ? "border-purple-700 ring-1 ring-purple-700" : "border-border-card hover:border-green-600"}
              focus-visible:outline-3 focus-visible:outline-purple-700`}
          />
          {errors.message && (
            <p id="message-error" className="text-xs font-bold text-purple-700" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        {/* Privacy Collection Notice & Consent Checkbox */}
        <div className="pt-2 border-t border-green-100 space-y-4">
          <div className="p-4 rounded-[12px] bg-surface-tint border border-green-200 text-xs sm:text-sm text-ink leading-relaxed">
            <p className="font-bold text-green-900 mb-1">Privacy Collection Notice</p>
            <p>
              Empowerwell Support Pty Ltd collects your personal details solely to assess and respond to your NDIS support enquiry. We will never sell, rent, or disclose your information to third parties without your explicit consent, in compliance with the Australian Privacy Principles. For full information, please read our{" "}
              <a href="/privacy" className="text-purple-700 font-bold underline hover:text-purple-900 focus-visible:outline-2 focus-visible:outline-purple-700 rounded">
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
              className="w-5 h-5 mt-1 rounded text-green-900 border-border-card focus:ring-purple-700 focus:ring-offset-2 cursor-pointer shrink-0"
            />
            <label htmlFor="consent" className="text-sm text-ink leading-snug cursor-pointer">
              I consent to Empowerwell Support Pty Ltd contacting me to discuss this NDIS referral and storing my details securely.{" "}
              <span className="text-purple-700 font-bold" aria-hidden="true">*</span>
            </label>
          </div>
          {errors.consent && (
            <p id="consent-error" className="text-xs font-bold text-purple-700" role="alert">
              {errors.consent}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-green-900 text-white font-heading font-extrabold text-lg hover:bg-green-800 active:bg-green-950 transition-all duration-150 shadow-soft disabled:opacity-50 cursor-pointer min-h-[48px] focus-visible:outline-3 focus-visible:outline-purple-700"
          >
            {isSubmitting ? (
              <span>Preparing Referral...</span>
            ) : (
              <>
                <Send className="w-5 h-5" aria-hidden="true" />
                <span>Submit NDIS Referral</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
