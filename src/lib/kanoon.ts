import { CaseResult } from "../types";
import { getCaseCache, saveCaseCache } from "./supabase";

const KANOON_API_KEY = process.env.INDIAN_KANOON_API_KEY || "";
const KANOON_BASE_URL = "https://api.indiankanoon.org";

// Landmark cases to serve as mock databases for search scenarios
const LANDMARK_PRECEDENTS: CaseResult[] = [
  {
    tid: 1965383,
    title: "State of Haryana v. Bhajan Lal (1992 SCC Supp (1) 335)",
    docsource: "Supreme Court of India",
    publishdate: "1990-11-21",
    headline: "Landmark ruling on quashing of FIRs under Section 482 of CrPC. Established 7 categories where High Courts can quash criminal proceedings, including cases of commercial dispute converted to criminal cases and private malice.",
    context: "Held: Where the allegations made in the First Information Report, even if taken at their face value and accepted in their entirety, do not prima facie constitute any offence, the FIR can be quashed. Commercial rivalries disguised as criminal offences represent an abuse of process."
  },
  {
    tid: 965324,
    title: "Gurbaksh Singh Sibbia v. State of Punjab (1980 2 SCC 565)",
    docsource: "Supreme Court of India",
    publishdate: "1980-04-09",
    headline: "Constitution Bench ruling on Anticipatory Bail (Section 438 CrPC / Section 482 BNSS). Disapproved of imposing artificial limits or timelines on anticipatory bail duration.",
    context: "Held: The power of granting anticipatory bail is of wide amplitude and should not be cabined or restricted. It is a device to secure individual liberty against arbitrary arrests."
  },
  {
    tid: 104523,
    title: "Arnesh Kumar v. State of Bihar (2014 8 SCC 273)",
    docsource: "Supreme Court of India",
    publishdate: "2014-07-02",
    headline: "Guidelines restricting mechanical arrests under Section 498A IPC / Section 85 BNS and offences punishable up to 7 years. Mandatory notice under Section 41A CrPC.",
    context: "Held: Arrests should not be the automatic response to filing of criminal charges. Police officers must outline reasons for arrest and satisfy the Magistrate under Section 41(1)(b) CrPC."
  },
  {
    tid: 153094,
    title: "Perkins Eastman Architects DPC v. HSCC (India) Ltd (2019 SCC Online SC 1517)",
    docsource: "Supreme Court of India",
    publishdate: "2019-11-26",
    headline: "Unilateral appointment of a sole arbitrator by a party interested in the dispute is void. Ensures impartiality in commercial arbitrations.",
    context: "Held: A person who has an interest in the outcome of the arbitration dispute is legally disqualified from acting as an arbitrator or nominating a sole arbitrator unilaterally."
  },
  {
    tid: 312569,
    title: "Sushila Aggarwal v. State (NCT of Delhi) (2020 5 SCC 1)",
    docsource: "Supreme Court of India",
    publishdate: "2020-01-29",
    headline: "Clarified that anticipatory bail should not normally be limited to a fixed time frame. It can continue till the end of the trial.",
    context: "Held: The protection granted to a person under Section 438 CrPC should not be limited to a fixed period; it should enure in their favour till the end of the trial."
  },
  {
    tid: 450912,
    title: "Modi Cements Ltd. v. Kuchil Kumar Nandi (1998 3 SCC 249)",
    docsource: "Supreme Court of India",
    publishdate: "1998-03-03",
    headline: "Addressed cheque bounce notice validity under Section 138 of the Negotiable Instruments Act. Issuing a stop-payment instruction does not preclude liability.",
    context: "Held: Merely because the drawer issued a stop payment notice to the bank, it does not mean Section 138 of the NI Act does not apply. The drawer remains liable if debt is established."
  }
];

export async function searchCases(query: string): Promise<CaseResult[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  // 1. Check local cache first
  const cached = await getCaseCache(normalizedQuery);
  if (cached) {
    return cached;
  }

  let results: CaseResult[] = [];

  // 2. Perform live API request if API key is present
  if (KANOON_API_KEY) {
    try {
      const response = await fetch(`${KANOON_BASE_URL}/search/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${KANOON_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          formInput: normalizedQuery,
          pagenum: "0"
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.results) {
          results = data.results.map((r: any) => ({
            tid: r.tid,
            title: r.title,
            docsource: r.docsource || "Indian Courts",
            publishdate: r.publishdate || "",
            headline: r.headline || "",
            context: r.headline || ""
          }));
        }
      } else {
        console.error("Indian Kanoon API returned error status:", response.status);
      }
    } catch (e) {
      console.error("Failed fetching live Indian Kanoon search data:", e);
    }
  }

  // 3. Fall back to local search matching if live API returned empty or is not configured
  if (results.length === 0) {
    const qLower = normalizedQuery.toLowerCase();
    
    // Fuzzy matching against landmark case fields
    results = LANDMARK_PRECEDENTS.filter(precedent => {
      return (
        precedent.title.toLowerCase().includes(qLower) ||
        precedent.headline.toLowerCase().includes(qLower) ||
        precedent.context?.toLowerCase().includes(qLower) ||
        (qLower.includes("bail") && precedent.title.includes("Gurbaksh") || precedent.title.includes("Sushila") || precedent.title.includes("Arnesh")) ||
        (qLower.includes("quash") && precedent.title.includes("Bhajan")) ||
        (qLower.includes("arbitration") && precedent.title.includes("Perkins")) ||
        (qLower.includes("cheque") && precedent.title.includes("Modi"))
      );
    });

    // If nothing matched, just return all precedents as default fallback references
    if (results.length === 0) {
      results = LANDMARK_PRECEDENTS.slice(0, 3);
    }
  }

  // 4. Save results to cache
  await saveCaseCache(normalizedQuery, results);

  return results;
}

export async function getCaseMeta(docId: number): Promise<CaseResult | null> {
  // If API key is present, attempt live metadata lookup
  if (KANOON_API_KEY) {
    try {
      const response = await fetch(`${KANOON_BASE_URL}/doc/${docId}/`, {
        method: "GET",
        headers: {
          "Authorization": `Token ${KANOON_API_KEY}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        return {
          tid: data.tid,
          title: data.title,
          docsource: data.docsource || "Indian Court Document",
          publishdate: data.publishdate || "",
          headline: data.headline || "",
          context: data.doc || ""
        };
      }
    } catch (e) {
      console.error("Failed fetching live Indian Kanoon metadata:", e);
    }
  }

  // Fallback to local landmark matching
  const matched = LANDMARK_PRECEDENTS.find(p => p.tid === docId);
  return matched || null;
}
