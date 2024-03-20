const { getDatabase } = require("firebase-admin/database");
const { DMKeys } = require("../../Chats/ChatList");
const { GetUserData } = require("../../Profile/GetUserData");
const { HasUserLikedPost } = require("../../Posts/Reaction");

const CurrentUsersPost = async ({ currentUser }) => {
  try {
    const postRef = getDatabase().ref("posts");
    const snapshot = await postRef
      .orderByChild("author")
      .equalTo(currentUser)
      .once("value");

    const posts = [];

    if (snapshot.exists()) {
      for (const key in snapshot.val()) {
        const { userData } = await GetUserData({
          user: snapshot.val()[key].author,
        });
        const liked = await HasUserLikedPost({
          currentUser: snapshot.val()[key].author,
          postid: key,
        });
        posts.push({
          userData,
          ...snapshot.val()[key],
          postid: key,
          type: "You",
          liked,
        });
      }
      return posts;
    } else {
      return []; // Return an empty array if no posts are found
    }
  } catch (error) {
    throw new Error(error.message); // Throw a new Error object with the error message
  }
};

const PostOfPeopleChattedWith = async ({ currentUser }) => {
  try {
    const chattedWithArray = await DMKeys({
      name: "dms",
      value: currentUser,
      child: "chats",
    });
    const posts = [];

    // Use map to create an array of promises
    const promises = chattedWithArray.map(async (key) => {
      const postRef = getDatabase().ref("posts");
      const snapshot = await postRef
        .orderByChild("author")
        .equalTo(key)
        .once("value");

      // Use Promise.all to wait for all promises to resolve
      for (const key in snapshot.val()) {
        const { userData } = await GetUserData({
          user: snapshot.val()[key].author,
        });
        const liked = await HasUserLikedPost({
          currentUser: snapshot.val()[key].author,
          postid: key,
        });
        posts.push({
          userData,
          ...snapshot.val()[key],
          type: "From your chats",
          postid: key,
          liked,
        });
      }
    });

    await Promise.all(promises);

    return posts;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { PostOfPeopleChattedWith, CurrentUsersPost };
