const { GetUserData } = require("../Profile/GetUserData");
const { GetUserArrays, GetOtherUsersArrays } = require("./GetArrays");

async function percentageMatch(array1, array2) {
  const minLength = Math.min(array1.length, array2.length);
  let totalPercentage = 0;

  for (let i = 0; i < minLength; i++) {
    if (array1[i] === array2[i]) {
      totalPercentage += 100;
    }
  }

  const averagePercentage = totalPercentage / minLength || 0; // Prevent division by zero
  return averagePercentage;
}

const CreateMatches = async ({ currentUser }) => {
  const currentUserArray = await GetUserArrays({ currentUser });
  const otherUsersArray = await GetOtherUsersArrays({});

  const matchPromises = otherUsersArray.map(async (user) => {
    const matchPercentage = await percentageMatch(
      currentUserArray,
      user.interest
    );
    const { userData } = await GetUserData({ user: user.userId });
    return {
      userId: user.userId,
      matchPercentage: matchPercentage,
      userData,
    };
  });

  const matches = await Promise.all(matchPromises);
  return matches.sort((x, y) => y.matchPercentage - x.matchPercentage);
};

module.exports = { CreateMatches };
