-- Supabase PostgreSQL DDL Schema for BRAHMO India Legal (Option C)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: legal_templates
-- Contains default drafting formats, prompt layouts, and QA rubrics.
CREATE TABLE IF NOT EXISTS legal_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(100) UNIQUE NOT NULL,
    jurisdiction VARCHAR(100) NOT NULL,
    practice_area VARCHAR(100) NOT NULL,      -- e.g. 'Criminal', 'Corporate'
    document_type VARCHAR(100) NOT NULL,      -- e.g. 'Bail Petition', 'Arbitration Notice', 'WS'
    court_type VARCHAR(100) NOT NULL,         -- e.g. 'Supreme Court', 'High Court', 'Sessions Court', 'NCLT'
    display_name VARCHAR(255) NOT NULL,
    system_prompt TEXT NOT NULL,
    auto_research_query TEXT NOT NULL,
    quality_checks JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of checks like: [{"id": "chk1", "rule": "Contains court header", "weight": 20}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: knowledge_nodes
-- Stores regulatory guidelines, specific client facts, local decisions, and drafting anti-patterns.
CREATE TABLE IF NOT EXISTS knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_type VARCHAR(50) NOT NULL CHECK (node_type IN ('Constraint', 'Anti Pattern', 'Decision', 'Client Fact')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    practice_area VARCHAR(100) NOT NULL,      -- e.g. 'Criminal', 'Corporate'
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    client_id VARCHAR(100),                   -- To isolate client-specific data
    matter_id VARCHAR(100),                   -- To isolate matter-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: section_mappings
-- Converts legacy penal and procedural codes (IPC, CrPC) to modern Indian codes (BNS, BNSS).
CREATE TABLE IF NOT EXISTS section_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    old_section VARCHAR(50) NOT NULL,
    new_section VARCHAR(50) NOT NULL,
    old_act VARCHAR(50) NOT NULL CHECK (old_act IN ('IPC', 'CrPC')),
    new_act VARCHAR(50) NOT NULL CHECK (new_act IN ('BNS', 'BNSS')),
    description TEXT,
    CONSTRAINT unique_section_mapping UNIQUE (old_section, old_act)
);

-- Table 4: court_formats
-- Holds standard styling frameworks for headers and closing clauses per court category.
CREATE TABLE IF NOT EXISTS court_formats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_code VARCHAR(50) UNIQUE NOT NULL,    -- e.g. 'SC', 'HC', 'SESSIONS', 'NCLT'
    court_name VARCHAR(255) NOT NULL,
    header_template TEXT NOT NULL,
    party_format TEXT NOT NULL,
    closing_format TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 5: ik_case_cache
-- Stores query cache mappings to optimize lookup expenses for the Indian Kanoon API.
CREATE TABLE IF NOT EXISTS ik_case_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_query VARCHAR(500) UNIQUE NOT NULL,
    results JSONB NOT NULL,                   -- Cached array of precedent records
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- PERFORMANCE OPTIMIZATION INDEXES
-- -----------------------------------------------------------------------------

-- Index for template selection
CREATE INDEX IF NOT EXISTS idx_legal_templates_lookup 
ON legal_templates (practice_area, document_type, court_type);

-- Index for compiling priority knowledge injection
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_injections
ON knowledge_nodes (practice_area, client_id, matter_id, node_type);

-- Index for looking up statutory corrections
CREATE INDEX IF NOT EXISTS idx_section_mappings_search
ON section_mappings (old_section, old_act);

-- Index for cache query matching
CREATE INDEX IF NOT EXISTS idx_ik_case_cache_query
ON ik_case_cache (search_query);
