import { MetaAPIClient } from "./api";

interface MetaTemplate {
  id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  components: Record<string, unknown>[];
}

export async function listMetaTemplates(
  wabaId: string,
  accessToken: string
): Promise<MetaTemplate[]> {
  const client = new MetaAPIClient(accessToken, "unused");
  const data = await client.getTemplates(wabaId);
  return (data.data as MetaTemplate[]) ?? [];
}

export async function createMetaTemplate(
  wabaId: string,
  accessToken: string,
  input: {
    name: string;
    category: string;
    language: string;
    components: Record<string, unknown>[];
  }
): Promise<MetaTemplate> {
  const client = new MetaAPIClient(accessToken, "unused");
  const data = await client.createTemplate(wabaId, input);
  return data as unknown as MetaTemplate;
}

export async function deleteMetaTemplate(
  wabaId: string,
  accessToken: string,
  templateName: string
): Promise<void> {
  const client = new MetaAPIClient(accessToken, "unused");
  await client.deleteTemplate(wabaId, templateName);
}
