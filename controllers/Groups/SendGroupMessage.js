const { getDatabase, ServerValue } = require("firebase-admin/database");

const SendGroupMessage = async ({ user, groupid, message }) => {
  try {
    const db = getDatabase();

    const newChatRef = db.ref(`groups/${groupid}/chats`).push();

    await Promise.all([
      newChatRef.set({
        message: message,
        sent: ServerValue.TIMESTAMP,
        read: false,
        seenAt: null,
        author: user,
        seenBy: null,
      }),
    ]);

    return "added";
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  SendGroupMessage,
};
