const { getDatabase } = require("firebase-admin/database");
const { v4: uuidv4 } = require("uuid");
const GetStorageKeys = async ({ name, child, value }) => {
  try {
    const ref = getDatabase().ref(name);

    return new Promise((resolve, reject) => {
      ref.orderByChild(child).once(
        "value",
        (snapshot) => {
          if (snapshot.exists()) {
            let foundKey = null; // Initialize foundKey outside forEach
            snapshot.forEach((childSnapshot) => {
              const childValue = childSnapshot.val();
              if (
                childValue.members.hasOwnProperty(value[0]) &&
                childValue.members.hasOwnProperty(value[1])
              ) {
                foundKey = childSnapshot.key; // Update foundKey if match found
              }
            });
            resolve(foundKey); // Resolve with foundKey (could be null if no match)
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
const InitializeDM = async ({ user, matchid }) => {
  try {
    const userkey = await GetStorageKeys({
      name: "dms",
      child: "members",
      value: [user, matchid],
    });

    const db = getDatabase();
    const ref = db.ref("dms").push();

    if (!userkey) {
      const membersRef = db.ref(`dms/${ref.key}/members`);

      await Promise.all([membersRef.set({ [user]: user, [matchid]: matchid })]);
      const key = await GetStorageKeys({
        name: "dms",
        child: "members",
        value: [user, matchid],
      });

      return key;
    } else {
      return userkey;
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  InitializeDM,
};
