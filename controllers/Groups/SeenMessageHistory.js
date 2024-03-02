const { getDatabase, ServerValue } = require("firebase-admin/database");
const { GetUserData } = require("../Profile/GetUserData");

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

const SeenMessageHistory = async ({ user, groupid, chatid }) => {
  try {
    const db = getDatabase();
    const chatSeenRef = db.ref(`groups/${groupid}/chats/${chatid}/seen`);

    return new Promise((resolve, reject) => {
      const dmhistory = [];
      chatSeenRef.once(
        "value",
        (snapshot) => {
          if (snapshot.exists()) {
            snapshot.forEach(async (his) => {
              const seenByUserId = his.val().seenBy;
              const profile = await GetUserData({ user: seenByUserId });
              const value = his.val();
              const data = { ...value, ...profile.userData };
              console.log(data);
              dmhistory.push(data);
              resolve(dmhistory);
            });
          } else {
            reject(null);
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

module.exports = {
  SeenMessageHistory,
};
