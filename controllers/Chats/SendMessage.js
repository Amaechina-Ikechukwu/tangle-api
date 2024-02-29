const { getDatabase, ServerValue } = require("firebase-admin/database");
const { v4: uuidv4 } = require("uuid");
const { GetStorageKeys } = require("./utils/DMKeys");
const { InitializeDM } = require("./InitializeDM");

const SendDM = async ({ user, friend, message, refid }) => {
  try {
    const userkey = await GetStorageKeys({
      name: "dms",
      child: "members",
      value: [user, friend],
    });

    const db = getDatabase();

    if (userkey) {
      const newChatRef = db.ref(`dms/${userkey}/chats`).push();

      await Promise.all([
        newChatRef.set({
          message: message,
          sent: ServerValue.TIMESTAMP,
          seenAt: 0,
          author: user,
          seenBy: false,
          ref: refid,
        }),
      ]);

      return "added";
    } else {
      await InitializeDM({ user, friend });
      await SendDM({ user, friend, message, refid });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  SendDM,
};
