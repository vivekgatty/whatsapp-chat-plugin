const META_API_BASE = "https://graph.facebook.com/v21.0";

interface SendResult {
  messageId: string;
}

export async function sendTextMessage(
  phoneNumberId: string,
  accessToken: string,
  recipientPhone: string,
  text: string
): Promise<SendResult> {
  const res = await fetch(`${META_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: recipientPhone.replace(/\D/g, ""),
      type: "text",
      text: { body: text },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Meta API error: ${data.error?.message ?? res.statusText}`);
  }

  return { messageId: data.messages?.[0]?.id ?? "" };
}

export async function sendTemplateMessage(
  phoneNumberId: string,
  accessToken: string,
  recipientPhone: string,
  templateName: string,
  language: string,
  variables: string[]
): Promise<SendResult> {
  const components =
    variables.length > 0
      ? [
          {
            type: "body",
            parameters: variables.map((v) => ({
              type: "text",
              text: v,
            })),
          },
        ]
      : [];

  const res = await fetch(`${META_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: recipientPhone.replace(/\D/g, ""),
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Meta API error: ${data.error?.message ?? res.statusText}`);
  }

  return { messageId: data.messages?.[0]?.id ?? "" };
}

export async function markMessageAsRead(
  phoneNumberId: string,
  accessToken: string,
  waMessageId: string
): Promise<void> {
  await fetch(`${META_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: waMessageId,
    }),
  });
}
