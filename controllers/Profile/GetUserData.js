const admin = require("firebase-admin");
const { getDatabase } = require("firebase-admin/database");

const GetUserData = async ({ user }) => {
  try {
    const ref = getDatabase().ref(`users/${user}`);

    return new Promise((resolve, reject) => {
      ref.once(
        "value",
        (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            const userKey = snapshot.key; // Retrieve the key of the snapshot
            resolve({ userData, userKey });
          } else {
            resolve(null); // Resolve with null if no data exists for that user
          }
        },
        (error) => {
          reject(error); // Reject the promise if there's an error
        }
      );
    });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  GetUserData,
};
