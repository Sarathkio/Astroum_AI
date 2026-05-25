-- Seed Data for BRAHMO India Legal (Option C)

-- 1. COURT FORMATS
INSERT INTO court_formats (court_code, court_name, header_template, party_format, closing_format) VALUES
('SC', 'Supreme Court of India', 
'IN THE SUPREME COURT OF INDIA
CRIMINAL ORIGINAL JURISDICTION
WRIT PETITION / SPECIAL LEAVE PETITION NO. _____ OF 2026',
'IN THE MATTER OF:
{PETITIONER_NAME}
... PETITIONER

VERSUS

STATE OF {STATE_NAME} & ANR.
... RESPONDENTS',
'AND FOR THIS ACT OF KINDNESS, THE PETITIONER SHALL AS IN DUTY BOUND EVER PRAY.
FILED BY:
___________________
ADVOCATE FOR THE PETITIONER
NEW DELHI
DATED: {DATE}'),

('HC', 'High Court of Delhi', 
'IN THE HIGH COURT OF DELHI AT NEW DELHI
(CRIMINAL APPELLATE / ORIGINAL JURISDICTION)
CRL.M.C. / CRL.A. NO. _____ OF 2026',
'IN THE MATTER OF:
{PETITIONER_NAME}
... PETITIONER

VERSUS

STATE (NCT OF DELHI) & ORS.
... RESPONDENTS',
'PETITIONER THROUGH ADVOCATE
___________________
ADVOCATE ON RECORD
PLACE: NEW DELHI
DATED: {DATE}'),

('SESSIONS', 'Court of Sessions, New Delhi',
'IN THE COURT OF THE DISTRICT & SESSIONS JUDGE, PATIALA HOUSE COURTS, NEW DELHI
BAIL APPLICATION NO. _____ OF 2026',
'IN THE MATTER OF:
{PETITIONER_NAME}
... APPLICANT/ACCUSED

VERSUS

STATE (NCT OF DELHI)
... RESPONDENT',
'APPLICANT THROUGH COUNSEL
___________________
ADVOCATE FOR THE APPLICANT
NEW DELHI
DATED: {DATE}'),

('NCLT', 'National Company Law Tribunal, Principal Bench',
'BEFORE THE NATIONAL COMPANY LAW TRIBUNAL,
PRINCIPAL BENCH AT NEW DELHI
COMPANY PETITION NO. _____ OF 2026',
'IN THE MATTER OF:
{PETITIONER_NAME}
... PETITIONER

VERSUS

{RESPONDENT_NAME} LIMITED
... RESPONDENT',
'PETITIONER THROUGH COUNSEL
___________________
ADVOCATE FOR THE PETITIONER
NEW DELHI
DATED: {DATE}')
ON CONFLICT (court_code) DO UPDATE SET 
    court_name = EXCLUDED.court_name,
    header_template = EXCLUDED.header_template,
    party_format = EXCLUDED.party_format,
    closing_format = EXCLUDED.closing_format;


-- 2. SECTION MAPPINGS (IPC -> BNS, CrPC -> BNSS)
INSERT INTO section_mappings (old_section, new_section, old_act, new_act, description) VALUES
('420', '318', 'IPC', 'BNS', 'Cheating and dishonestly inducing delivery of property'),
('302', '101', 'IPC', 'BNS', 'Punishment for murder'),
('376', '64', 'IPC', 'BNS', 'Punishment for rape / sexual assault'),
('120B', '61(2)', 'IPC', 'BNS', 'Criminal conspiracy'),
('34', '3(5)', 'IPC', 'BNS', 'Acts done by several persons in furtherance of common intention'),
('379', '303(2)', 'IPC', 'BNS', 'Punishment for theft'),
('406', '316', 'IPC', 'BNS', 'Punishment for criminal breach of trust'),
('506', '351(2)', 'IPC', 'BNS', 'Punishment for criminal intimidation'),
('498A', '85', 'IPC', 'BNS', 'Husband or relative of husband of a woman subjecting her to cruelty'),
('279', '281', 'IPC', 'BNS', 'Rash driving or riding on a public way'),
('323', '115(2)', 'IPC', 'BNS', 'Voluntarily causing hurt'),
('304A', '106(1)', 'IPC', 'BNS', 'Causing death by negligence'),
('438', '482', 'CrPC', 'BNSS', 'Direction for grant of bail to person apprehending arrest (Anticipatory Bail)'),
('439', '483', 'CrPC', 'BNSS', 'Special powers of High Court or Court of Session regarding bail'),
('482', '528', 'CrPC', 'BNSS', 'Saving of inherent powers of High Court'),
('167', '187', 'CrPC', 'BNSS', 'Procedure when investigation cannot be completed in twenty-four hours (Custody limit alterations)'),
('154', '173', 'CrPC', 'BNSS', 'Information in cognizable cases (Registration of FIR, zero FIR rules)')
ON CONFLICT (old_section, old_act) DO UPDATE SET 
    new_section = EXCLUDED.new_section,
    new_act = EXCLUDED.new_act,
    description = EXCLUDED.description;


-- 3. LEGAL TEMPLATES
INSERT INTO legal_templates (template_id, jurisdiction, practice_area, document_type, court_type, display_name, system_prompt, auto_research_query, quality_checks) VALUES
('criminal_bail_sessions', 'India', 'Criminal', 'Bail Petition', 'Sessions Court', 'Anticipatory Bail Petition (BNSS 482)', 
'You are a senior criminal defense advocate. Draft a petition for Anticipatory Bail under Section 482 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 (formerly Section 438 of the Code of Criminal Procedure, 1973).

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

{COURT_CLOSING_FORMAT}',
'Anticipatory Bail Section 482 BNSS quashing or business dispute precedents',
'[
  {"id": "chk_header", "rule": "Contains standard court header styling", "weight": 20},
  {"id": "chk_bns_conv", "rule": "Correctly references BNS/BNSS instead of IPC/CrPC", "weight": 30},
  {"id": "chk_precedent", "rule": "Integrates landmark quashing or bail judgments", "weight": 25},
  {"id": "chk_pray", "rule": "Concludes with standard legal prayer and signature block", "weight": 25}
]'::jsonb),

('corporate_arbitration_invoke', 'India', 'Corporate', 'Arbitration Notice', 'High Court', 'Arbitration Clause Invoke Notice', 
'You are a senior corporate litigation attorney. Draft a Notice Invoking Arbitration under Section 21 of the Arbitration and Conciliation Act, 1996.

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

{COURT_CLOSING_FORMAT}',
'Notice invoking arbitration Section 21 dispute board resolution precedents',
'[
  {"id": "chk_header", "rule": "Notice contains sender and recipient addresses", "weight": 20},
  {"id": "chk_sec21", "rule": "Explicitly references Section 21 invocation", "weight": 30},
  {"id": "chk_nominee", "rule": "Proposes a sole arbitrator and sets 30-day timeline", "weight": 30},
  {"id": "chk_close", "rule": "Signed by legal counsel on behalf of claimant", "weight": 20}
]'::jsonb),

('cheque_bounce_138', 'India', 'Criminal', 'Cheque Bounce Notice', 'District Court', 'Section 138 NI Act Legal Notice', 
'You are a legal counsel drafting a statutory legal demand notice under Section 138 of the Negotiable Instruments Act, 1881.

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

{COURT_CLOSING_FORMAT}',
'Section 138 NI Act cheque dishonour demand notice requirements',
'[
  {"id": "chk_header", "rule": "Contains complete addressee details", "weight": 20},
  {"id": "chk_timeline", "rule": "Includes mandatory 15-day statutory demand timeline", "weight": 30},
  {"id": "chk_chequedetails", "rule": "Includes cheque number, date, amount, and bounce memo date", "weight": 30},
  {"id": "chk_liability", "rule": "Asserts legally enforceable debt liability", "weight": 20}
]'::jsonb)
ON CONFLICT (template_id) DO UPDATE SET 
    jurisdiction = EXCLUDED.jurisdiction,
    practice_area = EXCLUDED.practice_area,
    document_type = EXCLUDED.document_type,
    court_type = EXCLUDED.court_type,
    display_name = EXCLUDED.display_name,
    system_prompt = EXCLUDED.system_prompt,
    auto_research_query = EXCLUDED.auto_research_query,
    quality_checks = EXCLUDED.quality_checks;


-- 4. KNOWLEDGE NODES
INSERT INTO knowledge_nodes (node_type, title, content, practice_area, tags, client_id, matter_id) VALUES
('Client Fact', 'FIR Registry', 'FIR No. 120/2026 was filed on May 10, 2026, at Patiala House Police Station under Section 420 and Section 120B of the IPC by Rajiv Mehta against Vikram Malhotra.', 'Criminal', '["fir", "criminal", "cheating"]'::jsonb, 'C001', 'M001'),
('Client Fact', 'Business Rivalry Origin', 'The complainant Rajiv Mehta and applicant Vikram Malhotra were equal shareholders in Astroum Tech. The dispute arose following a board deadlock regarding equity transfer on April 15, 2026.', 'Criminal', '["corporate-dispute", "rivalry"]'::jsonb, 'C001', 'M001'),
('Constraint', 'Roots in Society Assertion', 'The petition must assert that the applicant is a respectable director, has a permanent residence at Vasant Kunj, New Delhi, holds bank accounts and assets in India, and poses zero flight risk.', 'Criminal', '["bail", "constraint"]'::jsonb, 'C001', 'M001'),
('Anti Pattern', 'No Liability Admission', 'Do not mention any mutual settlement agreements or willingness to pay back any disputed amounts in the bail application, as this is often construed by prosecutors as an admission of corporate fraud or cheating.', 'Criminal', '["anti-pattern", "liability"]'::jsonb, 'C001', 'M001'),
('Decision', 'State of Haryana v. Bhajan Lal Precedent', 'In State of Haryana v. Bhajan Lal (1992 SCC Supp (1) 335), the Supreme Court laid down detailed guidelines for quashing FIRs, specifically highlighting that proceedings motivated by private malice or commercial rivalry should be quashed.', 'Criminal', '["precedent", "quashing"]'::jsonb, 'C001', 'M001'),
('Decision', 'Gurbaksh Singh Sibbia v. State of Punjab Precedent', 'In Gurbaksh Singh Sibbia v. State of Punjab (1980 2 SCC 565), the Constitution Bench of the Supreme Court held that the power under Section 438 (now BNSS 482) is of wide amplitude and should not be restricted by unnecessary judicial limitations.', 'Criminal', '["precedent", "anticipatory-bail"]'::jsonb, 'C001', 'M001'),

-- Corporate Knowledge Nodes
('Client Fact', 'Shareholders Agreement Details', 'Client Astroum Tech entered into a Shareholders Agreement (SHA) with Zenith Holdings on October 12, 2024. Clause 18.2 specifies that all disputes arising out of the agreement shall be referred to arbitration in New Delhi before a sole arbitrator.', 'Corporate', '["sha", "arbitration"]'::jsonb, 'C002', 'M002'),
('Constraint', 'Explicit Dispute Trigger', 'Clearly specify that the dispute arose due to Zenith Holdings failing to pay the licensing fee of INR 45,00,000 due under Clause 6.1 on March 1, 2026, despite multiple written reminders.', 'Corporate', '["arbitration", "constraint"]'::jsonb, 'C002', 'M002'),
('Decision', 'Perkins Eastman Arbitration Precedent', 'In Perkins Eastman Architects DPC v. HSCC (India) Ltd (2019 SCC Online SC 1517), the Supreme Court held that a party having an interest in the outcome of the dispute cannot unilaterally appoint a sole arbitrator.', 'Corporate', '["precedent", "arbitrator-appointment"]'::jsonb, 'C002', 'M002'),
('Anti Pattern', 'No Forgiveness of Interest', 'Do not waive or forget to claim the 18% per annum compound interest rate on the unpaid licensing fee, as specified in Schedule C of the licensing agreement.', 'Corporate', '["anti-pattern", "interest-claim"]'::jsonb, 'C002', 'M002');
