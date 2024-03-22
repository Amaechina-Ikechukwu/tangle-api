const { getDatabase, ServerValue } = require("firebase-admin/database");
const StorySeenCount = async ({ currentUser, storyid }) => {
  try {
    const storyRef = getDatabase().ref(`stories/actions/seen/${storyid}`);

    return new Promise((resolve, reject) => {
      storyRef.once(
        "value",
        (snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.numChildren());
          } else {
            resolve(0);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  } catch (error) {
    throw new Error(error);
  }
};
const IsItCurrentUsersStory = async ({ currentUser, storyid }) => {
  try {
    const storyRef = getDatabase().ref(`stories/posts/${storyid}`);

    return new Promise((resolve, reject) => {
      storyRef.once(
        "value",
        (snapshot) => {
          if (snapshot.exists()) {
            const result = snapshot.val().author === currentUser;
            resolve(result);
          } else {
            resolve(null);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  } catch (error) {
    throw new Error(error);
  }
};
const GetSeenKey = async ({ currentUser, storyid }) => {
  try {
    const likeRef = getDatabase().ref(`stories/actions/seen/${storyid}`);

    const snapshot = await likeRef
      .orderByChild("seenBy")
      .equalTo(currentUser)
      .once("value");
    if (snapshot.exists()) {
      for (const key in snapshot.val()) {
        if (snapshot.val()[key].seenBy == currentUser) {
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
const HasUserSeenStory = async ({ currentUser, storyid }) => {
  try {
    const likeRef = getDatabase().ref(`stories/actions/seen/${storyid}`);
    const snapshot = await likeRef
      .orderByChild("seenBy")
      .equalTo(currentUser)
      .once("value");
    if (snapshot.exists()) {
      for (const key in snapshot.val()) {
        if (snapshot.val()[key].seenBy == currentUser) {
          return snapshot.val()[key].seen;
        }
      }
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const SeeStory = async ({ currentUser, location, storyid }) => {
  try {
    const isUserStory = await IsItCurrentUsersStory({ currentUser, storyid });
    if (!isUserStory) {
      const hasUserLikedPost = await HasUserSeenStory({ currentUser, storyid });
      if (hasUserLikedPost == null) {
        const postRef = getDatabase()
          .ref(`stories/actions/seen/${storyid}`)
          .push();
        await postRef.set({
          seenBy: currentUser,
          location,
          timestamp: ServerValue.TIMESTAMP,
          seen: true,
        });
        return true;
      } else {
        const key = await GetSeenKey({ currentUser, storyid });
        if (key) {
          const postRef = getDatabase().ref(
            `stories/actions/seen/${storyid}/${key}`
          );
          await postRef.update({
            seenBy: currentUser,
            location,
            timestamp: ServerValue.TIMESTAMP,
            seen: true,
          });
          return true;
        }
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { SeeStory, HasUserSeenStory, GetSeenKey, StorySeenCount };
