const { getDatabase, ServerValue } = require("firebase-admin/database");

const CreatePost = async ({ caption, currentUser, location, imageurl }) => {
  try {
    const postRef = getDatabase().ref("posts").push();

    await Promise.all([
      postRef.set({
        caption,
        author: currentUser,
        location,
        imageurl,
        timestamp: ServerValue.TIMESTAMP,
      }),
    ]);
    return "Posted";
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = { CreatePost };
