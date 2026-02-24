-- ============================================================
-- Automation Helper Functions
-- Run after the main CRM schema (2026-02-24-001_crm_schema.sql)
-- ============================================================

-- Add tags to a contact (merges with existing, deduplicates)
CREATE OR REPLACE FUNCTION add_contact_tags(
  p_contact_id UUID,
  p_new_tags TEXT[]
)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  result TEXT[];
BEGIN
  UPDATE contacts
  SET tags = (
    SELECT ARRAY(
      SELECT DISTINCT unnest(tags || p_new_tags)
    )
  )
  WHERE id = p_contact_id
  RETURNING tags INTO result;

  RETURN result;
END;
$$;

-- Remove tags from a contact
CREATE OR REPLACE FUNCTION remove_contact_tags(
  p_contact_id UUID,
  p_remove_tags TEXT[]
)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  result TEXT[];
BEGIN
  UPDATE contacts
  SET tags = (
    SELECT ARRAY(
      SELECT unnest(tags)
      EXCEPT
      SELECT unnest(p_remove_tags)
    )
  )
  WHERE id = p_contact_id
  RETURNING tags INTO result;

  RETURN result;
END;
$$;

-- Get open conversation counts per agent (for round-robin assignment)
CREATE OR REPLACE FUNCTION get_agent_conversation_counts(
  p_workspace_id UUID
)
RETURNS TABLE(agent_id UUID, count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT
    a.id AS agent_id,
    COALESCE(c.cnt, 0) AS count
  FROM agents a
  LEFT JOIN (
    SELECT assigned_agent_id, COUNT(*) AS cnt
    FROM conversations
    WHERE workspace_id = p_workspace_id
      AND status = 'open'
      AND assigned_agent_id IS NOT NULL
    GROUP BY assigned_agent_id
  ) c ON c.assigned_agent_id = a.id
  WHERE a.workspace_id = p_workspace_id
    AND a.is_active = TRUE
    AND a.role != 'readonly'
  ORDER BY count ASC;
$$;

-- Deep-set a JSONB field (for custom_fields updates)
CREATE OR REPLACE FUNCTION jsonb_set_deep(
  p_target JSONB,
  p_path TEXT,
  p_value TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN jsonb_set(
    COALESCE(p_target, '{}'::jsonb),
    ARRAY[p_path],
    to_jsonb(p_value)
  );
END;
$$;
