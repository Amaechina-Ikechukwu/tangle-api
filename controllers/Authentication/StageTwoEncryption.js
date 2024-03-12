const crypto = require("crypto");
const iv = crypto.randomBytes(16); // 16 bytes for AES-256-CBC

// Encrypt data
function EncryptUser({ data, key }) {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// Decrypt data
function DecryptUser({ encryptedData, key }) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { EncryptUser, DecryptUser };
