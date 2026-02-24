const META_API_BASE = "https://graph.facebook.com/v21.0";

interface MetaTemplateComponent {
  type: string;
  format?: string;
  text?: string;
  buttons?: { type: string; text: string; url?: string }[];
}

interface CreateTemplateInput {
  name: string;
  category: string;
  language: string;
  components: MetaTemplateComponent[];
}

interface MetaTemplate {
  id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  components: MetaTemplateComponent[];
}

export async function listMetaTemplates(
  wabaId: string,
  accessToken: string
): Promise<MetaTemplate[]> {
  const res = await fetch(`${META_API_BASE}/${wabaId}/message_templates?limit=100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Meta API error: ${data.error?.message ?? res.statusText}`);
  }

  return data.data ?? [];
}

export async function createMetaTemplate(
  wabaId: string,
  accessToken: string,
  input: CreateTemplateInput
): Promise<MetaTemplate> {
  const res = await fetch(`${META_API_BASE}/${wabaId}/message_templates`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: input.name,
      category: input.category,
      language: input.language,
      components: input.components,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Meta API error: ${data.error?.message ?? res.statusText}`);
  }

  return data;
}

export async function deleteMetaTemplate(
  wabaId: string,
  accessToken: string,
  templateName: string
): Promise<void> {
  const res = await fetch(`${META_API_BASE}/${wabaId}/message_templates?name=${templateName}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(`Meta API error: ${data.error?.message ?? res.statusText}`);
  }
}
