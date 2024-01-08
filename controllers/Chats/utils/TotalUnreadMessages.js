const { getDatabase } = require("firebase-admin/database");
const { GetUnreadMessageCount } = require("../GetUnreadMessages");
const {
  GetGroupUnreadMessageCount,
} = require("../../Groups/GetGroupUnreadMessages");

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

const GroupKeys = async ({ name, child, value }) => {
  try {
    const ref = getDatabase().ref(name);

    return new Promise((resolve, reject) => {
      ref.orderByChild(child).once(
        "value",
        (snapshot) => {
          if (snapshot.exists()) {
            let foundkey = null; // Initialize foundKey outside forEach
            snapshot.forEach((childSnapshot) => {
              const childValue = childSnapshot.val();
              if (childValue.members[value] == value) {
                foundkey = childSnapshot.key; // Update foundKey if match found
              }
            });
            resolve(foundkey); // Resolve with foundKey (could be null if no match)
          } else {
            resolve(null); // Resolve with null if no data exists
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

const GetTotalUnreadMessages = async ({ user }) => {
  try {
    const userkey = await DMKeys({ name: "dms", value: user, child: "chats" });
    const groupkey = await GroupKeys({
      name: "groups",
      value: user,
      child: "members",
    });

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

    if (groupkey) {
      const groupUnreadCount = await GetGroupUnreadMessageCount({
        groupid: groupkey,
      });
      totalUnreadCount += groupUnreadCount;
    }

    return totalUnreadCount;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { GetTotalUnreadMessages };
