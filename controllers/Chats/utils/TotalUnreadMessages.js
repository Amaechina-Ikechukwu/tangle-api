const { getDatabase } = require("firebase-admin/database");
const { GetUnreadMessageCount } = require("../GetUnreadMessages");

const DMKeys = async ({ name, child, value }) => {
  try {
    const ref = getDatabase().ref(name);
    const snapshot = await ref.orderByChild(child).once("value");

    if (snapshot.exists()) {
      let foundKey = [];
      snapshot.forEach((childSnapshot) => {
        const childValue = childSnapshot.val();
        if (
          childValue &&
          childValue.members &&
          childValue.members.hasOwnProperty(value)
        ) {
          const members = childValue.members;
          delete members[value];
          const keys = Object.keys(members);
          foundKey.push(keys.length > 0 && keys[0]);
        }
      });
      return foundKey;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const GetTotalUnreadMessages = async ({ user }) => {
  try {
    const userkey = await DMKeys({ name: "dms", value: user, child: "chats" });

    let totalUnreadCount = 0;

    if (userkey) {
      const userUnreadCounts = await Promise.all(
        userkey.map(async (key) => {
          const unreadCount = await GetUnreadMessageCount({
            user,
            friend: key,
          });
          return unreadCount;
        })
      );
      totalUnreadCount += userUnreadCounts.reduce(
        (acc, count) => acc + count,
        0
      );
    }

    return totalUnreadCount;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { GetTotalUnreadMessages };
