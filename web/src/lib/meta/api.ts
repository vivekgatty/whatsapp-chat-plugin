const META_API_BASE = "https://graph.facebook.com/v19.0";

export class MetaAPIClient {
  private accessToken: string;
  private phoneNumberId: string;

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Record<string, unknown>> {
    const url = `${META_API_BASE}/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new MetaAPIError(
        data.error?.message ?? response.statusText,
        data.error?.code ?? response.status,
        data.error?.error_data
      );
    }

    return data;
  }

  async sendText(to: string, text: string, replyToMessageId?: string) {
    return this.request(`${this.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: text, preview_url: false },
        ...(replyToMessageId && {
          context: { message_id: replyToMessageId },
        }),
      }),
    });
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components: Record<string, unknown>[]
  ) {
    return this.request(`${this.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    });
  }

  async sendImage(to: string, imageUrl: string, caption?: string) {
    return this.request(`${this.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "image",
        image: { link: imageUrl, caption },
      }),
    });
  }

  async sendDocument(to: string, documentUrl: string, filename: string, caption?: string) {
    return this.request(`${this.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "document",
        document: { link: documentUrl, filename, caption },
      }),
    });
  }

  async sendLocation(to: string, lat: number, lng: number, name?: string, address?: string) {
    return this.request(`${this.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "location",
        location: { latitude: lat, longitude: lng, name, address },
      }),
    });
  }

  async sendInteractiveButtons(
    to: string,
    body: string,
    buttons: { id: string; title: string }[],
    header?: string,
    footer?: string
  ) {
    return this.request(`${this.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          ...(header && { header: { type: "text", text: header } }),
          body: { text: body },
          ...(footer && { footer: { text: footer } }),
          action: {
            buttons: buttons.map((b) => ({
              type: "reply",
              reply: { id: b.id, title: b.title },
            })),
          },
        },
      }),
    });
  }

  async sendListMessage(
    to: string,
    body: string,
    buttonText: string,
    sections: Record<string, unknown>[]
  ) {
    return this.request(`${this.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: body },
          action: { button: buttonText, sections },
        },
      }),
    });
  }

  async markAsRead(messageId: string) {
    return this.request(`${this.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    });
  }

  async uploadMedia(file: Buffer, mimeType: string) {
    const formData = new FormData();
    formData.append("file", new Blob([file], { type: mimeType }));
    formData.append("type", mimeType);
    formData.append("messaging_product", "whatsapp");

    const response = await fetch(`${META_API_BASE}/${this.phoneNumberId}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.accessToken}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new MetaAPIError(
        data.error?.message ?? response.statusText,
        data.error?.code ?? response.status,
        data.error?.error_data
      );
    }

    return data;
  }

  async createTemplate(wabaId: string, template: Record<string, unknown>) {
    return this.request(`${wabaId}/message_templates`, {
      method: "POST",
      body: JSON.stringify(template),
    });
  }

  async getTemplates(wabaId: string) {
    return this.request(
      `${wabaId}/message_templates?fields=name,status,components,language,category`
    );
  }

  async deleteTemplate(wabaId: string, templateName: string) {
    return this.request(`${wabaId}/message_templates?name=${templateName}`, { method: "DELETE" });
  }
}

export class MetaAPIError extends Error {
  code: number;
  errorData: unknown;

  constructor(message: string, code: number, errorData?: unknown) {
    super(message);
    this.name = "MetaAPIError";
    this.code = code;
    this.errorData = errorData;
  }
}
