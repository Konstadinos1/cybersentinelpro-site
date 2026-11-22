import type { Dictionary } from "./fr";

/** English twin of fr.ts. The `Dictionary` type makes a missing key a compile error. */
export const en: Dictionary = {
  meta: {
    title: "CyberSentinelPro | Law 25 and AI security audits, Laval",
    description:
      "Hybrid Law 25 audits and adversarial testing of your AI systems, at a fixed price, for Quebec companies with 25 to 250 employees. Free risk score.",
    privacyTitle: "Privacy policy | CyberSentinelPro",
    privacyDescription:
      "What personal information CyberSentinelPro collects, why, where it is hosted and how to exercise your rights.",
  },
  hud: {
    nav: {
      solutions: "Solutions",
      sandbox: "Threat Sandbox",
      diagnostic: "Law 25 Diagnostic",
      partners: "Partners",
    },
    cta: "Free Risk Score",
    telemetry: "SYS.STATUS // LAW25.READY // LAVAL.QC",
    audioOn: "AUDIO: ON",
    audioOff: "AUDIO: OFF",
    audioLabel: "Ambient sound",
    menu: "Menu",
    closeMenu: "Close menu",
    skip: "Skip to content",
    localeLabel: "Choose language",
    home: "CyberSentinelPro, home",
  },
  hero: {
    title: "Prove your AI systems actually protect personal information.",
    subtitle:
      "Most Quebec companies have finished their Law 25 paperwork. Few can show that their AI agents, chatbots and integrations hold up under attack. We check both, at a fixed price.",
    primaryCta: "Get my risk score",
    secondaryCta: "Watch an attack get blocked",
    trustLabel: "Frameworks we test against",
    trust: [
      "OWASP LLM Top 10",
      "Quebec Law 25",
      "Agentic Runtime Defense",
      "Bilingual Laval / Greater Montreal",
    ],
  },
  calculator: {
    title: "Law 25 and AI diagnostic",
    intro: "Five steps, about two minutes. The score follows a fixed grid, the same for every company.",
    stepLabel: "Step {current} of {total}",
    back: "Back",
    next: "Continue",
    submit: "See my score",
    submitting: "Calculating…",
    selectRequired: "Choose an answer to continue.",
    headcount: {
      title: "How many employees does your company have?",
      options: { "25-50": "25 to 50", "51-150": "51 to 150", "151-250+": "151 to 250 or more" },
    },
    vertical: {
      title: "What is your sector?",
      options: {
        clinics_health: "Clinics and health",
        accounting_legal: "Accounting and legal firms",
        retail_hospitality: "Multi-location retail and restaurants",
        b2b_saas: "B2B software and tech services",
        other: "Another sector",
      },
    },
    aiStack: {
      title: "Which AI tools does your team use?",
      hint: "Choose all that apply.",
      options: {
        copilot_chatgpt: "Copilot or ChatGPT",
        voice_ai: "Voice AI (reception, call centre)",
        custom_agents_rag: "Custom agents or RAG",
        exploring: "Still exploring",
      },
    },
    controls: {
      title: "What do you already have in place?",
      yes: "Yes",
      no: "No",
      items: {
        privacy_officer: "A person in charge of protecting personal information, designated in writing",
        incident_register: "An up-to-date register of confidentiality incidents",
        efvp: "A privacy impact assessment (PIA) for your technology projects",
      },
    },
    contact: {
      title: "Where should we send your result?",
    },
    result: {
      title: "Your readiness score",
      outOf: "out of 100",
      exposureLabel: "Exposure:",
      tiers: { low: "Low", moderate: "Moderate", high: "High", critical: "Critical" },
      statutory:
        "Under Law 25, the Commission d'accès à l'information can impose administrative monetary penalties of up to $10M or 2% of worldwide turnover. Penal fines can reach $25M or 4%.",
      fixesTitle: "Your three priorities",
      startTitle: "Recommended starting point",
      startTierName: "Hybrid Law 25 and AI governance audit (T1)",
      nextStepTier2:
        "Likely next step: deploying guardrails (T2), since you run agents or voice AI.",
      nextStepDefault: "Then: the posture retainer (T3) keeps your fixes in place.",
      book: "Book the results call (45 min)",
      bookNotice: "The calendar is provided by Cal.com, a third party. It loaded because you clicked “Book”.",
      noBooking: "We will email you within one business day to schedule the results call.",
      deepAudit: "Take the full assessment (40 to 50 questions)",
      restart: "Start over",
      savedError:
        "Your request was not saved. The score below was calculated in your browser. Try sending it again in a moment.",
      retry: "Send again",
      method: "How the score is calculated",
      methodBody:
        "A base of 25 points, plus 25 per control in place. We subtract up to 25 points for your AI tools, 3 to 10 for your sector, and 5 above 150 employees.",
    },
    fixes: {
      appoint_privacy_officer: {
        title: "Designate the person in charge of protecting personal information",
        body: "By default it is the person with the highest authority. Delegate in writing and publish their contact details on your website.",
      },
      open_incident_register: {
        title: "Keep a register of confidentiality incidents",
        body: "Log every incident, even without a risk of serious injury. The Commission can ask for a copy.",
      },
      run_efvp: {
        title: "Run a privacy impact assessment before your next technology project",
        body: "It is required for any system that processes personal information, and before communicating that information outside Quebec.",
      },
      redteam_agents: {
        title: "Test your agents against prompt injection",
        body: "Check that a booby-trapped document or email cannot make them call a tool or reveal data. It is risk #1 in the OWASP LLM Top 10 (2025).",
      },
      secure_voice_recordings: {
        title: "Put rules around voice AI recordings",
        body: "Tell callers, limit how long recordings and transcripts are kept, and check where the vendor hosts them.",
      },
      govern_genai_use: {
        title: "Set rules for Copilot and ChatGPT",
        body: "List the tools in use, spell out what must never be pasted into them, and turn on the settings that keep your data out of training.",
      },
      ai_policy_before_pilot: {
        title: "Adopt an AI policy before the first pilot",
        body: "One page is enough: the tools allowed, the data that is off limits, and who approves a new use.",
      },
      map_cross_border_transfers: {
        title: "List communications outside Quebec",
        body: "List the vendors that host your personal information outside Quebec. Each one requires an assessment first.",
      },
      tabletop_incident_drill: {
        title: "Rehearse an incident once a year",
        body: "A 90-minute exercise shows who decides, who notifies the Commission and how fast.",
      },
      retention_schedule: {
        title: "Set a retention schedule",
        body: "Destroy or anonymize personal information once the purposes it was collected for are achieved.",
      },
    },
  },
  forms: {
    fullName: "Full name",
    workEmail: "Work email",
    company: "Company",
    consentContact: "I agree that CyberSentinelPro may contact me about my request.",
    consentMarketing: "I also agree to receive the monthly newsletter (optional).",
    purpose:
      "We use this information to answer your request and discuss it with you. It is kept for 24 months.",
    privacyLink: "Privacy policy",
    requiredMark: "required",
    errors: {
      full_name: "Enter your full name (at least 2 characters).",
      work_email: "Enter a valid email address, for example name@company.ca.",
      company: "Enter your company name.",
      consent_contact: "Check this box so we can reply to you.",
      partner_type: "Choose the partner type.",
      message: "Your message is longer than 2,000 characters.",
      rate_limited: "Too many requests in one minute. Wait a moment, then try again.",
      generic: "Sending did not work. Check your connection, then try again.",
    },
  },
  sandbox: {
    title: "Threat Sandbox",
    intro:
      "Three known attacks against Clara, the fictional AI assistant of Groupe Exemple inc. On the left, the scripted answer of an unprotected model. On the right, our rule engine, running in your browser.",
    presetsLabel: "Choose an attack",
    presets: {
      prompt_extraction: {
        label: "System prompt extraction",
        summary: "The attacker tells the agent to ignore its instructions and print its configuration.",
      },
      law25_pii_exfil: {
        label: "Personal information exfiltration",
        summary: "The agent is asked to export social insurance numbers to an outside address.",
      },
      mcp_tool_hijack: {
        label: "MCP tool hijack",
        summary: "A booby-trapped document tells the agent to call a send tool pointing at an unknown server.",
      },
    },
    attackLabel: "Attacker request",
    hiddenLabel: "Text hidden in the document",
    unprotectedTitle: "Unprotected model",
    simulationTag: "Scripted simulation",
    guardedTitle: "Guardrailed runtime",
    liveTag: "Real engine, in your browser",
    breach: "BREACH DETECTED",
    blocked: "BLOCKED + LOGGED",
    allowed: "ALLOWED",
    rule: "Rule",
    owasp: "OWASP reference",
    latency: "Average latency (200 runs)",
    auditJson: "Audit log (JSON)",
    note: "The secrets, names and numbers shown are fictional. No data leaves your browser.",
  },
  offers: {
    title: "Prove, close, keep",
    intro:
      "Three fixed-price engagements. Each has a written scope, a timeline and a deliverable. The founder delivers every engagement personally.",
    includesLabel: "Included",
    pricesNote: "Prices in Canadian dollars, plus taxes.",
    disclaimer:
      "CyberSentinelPro delivers technical cybersecurity and operational compliance engineering, not legal advice.",
    tiers: [
      {
        id: "tier1",
        code: "T1",
        name: "Hybrid Law 25 and AI governance audit",
        price: "$5,000 to $10,000 CAD",
        cadence: "Fixed price, findings in 10 business days",
        includes: [
          "Review of your documents against Law 25 obligations",
          "Adversarial testing of your AI surfaces, mapped to the OWASP LLM Top 10 (2025)",
          "Remediation roadmap, ranked by severity",
          "60-minute briefing with leadership",
        ],
        anchors:
          "$5,000 for one AI tool with light documentation, $7,500 standard, $10,000 for several workflows.",
        outOfScope: "Out of scope: remediation, network penetration testing beyond AI, and legal opinions.",
        cta: "Start with the diagnostic",
        href: "#diagnostic",
      },
      {
        id: "tier2",
        code: "T2",
        name: "Secure AI agent deployment and guardrails",
        price: "$5,000 to $15,000 CAD",
        cadence: "Fixed price, 3 to 6 weeks",
        includes: [
          "Prompt-injection defenses on input and output",
          "Agent permission scopes and an MCP security gateway",
          "Privacy impact assessment file for the AI system",
          "90-minute bilingual training and an acceptance re-test",
        ],
        anchors: "Follows a T1 audit: it starts from those findings and re-tests them at the end.",
        outOfScope: "Out of scope: application rewrites and ongoing development.",
        cta: "Watch a guardrail work",
        href: "#sandbox",
      },
      {
        id: "tier3",
        code: "T3",
        name: "AI security posture and compliance retainer",
        price: "$2,000 to $5,000 CAD per month",
        cadence: "6-month minimum, monthly cycle",
        includes: [
          "Monthly tracking of your Law 25 obligations",
          "A 4 to 8 hour advisory block each month",
          "Quarterly adversarial re-test of your AI surfaces",
          "Bilingual posture report for leadership",
        ],
        anchors: "The price depends on the number of systems and the depth of testing.",
        outOfScope: "This is not a 24/7 SOC or a help desk.",
        cta: "Start with the diagnostic",
        href: "#diagnostic",
      },
    ],
  },
  moat: {
    title: "How we compare",
    intro: "A comparison by vendor category, based on public positioning observed in November 2026.",
    criterionLabel: "Criterion",
    columns: ["CyberSentinelPro", "Compliance checklist SaaS", "Generalist MSPs", "Big 4 firms"],
    rows: [
      {
        label: "Speed",
        values: [
          "Instant score, findings in 10 business days",
          "Weeks of onboarding",
          "Weeks, ticket by ticket",
          "4 to 12 weeks before kickoff",
        ],
      },
      {
        label: "Live AI red-teaming",
        values: [
          "Yes, mapped to the OWASP LLM Top 10",
          "Rarely: policy focus",
          "Rarely in scope",
          "Emerging practice, team-delivered",
        ],
      },
      {
        label: "Bilingual Law 25 fit",
        values: [
          "Native FR and EN, Quebec only",
          "Strong on Law 25",
          "Varies, tools often English-first",
          "Strong, at premium cost",
        ],
      },
      {
        label: "Direct principal access",
        values: [
          "The founder, on every engagement",
          "Vendor staff",
          "Technicians, vendor escalation",
          "Mixed teams, partner oversight",
        ],
      },
      {
        label: "Fixed pricing",
        values: [
          "Yes: $5,000 to $10,000 for the audit",
          "Platform subscription",
          "$150 to $250 an hour",
          "$25,000 to $100,000+",
        ],
      },
    ],
  },
  partners: {
    title: "Partner program",
    intro:
      "Your clients ask you about Law 25 and AI. We supply the technical proof and you keep the relationship.",
    types: [
      {
        id: "accounting_firm",
        name: "Accounting firms",
        offer: "A 10% referral fee on the first engagement and a co-presented briefing twice a year.",
      },
      {
        id: "msp",
        name: "MSPs with 40 to 500 seats",
        offer: "Referral or a white-label audit. You keep all the infrastructure work.",
      },
      {
        id: "fractional_cto",
        name: "Fractional CTOs and vCIOs",
        offer: "The T1 audit, white-labelled under your name, for AI security depth.",
      },
      {
        id: "privacy_counsel",
        name: "Privacy counsel",
        offer: "Technical evidence for your mandates and mutual referral. We give no legal advice.",
      },
    ],
    cta: "Become a partner",
    drawerTitle: "Become a partner",
    drawerIntro: "Tell us who you are. We reply within one business day.",
    partnerType: "Partner type",
    partnerTypePlaceholder: "Choose…",
    partnerTypeOptions: {
      accounting_firm: "Accounting firm",
      msp: "MSP",
      fractional_cto: "Fractional CTO or vCIO",
      privacy_counsel: "Privacy counsel",
      other: "Other (association, business network)",
    },
    message: "Message (optional)",
    submit: "Send request",
    submitting: "Sending…",
    success: "Request received. We will email you within one business day.",
    close: "Close",
  },
  consent: {
    title: "Your cookies, your choice",
    body: "We use audience measurement cookies only if you accept them. The site works the same way if you refuse.",
    accept: "Accept",
    refuse: "Refuse",
    settings: "Settings",
    settingsTitle: "Cookie settings",
    essential: "Essential",
    essentialBody: "Language and consent choice. Always on.",
    analytics: "Audience measurement",
    analyticsBody: "Page views and diagnostic steps, with no personal information.",
    save: "Save my choices",
    close: "Close",
    privacyLink: "Privacy policy",
  },
  footer: {
    disclaimer:
      "CyberSentinelPro delivers technical cybersecurity and operational compliance engineering, not legal advice.",
    privacy: "Privacy policy",
    privacyOfficer: "Person in charge of protecting personal information",
    address: "Laval, Quebec, Canada",
    consentSettings: "Cookie settings",
    rights: "© 2026 CyberSentinelPro",
  },
  privacy: {
    title: "Privacy policy",
    updated: "Last updated: 21/11/2026",
    intro:
      "This policy explains what personal information CyberSentinelPro collects on this site, why, where it is hosted and how to exercise your rights.",
    officerHeading: "Person in charge of protecting personal information",
    officerBody:
      "{name}, founder, is the person in charge of protecting personal information at CyberSentinelPro. For any question or request: {email}.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Diagnostic: your name, work email, company, your answers (size, sector, AI tools, controls in place) and the resulting score.",
          "Partner program: your name, email, company, partner type and message.",
          "We do not store your IP address.",
        ],
      },
      {
        heading: "Why",
        body: [
          "To send you your result, discuss it with you and, if you agree separately, send you the monthly newsletter.",
          "To measure site audience, only if you accept measurement cookies.",
        ],
      },
      {
        heading: "Vendors and hosting locations",
        body: [
          "Vercel Inc. (United States): site hosting and form processing.",
          "Supabase: request database, hosted in Canada (ca-central-1 region).",
          "GoHighLevel (United States): request follow-up.",
          "Cal.com, Inc. (United States): appointment booking. The calendar loads only if you click “Book”.",
        ],
      },
      {
        heading: "Retention",
        body: ["Requests are kept for 24 months, then destroyed.", "Your cookie choice is kept for 12 months."],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask to access, correct or delete your information, and withdraw your consent at any time.",
          "Write to the person named above. We reply within 30 days.",
          "You can also file a complaint with the Commission d'accès à l'information du Québec.",
        ],
      },
    ],
    analyticsHeading: "Audience measurement",
    analytics: {
      none: "No audience measurement tool is active on this site at the moment.",
      plausible: "Plausible Analytics (European Union), only after your consent. No advertising cookies.",
      vercel: "Vercel Web Analytics (United States), only after your consent.",
    },
    back: "Back to home",
  },
};
