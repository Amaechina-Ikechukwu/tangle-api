const { getDatabase, ServerValue } = require("firebase-admin/database");

const GetGroupLastMessage = async ({ groupid }) => {
  try {
    const db = getDatabase();

    const membersRef = db.ref(`groups/${groupid}/chats`);

    const snapshot = await membersRef
      .orderByChild("sent")
      .limitToLast(1)
      .once("value");
    if (snapshot.exists()) {
      const lastMessageKey = Object.keys(snapshot.val())[0];
      const lastMessage = snapshot.val()[lastMessageKey];
      return { id: lastMessageKey, ...lastMessage };
    } else {
      return null; // No messages found between the users
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  GetGroupLastMessage,
};
