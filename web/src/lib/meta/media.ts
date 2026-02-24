const META_API_BASE = "https://graph.facebook.com/v21.0";

interface UploadResult {
  id: string;
}

export async function uploadMedia(
  phoneNumberId: string,
  accessToken: string,
  file: File
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("messaging_product", "whatsapp");
  formData.append("file", file);
  formData.append("type", file.type);

  const res = await fetch(`${META_API_BASE}/${phoneNumberId}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Meta API error: ${data.error?.message ?? res.statusText}`);
  }

  return { id: data.id };
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
