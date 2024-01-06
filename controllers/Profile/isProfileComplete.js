const { getDatabase } = require("firebase-admin/database");

const checkUserData = async ({ userId }) => {
  try {
    const db = getDatabase();
    const userRef = db.ref(`users/${userId}`);

    const userSnapshot = await userRef.once("value");
    const userData = userSnapshot.val();

    if (userData && userData.camp && userData.nickname) {
      // User ID exists, 'camp' is an object, and 'nickname' is a string
      return true;
    } else {
      // User ID doesn't exist or 'camp' or 'nickname' is missing or invalid
      return false;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = {
  checkUserData,
};
