const { getDatabase } = require("firebase-admin/database");
const { DMKeys } = require("../../Chats/ChatList");
const { GetUserData } = require("../../Profile/GetUserData");
const { HasUserSeenStory } = require("../../Stories/StoriesReactions");
function isMoreThan24HoursAgo({ timestamp }) {
  // Get the current time
  var currentTime = Date.now();

  // Calculate the time difference
  var timeDifference = currentTime - timestamp;

  // Check if the time difference is more than 24 hours (24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
  return timeDifference > 24 * 60 * 60 * 1000;
}
const CurrentUsersStory = async ({ currentUser }) => {
  try {
    const postRef = getDatabase().ref("stories/posts");
    const snapshot = await postRef
      .orderByChild("author")
      .equalTo(currentUser)
      .once("value");

    const stories = [];

    if (snapshot.exists()) {
      for (const key in snapshot.val()) {
        if (!isMoreThan24HoursAgo(snapshot.val()[key].timestamp)) {
          const { userData } = await GetUserData({
            user: snapshot.val()[key].author,
          });
          const seen = await HasUserSeenStory({
            currentUser: snapshot.val()[key].author,
            storyid: key,
          });
          stories.push({
            userData,
            ...snapshot.val()[key],
            storyid: key,
            seen,
          });
        }
      }
      return stories;
    } else {
      return []; // Return an empty array if no posts are found
    }
  } catch (error) {
    throw new Error(error.message); // Throw a new Error object with the error message
  }
};

const StoriesOfPeopleChattedWith = async ({ currentUser }) => {
  try {
    const chattedWithArray = await DMKeys({
      name: "dms",
      value: currentUser,
      child: "chats",
    });
    const stories = [];

    // Use map to create an array of promises
    const promises = chattedWithArray.map(async (key) => {
      const postRef = getDatabase().ref("stories/posts");
      const snapshot = await postRef
        .orderByChild("author")
        .equalTo(key)
        .once("value");

      // Use Promise.all to wait for all promises to resolve
      for (const key in snapshot.val()) {
        if (!isMoreThan24HoursAgo(snapshot.val()[key].timestamp)) {
          const { userData } = await GetUserData({
            user: snapshot.val()[key].author,
          });
          const seen = await HasUserSeenStory({
            currentUser: snapshot.val()[key].author,
            storyid: key,
          });
          stories.push({
            userData,
            ...snapshot.val()[key],
            seen,
          });
        }
      }
    });

    await Promise.all(promises);

    return stories;
  } catch (error) {
    throw new Error(error.message);
  }
};

const GetStoryLists = async ({ currentUser }) => {
  try {
    const chattedWithArray = await DMKeys({
      name: "dms",
      value: currentUser,
      child: "chats",
    });
    chattedWithArray.push(currentUser);
    const stories = [];

    // Use map to create an array of promises
    const promises = chattedWithArray.map(async (key) => {
      const postRef = getDatabase().ref("stories/posts");
      const snapshot = await postRef
        .orderByChild("author")
        .equalTo(key)
        .once("value");

      // Use Promise.all to wait for all promises to resolve
      for (const key in snapshot.val()) {
        if (!isMoreThan24HoursAgo(snapshot.val()[key].timestamp)) {
          const { userData } = await GetUserData({
            user: snapshot.val()[key].author,
          });
          const seen = await HasUserSeenStory({
            currentUser: snapshot.val()[key].author,
            storyid: key,
          });
          stories.push({
            ...userData,
            seen,
            author: snapshot.val()[key].author,
          });
        }
      }
    });

    await Promise.all(promises);

    // Remove duplicate authors
    const uniqueStories = [];
    const authorsSet = new Set();
    for (const story of stories) {
      if (!authorsSet.has(story.author)) {
        uniqueStories.push(story);
        authorsSet.add(story.author);
      }
    }

    // Sort the unique stories by timestamp
    const sortedPosts = uniqueStories.sort((a, b) => b.timestamp - a.timestamp);

    // Sort by 'seen' flag and prioritize unseen stories by the current user
    sortedPosts.sort((a, b) => {
      // Prioritize unseen stories authored by the current user
      if (a.seen !== b.seen) {
        return a.seen ? 1 : -1; // Unseen posts first
      }
      // If both seen or both unseen, prioritize the current user's stories
      if (a.author === currentUser && !a.seen) return -1;
      if (b.author === currentUser && !b.seen) return 1;
      // Preserve the original order for other cases
      return 0;
    });

    return sortedPosts;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  StoriesOfPeopleChattedWith,
  CurrentUsersStory,
  GetStoryLists,
};
