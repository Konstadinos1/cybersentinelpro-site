/**
 * French is the source dictionary (Bill 96). `en.ts` must satisfy `typeof fr`.
 * Typography: non-breaking spaces ( ) before : ; ? ! and inside « », and in amounts.
 */
export const fr = {
  meta: {
    title: "CyberSentinelPro | Audit Loi 25 et sécurité de l'IA, Laval",
    description:
      "Audit hybride Loi 25 et tests adverses de vos systèmes d'IA, à prix fixe, pour les entreprises québécoises de 25 à 250 employés. Score de risque gratuit.",
    privacyTitle: "Politique de confidentialité | CyberSentinelPro",
    privacyDescription:
      "Quels renseignements personnels CyberSentinelPro recueille, pourquoi, où ils sont hébergés et comment exercer vos droits.",
  },
  hud: {
    nav: {
      solutions: "Solutions",
      sandbox: "Bac à sable",
      diagnostic: "Diagnostic Loi 25",
      partners: "Partenaires",
    },
    cta: "Score de risque gratuit",
    telemetry: "SYS.STATUS // LAW25.READY // LAVAL.QC",
    audioOn: "AUDIO: ON",
    audioOff: "AUDIO: OFF",
    audioLabel: "Ambiance sonore",
    menu: "Menu",
    closeMenu: "Fermer le menu",
    skip: "Aller au contenu",
    localeLabel: "Choisir la langue",
    home: "CyberSentinelPro, accueil",
  },
  hero: {
    title: "Prouvez que vos systèmes d'IA protègent vraiment les renseignements personnels.",
    subtitle:
      "La plupart des entreprises québécoises ont terminé la paperasse de la Loi 25. Peu peuvent démontrer que leurs agents IA, leurs robots conversationnels et leurs intégrations résistent à une attaque. Nous vérifions les deux, à prix fixe.",
    primaryCta: "Obtenir mon score de risque",
    secondaryCta: "Voir une attaque bloquée",
    trustLabel: "Cadres de référence",
    trust: [
      "OWASP LLM Top 10",
      "Loi 25 du Québec",
      "Défense agentique en temps réel",
      "Bilingue, Laval et Grand Montréal",
    ],
  },
  calculator: {
    title: "Diagnostic Loi 25 et IA",
    intro:
      "Cinq étapes, environ deux minutes. Le score suit une grille fixe, la même pour toutes les entreprises.",
    stepLabel: "Étape {current} de {total}",
    back: "Retour",
    next: "Continuer",
    submit: "Voir mon score",
    submitting: "Calcul en cours…",
    selectRequired: "Choisissez une réponse pour continuer.",
    headcount: {
      title: "Combien d'employés compte votre entreprise\u00a0?",
      options: { "25-50": "25 à 50", "51-150": "51 à 150", "151-250+": "151 à 250 et plus" },
    },
    vertical: {
      title: "Dans quel secteur êtes-vous\u00a0?",
      options: {
        clinics_health: "Cliniques et santé",
        accounting_legal: "Cabinets comptables et juridiques",
        retail_hospitality: "Commerce de détail et restauration multisites",
        b2b_saas: "Logiciels B2B et services technologiques",
        other: "Autre secteur",
      },
    },
    aiStack: {
      title: "Quels outils d'IA votre équipe utilise-t-elle\u00a0?",
      hint: "Choisissez tout ce qui s'applique.",
      options: {
        copilot_chatgpt: "Copilot ou ChatGPT",
        voice_ai: "IA vocale (réception, centre d'appels)",
        custom_agents_rag: "Agents sur mesure ou RAG",
        exploring: "Nous explorons encore",
      },
    },
    controls: {
      title: "Qu'avez-vous déjà en place\u00a0?",
      yes: "Oui",
      no: "Non",
      items: {
        privacy_officer:
          "Un responsable de la protection des renseignements personnels désigné par écrit",
        incident_register: "Un registre des incidents de confidentialité tenu à jour",
        efvp: "Une ÉFVP pour vos projets technologiques",
      },
    },
    contact: {
      title: "Où envoyer votre résultat\u00a0?",
    },
    result: {
      title: "Votre score de préparation",
      outOf: "sur 100",
      exposureLabel: "Exposition\u00a0:",
      tiers: { low: "Faible", moderate: "Modérée", high: "Élevée", critical: "Critique" },
      statutory:
        "Sous la Loi 25, la Commission d'accès à l'information peut imposer des sanctions administratives pécuniaires allant jusqu'à 10\u00a0M$ ou 2\u00a0% du chiffre d'affaires mondial. Les amendes pénales peuvent atteindre 25\u00a0M$ ou 4\u00a0%.",
      fixesTitle: "Vos trois priorités",
      startTitle: "Point de départ recommandé",
      startTierName: "Audit hybride Loi 25 et gouvernance IA (T1)",
      nextStepTier2:
        "Suite probable\u00a0: le déploiement de garde-fous (T2), puisque vous exploitez des agents ou de l'IA vocale.",
      nextStepDefault: "Ensuite\u00a0: le mandat de posture (T3) garde vos correctifs en place.",
      book: "Réserver l'appel de résultats (45 min)",
      bookNotice:
        "Le calendrier est fourni par Cal.com, un service tiers. Il s'est chargé parce que vous avez cliqué sur «\u00a0Réserver\u00a0».",
      noBooking: "Nous vous écrivons dans un jour ouvrable pour planifier l'appel de résultats.",
      deepAudit: "Faire l'évaluation complète (40 à 50 questions)",
      restart: "Recommencer",
      savedError:
        "Votre demande n'a pas été enregistrée. Le score ci-dessous est calculé dans votre navigateur. Réessayez l'envoi dans un instant.",
      retry: "Réessayer l'envoi",
      method: "Comment le score est calculé",
      methodBody:
        "Base de 25 points, plus 25 par mesure en place. On retire jusqu'à 25 points selon vos outils d'IA, de 3 à 10 selon le secteur, et 5 au-delà de 150 employés.",
    },
    fixes: {
      appoint_privacy_officer: {
        title: "Désigner le responsable de la protection des renseignements personnels",
        body: "Par défaut, c'est la personne ayant la plus haute autorité. Déléguez par écrit et publiez ses coordonnées sur votre site.",
      },
      open_incident_register: {
        title: "Tenir un registre des incidents de confidentialité",
        body: "Chaque incident y est consigné, même sans risque de préjudice sérieux. La Commission peut en demander une copie.",
      },
      run_efvp: {
        title: "Réaliser une ÉFVP avant votre prochain projet technologique",
        body: "Elle est exigée pour tout système qui traite des renseignements personnels, et avant de les communiquer à l'extérieur du Québec.",
      },
      redteam_agents: {
        title: "Tester vos agents contre l'injection de prompts",
        body: "Vérifiez qu'un document ou un courriel piégé ne peut pas leur faire appeler un outil ni révéler des données. C'est le risque n°\u00a01 du OWASP LLM Top 10 (2025).",
      },
      secure_voice_recordings: {
        title: "Encadrer les enregistrements de l'IA vocale",
        body: "Informez les appelants, limitez la conservation des enregistrements et des transcriptions, et vérifiez où le fournisseur les héberge.",
      },
      govern_genai_use: {
        title: "Encadrer l'usage de Copilot et de ChatGPT",
        body: "Dressez l'inventaire des outils, précisez ce qui ne doit jamais y être collé et activez les réglages qui excluent vos données de l'entraînement.",
      },
      ai_policy_before_pilot: {
        title: "Adopter une politique d'IA avant le premier projet pilote",
        body: "Une page suffit\u00a0: les outils permis, les données interdites et la personne qui approuve un nouvel usage.",
      },
      map_cross_border_transfers: {
        title: "Recenser les communications hors Québec",
        body: "Listez les fournisseurs qui hébergent vos renseignements personnels à l'extérieur du Québec. Chacun exige une évaluation préalable.",
      },
      tabletop_incident_drill: {
        title: "Simuler un incident une fois par année",
        body: "Un exercice de 90 minutes montre qui décide, qui avise la Commission et en combien de temps.",
      },
      retention_schedule: {
        title: "Fixer un calendrier de conservation",
        body: "Détruisez ou anonymisez les renseignements une fois atteintes les fins pour lesquelles ils ont été recueillis.",
      },
    },
  },
  forms: {
    fullName: "Nom complet",
    workEmail: "Courriel professionnel",
    company: "Entreprise",
    consentContact: "J'accepte que CyberSentinelPro me contacte au sujet de ma demande.",
    consentMarketing: "J'accepte aussi de recevoir l'infolettre mensuelle (facultatif).",
    purpose:
      "Nous utilisons ces renseignements pour répondre à votre demande et en discuter avec vous. Ils sont conservés 24 mois.",
    privacyLink: "Politique de confidentialité",
    requiredMark: "obligatoire",
    errors: {
      full_name: "Entrez votre nom complet (au moins 2 caractères).",
      work_email: "Entrez une adresse courriel valide, par exemple nom@entreprise.ca.",
      company: "Entrez le nom de votre entreprise.",
      consent_contact: "Cochez cette case pour que nous puissions vous répondre.",
      partner_type: "Choisissez le type de partenaire.",
      message: "Votre message dépasse 2\u00a0000 caractères.",
      rate_limited: "Trop de demandes en une minute. Attendez un instant, puis réessayez.",
      generic: "L'envoi n'a pas fonctionné. Vérifiez votre connexion, puis réessayez.",
    },
  },
  sandbox: {
    title: "Bac à sable des menaces",
    intro:
      "Trois attaques connues contre Clara, l'assistante IA fictive de Groupe Exemple inc. À gauche, la réponse scénarisée d'un modèle sans protection. À droite, notre moteur de règles, exécuté dans votre navigateur.",
    presetsLabel: "Choisir une attaque",
    presets: {
      prompt_extraction: {
        label: "Extraction du prompt système",
        summary: "L'attaquant demande à l'agent d'ignorer ses consignes et d'afficher sa configuration.",
      },
      law25_pii_exfil: {
        label: "Exfiltration de renseignements personnels",
        summary:
          "On demande à l'agent d'exporter des numéros d'assurance sociale vers une adresse externe.",
      },
      mcp_tool_hijack: {
        label: "Détournement d'outil MCP",
        summary:
          "Un document piégé ordonne à l'agent d'appeler un outil d'envoi vers un serveur inconnu.",
      },
    },
    attackLabel: "Requête de l'attaquant",
    hiddenLabel: "Texte caché dans le document",
    unprotectedTitle: "Modèle sans protection",
    simulationTag: "Simulation scénarisée",
    guardedTitle: "Exécution sous garde-fous",
    liveTag: "Moteur réel, dans votre navigateur",
    breach: "BRÈCHE DÉTECTÉE",
    blocked: "BLOQUÉ + JOURNALISÉ",
    allowed: "AUTORISÉ",
    rule: "Règle",
    owasp: "Référence OWASP",
    latency: "Latence moyenne (200 exécutions)",
    auditJson: "Journal d'audit (JSON)",
    note: "Les secrets, noms et numéros affichés sont fictifs. Aucune donnée ne quitte votre navigateur.",
  },
  offers: {
    title: "Prouver, corriger, maintenir",
    intro:
      "Trois mandats à prix fixe. Chacun a une portée écrite, un délai et un livrable. Le fondateur exécute chaque mandat lui-même.",
    includesLabel: "Inclus",
    pricesNote: "Prix en dollars canadiens, taxes en sus.",
    disclaimer:
      "CyberSentinelPro fournit des services d'ingénierie en cybersécurité et en conformité opérationnelle, et non des avis juridiques.",
    tiers: [
      {
        id: "tier1",
        code: "T1",
        name: "Audit hybride Loi 25 et gouvernance IA",
        price: "5\u00a0000\u00a0$ à 10\u00a0000\u00a0$",
        cadence: "Prix fixe, résultats en 10 jours ouvrables",
        includes: [
          "Revue de vos documents selon les obligations de la Loi 25",
          "Tests adverses de vos surfaces d'IA, alignés sur le OWASP LLM Top 10 (2025)",
          "Feuille de route des correctifs, classés par gravité",
          "Breffage de 60 minutes avec la direction",
        ],
        anchors:
          "5\u00a0000\u00a0$ pour un outil d'IA et une documentation légère, 7\u00a0500\u00a0$ en standard, 10\u00a0000\u00a0$ pour plusieurs flux de travail.",
        outOfScope: "Hors portée\u00a0: la correction, les tests d'intrusion réseau hors IA et les opinions juridiques.",
        cta: "Commencer par le diagnostic",
        href: "#diagnostic",
      },
      {
        id: "tier2",
        code: "T2",
        name: "Déploiement sécurisé d'agents IA et garde-fous",
        price: "5\u00a0000\u00a0$ à 15\u00a0000\u00a0$",
        cadence: "Prix fixe, 3 à 6 semaines",
        includes: [
          "Défenses contre l'injection de prompts, en entrée et en sortie",
          "Permissions des agents et passerelle de sécurité MCP",
          "Dossier ÉFVP pour le système d'IA",
          "Formation bilingue de 90 minutes et re-test d'acceptation",
        ],
        anchors: "Suit un audit T1\u00a0: on part de ses constats et on les re-teste à la fin.",
        outOfScope: "Hors portée\u00a0: la réécriture d'applications et le développement continu.",
        cta: "Voir un garde-fou en action",
        href: "#sandbox",
      },
      {
        id: "tier3",
        code: "T3",
        name: "Mandat de posture de sécurité IA et conformité",
        price: "2\u00a0000\u00a0$ à 5\u00a0000\u00a0$ par mois",
        cadence: "Minimum de 6 mois, cycle mensuel",
        includes: [
          "Suivi mensuel de vos obligations Loi 25",
          "Bloc-conseil de 4 à 8 heures par mois",
          "Re-test adverse trimestriel de vos surfaces d'IA",
          "Rapport de posture bilingue pour la direction",
        ],
        anchors: "Le prix dépend du nombre de systèmes et de la profondeur des tests.",
        outOfScope: "Ce n'est pas un centre de surveillance 24/7 ni un service d'assistance.",
        cta: "Commencer par le diagnostic",
        href: "#diagnostic",
      },
    ],
  },
  moat: {
    title: "Comment nous nous comparons",
    intro:
      "Une comparaison par catégorie de fournisseurs, selon leur positionnement public observé en novembre 2026.",
    criterionLabel: "Critère",
    columns: [
      "CyberSentinelPro",
      "Logiciels de conformité (listes de contrôle)",
      "TI généralistes (MSP)",
      "Grands cabinets (Big 4)",
    ],
    rows: [
      {
        label: "Rapidité",
        values: [
          "Score immédiat, constats en 10 jours ouvrables",
          "Quelques semaines d'intégration",
          "Quelques semaines, selon les billets",
          "4 à 12 semaines avant le lancement",
        ],
      },
      {
        label: "Tests adverses d'IA en direct",
        values: [
          "Oui, selon le OWASP LLM Top 10",
          "Rarement\u00a0: axés sur les politiques",
          "Rarement dans la portée",
          "Pratique en développement, en équipe",
        ],
      },
      {
        label: "Loi 25, en français et en anglais",
        values: [
          "Natif FR et EN, Québec seulement",
          "Solide sur la Loi 25",
          "Variable, outils souvent en anglais",
          "Solide, à prix élevé",
        ],
      },
      {
        label: "Accès direct au fondateur",
        values: [
          "Le fondateur, à chaque mandat",
          "Personnel du fournisseur",
          "Techniciens, escalade au fournisseur",
          "Équipes mixtes, associé en supervision",
        ],
      },
      {
        label: "Prix fixe",
        values: [
          "Oui\u00a0: 5\u00a0000\u00a0$ à 10\u00a0000\u00a0$ pour l'audit",
          "Abonnement à la plateforme",
          "150\u00a0$ à 250\u00a0$ l'heure",
          "25\u00a0000\u00a0$ à 100\u00a0000\u00a0$ et plus",
        ],
      },
    ],
  },
  partners: {
    title: "Programme partenaires",
    intro:
      "Vos clients vous questionnent sur la Loi 25 et l'IA. Nous fournissons la preuve technique et vous gardez la relation.",
    types: [
      {
        id: "accounting_firm",
        name: "Cabinets comptables",
        offer: "Une commission de 10\u00a0% sur le premier mandat et un breffage coprésenté deux fois par année.",
      },
      {
        id: "msp",
        name: "MSP de 40 à 500 postes",
        offer: "Référence ou audit en marque blanche. Vous gardez tout le travail d'infrastructure.",
      },
      {
        id: "fractional_cto",
        name: "CTO et vCIO à temps partagé",
        offer: "L'audit T1 en marque blanche, sous votre nom, pour la profondeur en sécurité de l'IA.",
      },
      {
        id: "privacy_counsel",
        name: "Cabinets en protection des renseignements personnels",
        offer:
          "Des preuves techniques pour vos mandats et une référence mutuelle. Nous ne donnons aucun avis juridique.",
      },
    ],
    cta: "Devenir partenaire",
    drawerTitle: "Devenir partenaire",
    drawerIntro: "Dites-nous qui vous êtes. Nous répondons dans un jour ouvrable.",
    partnerType: "Type de partenaire",
    partnerTypePlaceholder: "Choisir…",
    partnerTypeOptions: {
      accounting_firm: "Cabinet comptable",
      msp: "MSP",
      fractional_cto: "CTO ou vCIO à temps partagé",
      privacy_counsel: "Cabinet en protection des renseignements personnels",
      other: "Autre (association, réseau d'affaires)",
    },
    message: "Message (facultatif)",
    submit: "Envoyer la demande",
    submitting: "Envoi…",
    success: "Demande reçue. Nous vous écrivons dans un jour ouvrable.",
    close: "Fermer",
  },
  consent: {
    title: "Vos témoins, votre choix",
    body: "Nous utilisons des témoins de mesure d'audience seulement si vous les acceptez. Le site fonctionne de la même façon si vous refusez.",
    accept: "Accepter",
    refuse: "Refuser",
    settings: "Paramètres",
    settingsTitle: "Paramètres des témoins",
    essential: "Essentiels",
    essentialBody: "Langue et choix de consentement. Toujours actifs.",
    analytics: "Mesure d'audience",
    analyticsBody: "Pages vues et étapes du diagnostic, sans renseignements personnels.",
    save: "Enregistrer mes choix",
    close: "Fermer",
    privacyLink: "Politique de confidentialité",
  },
  footer: {
    disclaimer:
      "CyberSentinelPro fournit des services d'ingénierie en cybersécurité et en conformité opérationnelle, et non des avis juridiques.",
    privacy: "Politique de confidentialité",
    privacyOfficer: "Responsable de la protection des renseignements personnels",
    address: "Laval (Québec), Canada",
    consentSettings: "Paramètres des témoins",
    rights: "© 2026 CyberSentinelPro",
  },
  privacy: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour\u00a0: 21/11/2026",
    intro:
      "Cette politique explique quels renseignements personnels CyberSentinelPro recueille sur ce site, pourquoi, où ils sont hébergés et comment exercer vos droits.",
    officerHeading: "Responsable de la protection des renseignements personnels",
    officerBody: "{name}, fondateur, est le responsable de la protection des renseignements personnels de CyberSentinelPro. Pour toute question ou demande\u00a0: {email}.",
    sections: [
      {
        heading: "Ce que nous recueillons",
        body: [
          "Diagnostic\u00a0: votre nom, votre courriel professionnel, votre entreprise, vos réponses (taille, secteur, outils d'IA, mesures en place) et le score qui en découle.",
          "Programme partenaires\u00a0: votre nom, votre courriel, votre entreprise, le type de partenaire et votre message.",
          "Nous ne conservons pas votre adresse IP.",
        ],
      },
      {
        heading: "Pourquoi",
        body: [
          "Vous transmettre votre résultat, en discuter avec vous et, si vous l'acceptez séparément, vous envoyer l'infolettre mensuelle.",
          "Mesurer l'audience du site, seulement si vous acceptez les témoins de mesure.",
        ],
      },
      {
        heading: "Fournisseurs et lieux d'hébergement",
        body: [
          "Vercel Inc. (États-Unis)\u00a0: hébergement du site et traitement des formulaires.",
          "Supabase\u00a0: base de données des demandes, hébergée au Canada (région ca-central-1).",
          "GoHighLevel (États-Unis)\u00a0: suivi des demandes.",
          "Cal.com, Inc. (États-Unis)\u00a0: prise de rendez-vous. Le calendrier se charge seulement si vous cliquez sur «\u00a0Réserver\u00a0».",
        ],
      },
      {
        heading: "Conservation",
        body: [
          "Les demandes sont conservées 24 mois, puis détruites.",
          "Votre choix de témoins est conservé 12 mois.",
        ],
      },
      {
        heading: "Vos droits",
        body: [
          "Vous pouvez demander l'accès à vos renseignements, leur rectification ou leur suppression, et retirer votre consentement en tout temps.",
          "Écrivez au responsable ci-dessus. Nous répondons dans les 30 jours.",
          "Vous pouvez aussi porter plainte auprès de la Commission d'accès à l'information du Québec.",
        ],
      },
    ],
    analyticsHeading: "Mesure d'audience",
    analytics: {
      none: "Aucun outil de mesure d'audience n'est actif sur ce site pour le moment.",
      plausible:
        "Plausible Analytics (Union européenne), seulement après votre consentement. Aucun témoin publicitaire.",
      vercel: "Vercel Web Analytics (États-Unis), seulement après votre consentement.",
    },
    back: "Retour à l'accueil",
  },
};

export type Dictionary = typeof fr;
