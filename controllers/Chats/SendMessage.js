const { getDatabase, ServerValue } = require("firebase-admin/database");
const { v4: uuidv4 } = require("uuid");
const { GetStorageKeys } = require("./utils/DMKeys");
const { InitializeDM } = require("./InitializeDM");

const SendDM = async ({ user, matchid, message, refid }) => {
  try {
    const userkey = await GetStorageKeys({
      name: "dms",
      child: "members",
      value: [user, matchid],
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
          read: false,
        }),
      ]);

      return "added";
    } else {
      await SendDM({ user, matchid, message, refid });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  SendDM,
};
