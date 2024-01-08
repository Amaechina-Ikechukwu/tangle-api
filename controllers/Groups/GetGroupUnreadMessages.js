const { getDatabase } = require("firebase-admin/database");

const GetGroupUnreadMessageCount = async ({ groupid }) => {
  try {
    const db = getDatabase();

    const membersRef = db.ref(`groups/${groupid}/chats`);

    const snapshot = await membersRef
      .orderByChild("read")
      .equalTo(false)
      .once("value");
    if (snapshot.exists()) {
      return snapshot.numChildren(); // Count the number of unread messages
    } else {
      return 0; // No unread messages found between the users
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  GetGroupUnreadMessageCount,
};
