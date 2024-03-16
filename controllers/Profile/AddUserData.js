const { getDatabase } = require("firebase-admin/database");
const { InitializeCampGroup } = require("../Actions/InitializeCampGroup");
const AddUserData = async ({
  user,
  username,
  fullName,
  age,
  gender,
  interest,
  bio,
  imageurl,
  email,
}) => {
  await getDatabase()
    .ref(`users/${user}`)
    .update({
      username: username.toLowerCase(),
      fullName,
      age,
      gender,
      interest,
      bio,
      imageurl,
      email,
    })
    .then(async (result) => {
      return "added";
    })
    .catch((error) => {
      throw new Error(error);
    });
};
module.exports = {
  AddUserData,
};
