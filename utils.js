// Imports
const crypto = require(`crypto`);

// ==========================
// ======= Encryptions ======
// ==========================

// Keys
const encryptionKey = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

// Encrypt text function
function encrypt(text) {
  // Convert number to string if necessary
  if (text === null) {
    text = "n/a";
  }

  // Convert booleans to their string representation
  if (typeof text === "boolean") {
    text = text.toString();
  }

  // Convert number to string if necessary
  if (typeof text === "number") {
    text = text.toString();
  }

  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "utf-8"),
    iv
  );
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

// Decrypt text function
function decrypt(text) {
  try {
    let textParts = text.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(encryptionKey, "utf-8"),
      iv
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return null; // or handle the error as appropriate
  }
}

// Hash data function
function hashData(data) {
  return crypto.createHash(`sha256`).update(data).digest(`hex`);
}

function isObjectFullyPopulated(obj) {
  return Object.keys(obj).every(
    (key) => obj[key] !== undefined && obj[key] !== null && obj[key] !== ""
  );
}
module.exports = { isObjectFullyPopulated, encrypt, decrypt, hashData };
