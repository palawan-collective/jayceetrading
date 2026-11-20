import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Mail, ShieldCheck } from "lucide-react";
import "./PartnershipInquiryDialog.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const serviceAreas = ["Puerto Princesa", "Port Barton", "San Vicente", "Roxas", "Sabang", "Taytay", "El Nido"];
const businessTypes = ["Hotel or resort", "Restaurant or café", "Supermarket or retailer", "Caterer", "Other business"];
const products = ["Canned food", "Frozen products", "Dairy", "Imported goods", "More than one category"];

interface PartnershipInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PartnershipInquiryDialog({ open, onOpenChange }: PartnershipInquiryDialogProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fallback, setFallback] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (submitting) return;
    if (!nextOpen) {
      setSubmitted(false);
      setFallback("");
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const formData = new FormData(event.currentTarget);
    const fields = [
      ["Name", formData.get("name")],
      ["Business", formData.get("business")],
      ["Business type", formData.get("businessType")],
      ["Email", formData.get("email")],
      ["Phone", formData.get("phone")],
      ["Delivery location", formData.get("location")],
      ["Products of interest", formData.get("products")],
      ["Order frequency", formData.get("frequency") || "Not specified"],
      ["Message", formData.get("message")],
    ];
    const body = fields.map(([label, value]) => `${label}: ${String(value ?? "").trim()}`).join("\n\n");
    const subject = `Partnership enquiry from ${String(formData.get("business") || formData.get("name"))}`;
    const emailDraft = `mailto:tradingjaycee@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setSubmitting(true);
    setFallback("");
    try {
      const { error } = await supabase.from("contact_form_submissions").insert({
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        message: `${subject}\n\n${body}`,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      setFallback(emailDraft);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="partnership-dialog">
        <DialogHeader className="partnership-dialog__header">
          <span className="partnership-dialog__eyebrow">JayCee Trading &amp; Services</span>
          <DialogTitle className="partnership-dialog__title">Let’s build a great partnership.</DialogTitle>
          <DialogDescription className="partnership-dialog__description">
            Tell us about your business and what you need. Our front desk will review your enquiry.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="partnership-confirmation" role="status" aria-live="polite">
            <span className="partnership-confirmation__icon"><Check size={24} /></span>
            <h3>Your enquiry was submitted.</h3>
            <p>Jaycee’s front desk can follow up using the contact details you provided.</p>
            <a href="mailto:tradingjaycee@gmail.com" className="partnership-confirmation__email"><Mail size={16} /> Email tradingjaycee@gmail.com</a>
            <Button type="button" className="brand-button" onClick={() => handleOpenChange(false)}>Done</Button>
          </div>
        ) : (
          <form className="partnership-form" onSubmit={handleSubmit}>
            <div className="partnership-form__grid">
              <label className="partnership-field">
                <span>Full name <b>*</b></span>
                <input name="name" type="text" autoComplete="name" placeholder="Your name" required maxLength={100} />
              </label>
              <label className="partnership-field">
                <span>Business / organization <b>*</b></span>
                <input name="business" type="text" autoComplete="organization" placeholder="Business name" required maxLength={120} />
              </label>
              <label className="partnership-field">
                <span>Work email <b>*</b></span>
                <input name="email" type="email" autoComplete="email" placeholder="name@company.com" required maxLength={150} />
              </label>
              <label className="partnership-field">
                <span>Phone number <b>*</b></span>
                <input name="phone" type="tel" autoComplete="tel" placeholder="e.g. 09XX XXX XXXX" required maxLength={40} />
              </label>
              <label className="partnership-field">
                <span>Type of business <b>*</b></span>
                <select name="businessType" defaultValue="" required>
                  <option value="" disabled>Select business type</option>
                  {businessTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="partnership-field">
                <span>Delivery location <b>*</b></span>
                <select name="location" defaultValue="" required>
                  <option value="" disabled>Select service area</option>
                  {serviceAreas.map((area) => <option key={area} value={area}>{area}</option>)}
                  <option value="Other / please confirm">Other / please confirm</option>
                </select>
              </label>
              <label className="partnership-field">
                <span>Products of interest <b>*</b></span>
                <select name="products" defaultValue="" required>
                  <option value="" disabled>Select a product range</option>
                  {products.map((product) => <option key={product} value={product}>{product}</option>)}
                </select>
              </label>
              <label className="partnership-field">
                <span>How often do you order?</span>
                <select name="frequency" defaultValue="">
                  <option value="">Select frequency (optional)</option>
                  <option>One-time enquiry</option>
                  <option>Weekly</option>
                  <option>Every two weeks</option>
                  <option>Monthly</option>
                  <option>To be discussed</option>
                </select>
              </label>
              <label className="partnership-field partnership-field--full">
                <span>How can we help? <b>*</b></span>
                <textarea name="message" placeholder="Tell us what products or supply support you’re looking for…" required minLength={10} maxLength={1200} rows={4} />
                <small>At least 10 characters, please.</small>
              </label>
            </div>
            <div className="partnership-form__footer">
              <p><ShieldCheck size={15} /> Your details will be shared with Jaycee’s front desk.</p>
              <Button type="submit" disabled={submitting} className="brand-button">{submitting ? "Sending…" : "Send enquiry"} <ArrowRight size={16} /></Button>
            </div>
            {fallback && <p role="alert">We could not confirm your submission. Try again or <a className="underline" href={fallback}>email your enquiry</a>.</p>}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
