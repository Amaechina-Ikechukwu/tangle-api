const admin = require("firebase-admin");
const { getDatabase } = require("firebase-admin/database");

const GetGroupInfo = async ({ groupId }) => {
  try {
    const ref = getDatabase().ref(`groups/${groupId}/groupinfo`);

    return new Promise((resolve, reject) => {
      ref.once(
        "value",
        (snapshot) => {
          if (snapshot.exists()) {
            const groupInfo = snapshot.val();
            resolve({ ...groupInfo, groupId }); // Include the groupId in the resolved object
          } else {
            resolve(null); // Resolve with null if no data exists for that group
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
  GetGroupInfo,
};
