const { getDatabase } = require("firebase-admin/database");
const { InitializeCampGroup } = require("../Actions/InitializeCampGroup");
const AddUserData = async ({ user, name, camp }) => {
  await getDatabase()
    .ref(`users/${user}`)
    .set({
      nickname: name,
      camp: { ...camp },
    })
    .then(async (result) => {
      return "added";
    })
    .catch((error) => {
      throw new Error(error);
    });
  await InitializeCampGroup({ user, camp });
};
module.exports = {
  AddUserData,
};
