"use client";

import { AnimatePresence, LazyMotion, m } from "framer-motion";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { PARTNER_TYPES, type PartnerType } from "@/lib/partner-types";
import { playGlassClick } from "@/lib/audio";
import { trackEvent } from "@/lib/track-event";
import { ConsentFields, ContactFields, EMPTY_CONTACT, issuesToFieldErrors, readUtm, submitLead, type ContactValues, type FieldErrors } from "./forms";

const loadMotionFeatures = () => import("framer-motion").then((mod) => mod.domAnimation);
const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const HTTP_TOO_MANY = 429;
const MESSAGE_MAX = 2000;

interface PartnerTrackProps {
  locale: Locale;
  copy: Dictionary["partners"];
  forms: Dictionary["forms"];
  privacyHref: string;
}

export function PartnerTrack(props: PartnerTrackProps) {
  const { copy } = props;
  const [open, setOpen] = useState(false);
  // Motion features (~66 KB) load on first intent, not with the page.
  const [motionArmed, setMotionArmed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const arm = () => {
    if (!motionArmed) void loadMotionFeatures();
    setMotionArmed(true);
  };

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <section id="partners" className="relative z-10 bg-night py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1fr_1.4fr] lg:px-8">
        <div>
          <h2 className="text-[length:var(--text-section)] leading-[var(--text-section--line-height)] font-semibold">{copy.title}</h2>
          <p className="mt-4 max-w-md text-mist">{copy.intro}</p>
          <button ref={triggerRef} type="button" className="btn-primary mt-8" data-partner-open onPointerEnter={arm} onFocus={arm} onClick={() => (arm(), setOpen(true), trackEvent("cta_click", { target: "partners" }))}>
            {copy.cta}
          </button>
        </div>
        <dl className="divide-y divide-line border-y border-line">
          {copy.types.map((type) => (
            <div key={type.id} className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
              <dt className="font-semibold">{type.name}</dt>
              <dd className="text-mist">{type.offer}</dd>
            </div>
          ))}
        </dl>
      </div>
      {motionArmed ? (
        <LazyMotion features={loadMotionFeatures} strict>
          <AnimatePresence>{open ? <PartnerDrawer {...props} onClose={close} /> : null}</AnimatePresence>
        </LazyMotion>
      ) : null}
    </section>
  );
}

function useDrawerBehaviour(onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input:not([tabindex='-1']), select")?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return panelRef;
}

function PartnerDrawer({ locale, copy, forms, privacyHref, onClose }: PartnerTrackProps & { onClose: () => void }) {
  const panelRef = useDrawerBehaviour(onClose);
  const titleId = useId();
  const typeId = useId();
  const messageId = useId();
  const [contact, setContact] = useState<ContactValues>(EMPTY_CONTACT);
  const [partnerType, setPartnerType] = useState<PartnerType | "">("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    const payload = { source: "partner", locale, ...contact, partner_type: partnerType || undefined, message: message || undefined, utm: readUtm() };
    const response = await submitLead(payload);
    trackEvent("lead_submit", { source: "partner", status: response.status });
    if (response.status === HTTP_CREATED) {
      playGlassClick();
      return setStatus("sent");
    }
    setStatus("idle");
    if (response.status === HTTP_BAD_REQUEST) return setErrors(issuesToFieldErrors(response.body.issues, forms));
    setErrors({ form: response.status === HTTP_TOO_MANY ? forms.errors.rate_limited : forms.errors.generic });
  }

  return (
    <div className="fixed inset-0 z-50">
      <m.div className="absolute inset-0 bg-night/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <m.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-partner-drawer
        className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col overflow-y-auto border-l border-line bg-abyss p-6 sm:p-8"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-2xl font-semibold">{copy.drawerTitle}</h2>
          <button type="button" className="btn-secondary min-h-10 px-3 py-1.5 text-sm" onClick={onClose}>
            {copy.close}
          </button>
        </div>
        {status === "sent" ? (
          <p role="status" data-partner-success className="mt-8 rounded-md border border-ice/50 bg-fleur/15 p-4">{copy.success}</p>
        ) : (
          <form noValidate onSubmit={submit} className="mt-4 space-y-5">
            <p className="text-mist">{copy.drawerIntro}</p>
            <ContactFields values={contact} errors={errors} copy={forms} onChange={(patch) => setContact((c) => ({ ...c, ...patch }))} />
            <div className="space-y-1.5">
              <label htmlFor={typeId} className="block text-sm font-medium">{copy.partnerType} <span className="text-mist">({forms.requiredMark})</span></label>
              <select id={typeId} name="partner_type" className="field" value={partnerType} aria-invalid={errors.partner_type ? true : undefined} onChange={(e) => setPartnerType(e.target.value as PartnerType)}>
                <option value="">{copy.partnerTypePlaceholder}</option>
                {PARTNER_TYPES.map((type) => (
                  <option key={type} value={type}>{copy.partnerTypeOptions[type]}</option>
                ))}
              </select>
              {errors.partner_type ? <p data-field-error="partner_type" className="text-sm text-breach">{errors.partner_type}</p> : null}
            </div>
            <div className="space-y-1.5">
              <label htmlFor={messageId} className="block text-sm font-medium">{copy.message}</label>
              <textarea id={messageId} name="message" rows={4} maxLength={MESSAGE_MAX} className="field" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <ConsentFields values={contact} errors={errors} copy={forms} privacyHref={privacyHref} onChange={(patch) => setContact((c) => ({ ...c, ...patch }))} />
            {errors.form ? <p role="alert" className="text-sm text-breach">{errors.form}</p> : null}
            <button type="submit" className="btn-primary w-full" disabled={status === "sending"}>
              {status === "sending" ? copy.submitting : copy.submit}
            </button>
          </form>
        )}
      </m.div>
    </div>
  );
}
