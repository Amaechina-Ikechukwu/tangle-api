const { getDatabase, ServerValue } = require("firebase-admin/database");

const GetAuthorFromChat = async ({ groupid, chatid }) => {
  try {
    const ref = getDatabase().ref(`groups/${groupid}/chats/${chatid}`);

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

const SeenGroupMessage = async ({ user, groupid, chatid }) => {
  try {
    const db = getDatabase();
    const author = await GetAuthorFromChat({ groupid, chatid });

    const chatSeenRef = db.ref(`groups/${groupid}/chats/${chatid}/seen`);
    const seenMessagesSnapshot = await chatSeenRef.once("value");

    // Check if the message hasn't been seen by the user yet
    const messageSeenByUser =
      seenMessagesSnapshot.exists() &&
      Object.values(seenMessagesSnapshot.val() || {}).some(
        (seenMessage) => seenMessage.seenBy === user
      );

    if (author !== user && !messageSeenByUser) {
      await chatSeenRef.push().set({
        read: true,
        seenAt: ServerValue.TIMESTAMP,
        seenBy: user,
      });
      return "added";
    } else {
      return "already_seen";
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  SeenGroupMessage,
};
