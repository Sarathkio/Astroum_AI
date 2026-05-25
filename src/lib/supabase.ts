import { createClient } from "@supabase/supabase-js";
import { LegalTemplate, KnowledgeNode, SectionMapping, CourtFormat, CaseResult } from "../types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Initialize real Supabase client only if credentials are set
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// =============================================================================
// IN-MEMORY MOCK DATABASE (Graceful Fallback matching supabase/seed.sql)
// =============================================================================

const MOCK_COURT_FORMATS: CourtFormat[] = [
  {
    id: "f1",
    court_code: "SC",
    court_name: "Supreme Court of India",
    header_template: "IN THE SUPREME COURT OF INDIA\nCRIMINAL ORIGINAL JURISDICTION\nWRIT PETITION / SPECIAL LEAVE PETITION NO. _____ OF 2026",
    party_format: "IN THE MATTER OF:\n{PETITIONER_NAME}\n... PETITIONER\n\nVERSUS\n\nSTATE OF {STATE_NAME} & ANR.\n... RESPONDENTS",
    closing_format: "AND FOR THIS ACT OF KINDNESS, THE PETITIONER SHALL AS IN DUTY BOUND EVER PRAY.\nFILED BY:\n___________________\nADVOCATE FOR THE PETITIONER\nNEW DELHI\nDATED: {DATE}"
  },
  {
    id: "f2",
    court_code: "HC",
    court_name: "High Court of Delhi",
    header_template: "IN THE HIGH COURT OF DELHI AT NEW DELHI\n(CRIMINAL APPELLATE / ORIGINAL JURISDICTION)\nCRL.M.C. / CRL.A. NO. _____ OF 2026",
    party_format: "IN THE MATTER OF:\n{PETITIONER_NAME}\n... PETITIONER\n\nVERSUS\n\nSTATE (NCT OF DELHI) & ORS.\n... RESPONDENTS",
    closing_format: "PETITIONER THROUGH ADVOCATE\n___________________\nADVOCATE ON RECORD\nPLACE: NEW DELHI\nDATED: {DATE}"
  },
  {
    id: "f3",
    court_code: "SESSIONS",
    court_name: "Court of Sessions, New Delhi",
    header_template: "IN THE COURT OF THE DISTRICT & SESSIONS JUDGE, PATIALA HOUSE COURTS, NEW DELHI\nBAIL APPLICATION NO. _____ OF 2026",
    party_format: "IN THE MATTER OF:\n{PETITIONER_NAME}\n... APPLICANT/ACCUSED\n\nVERSUS\n\nSTATE (NCT OF DELHI)\n... RESPONDENT",
    closing_format: "APPLICANT THROUGH COUNSEL\n___________________\nADVOCATE FOR THE APPLICANT\nNEW DELHI\nDATED: {DATE}"
  },
  {
    id: "f4",
    court_code: "NCLT",
    court_name: "National Company Law Tribunal, Principal Bench",
    header_template: "BEFORE THE NATIONAL COMPANY LAW TRIBUNAL,\nPRINCIPAL BENCH AT NEW DELHI\nCOMPANY PETITION NO. _____ OF 2026",
    party_format: "IN THE MATTER OF:\n{PETITIONER_NAME}\n... PETITIONER\n\nVERSUS\n\n{RESPONDENT_NAME} LIMITED\n... RESPONDENT",
    closing_format: "PETITIONER THROUGH COUNSEL\n___________________\nADVOCATE FOR THE PETITIONER\nNEW DELHI\nDATED: {DATE}"
  }
];

const MOCK_SECTION_MAPPINGS: SectionMapping[] = [
  { id: "m1", old_section: "420", new_section: "318", old_act: "IPC", new_act: "BNS", description: "Cheating and dishonestly inducing delivery of property" },
  { id: "m2", old_section: "302", new_section: "101", old_act: "IPC", new_act: "BNS", description: "Punishment for murder" },
  { id: "m3", old_section: "376", new_section: "64", old_act: "IPC", new_act: "BNS", description: "Punishment for rape" },
  { id: "m4", old_section: "120B", new_section: "61(2)", old_act: "IPC", new_act: "BNS", description: "Criminal conspiracy" },
  { id: "m5", old_section: "34", new_section: "3(5)", old_act: "IPC", new_act: "BNS", description: "Acts done by several persons in furtherance of common intention" },
  { id: "m6", old_section: "379", new_section: "303(2)", old_act: "IPC", new_act: "BNS", description: "Punishment for theft" },
  { id: "m7", old_section: "406", new_section: "316", old_act: "IPC", new_act: "BNS", description: "Punishment for criminal breach of trust" },
  { id: "m8", old_section: "506", new_section: "351(2)", old_act: "IPC", new_act: "BNS", description: "Punishment for criminal intimidation" },
  { id: "m9", old_section: "498A", new_section: "85", old_act: "IPC", new_act: "BNS", description: "Cruelty by husband or relatives" },
  { id: "m10", old_section: "279", new_section: "281", old_act: "IPC", new_act: "BNS", description: "Rash driving" },
  { id: "m11", old_section: "323", new_section: "115(2)", old_act: "IPC", new_act: "BNS", description: "Voluntarily causing hurt" },
  { id: "m12", old_section: "304A", new_section: "106(1)", old_act: "IPC", new_act: "BNS", description: "Causing death by negligence" },
  { id: "m13", old_section: "438", new_section: "482", old_act: "CrPC", new_act: "BNSS", description: "Anticipatory Bail" },
  { id: "m14", old_section: "439", new_section: "483", old_act: "CrPC", new_act: "BNSS", description: "Special bail powers of Sessions/High Court" },
  { id: "m15", old_section: "482", new_section: "528", old_act: "CrPC", new_act: "BNSS", description: "Inherent powers of High Court" },
  { id: "m16", old_section: "167", new_section: "187", old_act: "CrPC", new_act: "BNSS", description: "Investigation custody limits" },
  { id: "m17", old_section: "154", new_section: "173", old_act: "CrPC", new_act: "BNSS", description: "Registration of FIR / Zero FIR" }
];

const MOCK_TEMPLATES: LegalTemplate[] = [
  {
    id: "t1",
    template_id: "criminal_bail_sessions",
    jurisdiction: "India",
    practice_area: "Criminal",
    document_type: "Bail Petition",
    court_type: "Sessions Court",
    display_name: "Anticipatory Bail Petition (BNSS 482)",
    system_prompt: `You are a senior criminal defense advocate. Draft a petition for Anticipatory Bail under Section 482 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 (formerly Section 438 of the Code of Criminal Procedure, 1973).

Structure the petition as follows:
{COURT_HEADER}

{COURT_PARTY_FORMAT}

PETITION FOR ANTICIPATORY BAIL ON BEHALF OF THE APPLICANT

Most Respectfully Showeth:
1. State that the applicant is law-abiding, a respectable citizen, and deep-rooted in the society.
2. Outline the facts and details of the current case:
{INJECTION_CLIENT}
3. Provide the statutory argument, noting that the case is registered under IPC/BNS sections. Ensure you reference the updated sections from the BNS/BNSS.
4. Inject relevant precedent case laws:
{INJECTION_DECISIONS}
5. Address key safety constraints & anti-patterns to protect the client:
{INJECTION_CONSTRAINTS}
6. Pray for anticipatory bail, detailing that the applicant is willing to abide by all investigation cooperation requests and will not tamper with witnesses.

{COURT_CLOSING_FORMAT}`,
    auto_research_query: "Anticipatory Bail Section 482 BNSS quashing or business dispute precedents",
    quality_checks: [
      { id: "chk_header", rule: "Contains standard court header styling", weight: 20 },
      { id: "chk_bns_conv", rule: "Correctly references BNS/BNSS instead of IPC/CrPC", weight: 30 },
      { id: "chk_precedent", rule: "Integrates landmark quashing or bail judgments", weight: 25 },
      { id: "chk_pray", rule: "Concludes with standard legal prayer and signature block", weight: 25 }
    ]
  },
  {
    id: "t2",
    template_id: "corporate_arbitration_invoke",
    jurisdiction: "India",
    practice_area: "Corporate",
    document_type: "Arbitration Notice",
    court_type: "High Court",
    display_name: "Arbitration Clause Invoke Notice",
    system_prompt: `You are a senior corporate litigation attorney. Draft a Notice Invoking Arbitration under Section 21 of the Arbitration and Conciliation Act, 1996.

Structure the notice as follows:
{COURT_HEADER}

BY REGISTERED POST A.D. & EMAIL
To,
{RESPONDENT_DETAILS}

SUBJECT: NOTICE INVOKING ARBITRATION UNDER SECTION 21 OF THE ARBITRATION AND CONCILIATION ACT, 1996

Dear Sirs,
1. State the relationship between the parties based on the agreement:
{INJECTION_CLIENT}
2. Define the dispute details, transaction history, and contract defaults.
3. List the legal precedents or decisions supporting the invocation:
{INJECTION_DECISIONS}
4. Apply the strict drafting constraints:
{INJECTION_CONSTRAINTS}
5. Nominate a sole arbitrator and request consent within 30 days.

{COURT_CLOSING_FORMAT}`,
    auto_research_query: "Notice invoking arbitration Section 21 dispute board resolution precedents",
    quality_checks: [
      { id: "chk_header", rule: "Notice contains sender and recipient addresses", weight: 20 },
      { id: "chk_sec21", rule: "Explicitly references Section 21 invocation", weight: 30 },
      { id: "chk_nominee", rule: "Proposes a sole arbitrator and sets 30-day timeline", weight: 30 },
      { id: "chk_close", rule: "Signed by legal counsel on behalf of claimant", weight: 20 }
    ]
  },
  {
    id: "t3",
    template_id: "cheque_bounce_138",
    jurisdiction: "India",
    practice_area: "Criminal",
    document_type: "Cheque Bounce Notice",
    court_type: "District Court",
    display_name: "Section 138 NI Act Legal Notice",
    system_prompt: `You are a legal counsel drafting a statutory legal demand notice under Section 138 of the Negotiable Instruments Act, 1881.

Structure the notice as follows:
{COURT_HEADER}

REGD AD / SPEED POST
To,
{RESPONDENT_DETAILS}

SUBJECT: LEGAL NOTICE FOR DEMAND UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 FOR DISHONOUR OF CHEQUE

Under instructions from my client, {CLIENT_NAME}, I hereby serve you the following notice:
1. Explain the transaction details, invoice amounts, and issuing of the cheque:
{INJECTION_CLIENT}
2. Detail the presentation and subsequent return of the cheque with reason "Funds Insufficient" or "Refer to Drawer".
3. Apply critical client anti-patterns and decisions:
{INJECTION_DECISIONS}
{INJECTION_CONSTRAINTS}
4. Provide a clear demand for payment of the cheque amount within 15 days of receipt of this notice, failing which legal proceedings will commence.

{COURT_CLOSING_FORMAT}`,
    auto_research_query: "Section 138 NI Act cheque dishonour demand notice requirements",
    quality_checks: [
      { id: "chk_header", rule: "Contains complete addressee details", weight: 20 },
      { id: "chk_timeline", rule: "Includes mandatory 15-day statutory demand timeline", weight: 30 },
      { id: "chk_chequedetails", rule: "Includes cheque number, date, amount, and bounce memo date", weight: 30 },
      { id: "chk_liability", rule: "Asserts legally enforceable debt liability", weight: 20 }
    ]
  }
];

const MOCK_KNOWLEDGE_NODES: KnowledgeNode[] = [
  {
    id: "k1",
    node_type: "Client Fact",
    title: "FIR Registry Details",
    content: "FIR No. 120/2026 was filed on May 10, 2026, at Patiala House Police Station under Section 420 and Section 120B of the IPC (corresponding to Section 318 and Section 61(2) BNS) by Rajiv Mehta against Vikram Malhotra.",
    practice_area: "Criminal",
    tags: ["fir", "criminal", "cheating"],
    client_id: "C001",
    matter_id: "M001"
  },
  {
    id: "k2",
    node_type: "Client Fact",
    title: "Business Rivalry Origin",
    content: "The complainant Rajiv Mehta and applicant Vikram Malhotra were equal shareholders in Astroum Tech. The dispute arose following a board deadlock regarding equity transfer on April 15, 2026. Rajiv Mehta threatened to file criminal actions if Vikram Malhotra did not transfer his shares for free.",
    practice_area: "Criminal",
    tags: ["corporate-dispute", "rivalry"],
    client_id: "C001",
    matter_id: "M001"
  },
  {
    id: "k3",
    node_type: "Constraint",
    title: "Roots in Society Assertion",
    content: "The petition must assert that the applicant is a respectable business director of Astroum Tech, has a permanent residence at Vasant Kunj, New Delhi, holds bank accounts and assets in India, and poses zero flight risk or tampering risk.",
    practice_area: "Criminal",
    tags: ["bail", "constraint"],
    client_id: "C001",
    matter_id: "M001"
  },
  {
    id: "k4",
    node_type: "Anti Pattern",
    title: "No Liability Admission",
    content: "Do not mention any mutual settlement agreements or willingness to pay back any disputed amounts in the bail application, as this is often construed by prosecutors as an admission of corporate fraud or cheating.",
    practice_area: "Criminal",
    tags: ["anti-pattern", "liability"],
    client_id: "C001",
    matter_id: "M001"
  },
  {
    id: "k5",
    node_type: "Decision",
    title: "State of Haryana v. Bhajan Lal Precedent",
    content: "In State of Haryana v. Bhajan Lal (1992 SCC Supp (1) 335), the Supreme Court laid down detailed guidelines for quashing FIRs, specifically highlighting that proceedings motivated by private malice or commercial rivalry should be quashed.",
    practice_area: "Criminal",
    tags: ["precedent", "quashing"],
    client_id: "C001",
    matter_id: "M001"
  },
  {
    id: "k6",
    node_type: "Decision",
    title: "Gurbaksh Singh Sibbia v. State of Punjab Precedent",
    content: "In Gurbaksh Singh Sibbia v. State of Punjab (1980 2 SCC 565), the Constitution Bench of the Supreme Court held that the power under Section 438 (now BNSS 482) is of wide amplitude and should not be restricted by unnecessary judicial limitations.",
    practice_area: "Criminal",
    tags: ["precedent", "anticipatory-bail"],
    client_id: "C001",
    matter_id: "M001"
  },
  {
    id: "k7",
    node_type: "Client Fact",
    title: "Shareholders Agreement Details",
    content: "Client Astroum Tech entered into a Shareholders Agreement (SHA) with Zenith Holdings on October 12, 2024. Clause 18.2 specifies that all disputes arising out of the agreement shall be referred to arbitration in New Delhi before a sole arbitrator.",
    practice_area: "Corporate",
    tags: ["sha", "arbitration"],
    client_id: "C002",
    matter_id: "M002"
  },
  {
    id: "k8",
    node_type: "Constraint",
    title: "Explicit Dispute Trigger",
    content: "Clearly specify that the dispute arose due to Zenith Holdings failing to pay the licensing fee of INR 45,00,000 due under Clause 6.1 on March 1, 2026, despite multiple written reminders.",
    practice_area: "Corporate",
    tags: ["arbitration", "constraint"],
    client_id: "C002",
    matter_id: "M002"
  },
  {
    id: "k9",
    node_type: "Decision",
    title: "Perkins Eastman Arbitration Precedent",
    content: "In Perkins Eastman Architects DPC v. HSCC (India) Ltd (2019 SCC Online SC 1517), the Supreme Court held that a party having an interest in the outcome of the dispute cannot unilaterally appoint a sole arbitrator.",
    practice_area: "Corporate",
    tags: ["precedent", "arbitrator-appointment"],
    client_id: "C002",
    matter_id: "M002"
  },
  {
    id: "k10",
    node_type: "Anti Pattern",
    title: "No Forgiveness of Interest",
    content: "Do not waive or forget to claim the 18% per annum compound interest rate on the unpaid licensing fee, as specified in Schedule C of the licensing agreement.",
    practice_area: "Corporate",
    tags: ["anti-pattern", "interest-claim"],
    client_id: "C002",
    matter_id: "M002"
  }
];

const MOCK_IK_CASE_CACHE: Record<string, CaseResult[]> = {};

// =============================================================================
// UNIFIED DATABASE SERVICES (SUPABASE + MOCK FALLBACK)
// =============================================================================

export async function getTemplates(): Promise<LegalTemplate[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("legal_templates").select("*");
      if (!error && data) return data as LegalTemplate[];
    }
  } catch (e) {
    console.warn("Supabase templates read failed, falling back to mock database:", e);
  }
  return MOCK_TEMPLATES;
}

export async function getKnowledgeNodes(
  practiceArea: string,
  clientId?: string,
  matterId?: string
): Promise<KnowledgeNode[]> {
  try {
    if (supabase) {
      let query = supabase.from("knowledge_nodes").select("*").eq("practice_area", practiceArea);
      if (clientId) query = query.eq("client_id", clientId);
      if (matterId) query = query.eq("matter_id", matterId);
      const { data, error } = await query;
      if (!error && data) return data as KnowledgeNode[];
    }
  } catch (e) {
    console.warn("Supabase knowledge nodes read failed, falling back to mock database:", e);
  }
  
  // Local filter
  return MOCK_KNOWLEDGE_NODES.filter(node => {
    if (node.practice_area !== practiceArea) return false;
    if (clientId && node.client_id !== clientId) return false;
    if (matterId && node.matter_id !== matterId) return false;
    return true;
  });
}

export async function getSectionMappings(): Promise<SectionMapping[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("section_mappings").select("*");
      if (!error && data) return data as SectionMapping[];
    }
  } catch (e) {
    console.warn("Supabase section mappings read failed, falling back to mock database:", e);
  }
  return MOCK_SECTION_MAPPINGS;
}

export async function getCourtFormat(courtCode: string): Promise<CourtFormat | null> {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("court_formats").select("*").eq("court_code", courtCode).single();
      if (!error && data) return data as CourtFormat;
    }
  } catch (e) {
    console.warn("Supabase court format read failed, falling back to mock database:", e);
  }
  return MOCK_COURT_FORMATS.find(cf => cf.court_code === courtCode) || null;
}

export async function getCaseCache(searchQuery: string): Promise<CaseResult[] | null> {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("ik_case_cache").select("results").eq("search_query", searchQuery).single();
      if (!error && data) return data.results as CaseResult[];
    }
  } catch (e) {
    console.warn("Supabase case cache read failed, falling back to mock database:", e);
  }
  return MOCK_IK_CASE_CACHE[searchQuery.toLowerCase().trim()] || null;
}

export async function saveCaseCache(searchQuery: string, results: CaseResult[]): Promise<void> {
  try {
    if (supabase) {
      await supabase.from("ik_case_cache").upsert({
        search_query: searchQuery,
        results,
        searched_at: new Date().toISOString()
      }, { onConflict: "search_query" });
      return;
    }
  } catch (e) {
    console.warn("Supabase case cache save failed, saving to mock memory instead:", e);
  }
  MOCK_IK_CASE_CACHE[searchQuery.toLowerCase().trim()] = results;
}
