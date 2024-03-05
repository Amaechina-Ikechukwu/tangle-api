const { getDatabase } = require("firebase-admin/database");
const { GroupKeys } = require("../Chats/ChatList");
const { GetUserData } = require("../Profile/GetUserData");

const GetMembersProfileList = async ({ userid }) => {
  let users = {};
  try {
    const groupkey = await GroupKeys({
      name: "groups",
      value: userid,
      child: "members",
    });
    const db = getDatabase();

    const membersRef = db.ref(`groups/${groupkey}/members`);

    const snapshot = await membersRef.once("value");
    users[groupkey] = {};
    if (snapshot.exists()) {
      for (const value in snapshot.val()) {
        const result = await GetUserData({ user: value });

        users[groupkey][result.userKey] = result.userData;
      }

      return users;
    } else {
      return null; // No messages found between the users
    }
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = { GetMembersProfileList };
