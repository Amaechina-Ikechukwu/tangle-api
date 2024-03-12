const { auth } = require("firebase-admin");
const { getDatabase } = require("firebase-admin/database");

const findUser = async ({ salt }) => {
  try {
    const data = await getDatabase().ref("authentication").once("value");
    if (data.exists()) {
      let uid = null;
      data.forEach((doc) => {
        if (doc.val().salt === salt) {
          uid = doc.key;
        }
      });
      return uid;
    }
    return null; // Resolve with null if user not found
  } catch (error) {
    throw error; // Forward the error to the caller
  }
};

const VerifyEmail = async ({ salt }) => {
  try {
    const uid = await findUser({ salt });
    if (uid) {
      await auth().updateUser(uid, {
        emailVerified: true,
      });
    } else {
      throw Error("User not found or salt does not match.");
    }
  } catch (error) {
    throw Error("Error verifying email:", error);
    // You may want to log the error and handle it accordingly without crashing the server
  }
};

module.exports = { VerifyEmail };
