// const crypto = require("crypto");

// const secretKey = crypto.randomBytes(32); // 256-bit key

// function encryptHash(fileHash) {
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
//   let encrypted = cipher.update(fileHash, "utf8", "hex");
//   encrypted += cipher.final("hex");
//   return iv.toString("hex") + ":" + encrypted;
// }

// function decryptHash(encryptedHash) {
//   const [iv, encrypted] = encryptedHash.split(":");
//   const decipher = crypto.createDecipheriv(
//     "aes-256-cbc",
//     secretKey,
//     Buffer.from(iv, "hex")
//   );
//   let decrypted = decipher.update(encrypted, "hex", "utf8");
//   decrypted += decipher.final("utf8");
//   return decrypted;
// }

// module.exports = { encryptHash, decryptHash };

const crypto = require("crypto");

const secretKey = crypto.randomBytes(32); // 256-bit key

function encryptHash(fileHash) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
  let encrypted = cipher.update(fileHash, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decryptHash(encryptedHash) {
  const [iv, encrypted] = encryptedHash.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    secretKey,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encryptHash, decryptHash };
