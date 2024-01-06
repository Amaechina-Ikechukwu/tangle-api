const admin = require("firebase-admin");
const { getDatabase } = require("firebase-admin/database");

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
              if (childValue.groupinfo.address == value) {
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

module.exports = {
  GetStorageKeys,
};
