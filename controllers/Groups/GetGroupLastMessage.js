const { getDatabase, ServerValue } = require("firebase-admin/database");
const { GetUserData } = require("../Profile/GetUserData");

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
      const userData = await GetUserData({ user: lastMessage.author });
      return {
        id: lastMessageKey,
        ...lastMessage,
        authorData: userData.userData,
      };
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
