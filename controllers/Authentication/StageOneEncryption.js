const argon2 = require("argon2");

/**
 * Encrypts the user's email using Argon2.
 * @param {string} userid - The user's email to encrypt.

 */
const StageOneEncryption = async ({ userid }) => {
  console.log({ userid });
  try {
    const hash = await argon2.hash(userid);
    return hash;
  } catch (err) {
    throw err; // Re-throw the caught error directly
  }
};

module.exports = { StageOneEncryption };
