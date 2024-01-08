const { getDatabase, ServerValue } = require("firebase-admin/database");
const { v4: uuidv4 } = require("uuid");
const { GetStorageKeys } = require("./utils/DMKeys");

const GetLastMessage = async ({ user, friend }) => {
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
        .orderByChild("sent")
        .limitToLast(1)
        .once("value");
      if (snapshot.exists()) {
        const lastMessageKey = Object.keys(snapshot.val())[0];
        const lastMessage = snapshot.val()[lastMessageKey];
        return { id: lastMessageKey, ...lastMessage, chatid: userkey };
      } else {
        return null; // No messages found between the users
      }
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  GetLastMessage,
};
