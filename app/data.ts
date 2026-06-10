export type CategoryId = "health" | "education" | "environment";

export type StageId = "understand" | "imagine" | "create" | "decide";

export type PolicyIssue = {
  id: string;
  title: string;
  category: CategoryId;
  challenge: string;
  brief: string;
  lessHeardGroups: string[];
};

export type Card = {
  title: string;
  text: string;
  prompt: string;
};

export type ResourceToken = {
  id: string;
  name: string;
  description: string;
};

export type ScoreKey = "inclusion" | "feasibility" | "impact" | "equity" | "innovation";

export type EventChoice = {
  id: "a" | "b" | "c";
  label: string;
  consequence: string;
  scoreEffects: Partial<Record<ScoreKey, number>>;
  resourceEffects?: Partial<Record<string, number>>;
  quality: number;
};

export type ConsequenceEvent = {
  title: string;
  description: string;
  consequence: string;
  choices: EventChoice[];
};

export type EvidenceCard = {
  id: string;
  title: string;
  type:
    | "Policy Report"
    | "Service Data"
    | "Research Finding"
    | "User Voice"
    | "Audit Finding"
    | "Evaluation Finding";
  finding: string;
  implication: string;
  sourceOrganisation: string;
  sourceTitle: string;
  sourceYear: string;
};

export type ConstraintCard = {
  id: string;
  title: string;
  description: string;
  impact: string;
  response: string;
};

export type ContextId = "qatar" | "uk" | "pakistan";

export type Reference = {
  organisation: string;
  title: string;
  year: string;
};

export type ContextStakeholder = {
  title: string;
  text: string;
  prompt: string;
};

export type RoleObjective = {
  id: string;
  name: string;
  icon: string;
  purpose: string;
  defends: string;
  questions: string[];
  objectives: string[];
  successCriteria: string;
  hiddenObjective: string;
  hiddenPriority: string;
  challengeQuestions: string[];
};

export type ReflectionPrompts = {
  learning: string[];
  debrief: string[];
};

export type IssueContentPack = {
  stakeholders: ContextStakeholder[];
  evidence: EvidenceCard[];
  events: ConsequenceEvent[];
  constraints: ConstraintCard[];
  roleObjectives: RoleObjective[];
  hiddenAgendas: string[];
  reflectionPrompts: ReflectionPrompts;
  references: Reference[];
};

export type ContextPack = {
  id: ContextId;
  name: string;
  description: string;
  issuePacks?: Record<string, IssueContentPack>;
  evidencePacks: Record<string, EvidenceCard[]>;
  eventDecks: Record<string, ConsequenceEvent[]>;
  constraintPacks?: Record<string, ConstraintCard[]>;
  stakeholdersByIssue?: Record<string, ContextStakeholder[]>;
  roleObjectivesByIssue?: Record<string, RoleObjective[]>;
  reflectionPromptsByIssue?: Record<string, ReflectionPrompts>;
  stakeholders: ContextStakeholder[];
  constraints: ConstraintCard[];
  references: Reference[];
};

export type TeamRole = {
  id: string;
  name: string;
  icon: string;
  purpose: string;
  defends: string;
  questions: string[];
  successCriteria: string;
  hiddenObjective: string;
  challengeQuestions: string[];
};

export function getMissionBrief(contextName: string, issueTitle: string) {
  return `${contextName} decision-makers have identified a challenge in improving ${issueTitle.toLowerCase()} for people who may need support but are less likely to engage with services. Your team has been asked to design a realistic pilot that can be presented to senior decision-makers.`;
}

export const categories = [
  {
    id: "health" as const,
    name: "Health Policy",
    description: "Improve access, trust, prevention, and quality in health services."
  },
  {
    id: "education" as const,
    name: "Education Policy",
    description: "Support learners, families, schools, and local education systems."
  },
  {
    id: "environment" as const,
    name: "Environment Policy",
    description: "Help communities adapt to climate, place, and environmental risks."
  }
];

export const policyIssues: PolicyIssue[] = [
  {
    id: "mental-health-access",
    title: "Mental Health Services Access",
    category: "health",
    challenge: "How can we improve access to mental health support for people who need help early but are less likely to engage?",
    brief: "Focus on awareness, referral routes, trust, waiting times, stigma, and support before crisis.",
    lessHeardGroups: ["Young adults", "Men less likely to seek help", "Rural residents", "People facing language barriers"]
  },
  {
    id: "maternal-health-access",
    title: "Maternal Health Services Access",
    category: "health",
    challenge: "How can we improve access to maternal health services for mothers, parents, and carers who face barriers to support?",
    brief: "Focus on pregnancy, birth, postnatal care, family support, continuity, and culturally safe services.",
    lessHeardGroups: ["Young parents", "Migrant families", "Single parents", "Parents with disabilities"]
  },
  {
    id: "vaccine-hesitancy",
    title: "Vaccine Hesitancy",
    category: "health",
    challenge: "How can we improve confidence, access, and informed choice around vaccination?",
    brief: "Focus on trust, misinformation, convenience, community voices, and respectful communication.",
    lessHeardGroups: ["Parents with safety concerns", "Communities with low trust", "Digitally excluded groups", "Shift workers"]
  },
  {
    id: "school-dropout-prevention",
    title: "School Dropout Prevention",
    category: "education",
    challenge: "How can we reduce school dropout by designing earlier, more supportive responses with students and families?",
    brief: "Focus on belonging, attendance, wellbeing, family pressure, learning support, and transition points.",
    lessHeardGroups: ["Students with caring duties", "Students with low attendance", "Families under financial pressure", "Students with additional needs"]
  },
  {
    id: "climate-adaptation",
    title: "Climate Adaptation",
    category: "environment",
    challenge: "How can we help communities adapt to climate risks in ways that are fair, practical, and locally trusted?",
    brief: "Focus on heat, flooding, public spaces, housing, communication, and support for vulnerable residents.",
    lessHeardGroups: ["Older residents", "Outdoor workers", "Renters", "Low-income households"]
  }
];

export const stages = [
  {
    id: "understand" as const,
    title: "Understand Experiences",
    short: "Listen and map",
    description: "Explore what people experience now, who is missing, and where access breaks down."
  },
  {
    id: "imagine" as const,
    title: "Imagine the Ideal",
    short: "Picture better",
    description: "Describe what a better journey would feel like for people and partners."
  },
  {
    id: "create" as const,
    title: "Create New Ideas",
    short: "Prototype options",
    description: "Generate service ideas, combine them, and make rough versions that can be tested."
  },
  {
    id: "decide" as const,
    title: "Make Decisions",
    short: "Choose and test",
    description: "Prioritize an idea, check equity and feasibility, and define a first test."
  }
];

export const stakeholderCards: Card[] = [
  {
    title: "Service User",
    text: "You need support but may be tired, busy, anxious, or unsure whether the service is for you.",
    prompt: "Ask: Would I know this exists, and would I feel welcome?"
  },
  {
    title: "Frontline Worker",
    text: "You understand daily pressures and know where official processes do not match real life.",
    prompt: "Ask: Can staff deliver this without creating hidden extra work?"
  },
  {
    title: "Community Connector",
    text: "You are trusted locally through a community group, school, library, clinic, or neighbourhood network.",
    prompt: "Ask: How can trusted relationships be supported, not exploited?"
  },
  {
    title: "Policy Lead",
    text: "You need a plan that is fair, lawful, measurable, and realistic for public services.",
    prompt: "Ask: What decision could be made next month?"
  },
  {
    title: "Data and Insights Lead",
    text: "You can use patterns and evidence, but you know numbers do not explain everything.",
    prompt: "Ask: What data and stories do we need together?"
  },
  {
    title: "Equity Advocate",
    text: "You look for who is left out by design choices, eligibility rules, language, timing, or location.",
    prompt: "Ask: Who benefits least from this idea unless we adjust it?"
  }
];

export const activityCards: Record<StageId, Card[]> = {
  understand: [
    {
      title: "Journey Map",
      text: "Map the current journey from needing support to receiving useful help. Mark feelings, barriers, and drop-off points.",
      prompt: "Output: three access barriers."
    },
    {
      title: "Who Is Missing?",
      text: "List groups who are less likely to engage. Choose one priority group and name what you need to learn from them.",
      prompt: "Output: one priority group."
    },
    {
      title: "Trust Check",
      text: "Sort touchpoints into trust-building and trust-breaking moments.",
      prompt: "Output: one trust-building change."
    }
  ],
  imagine: [
    {
      title: "Ideal First Contact",
      text: "Write the first message or invitation someone receives. Keep it warm, clear, and stigma-free.",
      prompt: "Output: invitation script."
    },
    {
      title: "No Wrong Door",
      text: "Design how someone can ask for help in any partner setting and still reach the right support.",
      prompt: "Output: simple route to support."
    },
    {
      title: "Future Headline",
      text: "Write a headline from one year in the future that shows what improved access looks like.",
      prompt: "Output: success statement."
    }
  ],
  create: [
    {
      title: "Idea Sprint",
      text: "Generate ten service improvement ideas. Include tiny changes, partnership ideas, and bold options.",
      prompt: "Output: idea list."
    },
    {
      title: "Prototype on Paper",
      text: "Sketch a message, referral route, service journey, appointment model, or outreach approach.",
      prompt: "Output: rough prototype."
    },
    {
      title: "Make It Easier",
      text: "Choose one difficult step and reduce effort, uncertainty, stigma, waiting, travel, or repetition.",
      prompt: "Output: easier service step."
    }
  ],
  decide: [
    {
      title: "Impact vs Effort",
      text: "Compare ideas by likely impact and delivery effort. Choose one quick win or one bigger bet.",
      prompt: "Output: priority idea."
    },
    {
      title: "Equity Check",
      text: "Ask who may still be left out. Add one adjustment that makes the idea fairer.",
      prompt: "Output: inclusion adjustment."
    },
    {
      title: "Test Card",
      text: "Write: We believe this will help [group] because [reason]. We will know if it works when [measure].",
      prompt: "Output: testable hypothesis."
    }
  ]
};

const commonChoices = {
  budgetCut: [
    {
      id: "a" as const,
      label: "Reduce the scope",
      consequence: "The pilot becomes easier to deliver but reaches fewer people.",
      scoreEffects: { feasibility: 1, impact: -1 },
      quality: 2
    },
    {
      id: "b" as const,
      label: "Seek partner support",
      consequence: "A trusted partner shares delivery, but coordination takes time.",
      scoreEffects: { inclusion: 1, feasibility: 1 },
      resourceEffects: { "community-trust": 1, "time-to-test": -1 },
      quality: 3
    },
    {
      id: "c" as const,
      label: "Delay the pilot",
      consequence: "Planning improves, but urgency and momentum drop.",
      scoreEffects: { feasibility: 1, impact: -1, innovation: -1 },
      quality: 1
    }
  ],
  trust: [
    {
      id: "a" as const,
      label: "Use peer messengers",
      consequence: "People hear from someone relatable, but peer support needs care.",
      scoreEffects: { inclusion: 1, equity: 1 },
      resourceEffects: { "community-trust": 1 },
      quality: 3
    },
    {
      id: "b" as const,
      label: "Issue official reassurance",
      consequence: "The message is clear but may not overcome distrust.",
      scoreEffects: { feasibility: 1, inclusion: -1 },
      quality: 1
    },
    {
      id: "c" as const,
      label: "Host a listening session",
      consequence: "The team learns more before acting, but delivery slows.",
      scoreEffects: { inclusion: 1, equity: 1, feasibility: -1 },
      quality: 2
    }
  ],
  capacity: [
    {
      id: "a" as const,
      label: "Simplify the workflow",
      consequence: "Staff can deliver the idea with fewer steps.",
      scoreEffects: { feasibility: 1, innovation: -1 },
      quality: 2
    },
    {
      id: "b" as const,
      label: "Train a small champion team",
      consequence: "Delivery quality improves but staff time is tighter.",
      scoreEffects: { feasibility: 1, impact: 1 },
      resourceEffects: { "staff-time": -1 },
      quality: 3
    },
    {
      id: "c" as const,
      label: "Keep the full design",
      consequence: "The idea stays ambitious but risks poor implementation.",
      scoreEffects: { innovation: 1, feasibility: -1 },
      quality: 1
    }
  ],
  data: [
    {
      id: "a" as const,
      label: "Pause data sharing",
      consequence: "Privacy risk drops, but learning becomes weaker.",
      scoreEffects: { equity: 1, impact: -1 },
      quality: 2
    },
    {
      id: "b" as const,
      label: "Explain consent clearly",
      consequence: "People understand the trade-off and can choose confidently.",
      scoreEffects: { equity: 1, feasibility: 1 },
      quality: 3
    },
    {
      id: "c" as const,
      label: "Proceed as planned",
      consequence: "The pilot moves quickly but trust may fall.",
      scoreEffects: { feasibility: 1, inclusion: -1, equity: -1 },
      quality: 1
    }
  ],
  demand: [
    {
      id: "a" as const,
      label: "Create triage criteria",
      consequence: "Urgent needs are prioritized but some people wait longer.",
      scoreEffects: { feasibility: 1, equity: 1, impact: -1 },
      quality: 2
    },
    {
      id: "b" as const,
      label: "Add group support",
      consequence: "Reach improves, but individual tailoring drops.",
      scoreEffects: { impact: 1, feasibility: 1, inclusion: -1 },
      quality: 2
    },
    {
      id: "c" as const,
      label: "Secure short-term help",
      consequence: "Capacity improves if partners or temporary staff are available.",
      scoreEffects: { impact: 1 },
      resourceEffects: { "staff-time": 1, "small-budget": -1 },
      quality: 3
    }
  ],
  access: [
    {
      id: "a" as const,
      label: "Move closer to communities",
      consequence: "Access improves but coordination becomes more complex.",
      scoreEffects: { inclusion: 1, equity: 1, feasibility: -1 },
      resourceEffects: { "venue-access": 1 },
      quality: 3
    },
    {
      id: "b" as const,
      label: "Offer transport or timing support",
      consequence: "Hidden costs are reduced, but resources are stretched.",
      scoreEffects: { equity: 1, impact: 1 },
      resourceEffects: { "small-budget": -1 },
      quality: 3
    },
    {
      id: "c" as const,
      label: "Keep one central route",
      consequence: "Delivery is simple but some people remain excluded.",
      scoreEffects: { feasibility: 1, inclusion: -1, equity: -1 },
      quality: 1
    }
  ]
};

const eventTemplates = [
  ["Budget Cut", "Funding is reduced during the pilot planning stage.", "Teams must protect the core idea while lowering cost.", commonChoices.budgetCut],
  ["Election Year", "Leaders want visible results before the election cycle shifts attention.", "A quick win is needed without abandoning co-design.", commonChoices.demand],
  ["Media Criticism", "A local media story questions whether the service is effective.", "Teams must explain evidence, value, and public benefit.", commonChoices.data],
  ["Community Champion Emerges", "A trusted local voice offers to support engagement.", "The champion can build trust if their role is respectful.", commonChoices.trust],
  ["New Funding Opportunity", "A small grant becomes available for a rapid pilot.", "Teams can expand testing if they define measurable learning.", commonChoices.demand],
  ["Staff Shortage", "Key frontline staff are unavailable for two weeks.", "The service model must reduce pressure or shift tasks.", commonChoices.capacity],
  ["Data Privacy Concern", "Participants ask how their information will be used.", "Trust depends on clearer consent and safer data practice.", commonChoices.data],
  ["Political Support", "A senior decision-maker backs the proposal.", "Momentum rises, but the plan must be credible.", commonChoices.demand],
  ["Public Complaint", "A member of the public describes the current system as unfair.", "The complaint exposes a touchpoint that needs redesign.", commonChoices.access],
  ["Service Demand Surge", "Demand rises sharply after outreach improves awareness.", "Teams must manage scale without losing quality.", commonChoices.demand],
  ["Digital Exclusion", "Some participants cannot use the online route.", "An equal non-digital route is required.", commonChoices.access],
  ["Language Barrier", "Important information is not available in trusted languages.", "Communication must be redesigned for understanding.", commonChoices.access],
  ["Partner Withdrawal", "A partner pauses involvement because they are overstretched.", "The team must protect delivery and relationships.", commonChoices.capacity],
  ["Conflicting Evidence", "Data points one way, but lived experience points another.", "Teams must decide how to balance evidence types.", commonChoices.data],
  ["Accessibility Challenge", "A participant identifies a disability access barrier.", "The idea must include a practical adjustment.", commonChoices.access]
] as const;

function buildDeck(prefix: string, focus: string): ConsequenceEvent[] {
  return eventTemplates.map(([title, description, consequence, choices], index) => ({
    title: `${title}`,
    description: `${description} In this ${focus} challenge, the issue becomes visible during stage ${index % 4 + 1}.`,
    consequence,
    choices: [...choices]
  }));
}

export const eventDecks: Record<string, ConsequenceEvent[]> = {
  "mental-health-access": buildDeck("mh", "mental health access"),
  "maternal-health-access": buildDeck("mat", "maternal health access"),
  "vaccine-hesitancy": buildDeck("vac", "vaccine confidence"),
  "school-dropout-prevention": buildDeck("edu", "school dropout prevention"),
  "climate-adaptation": buildDeck("cli", "climate adaptation")
};

const evidenceTypes: EvidenceCard["type"][] = [
  "Policy Report",
  "Service Data",
  "Research Finding",
  "User Voice",
  "Audit Finding",
  "Evaluation Finding"
];

const evidenceFindings = [
  ["Policy Report", "Strategy documents emphasise earlier, more coordinated support.", "Design earlier, clearer routes into help."],
  ["Service Data", "Service use patterns can reveal groups who are not reached by standard access routes.", "Design access routes for people not already using services."],
  ["User Voice", "People may hesitate when they do not know what will happen after first contact.", "Make the first step predictable and safe."],
  ["Research Finding", "Referral steps can be understood differently across organisations.", "Create a shared, plain-language route."],
  ["Audit Finding", "Pilot resources and delivery capacity need to be explicit.", "Prioritize a focused test with measurable learning."],
  ["Evaluation Finding", "Previous implementation learning highlights the importance of simple workflows.", "Make implementation easy for frontline teams."]
] as const;

function buildEvidencePack(issueId: string, focus: string): EvidenceCard[] {
  return evidenceFindings.map(([type, finding, implication], index) => ({
    id: `${issueId}-evidence-${index + 1}`,
    title: `${focus}: ${type}`,
    type: type as EvidenceCard["type"],
    finding: `${finding} This evidence is specific to the ${focus.toLowerCase()} challenge.`,
    implication,
    sourceOrganisation: "PolicyQuest fallback pack",
    sourceTitle: "Generic classroom evidence prompt",
    sourceYear: "Undated"
  }));
}

export const evidencePacks: Record<string, EvidenceCard[]> = {
  "mental-health-access": buildEvidencePack("mental-health-access", "Mental Health Access"),
  "maternal-health-access": buildEvidencePack("maternal-health-access", "Maternal Health Access"),
  "vaccine-hesitancy": buildEvidencePack("vaccine-hesitancy", "Vaccine Confidence"),
  "school-dropout-prevention": buildEvidencePack("school-dropout-prevention", "School Dropout Prevention"),
  "climate-adaptation": buildEvidencePack("climate-adaptation", "Climate Adaptation")
};

export const constraintCards: ConstraintCard[] = [
  {
    id: "budget-freeze",
    title: "Budget Freeze",
    description: "No new spending can be approved during the pilot period.",
    impact: "The team must work within existing resources.",
    response: "Identify what can be tested using current staff, partners, or spaces."
  },
  {
    id: "staff-shortage",
    title: "Staff Shortage",
    description: "Frontline capacity is reduced for the next month.",
    impact: "The delivery model may be too labour-intensive.",
    response: "Simplify tasks and protect only the highest-value staff actions."
  },
  {
    id: "political-deadline",
    title: "Political Deadline",
    description: "A decision is needed before the next committee meeting.",
    impact: "The team must show a credible short-term milestone.",
    response: "Define a small pilot decision and a simple evidence plan."
  },
  {
    id: "data-privacy",
    title: "Data Privacy Requirement",
    description: "Personal data use must be minimized and clearly explained.",
    impact: "Some tracking or follow-up ideas may need redesign.",
    response: "Add clear consent and use only the data needed for learning."
  },
  {
    id: "public-resistance",
    title: "Public Resistance",
    description: "Some residents question why this group is being prioritized.",
    impact: "The team must explain fairness and public value.",
    response: "Prepare a plain-language equity rationale."
  },
  {
    id: "legal-restriction",
    title: "Legal Restriction",
    description: "Eligibility or safeguarding rules limit what can be changed.",
    impact: "The proposal cannot bypass statutory duties.",
    response: "Adjust the idea within the legal boundary."
  },
  {
    id: "low-trust",
    title: "Low Trust",
    description: "Less-heard groups are cautious about engaging with official services.",
    impact: "Outreach may fail without trusted relationships.",
    response: "Use supported community routes and explain what happens next."
  },
  {
    id: "digital-exclusion",
    title: "Digital Exclusion",
    description: "Some participants cannot rely on online forms or apps.",
    impact: "A digital-only plan will exclude people.",
    response: "Create an equal offline route."
  },
  {
    id: "implementation-delay",
    title: "Implementation Delay",
    description: "A system, venue, or approval step will take longer than expected.",
    impact: "The timeline may slip unless the test is simplified.",
    response: "Define a lower-tech or smaller first test."
  },
  {
    id: "partner-capacity",
    title: "Partner Capacity Limit",
    description: "A key partner wants to help but cannot take on extra workload.",
    impact: "The partnership role may be unrealistic.",
    response: "Offer a lighter role with clear support and boundaries."
  }
];

const issueFocus: Record<string, string> = {
  "mental-health-access": "mental health services access",
  "maternal-health-access": "maternal health services access",
  "vaccine-hesitancy": "vaccine confidence and access",
  "school-dropout-prevention": "school dropout prevention",
  "climate-adaptation": "climate adaptation"
};

const contextReferences: Record<ContextId, Reference[]> = {
  qatar: [
    { organisation: "Ministry of Public Health, Qatar", title: "National Health Strategy 2024-2030", year: "2024" },
    { organisation: "Ministry of Public Health, Qatar", title: "Qatar National Mental Health Strategy", year: "2013" },
    { organisation: "World Health Organization", title: "Mental Health Atlas: Qatar country profile", year: "2020" },
    { organisation: "Government of Qatar", title: "Qatar National Vision 2030", year: "2008" }
  ],
  uk: [
    { organisation: "NHS England", title: "The NHS Long Term Plan", year: "2019" },
    { organisation: "NHS England", title: "NHS Mental Health Implementation Plan 2019/20-2023/24", year: "2019" },
    { organisation: "Care Quality Commission", title: "The state of health care and adult social care in England", year: "2024" },
    { organisation: "NICE", title: "NICE guidelines and quality standards for health and care services", year: "Current guidance" }
  ],
  pakistan: [
    { organisation: "Ministry of National Health Services, Regulations and Coordination, Pakistan", title: "National Health Vision 2016-2025", year: "2016" },
    { organisation: "World Health Organization", title: "Mental Health Atlas: Pakistan country profile", year: "2020" },
    { organisation: "World Health Organization Pakistan", title: "Pakistan country cooperation and health systems materials", year: "Current materials" },
    { organisation: "Government of Pakistan", title: "National Climate Change Policy", year: "2021" }
  ]
};

const contextEvidenceTemplates: Record<ContextId, Array<[EvidenceCard["type"], string, string, number]>> = {
  qatar: [
    ["Policy Report", "National strategies emphasise integrated, preventive, and person-centred health services.", "Design proposals should connect access improvements to national health priorities.", 0],
    ["Research Finding", "International mental health system profiles identify service governance, workforce, and community awareness as important implementation issues.", "Teams should consider delivery capacity as well as public awareness.", 2],
    ["Service Data", "Public health planning in Qatar recognises the importance of coordinated services across providers and sectors.", "Access routes should reduce confusion between services.", 0],
    ["User Voice", "In multilingual settings, people may need clear information in languages and formats they trust.", "Plain-language and multilingual communication should be treated as core design work.", 0],
    ["Audit Finding", "Health system governance places emphasis on data protection, regulation, and quality of care.", "Proposals should include safe data use and clear accountability.", 0],
    ["Evaluation Finding", "Service transformation strategies point to the value of prevention, early support, and joined-up care.", "Pilot designs should show how early help will be tested.", 0],
    ["Policy Report", "Qatar National Vision links health and wellbeing to human development.", "Policy ideas should explain their contribution to wellbeing and social development.", 3],
    ["Research Finding", "Global evidence on vaccine confidence highlights trust, convenience, and clear communication as recurring design factors.", "Teams should combine access and trust-building approaches.", 2],
    ["Service Data", "Rapid population diversity can make standard communication channels insufficient.", "Design should include community routes, not only official channels.", 0],
    ["Evaluation Finding", "Cross-sector implementation requires clear roles between ministries, providers, and community organisations.", "The plan should name who does what during a pilot.", 0]
  ],
  uk: [
    ["Policy Report", "NHS plans emphasise expanded access, prevention, and integrated community-based support.", "Teams should align proposals with integrated care and earlier intervention.", 0],
    ["Service Data", "NHS services face visible pressure around access, waiting, and demand management.", "Designs should include realistic prioritisation and follow-up.", 0],
    ["Audit Finding", "CQC reporting highlights variation in quality, access, and system pressures across services.", "Teams should avoid one-size-fits-all assumptions.", 2],
    ["Research Finding", "NICE guidance stresses evidence-informed care, shared decision-making, and quality standards.", "Solutions should include clear standards for safe delivery.", 3],
    ["User Voice", "People often experience fragmented pathways when responsibilities sit across services.", "Design should reduce handoffs and explain next steps.", 0],
    ["Evaluation Finding", "Implementation guidance values measurable outcomes and learning from pilots.", "Teams should define what will be learned before scaling.", 1],
    ["Policy Report", "Mental health policy in England has focused on community access and earlier support.", "Access ideas should reduce crisis-driven entry points.", 1],
    ["Service Data", "Local systems must balance national priorities with local population needs.", "Teams should identify the local partnership needed for delivery.", 0],
    ["Audit Finding", "Workforce pressure is a recurring barrier in health and care delivery.", "The proposal should be deliverable with realistic staffing.", 2],
    ["Evaluation Finding", "Service change is stronger when commissioners, providers, local authorities, and communities share ownership.", "Stakeholder roles should be explicit in the pilot plan.", 0]
  ],
  pakistan: [
    ["Policy Report", "Pakistan health policy materials emphasise universal health coverage, primary care, and health system strengthening.", "Designs should connect access improvements to primary and community care.", 0],
    ["Research Finding", "Published literature on mental health in Pakistan commonly identifies stigma, workforce gaps, and limited specialist access as barriers.", "Solutions should include awareness, referral, and task-sharing considerations.", 1],
    ["Service Data", "Rural and underserved areas often face practical access barriers related to distance, affordability, and service availability.", "The plan should address location, cost, and outreach.", 0],
    ["User Voice", "Health literacy and trust can affect whether people seek support early.", "Communication should use trusted local channels and plain language.", 2],
    ["Audit Finding", "Health system responsibilities are distributed across federal, provincial, and district levels.", "Implementation plans should identify the responsible level of government.", 0],
    ["Evaluation Finding", "Community health worker models are important routes for public health outreach.", "Teams should consider frontline community workers where relevant.", 0],
    ["Policy Report", "Climate policy identifies adaptation and resilience as national priorities.", "Climate adaptation proposals should connect to local resilience and public health.", 3],
    ["Research Finding", "Vaccine confidence research highlights the role of trusted messengers and misinformation management.", "The design should include trusted communication and response to concerns.", 2],
    ["Service Data", "Out-of-pocket costs can influence care-seeking and continuity of support.", "Teams should identify hidden costs in their design.", 0],
    ["Evaluation Finding", "NGOs and community leaders can support delivery when formal systems have limited reach.", "Partnership roles should be clear and respectful.", 0]
  ]
};

function buildContextEvidence(context: ContextId, issueId: string): EvidenceCard[] {
  const focus = issueFocus[issueId];
  const refs = contextReferences[context];

  return contextEvidenceTemplates[context].map(([type, finding, implication, refIndex], index) => ({
    id: `${context}-${issueId}-evidence-${index + 1}`,
    title: `${focus}: ${type}`,
    type,
    finding,
    implication,
    sourceOrganisation: refs[refIndex].organisation,
    sourceTitle: refs[refIndex].title,
    sourceYear: refs[refIndex].year
  }));
}

function buildContextEvidencePacks(context: ContextId) {
  return Object.fromEntries(policyIssues.map((issue) => [issue.id, buildContextEvidence(context, issue.id)]));
}

function buildContextEvents(contextName: string, issueId: string): ConsequenceEvent[] {
  const focus = issueFocus[issueId];

  return eventTemplates.map(([title, description, consequence, choices], index) => ({
    title,
    description: `${description} In ${contextName}, this affects ${focus} through local implementation conditions.`,
    consequence: `${consequence} Teams should respond using context evidence and clearly stated assumptions.`,
    choices: [...choices]
  }));
}

function buildContextEventDecks(contextName: string) {
  return Object.fromEntries(policyIssues.map((issue) => [issue.id, buildContextEvents(contextName, issue.id)]));
}

export const contextPacks: Record<ContextId, ContextPack> = {
  qatar: {
    id: "qatar",
    name: "Qatar",
    description: "A high-income, multilingual health and public service context with strong national strategy, rapid service development, and governance requirements.",
    stakeholders: [
      { title: "Service User", text: "You need support that is easy to understand, culturally respectful, and clear about next steps.", prompt: "Ask: Would I know where to go and what will happen next?" },
      { title: "Community Representative", text: "You understand how language, trust, and community settings affect engagement.", prompt: "Ask: Does this reach people beyond official channels?" },
      { title: "Mental Health Professional", text: "You focus on safe care, referral quality, workforce capacity, and continuity.", prompt: "Ask: Can the service deliver this safely?" },
      { title: "Ministry Representative", text: "You need alignment with national strategy, regulation, data governance, and quality.", prompt: "Ask: Is this accountable and policy-aligned?" },
      { title: "NGO Representative", text: "You support community needs and may help connect people to services.", prompt: "Ask: Is partnership realistic and respectful?" }
    ],
    constraints: [
      { id: "qatar-multilingual", title: "Multilingual Population", description: "People may need information in different languages and formats.", impact: "A single-language route can exclude some users.", response: "Add multilingual and plain-language access points." },
      { id: "qatar-workforce", title: "Workforce Capacity", description: "Specialist and frontline capacity must be used carefully.", impact: "A labour-intensive idea may not be feasible.", response: "Define a focused staff role and simple workflow." },
      { id: "qatar-awareness", title: "Service Awareness Gaps", description: "People may not know which support exists or how to enter it.", impact: "Good services may remain underused.", response: "Create trusted awareness routes." },
      { id: "qatar-data", title: "Data Governance Requirements", description: "Information sharing must follow governance and privacy expectations.", impact: "Data-heavy designs need safeguards.", response: "Explain consent, data minimisation, and accountability." }
    ],
    evidencePacks: buildContextEvidencePacks("qatar"),
    eventDecks: buildContextEventDecks("Qatar"),
    references: contextReferences.qatar
  },
  uk: {
    id: "uk",
    name: "United Kingdom",
    description: "A publicly funded health, education, and local government context shaped by NHS access pressures, local partnerships, regulation, and commissioning.",
    stakeholders: [
      { title: "Service User", text: "You may experience long waits, unclear pathways, or repeated referrals.", prompt: "Ask: Does this make the route easier?" },
      { title: "NHS Clinician", text: "You focus on safe care, workload, clinical standards, and continuity.", prompt: "Ask: Can staff deliver this alongside current demand?" },
      { title: "Local Authority Officer", text: "You connect services around families, schools, communities, and prevention.", prompt: "Ask: Does this fit local partnership responsibilities?" },
      { title: "Community Organisation", text: "You see who is missing from formal services and what builds trust.", prompt: "Ask: Are community partners properly supported?" },
      { title: "Commissioner", text: "You need value, evidence, outcomes, and a feasible delivery route.", prompt: "Ask: What would justify a pilot or scale-up decision?" }
    ],
    constraints: [
      { id: "uk-waiting", title: "NHS Waiting Times", description: "Demand and waiting pressures affect access and experience.", impact: "The idea must manage expectations and interim support.", response: "Add prioritisation, signposting, or follow-up." },
      { id: "uk-workforce", title: "Workforce Shortages", description: "Staff capacity is a recurring delivery constraint.", impact: "A complex design may not be deliverable.", response: "Simplify delivery and protect staff time." },
      { id: "uk-budget", title: "Budget Pressures", description: "Funding decisions require clear value and evidence.", impact: "The pilot must be focused and measurable.", response: "Define a small test and success criteria." },
      { id: "uk-fragmentation", title: "Service Fragmentation", description: "People may move between NHS, local authority, school, and voluntary services.", impact: "Handoffs can create drop-off.", response: "Create a shared pathway and named roles." }
    ],
    evidencePacks: buildContextEvidencePacks("uk"),
    eventDecks: buildContextEventDecks("the United Kingdom"),
    references: contextReferences.uk
  },
  pakistan: {
    id: "pakistan",
    name: "Pakistan",
    description: "A federal and provincial health and public service context shaped by rural access barriers, workforce gaps, affordability, and community trust.",
    stakeholders: [
      { title: "Service User", text: "You may face distance, cost, stigma, or uncertainty about where to seek help.", prompt: "Ask: Is this reachable and understandable?" },
      { title: "Lady Health Worker", text: "You connect households with health information and community-based support.", prompt: "Ask: Does this use community outreach realistically?" },
      { title: "District Health Officer", text: "You focus on district delivery, staff capacity, and public health priorities.", prompt: "Ask: Can this be implemented locally?" },
      { title: "Community Elder", text: "You influence trust, norms, and whether families accept support.", prompt: "Ask: Will people trust this route?" },
      { title: "NGO Representative", text: "You may support outreach where public systems have limited reach.", prompt: "Ask: Is the partnership role clear and sustainable?" }
    ],
    constraints: [
      { id: "pakistan-rural", title: "Rural Access Barriers", description: "Distance and transport can limit service use.", impact: "Centralised services may not reach priority groups.", response: "Add outreach or local access points." },
      { id: "pakistan-workforce", title: "Workforce Shortages", description: "Specialist and frontline workforce may be limited.", impact: "The idea must avoid relying only on specialists.", response: "Use task-sharing and referral clarity where appropriate." },
      { id: "pakistan-cost", title: "Out-of-Pocket Costs", description: "Direct and indirect costs can affect care-seeking.", impact: "People may disengage even when services exist.", response: "Identify and reduce hidden costs." },
      { id: "pakistan-literacy", title: "Health Literacy Barriers", description: "People may need trusted explanations in accessible language.", impact: "Technical communication can reduce engagement.", response: "Use trusted messengers and plain-language materials." }
    ],
    evidencePacks: buildContextEvidencePacks("pakistan"),
    eventDecks: buildContextEventDecks("Pakistan"),
    references: contextReferences.pakistan
  }
};

const countryName = (context: ContextId) =>
  context === "uk" ? "the United Kingdom" : context === "qatar" ? "Qatar" : "Pakistan";

const scopedReferences: Record<ContextId, Record<string, Reference[]>> = {
  qatar: {
    "mental-health-access": [
      { organisation: "Ministry of Public Health, Qatar", title: "Qatar National Mental Health Strategy", year: "2013" },
      { organisation: "Ministry of Public Health, Qatar", title: "National Health Strategy 2024-2030", year: "2024" },
      { organisation: "World Health Organization", title: "Mental Health Atlas: Qatar country profile", year: "2020" }
    ],
    "maternal-health-access": [
      { organisation: "Ministry of Public Health, Qatar", title: "National Health Strategy 2024-2030", year: "2024" },
      { organisation: "Ministry of Public Health, Qatar", title: "Qatar Public Health Strategy 2017-2022", year: "2017" },
      { organisation: "World Health Organization", title: "Qatar country cooperation strategy materials", year: "Current guidance" }
    ],
    "vaccine-hesitancy": [
      { organisation: "Ministry of Public Health, Qatar", title: "National Health Strategy 2024-2030", year: "2024" },
      { organisation: "World Health Organization", title: "Behavioural and social drivers of vaccination", year: "2022" },
      { organisation: "World Health Organization", title: "Immunization Agenda 2030", year: "2020" }
    ],
    "school-dropout-prevention": [
      { organisation: "Ministry of Education and Higher Education, Qatar", title: "Education and Training Sector Strategy 2018-2022", year: "2018" },
      { organisation: "Government of Qatar", title: "Qatar National Vision 2030", year: "2008" },
      { organisation: "UNESCO", title: "Global Education Monitoring Report", year: "Current report" }
    ],
    "climate-adaptation": [
      { organisation: "Ministry of Environment and Climate Change, Qatar", title: "Qatar National Climate Change Action Plan 2030", year: "2021" },
      { organisation: "Government of Qatar", title: "Qatar National Vision 2030", year: "2008" },
      { organisation: "World Health Organization", title: "Climate change and health guidance", year: "Current guidance" }
    ]
  },
  uk: {
    "mental-health-access": [
      { organisation: "NHS England", title: "NHS Mental Health Implementation Plan 2019/20-2023/24", year: "2019" },
      { organisation: "NHS England", title: "The NHS Long Term Plan", year: "2019" },
      { organisation: "Care Quality Commission", title: "The state of health care and adult social care in England", year: "2024" }
    ],
    "maternal-health-access": [
      { organisation: "Department of Health and Social Care", title: "Women's Health Strategy for England", year: "2022" },
      { organisation: "NHS England", title: "Three year delivery plan for maternity and neonatal services", year: "2023" },
      { organisation: "National Institute for Health and Care Excellence", title: "Antenatal care guideline", year: "2021" }
    ],
    "vaccine-hesitancy": [
      { organisation: "NHS England", title: "NHS vaccination strategy", year: "2023" },
      { organisation: "UK Health Security Agency", title: "Immunisation against infectious disease: the Green Book", year: "Current guidance" },
      { organisation: "World Health Organization", title: "Behavioural and social drivers of vaccination", year: "2022" }
    ],
    "school-dropout-prevention": [
      { organisation: "Department for Education", title: "Working together to improve school attendance", year: "2024" },
      { organisation: "Ofsted", title: "Education recovery in schools", year: "2022" },
      { organisation: "Department for Education", title: "Keeping children safe in education", year: "2024" }
    ],
    "climate-adaptation": [
      { organisation: "HM Government", title: "Third National Adaptation Programme", year: "2023" },
      { organisation: "Climate Change Committee", title: "Progress in adapting to climate change", year: "2023" },
      { organisation: "UK Health Security Agency", title: "Adverse Weather and Health Plan", year: "2023" }
    ]
  },
  pakistan: {
    "mental-health-access": [
      { organisation: "World Health Organization", title: "Mental Health Atlas: Pakistan country profile", year: "2020" },
      { organisation: "Ministry of National Health Services, Regulations and Coordination, Pakistan", title: "National Health Vision 2016-2025", year: "2016" },
      { organisation: "Pakistan Mental Health Coalition", title: "Mental health advocacy and systems materials", year: "Current materials" }
    ],
    "maternal-health-access": [
      { organisation: "Ministry of National Health Services, Regulations and Coordination, Pakistan", title: "National Health Vision 2016-2025", year: "2016" },
      { organisation: "Government of Pakistan", title: "Pakistan Maternal Nutrition Strategy", year: "2022" },
      { organisation: "World Health Organization Pakistan", title: "Maternal and newborn health country materials", year: "Current materials" }
    ],
    "vaccine-hesitancy": [
      { organisation: "Expanded Programme on Immunization Pakistan", title: "National Immunization Policy", year: "2022" },
      { organisation: "World Health Organization Pakistan", title: "Immunization and vaccine-preventable disease materials", year: "Current materials" },
      { organisation: "World Health Organization", title: "Behavioural and social drivers of vaccination", year: "2022" }
    ],
    "school-dropout-prevention": [
      { organisation: "Ministry of Federal Education and Professional Training, Pakistan", title: "Pakistan Education Statistics", year: "Current report" },
      { organisation: "UNICEF Pakistan", title: "Education programme materials", year: "Current materials" },
      { organisation: "UNESCO", title: "Global Education Monitoring Report", year: "Current report" }
    ],
    "climate-adaptation": [
      { organisation: "Government of Pakistan", title: "National Climate Change Policy", year: "2021" },
      { organisation: "Ministry of Climate Change and Environmental Coordination, Pakistan", title: "National Adaptation Plan", year: "2023" },
      { organisation: "World Bank", title: "Pakistan Country Climate and Development Report", year: "2022" }
    ]
  }
};

const scopedStakeholders: Record<ContextId, Record<string, string[]>> = {
  qatar: {
    "mental-health-access": ["Service User", "Mental Health Professional", "Community Representative", "Ministry Representative", "PHCC Representative", "Equity Advocate"],
    "maternal-health-access": ["Pregnant Woman Representative", "Midwife", "Obstetrician", "Primary Care Representative", "Family Representative", "Ministry Representative"],
    "vaccine-hesitancy": ["Parent/Caregiver", "PHCC Representative", "Public Health/EPI Representative", "School Health Representative", "Community Leader", "Communications Officer"],
    "school-dropout-prevention": ["Student", "Parent", "Teacher", "School Counsellor", "School Administrator", "Education Ministry Representative"],
    "climate-adaptation": ["Resident", "Municipal Planner", "Public Health Representative", "Emergency Management Representative", "Infrastructure Representative", "Environmental Policy Representative"]
  },
  uk: {
    "mental-health-access": ["Service User", "NHS Mental Health Practitioner", "GP", "Local Authority Officer", "Voluntary Sector Representative", "Commissioner"],
    "maternal-health-access": ["Pregnant Woman Representative", "NHS Midwife", "Obstetrician", "GP", "Health Visitor", "Integrated Care Board Commissioner"],
    "vaccine-hesitancy": ["Parent/Caregiver", "GP Practice Representative", "UKHSA Public Health Specialist", "School Nurse", "Community Organisation", "Communications Lead"],
    "school-dropout-prevention": ["Student", "Parent/Carer", "Teacher", "School Nurse", "Local Authority Attendance Officer", "Voluntary Sector Representative"],
    "climate-adaptation": ["Resident", "Local Authority Climate Officer", "UKHSA Public Health Specialist", "Emergency Planner", "Housing or Infrastructure Lead", "Community Organisation"]
  },
  pakistan: {
    "mental-health-access": ["Service User", "Psychiatrist / Psychologist", "Lady Health Worker", "District Health Officer", "Community Elder", "NGO Representative"],
    "maternal-health-access": ["Pregnant Woman Representative", "Lady Health Worker", "Midwife", "Basic Health Unit Representative", "District Health Officer", "Family Elder"],
    "vaccine-hesitancy": ["Parent/Caregiver", "EPI Vaccinator", "Lady Health Worker", "District Health Officer", "Union Council Representative", "Religious or Community Leader"],
    "school-dropout-prevention": ["Student", "Parent", "School Teacher", "Head Teacher", "Union Council Representative", "Provincial Education Department Representative"],
    "climate-adaptation": ["Resident", "Union Council Representative", "District Disaster Management Representative", "Public Health Officer", "Farmer or Outdoor Worker Representative", "Provincial Climate Department Representative"]
  }
};

const evidenceByIssue: Record<string, Array<[EvidenceCard["type"], string, string]>> = {
  "mental-health-access": [
    ["Policy Report", "Strategies and health-system profiles identify mental health as an area where coordinated access and early support matter.", "The pilot should clarify entry routes and connect early help to formal care."],
    ["Research Finding", "Mental health literature commonly identifies stigma, workforce capacity, and referral pathways as barriers to timely support.", "The design must address trust, staff capacity, and safe handoffs together."],
    ["Service Data", "Health-system reports emphasise integration between primary care, specialist services, and community support.", "The proposal should name the pathway and follow-up responsibility."]
  ],
  "maternal-health-access": [
    ["Policy Report", "Maternal and newborn health policy stresses continuity, respectful care, and timely access across pregnancy and postnatal stages.", "The pilot should protect continuity and reduce missed touchpoints."],
    ["Research Finding", "Maternal health evidence highlights transport, communication, family support, and trust in providers as recurring access factors.", "The design should include practical access routes and respectful communication."],
    ["Evaluation Finding", "Implementation guidance emphasises coordinated care between community, primary, and specialist maternity services.", "The proposal should define who identifies risk, who follows up, and how families are included."]
  ],
  "vaccine-hesitancy": [
    ["Policy Report", "Vaccination guidance emphasises confidence, convenience, and trusted communication rather than information alone.", "The pilot should combine practical access with respectful dialogue."],
    ["Research Finding", "Behavioural evidence on vaccination shows that social norms, trusted messengers, and misinformation environments influence decisions.", "The design should include a trusted messenger and a response to misinformation."],
    ["User Voice", "Parents and caregivers may need a safe space to ask questions without being dismissed.", "The service improvement should create a listening route before asking for uptake."]
  ],
  "school-dropout-prevention": [
    ["Policy Report", "Education guidance links attendance and retention to safeguarding, family engagement, and early identification of risk.", "The pilot should detect risk early and connect school, family, and support services."],
    ["Research Finding", "Education research highlights belonging, learning support, family pressure, and wellbeing as factors affecting disengagement.", "The plan should go beyond attendance monitoring to address reasons for disengagement."],
    ["Evaluation Finding", "School improvement guidance values coordinated follow-up and clear responsibility when students begin to disengage.", "The proposal should identify who acts first and how the student voice is included."]
  ],
  "climate-adaptation": [
    ["Policy Report", "Climate adaptation policy identifies heat, flooding, infrastructure resilience, and vulnerable groups as planning priorities.", "The pilot should focus on practical local adaptation and those most exposed to risk."],
    ["Research Finding", "Public health climate guidance links climate risks to health, housing, outdoor work, and emergency preparedness.", "The design should include health protection and community communication."],
    ["Evaluation Finding", "Adaptation planning guidance stresses cross-sector coordination between local government, infrastructure, health, and communities.", "The proposal should define shared roles before an extreme-weather event occurs."]
  ]
};

const eventsByIssue: Record<string, Array<[string, string, string, ConsequenceEvent["choices"]]>> = {
  "mental-health-access": [
    ["Waiting List Pressure", "Demand for mental health support increases before the pilot begins.", "Protect early access without promising capacity the service cannot deliver.", commonChoices.demand],
    ["Referral Pathway Confusion", "People and frontline staff are unclear about the right mental health referral route.", "Simplify access points and clarify responsibility.", commonChoices.access],
    ["Confidentiality Concern", "A participant worries that seeking mental health support may not remain private.", "Explain confidentiality and data use clearly.", commonChoices.data],
    ["Staff Burnout Pressure", "Mental health staff report workload concerns.", "Reduce avoidable work and protect staff time.", commonChoices.capacity],
    ["New Early Support Funding", "A short-term fund becomes available for early mental health support.", "Test quickly only if learning goals are specific.", commonChoices.demand]
  ],
  "maternal-health-access": [
    ["Midwife Capacity Pressure", "Maternity staff identify pressure around appointment time and follow-up.", "Protect continuity while keeping workload realistic.", commonChoices.capacity],
    ["Transport Disruption", "Families report difficulty reaching maternal health appointments.", "Reduce travel friction or offer closer routes.", commonChoices.access],
    ["Missed Appointment Pattern", "Frontline teams notice repeated missed antenatal or postnatal contacts.", "Understand barriers before assuming non-engagement.", commonChoices.trust],
    ["Family Support Request", "Families ask to be included in maternal health communication.", "Balance family support, consent, and the woman's priorities.", commonChoices.data],
    ["Community Outreach Opportunity", "A trusted community setting offers space for maternal health engagement.", "Build trust only if roles and safeguarding are clear.", commonChoices.trust]
  ],
  "vaccine-hesitancy": [
    ["Social Media Misinformation Surge", "Misleading vaccine claims circulate in community channels.", "Respond without dismissing legitimate questions.", commonChoices.trust],
    ["Vaccine Supply Delay", "A planned vaccination session cannot offer vaccines on the expected day.", "Protect confidence through clear communication and follow-up.", commonChoices.capacity],
    ["Community Concern Meeting", "Parents request a meeting before supporting the vaccine proposal.", "Create space for questions and trusted explanation.", commonChoices.trust],
    ["School Consent Issue", "Consent processes for school-linked vaccination are misunderstood.", "Clarify consent, choice, and information routes.", commonChoices.data],
    ["Outbreak Warning", "Public health teams warn of rising vaccine-preventable disease risk.", "Act quickly while preserving trust.", commonChoices.demand]
  ],
  "school-dropout-prevention": [
    ["Attendance Warning", "A student group shows signs of persistent absence.", "Intervene early without blaming students or families.", commonChoices.access],
    ["Family Pressure Emerges", "Students describe work, caring responsibilities, or household stress affecting attendance.", "Respond to practical pressures as well as school rules.", commonChoices.trust],
    ["Safeguarding Concern", "A case raises safeguarding questions during the pilot.", "Protect students and follow appropriate referral routes.", commonChoices.data],
    ["Teacher Workload Concern", "Teachers say the proposal adds too many tracking tasks.", "Simplify roles and avoid unrealistic administration.", commonChoices.capacity],
    ["Student Voice Challenge", "Students say the proposed support does not address belonging.", "Adjust the idea using student experience.", commonChoices.trust]
  ],
  "climate-adaptation": [
    ["Extreme Heat Warning", "A heat alert is issued during pilot planning.", "Prioritise vulnerable groups and practical communication.", commonChoices.demand],
    ["Flood Preparedness Concern", "Residents ask how warnings and support will reach them.", "Connect emergency communication with local trust.", commonChoices.access],
    ["Infrastructure Delay", "A planned physical adaptation will take longer than expected.", "Identify a short-term protective action.", commonChoices.capacity],
    ["Public Resistance", "Residents question whether adaptation measures are fair or necessary.", "Explain public value and listen to concerns.", commonChoices.trust],
    ["Data Sharing Barrier", "Agencies disagree on sharing climate-risk information.", "Use safe data governance and clear accountability.", commonChoices.data]
  ]
};

const constraintsByIssue: Record<string, Array<[string, string, string, string]>> = {
  "mental-health-access": [
    ["Confidentiality Requirement", "People need confidence that sensitive information is protected.", "Poorly explained data use will reduce help-seeking.", "Add plain-language confidentiality and consent steps."],
    ["Workforce Capacity", "Specialist and frontline mental health capacity is limited.", "A labour-intensive model may not be deliverable.", "Use a focused pathway and clear escalation criteria."],
    ["Stigma and Trust", "Some people may avoid official mental health routes because of stigma.", "Awareness alone may not lead to engagement.", "Use trusted access points and stigma-free language."],
    ["Referral Fragmentation", "Multiple entry routes can confuse users and staff.", "People may drop out before receiving support.", "Create a no-wrong-door route with named follow-up."]
  ],
  "maternal-health-access": [
    ["Continuity of Care", "Pregnancy and postnatal support can involve multiple providers.", "Gaps can appear between stages of care.", "Name handoff points and follow-up responsibility."],
    ["Transport and Timing", "Appointments may be difficult because of travel, work, or family duties.", "Practical barriers can become access barriers.", "Offer closer, flexible, or supported contact options."],
    ["Cultural Safety", "Women and families may need respectful communication that fits their context.", "Poor communication can reduce trust.", "Co-design messages and settings with affected families."],
    ["Clinical Safety", "Any new maternal access route must recognise risk and escalation needs.", "A simple route still needs safe referral.", "Define safety checks and escalation criteria."]
  ],
  "vaccine-hesitancy": [
    ["Misinformation Environment", "People may encounter conflicting vaccine claims before speaking to services.", "Information campaigns alone may not build confidence.", "Use trusted messengers and question-led communication."],
    ["Consent and Choice", "People need clarity about consent, eligibility, and what happens next.", "Confusing processes can lower trust.", "Make consent steps visible and understandable."],
    ["Supply Reliability", "Access plans depend on vaccine availability and session planning.", "Cancelled or changed sessions can damage confidence.", "Create follow-up routes and transparent communication."],
    ["Community Trust", "Some groups may prefer advice from community or faith networks.", "Official messages may not reach or persuade everyone.", "Partner with trusted voices without shifting responsibility onto them."]
  ],
  "school-dropout-prevention": [
    ["Safeguarding Duty", "Schools must act safely when absence or disengagement signals risk.", "A light-touch idea cannot ignore safeguarding responsibilities.", "Define referral and escalation pathways."],
    ["Teacher Workload", "Teachers already manage teaching, pastoral, and administrative pressures.", "Extra monitoring may be unrealistic.", "Reduce paperwork and assign realistic roles."],
    ["Family Pressure", "Students may face caring, work, financial, or wellbeing pressures.", "Attendance-only responses may miss root causes.", "Include family support and practical problem-solving."],
    ["Student Trust", "Students may disengage if support feels punitive.", "The proposal may worsen disengagement.", "Use student voice and strengths-based contact."]
  ],
  "climate-adaptation": [
    ["Heat and Health Risk", "Climate risks affect health, housing, outdoor work, and vulnerable groups differently.", "A general campaign may miss those most at risk.", "Prioritise specific groups and protective actions."],
    ["Cross-Agency Coordination", "Adaptation requires health, municipal, emergency, and infrastructure roles.", "Unclear ownership can delay action.", "Name lead and support roles for the pilot."],
    ["Public Acceptance", "Residents may question changes to public space, warnings, or resource allocation.", "Low acceptance can block implementation.", "Add consultation and visible fairness criteria."],
    ["Infrastructure Timeline", "Physical adaptation can take longer than a classroom pilot period.", "Teams may overpromise delivery.", "Choose a short-term test that supports longer-term adaptation."]
  ]
};

const contextConstraint: Record<ContextId, [string, string, string, string]> = {
  qatar: ["Multilingual Communication", "Public information may need multiple languages and accessible formats.", "Single-language design can exclude residents.", "Include multilingual and plain-language routes."],
  uk: ["Budget and Workforce Pressure", "Public services face visible resource and staffing constraints.", "Ambitious designs need a realistic delivery model.", "Define a narrow pilot and protect staff time."],
  pakistan: ["Rural and Affordability Barrier", "Distance, household costs, and service availability can limit engagement.", "Centralised or costly routes may exclude priority groups.", "Use local access points and reduce hidden costs."]
};

function buildScopedIssuePack(context: ContextId, issueId: string): IssueContentPack {
  const references = scopedReferences[context][issueId];
  const stakeholders = scopedStakeholders[context][issueId].map((title) => ({
    title,
    text: `${title} brings a ${countryName(context)} perspective on ${issueFocus[issueId]}.`,
    prompt: `Ask: What would ${title.toLowerCase()} support, challenge, or need before implementation?`
  }));
  const evidence = evidenceByIssue[issueId].map(([type, finding, implication], index) => {
    const source = references[index % references.length];
    return {
      id: `${context}-${issueId}-evidence-${index + 1}`,
      title: `${issueFocus[issueId]} evidence ${index + 1}`,
      type,
      finding,
      implication,
      sourceOrganisation: source.organisation,
      sourceTitle: source.title,
      sourceYear: source.year
    };
  });
  const constraints = [...constraintsByIssue[issueId], contextConstraint[context]].map(([title, description, impact, response], index) => ({
    id: `${context}-${issueId}-constraint-${index + 1}`,
    title,
    description,
    impact,
    response
  }));
  const events = eventsByIssue[issueId].map(([title, description, consequence, choices]) => ({
    title,
    description: `${description} Context: ${countryName(context)}.`,
    consequence,
    choices: [...choices]
  }));
  const roleObjectives = stakeholders.map((stakeholder, index) => ({
    id: `${context}-${issueId}-role-${index + 1}`,
    name: stakeholder.title,
    icon: ["user", "briefcase", "network", "landmark", "chart", "scale"][index] ?? "user",
    purpose: `Represent the ${stakeholder.title.toLowerCase()} perspective in this ${countryName(context)} policy mission.`,
    defends: index === 0 ? "Lived experience, trust, dignity, and clear access." : index === 5 ? "Equity, inclusion, and groups most likely to be missed." : "Feasibility, accountability, and credible implementation.",
    questions: [`What would ${stakeholder.title.toLowerCase()} need before supporting this?`, "What risk would this role notice first?", "What would make the pilot more realistic?"],
    objectives: [`Protect the interests of ${stakeholder.title.toLowerCase()}.`, "Challenge assumptions that are not supported by evidence.", "Help the team make a feasible and equitable pilot recommendation."],
    successCriteria: "The final proposal recognises this role's concerns and gives them a credible part in the pilot.",
    hiddenObjective: index === 0 ? "Do not support a proposal that feels confusing, unsafe, or hard to access." : index === 5 ? "Oppose proposals that leave underserved groups without a specific adjustment." : "Support the proposal only if the delivery role is clear and evidence-informed.",
    hiddenPriority: index === 2 ? "Trust is more important than technology." : index === 4 ? "Require evidence before supporting expansion." : "Do not let the team ignore implementation barriers.",
    challengeQuestions: ["What trade-off is being hidden?", "Who benefits least from this idea?", "What must be true for this to work?"]
  }));

  return {
    stakeholders,
    evidence,
    events,
    constraints,
    roleObjectives,
    hiddenAgendas: roleObjectives.map((role) => role.hiddenPriority),
    reflectionPrompts: {
      learning: [`Which ${countryName(context)} stakeholder changed your view of ${issueFocus[issueId]}?`, "Which evidence card should most influence the pilot design?", "Which constraint would most likely block implementation?"],
      debrief: ["What did the team assume at first that changed during the simulation?", "Which group remains underserved?", "What would need to be tested before a real policy decision?"]
    },
    references
  };
}

function buildScopedContext(context: ContextId) {
  return Object.fromEntries(policyIssues.map((issue) => [issue.id, buildScopedIssuePack(context, issue.id)])) as Record<string, IssueContentPack>;
}

export const issueScopedContentPacks: Record<ContextId, Record<string, IssueContentPack>> = {
  qatar: buildScopedContext("qatar"),
  uk: buildScopedContext("uk"),
  pakistan: buildScopedContext("pakistan")
};

export function getIssuePack(context: ContextPack, issueId: string): IssueContentPack {
  return issueScopedContentPacks[context.id][issueId] ?? issueScopedContentPacks[context.id]["mental-health-access"];
}

export const resourceTokens: ResourceToken[] = [
  {
    id: "staff-time",
    name: "Staff Time",
    description: "People who can run sessions, follow up, or coordinate delivery."
  },
  {
    id: "community-trust",
    name: "Community Trust",
    description: "Relationships with people and places already trusted by the target group."
  },
  {
    id: "data-insight",
    name: "Data Insight",
    description: "Service data, feedback, and evidence that show patterns and gaps."
  },
  {
    id: "small-budget",
    name: "Small Budget",
    description: "Limited money for materials, travel, incentives, translation, or testing."
  },
  {
    id: "venue-access",
    name: "Venue Access",
    description: "A place people can reach and feel comfortable using."
  },
  {
    id: "digital-tool",
    name: "Digital Tool",
    description: "A website, form, message flow, or shared tracking tool."
  },
  {
    id: "translation",
    name: "Translation",
    description: "Language support and accessible communication."
  },
  {
    id: "time-to-test",
    name: "Time to Test",
    description: "A short pilot period to learn what works before scaling."
  }
];

export const wisdomCards: Card[] = [
  {
    title: "Start with lived experience",
    text: "Do not begin with a fixed solution. Begin with what people are trying to do and what gets in the way.",
    prompt: "Name one assumption you need to test."
  },
  {
    title: "Plain language is access",
    text: "If the target group would not say it, rewrite it. Avoid official wording and hidden rules.",
    prompt: "Rewrite one sentence in human language."
  },
  {
    title: "Power shapes participation",
    text: "Notice whose knowledge gets treated as expert. Lived experience, frontline skill, and policy knowledge all matter.",
    prompt: "Invite one quieter perspective."
  },
  {
    title: "Small tests are useful",
    text: "A rough pilot can teach more than a perfect plan that never reaches people.",
    prompt: "Choose the smallest useful test."
  }
];
