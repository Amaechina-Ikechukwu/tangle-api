const { getDatabase, ServerValue } = require("firebase-admin/database");
const GetLikeKey = async ({ currentUser, postid }) => {
  try {
    const likeRef = getDatabase().ref(`likes/${postid}`);

    const snapshot = await likeRef
      .orderByChild("likedBy")
      .equalTo(currentUser)
      .once("value");
    if (snapshot.exists()) {
      for (const key in snapshot.val()) {
        if (snapshot.val()[key].likedBy == currentUser) {
          return key;
        }
      }
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
};
const HasUserLikedPost = async ({ currentUser, postid }) => {
  try {
    const likeRef = getDatabase().ref(`likes/${postid}`);
    const snapshot = await likeRef
      .orderByChild("likedBy")
      .equalTo(currentUser)
      .once("value");
    if (snapshot.exists()) {
      for (const key in snapshot.val()) {
        if (snapshot.val()[key].likedBy == currentUser) {
          return snapshot.val()[key].liked;
        }
      }
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const LikePost = async ({ currentUser, location, postid }) => {
  try {
    const hasUserLikedPost = await HasUserLikedPost({ currentUser, postid });
    if (hasUserLikedPost == null) {
      const postRef = getDatabase().ref(`likes/${postid}`).push();
      await postRef.set({
        likedBy: currentUser,
        location,
        timestamp: ServerValue.TIMESTAMP,
        liked: true,
      });
      return true;
    } else {
      const key = await GetLikeKey({ currentUser, postid });
      if (key) {
        const postRef = getDatabase().ref(`likes/${postid}/${key}`);
        await postRef.update({
          likedBy: currentUser,
          location,
          timestamp: ServerValue.TIMESTAMP,
          liked: true,
        });
        return true;
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};
const UnLikePost = async ({ currentUser, location, postid }) => {
  try {
    const key = await GetLikeKey({ currentUser, postid });
    console.log(key);
    if (key) {
      const postRef = getDatabase().ref(`likes/${postid}/${key}`);
      await Promise.all([
        postRef.update({
          likedBy: currentUser,
          location,

          timestamp: ServerValue.TIMESTAMP,
          liked: false,
        }),
      ]);
      return false;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = { LikePost, HasUserLikedPost, UnLikePost };
