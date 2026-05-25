import { KnowledgeNode } from "../types";

const MAX_TOKENS = 3000;
// 1 token is roughly 4 characters in English text. So 3000 tokens is roughly 12,000 characters.
const MAX_CHARACTERS = MAX_TOKENS * 4;

interface InjectionOutput {
  injectedPrompt: string;
  injectedNodeTitles: string[];
}

/**
 * Estimates the token count of a string using a standard approximation.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Knowledge Injection Engine
 * Compiles a system prompt template by replacing:
 *   - {INJECTION_CONSTRAINTS} (with Constraints and Anti Patterns)
 *   - {INJECTION_DECISIONS} (with Decisions/Precedents)
 *   - {INJECTION_CLIENT} (with Client Facts)
 * 
 * Priorities for budget distribution:
 *   1. Constraint (Highest)
 *   2. Anti Pattern
 *   3. Decision
 *   4. Client Fact (Lowest)
 */
export function injectKnowledge(
  systemPromptTemplate: string,
  nodes: KnowledgeNode[]
): InjectionOutput {
  // 1. Group nodes by type
  const constraints = nodes.filter(n => n.node_type === "Constraint");
  const antiPatterns = nodes.filter(n => n.node_type === "Anti Pattern");
  const decisions = nodes.filter(n => n.node_type === "Decision");
  const clientFacts = nodes.filter(n => n.node_type === "Client Fact");

  // 2. Ordered sequence based on priority
  // Priority order: Constraints -> Anti Patterns -> Decisions -> Client Facts
  const orderedNodes = [
    ...constraints,
    ...antiPatterns,
    ...decisions,
    ...clientFacts
  ];

  const injectedNodeTitles: string[] = [];
  let currentUsedChars = systemPromptTemplate.length; // Baseline size

  // Collections of text to inject
  const injectedConstraints: string[] = [];
  const injectedDecisions: string[] = [];
  const injectedClientFacts: string[] = [];

  // 3. Greedily add nodes to their respective sections as long as we are under budget
  for (const node of orderedNodes) {
    const formattedNodeText = `- [${node.title}]: ${node.content}\n`;
    const nodeLength = formattedNodeText.length;

    // Check if adding this node exceeds our character budget (3000 tokens)
    if (currentUsedChars + nodeLength > MAX_CHARACTERS) {
      console.warn(`Token budget exceeded! Skipping knowledge node: ${node.title}`);
      continue; // Skip node to respect token ceiling
    }

    // Accumulate the node based on type
    if (node.node_type === "Constraint") {
      injectedConstraints.push(formattedNodeText);
      injectedNodeTitles.push(node.title);
      currentUsedChars += nodeLength;
    } else if (node.node_type === "Anti Pattern") {
      // Anti patterns are grouped in constraints section for drafting directives
      injectedConstraints.push(`- WARNING (ANTI-PATTERN): ${node.content}\n`);
      injectedNodeTitles.push(node.title);
      currentUsedChars += nodeLength;
    } else if (node.node_type === "Decision") {
      injectedDecisions.push(formattedNodeText);
      injectedNodeTitles.push(node.title);
      currentUsedChars += nodeLength;
    } else if (node.node_type === "Client Fact") {
      injectedClientFacts.push(formattedNodeText);
      injectedNodeTitles.push(node.title);
      currentUsedChars += nodeLength;
    }
  }

  // 4. Assemble final string buffers
  const constraintsString = injectedConstraints.length > 0 
    ? injectedConstraints.join("") 
    : "No specific drafting constraints provided.";

  const decisionsString = injectedDecisions.length > 0 
    ? injectedDecisions.join("") 
    : "No legal precedents or decisions provided.";

  const clientFactsString = injectedClientFacts.length > 0 
    ? injectedClientFacts.join("") 
    : "No client dispute facts provided.";

  // 5. Replace placeholders in the system template
  let injectedPrompt = systemPromptTemplate;
  injectedPrompt = injectedPrompt.replace(/{INJECTION_CONSTRAINTS}/g, constraintsString);
  injectedPrompt = injectedPrompt.replace(/{INJECTION_DECISIONS}/g, decisionsString);
  injectedPrompt = injectedPrompt.replace(/{INJECTION_CLIENT}/g, clientFactsString);

  return {
    injectedPrompt,
    injectedNodeTitles
  };
}
