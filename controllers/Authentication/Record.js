const { auth } = require("firebase-admin");
const { getDatabase } = require("firebase-admin/database");

const GetUID = async ({ useremail }) => {
  return new Promise((resolve, reject) => {
    auth()
      .getUserByEmail(useremail)
      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        const result = userRecord.toJSON().uid;
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
const Record = async ({ salt, user }) => {
  return new Promise(async (resolve, reject) => {
    await getDatabase()
      .ref(`authentication/${user}`)
      .set({
        salt,
      })
      .then(async (result) => {
        resolve("added");
      })
      .catch((error) => {
        reject(error);
      });
  });
};
module.exports = { Record, GetUID };
