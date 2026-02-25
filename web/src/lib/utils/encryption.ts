import crypto from "crypto";

const ALGO = "aes-256-gcm";

type EncryptedParts = {
  iv: string;
  authTag: string;
  cipherText: string;
};

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY || process.env.TOKEN_ENCRYPTION_KEY || "";
  if (!raw) throw new Error("ENCRYPTION_KEY (or TOKEN_ENCRYPTION_KEY) is missing");

  let key: Buffer;
  if (/^[a-fA-F0-9]{64}$/.test(raw)) key = Buffer.from(raw, "hex");
  else key = Buffer.from(raw, "base64");

  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY (or TOKEN_ENCRYPTION_KEY) must decode to 32 bytes for AES-256-GCM");
  }
  return key;
}

function encryptToParts(token: string): EncryptedParts {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    cipherText: encrypted.toString("base64"),
  };
}

function decryptFromParts(parts: EncryptedParts): string {
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(parts.iv, "base64"));
  decipher.setAuthTag(Buffer.from(parts.authTag, "base64"));

  const plain = Buffer.concat([
    decipher.update(Buffer.from(parts.cipherText, "base64")),
    decipher.final(),
  ]);

  return plain.toString("utf8");
}

export function encryptToken(token: string): string {
  const { iv, authTag, cipherText } = encryptToParts(token);
  return `${iv}:${authTag}:${cipherText}`;
}

export function decryptToken(encrypted: string): string {
  const [iv, authTag, cipherText] = encrypted.split(":");
  if (!iv || !authTag || !cipherText) {
    throw new Error("Encrypted token must be in iv:tag:ciphertext format");
  }
  return decryptFromParts({ iv, authTag, cipherText });
}

// Backward-compatible helpers used by existing API handlers.
export type EncryptedToken = EncryptedParts;

export function encryptAccessToken(plainText: string): EncryptedToken {
  return encryptToParts(plainText);
}

export function decryptAccessToken(payload: EncryptedToken): string {
  return decryptFromParts(payload);
}
