import { SectionMapping, NormalizeResult, NormalizerAlert } from "../types";

/**
 * Standard legal alert descriptions explaining real statutory changes
 */
const STATUTORY_IMPLICATIONS: Record<string, string> = {
  "318-BNS": "Section 318 BNS (formerly 420 IPC) covers Cheating. The threshold for corporate cheating and sentencing rules have been updated, specifically establishing progressive penalties for recidivists.",
  "101-BNS": "Section 101 BNS (formerly 302 IPC) establishes punishment for Murder. Note that the sentencing structures have been re-arranged in the new penal code.",
  "64-BNS": "Section 64 BNS (formerly 376 IPC) covers Rape, which is now codified with revised mandatory minimum sentencing ranges under Chapter V of the BNS.",
  "61(2)-BNS": "Section 61(2) BNS (formerly 120B IPC) defines Criminal Conspiracy. Ensure any joint liability arguments are restructured under the new codification.",
  "3(5)-BNS": "Section 3(5) BNS (formerly 34 IPC) defines Common Intention. The language has been modernized to specify joint criminal acts.",
  "316-BNS": "Section 316 BNS (formerly 406 IPC) governs Criminal Breach of Trust, introducing distinct sub-categories for public servants and agents.",
  "351(2)-BNS": "Section 351(2) BNS (formerly 506 IPC) covers Criminal Intimidation, with updated definitions regarding threats communicated electronically.",
  "482-BNSS": "Section 482 BNSS (formerly 438 CrPC) governs Anticipatory Bail. The statutory guidelines have been slightly adjusted; ensure you explicitly satisfy the court regarding the lack of flight risk.",
  "483-BNSS": "Section 483 BNSS (formerly 439 CrPC) defines special powers of Sessions and High Courts regarding bail.",
  "528-BNSS": "Section 528 BNSS (formerly 482 CrPC) preserves the Inherent Powers of the High Court. Ensure petitions for quashing highlight this section explicitly.",
  "187-BNSS": "Section 187 BNSS (formerly 167 CrPC) alters police custody limits. Under the BNSS, police custody can be sought in phases within the first 40 or 60 days, up to a maximum of 15 days, which is a major expansion over the older 15-day restriction.",
  "173-BNSS": "Section 173 BNSS (formerly 154 CrPC) codifies the registration of FIRs and mandates the integration of digital signatures and Zero FIR practices."
};

export function normalizeSections(content: string, mappings: SectionMapping[]): NormalizeResult {
  let updatedContent = content;
  const replacedSections: Record<string, string> = {};
  const alerts: NormalizerAlert[] = [];

  // Create a map for quick mapping checks
  const mappingMap = new Map<string, SectionMapping>();
  mappings.forEach(m => {
    mappingMap.set(`${m.old_section}_${m.old_act}`.toLowerCase(), m);
  });

  // Regex to match "Section 420 IPC", "Section 420 of the IPC", "Section 438 of CrPC", "Section 438 CrPC", "Sec. 420 IPC"
  // Captures: 1 = Section number, 2 = Act (IPC or CrPC)
  const regexPatterns = [
    /Sec(?:tion|\.)\s*(\d+[A-Za-z]*)\s*(?:of\s+the\s+|of\s+)?(IPC|CrPC)/gi,
    /(\d+[A-Za-z]*)\s*(IPC|CrPC)/gi
  ];

  regexPatterns.forEach((regex) => {
    let match;
    // We search the current version of the content
    while ((match = regex.exec(updatedContent)) !== null) {
      const fullMatchText = match[0];
      const sectionNum = match[1];
      const act = match[2].toUpperCase() as "IPC" | "CrPC";
      
      const key = `${sectionNum}_${act}`.toLowerCase();
      const mapping = mappingMap.get(key);

      if (mapping) {
        const replacementText = `Section ${mapping.new_section} of the ${mapping.new_act} (formerly ${fullMatchText})`;
        
        // Check if we already replaced this in this run to avoid infinite loop
        if (!replacedSections[fullMatchText]) {
          replacedSections[fullMatchText] = `Section ${mapping.new_section} ${mapping.new_act}`;
          
          // Replace all occurrences of this exact match in our working text
          // Using a split-join approach to safely replace exact strings without regex compilation issues
          updatedContent = updatedContent.split(fullMatchText).join(replacementText);
          
          const alertKey = `${mapping.new_section}-${mapping.new_act}`;
          const customMessage = STATUTORY_IMPLICATIONS[alertKey] || 
            `Section ${sectionNum} ${act} has been replaced by Section ${mapping.new_section} ${mapping.new_act}.`;

          alerts.push({
            section: sectionNum,
            oldAct: act,
            newSection: mapping.new_section,
            newAct: mapping.new_act,
            message: customMessage
          });
        }
      }
    }
  });

  // Also catch generic standalone matches like "Section 420" if context is clearly IPC/CrPC, 
  // but to keep normalizer safe, we stick to explicit mentions (e.g. "Section 420 IPC") as specified by the prompt.

  return {
    updatedContent,
    replacedSections,
    alerts
  };
}
