const { getDatabase, ServerValue } = require("firebase-admin/database");

const CreateStory = async ({ caption, currentUser, location, imageurl }) => {
  try {
    const postRef = getDatabase().ref("stories/posts").push();

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
module.exports = { CreateStory };
