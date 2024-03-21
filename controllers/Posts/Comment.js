const { getDatabase, ServerValue } = require("firebase-admin/database");
const { GetUserData } = require("../Profile/GetUserData");

const CommentOnPost = async ({ currentUser, location, postid, comment }) => {
  try {
    const postRef = getDatabase().ref(`comments/${postid}`).push();
    await postRef.set({
      author: currentUser,
      location,
      timestamp: ServerValue.TIMESTAMP,
      comment: comment,
    });
    return "Commented";
  } catch (error) {
    throw new Error(error);
  }
};
const GetComment = async ({ currentUser, location, postid }) => {
  try {
    return new Promise((resolve, reject) => {
      const comments = [];
      const postRef = getDatabase().ref(`comments/${postid}`);

      postRef.once(
        "value",
        async (snapshot) => {
          if (snapshot.exists()) {
            const commentPromises = Object.keys(snapshot.val()).map(
              async (key) => {
                const { userData } = await GetUserData({
                  user: snapshot.val()[key].author,
                });
                comments.push({
                  commentid: key,
                  ...snapshot.val()[key],
                  userData,
                });
              }
            );

            await Promise.all(commentPromises);
            resolve(comments);
          } else {
            resolve([]); // Return empty array if no comments exist
          }
        },
        (error) => {
          throw new Error(error);
        }
      );
    });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { CommentOnPost, GetComment };
