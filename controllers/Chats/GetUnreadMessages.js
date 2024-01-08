const { getDatabase } = require("firebase-admin/database");
const { GetStorageKeys } = require("./utils/DMKeys");

const GetUnreadMessageCount = async ({ user, friend }) => {
  try {
    const userkey = await GetStorageKeys({
      name: "dms",
      child: "members",
      value: [user, friend],
    });

    const db = getDatabase();
    if (userkey) {
      const membersRef = db.ref(`dms/${userkey}/chats`);

      const snapshot = await membersRef
        .orderByChild("seenBy")
        .equalTo(null)
        .once("value");
      if (snapshot.exists()) {
        return snapshot.numChildren(); // Count the number of unread messages
      } else {
        return 0; // No unread messages found between the users
      }
    } else {
      return 0;
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  GetUnreadMessageCount,
};
