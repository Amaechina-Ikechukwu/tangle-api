const { getDatabase } = require("firebase-admin/database");

const GetStorageKeys = async ({ name, child, value }) => {
  try {
    const ref = getDatabase().ref(name);

    const snapshot = await ref.orderByChild(child).once("value");

    if (snapshot.exists()) {
      let foundKey = null;
      snapshot.forEach((childSnapshot) => {
        const childValue = childSnapshot.val();
        if (
          childValue &&
          childValue.members &&
          childValue.members.hasOwnProperty(value[0]) &&
          childValue.members.hasOwnProperty(value[1])
        ) {
          foundKey = childSnapshot.key;
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

module.exports = {
  GetStorageKeys,
};
