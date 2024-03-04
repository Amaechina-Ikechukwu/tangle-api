const { getDatabase } = require("firebase-admin/database");
const { GetGroupInfo } = require("../Groups/GetGroupInfo");
const { GetUserData } = require("../Profile/GetUserData");
const { GetLastMessage } = require("./GetLastMessage");
const { GetGroupLastMessage } = require("../Groups/GetGroupLastMessage");
const { GetUnreadMessageCount } = require("./GetUnreadMessages");
const {
  GetGroupUnreadMessageCount,
} = require("../Groups/GetGroupUnreadMessages");

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
const ChatList = async ({ user }) => {
  try {
    const userkey = await DMKeys({ name: "dms", value: user, child: "chats" });
    const groupkey = await GroupKeys({
      name: "groups",
      value: user,
      child: "members",
    });
    const groupData = await GetGroupInfo({ groupId: groupkey });
    const grouplastmessage = await GetGroupLastMessage({ groupid: groupkey });
    const groupUnreadMessages = await GetGroupUnreadMessageCount({
      groupid: groupkey,
      userid: user,
    });
    const userDataPromises = userkey.map(async (key) => {
      const lastMessage = await GetLastMessage({ user: user, friend: key });
      const unread = await GetUnreadMessageCount({ user: user, friend: key });

      const userData = await GetUserData({ user: key });
      return { lastMessage, userData, unread };
    });

    const userDataWithLastMessages = await Promise.all(userDataPromises);

    const dmObjects = userDataWithLastMessages.map(
      ({ lastMessage, userData, unread }) => ({
        type: "dm",
        lastMessage,
        ...userData,
        unread,
      })
    );
    const groupObject = groupData
      ? [
          {
            type: "group",
            ...groupData,
            lastMessage: grouplastmessage,
            unread: groupUnreadMessages,
          },
        ]
      : [];

    const resultArray = [...dmObjects, ...groupObject];
    resultArray.sort((a, b) => {
      const dateA = new Date(a.lastMessage.sent);
      const dateB = new Date(b.lastMessage.sent);
      return dateB - dateA; // Sort in descending order (latest first)
    });

    return resultArray;
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = { ChatList };
