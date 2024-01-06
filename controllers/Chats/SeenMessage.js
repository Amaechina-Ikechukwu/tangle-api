const { getDatabase, ServerValue } = require("firebase-admin/database");
const { v4: uuidv4 } = require("uuid");
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

            const author = chatData.author; // Retrieve the 'author' field
            resolve(author); // Resolve with the author value
          } else {
            resolve(null); // Resolve with null if no data exists at that path
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

const SeenMessage = async ({ user, friend, chatid }) => {
  try {
    const userkey = await GetStorageKeys({
      name: "dms",
      child: "members",
      value: user,
    });
    const friendkey = await GetStorageKeys({
      name: "dms",
      child: "members",
      value: friend,
    });
    const db = getDatabase();
    const author = await GetAuthorFromChat({ userkey, chatid });

    if (userkey === friendkey) {
      const chatRef = db.ref(`dms/${userkey}/chats/${chatid}`);
      if (author !== user) {
        await Promise.all([
          chatRef.update({
            read: true,
            seenAt: ServerValue.TIMESTAMP,
            seenBy: user,
          }),
        ]);
        return "added";
      }
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  SeenMessage,
};
