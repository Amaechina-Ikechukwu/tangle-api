const { getDatabase, ServerValue } = require("firebase-admin/database");
const { GetStorageKeys } = require("./utils/DMKeys");

const GetAuthorFromChat = async ({ userkey, chatid }) => {
  try {
    const ref = getDatabase().ref(`dms/${userkey}/chats/${chatid}`);

    return new Promise((resolve, reject) => {
      ref.once(
        "value",
        (snapshot) => {
          if (snapshot.exists()) {
            const chatData = snapshot.val();
            const author = chatData.author;
            resolve(author);
          } else {
            resolve(null);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const SeenMessage = async ({ user, friend, chatid }) => {
  try {
    const userkey = await GetStorageKeys({
      name: "dms",
      child: "members",
      value: [user, friend],
    });

    const db = getDatabase();
    const author = await GetAuthorFromChat({ userkey, chatid });

    if (author !== user) {
      const chatRef = db.ref(`dms/${userkey}/chats/${chatid}`);
      const chatSnapshot = await chatRef.once("value");

      if (chatSnapshot.exists()) {
        // Update existing document
        await chatRef.update({
          read: true,
          seenAt: ServerValue.TIMESTAMP,
          seenBy: user,
        });
        return "updated";
      } else {
        // Document does not exist
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  SeenMessage,
};
