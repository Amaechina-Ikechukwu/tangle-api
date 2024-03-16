const { getDatabase } = require("firebase-admin/database");

/**
 * Checks if the user data in Firebase includes essential fields.
 * @param {string} userId - The ID of the user to check.
 * @returns {Promise<boolean>} - Returns true if the user data contains all essential fields, otherwise false.
 * @throws {Error} - Throws an error if there's an issue accessing the database.
 */
const checkUserData = async (userId) => {
  try {
    const db = getDatabase();
    const userRef = db.ref(`users/${userId}`);
    const userSnapshot = await userRef.once("value");
    const userData = userSnapshot.val();

    const requiredFields = [
      "fullName",
      "username",
      "gender",
      "age",
      "bio",
      "imageurl",
      "email",
    ];

    const allFieldsPresent = requiredFields.every(
      (field) => userData && userData[field]
    );
    return allFieldsPresent;
  } catch (error) {
    throw new Error(`Error checking user data: ${error.message}`);
  }
};

module.exports = {
  checkUserData,
};
