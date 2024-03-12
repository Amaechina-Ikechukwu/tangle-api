const { GetUserArrays, GetOtherUsersArrays } = require("./GetArrays");

function percentageMatch(array1, array2) {
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

  const matches = [];
  otherUsersArray.forEach((user) => {
    const matchPercentage = percentageMatch(currentUserArray, user.interest);
    matches.push({ userId: user.userId, matchPercentage: matchPercentage });
  });

  return matches.sort((x, y) => y.matchPercentage - x.matchPercentage);
};
module.exports = { CreateMatches };
