const { getDatabase } = require("firebase-admin/database");

const GetGroupUnreadMessageCount = async ({ groupid, userid }) => {
  try {
    const db = getDatabase();
    let number = 0; // Initialize number to count unread messages
    const membersRef = db.ref(`groups/${groupid}/chats`);

    const snapshot = await membersRef.once("value");
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const messages = childSnapshot.val(); // Get the value of the child node
        Object.values(messages).forEach((message) => {
          if (!message.seenBy || !message.seenBy.includes(userid)) {
            number++;
          }
        });
      });
      return number; // Count the number of unread messages
    } else {
      return 0; // No unread messages found between the users
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  GetGroupUnreadMessageCount,
};
