const { GetUserData } = require("../Profile/GetUserData");
const { GetUserArrays, GetOtherUsersArrays } = require("./GetArrays");

async function percentageMatch(array1, array2) {
  const totalItems = Math.max(array1.length, array2.length);
  let commonItems = 0;

  for (const item of array1) {
    if (array2.includes(item)) {
      commonItems++;
    }
  }

  const matchPercentage = Math.round((commonItems / totalItems) * 100);
  return matchPercentage;
}

const CreateMatches = async ({ currentUser }) => {
  const currentUserArray = await GetUserArrays({ currentUser });
  const otherUsersArray = await GetOtherUsersArrays({});

  // Filter out the current user from other users array
  const filteredOtherUsersArray = otherUsersArray.filter(
    (user) => user.userId !== currentUser
  );

  const matches = await Promise.all(
    filteredOtherUsersArray.map(async (user) => {
      if (user.interest) {
        const matchPercentage = await percentageMatch(
          currentUserArray,
          user.interest
        );

        const { userData } = await GetUserData({ user: user.userId });
        return {
          userId: user.userId,
          matchPercentage: matchPercentage,
          ...userData,
          commonInterests: currentUserArray.filter((interest) =>
            user.interest.includes(interest)
          ),
        };
      }
    })
  );

  // Sort matches by matchPercentage in descending order
  matches.sort((x, y) => y.matchPercentage - x.matchPercentage);

  return matches;
};

module.exports = { CreateMatches };
