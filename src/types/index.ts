// BRAHMO India Legal - Type Definitions

export type PracticeArea = "Criminal" | "Corporate";
export type NodeType = "Constraint" | "Anti Pattern" | "Decision" | "Client Fact";

export interface QualityCheck {
  id: string;
  rule: string;
  weight: number;
}

export interface LegalTemplate {
  id: string;
  template_id: string;
  jurisdiction: string;
  practice_area: PracticeArea;
  document_type: string;
  court_type: string;
  display_name: string;
  system_prompt: string;
  auto_research_query: string;
  quality_checks: QualityCheck[];
  created_at?: string;
}

export interface KnowledgeNode {
  id: string;
  node_type: NodeType;
  title: string;
  content: string;
  practice_area: PracticeArea;
  tags: string[];
  client_id?: string;
  matter_id?: string;
  created_at?: string;
}

export interface SectionMapping {
  id: string;
  old_section: string;
  new_section: string;
  old_act: "IPC" | "CrPC";
  new_act: "BNS" | "BNSS";
  description?: string;
}

export interface CourtFormat {
  id: string;
  court_code: string;
  court_name: string;
  header_template: string;
  party_format: string;
  closing_format: string;
  created_at?: string;
}

export interface CaseResult {
  tid: number;
  title: string;
  docsource: string;
  publishdate: string;
  headline: string;
  context?: string;
}

export interface CaseCache {
  id: string;
  search_query: string;
  results: CaseResult[];
  searched_at: string;
}

export interface Matter {
  client_id: string;
  matter_id: string;
  display_name: string;
  practice_area: PracticeArea;
}

export interface NormalizerAlert {
  section: string;
  oldAct: string;
  newSection: string;
  newAct: string;
  message: string;
}

export interface NormalizeResult {
  updatedContent: string;
  replacedSections: Record<string, string>;
  alerts: NormalizerAlert[];
}

export interface ComparisonLevelOutput {
  draftText: string;
  qualityScore: number;
  checksPassed: string[];
  checksFailed: string[];
  injectedNodes: string[]; // Titles of injected knowledge nodes
  legalReferences: string[]; // Landmark cases referenced
}

export interface ThreeLevelComparison {
  level1: ComparisonLevelOutput; // Generic AI
  level2: ComparisonLevelOutput; // Template only
  level3: ComparisonLevelOutput; // Template + Knowledge + Kanoon
}
