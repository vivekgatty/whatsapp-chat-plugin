import { MetaAPIClient } from "./api";

const META_API_BASE = "https://graph.facebook.com/v19.0";

export async function uploadMedia(
  phoneNumberId: string,
  accessToken: string,
  file: File
): Promise<{ id: string }> {
  const client = new MetaAPIClient(accessToken, phoneNumberId);
  const buffer = Buffer.from(await file.arrayBuffer());
  const data = await client.uploadMedia(buffer, file.type);
  return { id: data.id as string };
}

export async function getMediaUrl(mediaId: string, accessToken: string): Promise<string> {
  const res = await fetch(`${META_API_BASE}/${mediaId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Meta API error: ${data.error?.message ?? res.statusText}`);
  }

  return data.url;
}

export async function downloadMedia(mediaUrl: string, accessToken: string): Promise<ArrayBuffer> {
  const res = await fetch(mediaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to download media: ${res.statusText}`);
  }

  return res.arrayBuffer();
}
