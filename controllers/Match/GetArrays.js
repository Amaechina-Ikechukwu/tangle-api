const admin = require("firebase-admin/database");

const GetUserArrays = async ({ currentUser }) => {
  try {
    const userinfo = await admin
      .getDatabase()
      .ref(`users/${currentUser}`)
      .once("value");

    return userinfo.val().interest;
  } catch (error) {
    throw Error(error);
  }
};
const GetOtherUsersArrays = async ({}) => {
  try {
    const usersSnapshot = await admin.getDatabase().ref("users").once("value");
    const usersData = usersSnapshot.val();
    const usersInterest = Object.keys(usersData).map((userId) => {
      return { interest: usersData[userId].interest, userId: userId };
    });
    return usersInterest;
  } catch (error) {
    console.log({ error });
    throw Error(error);
  }
};
module.exports = { GetOtherUsersArrays, GetUserArrays };
