const { getDatabase } = require("firebase-admin/database");
const { GetGroupInfo } = require("../Groups/GetGroupInfo");
const { GetUserData } = require("../Profile/GetUserData");
const { GetLastMessage } = require("./GetLastMessage");
const { GetGroupLastMessage } = require("../Groups/GetGroupLastMessage");

const DMKeys = async ({ name, child, value }) => {
  try {
    const ref = getDatabase().ref("dms");
    const snapshot = await ref.once("value");

    if (!snapshot.exists()) {
      return [];
    }

    const dms = snapshot.val();
    const members = [];

    for (const convoId in dms) {
      const convoRef = ref.child(convoId);
      const convoSnapshot = await convoRef.once("value");
      const convoData = convoSnapshot.val();

      if (convoData.members && convoData.members[value] !== undefined) {
        delete convoData.members[value];
      }

      members.push(...Object.keys(convoData.members || {}));
    }

    return members;
  } catch (error) {
    throw new Error(error);
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
    console.log({ grouplastmessage });
    const userDataPromises = userkey.map(async (key) => {
      const lastMessage = await GetLastMessage({ user: user, friend: key });
      const userData = await GetUserData({ user: key });
      return { lastMessage, userData };
    });

    const userDataWithLastMessages = await Promise.all(userDataPromises);

    const dmObjects = userDataWithLastMessages.map(
      ({ lastMessage, userData }) => ({
        type: "dm",
        lastMessage,
        ...userData,
      })
    );
    const groupObject = groupData
      ? [{ type: "group", ...groupData, lastMessage: grouplastmessage }]
      : [];

    const resultArray = [...dmObjects, ...groupObject];

    return resultArray;
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = { ChatList };
