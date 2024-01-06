const { getDatabase } = require("firebase-admin/database");
const { v4: uuidv4 } = require("uuid");
const { GetStorageKeys } = require("../../utils/GetStorageKeys");

const InitializeCampGroup = async ({ user, camp }) => {
  try {
    const key = await GetStorageKeys({
      name: "groups",
      child: "groupinfo",
      value: camp.address,
      valuename: "camp",
    });
    const groupname = camp.address.split(",")[2] + "," + camp.state;
    const db = getDatabase();
    const ref = db.ref("groups").push();
    const groupId = ref.key;

    if (!key) {
      const membersRef = db.ref(`groups/${groupId}/members`);
      const infoRef = db.ref(`groups/${groupId}/groupinfo`);

      await Promise.all([
        membersRef.update({ [user]: user }),
        infoRef.set({ ...camp, groupname }),
      ]);

      return "added";
    } else {
      const existingMembersRef = db.ref(`groups/${key}/members`);

      // Fetch the current members
      const snapshot = await existingMembersRef.once("value");
      const existingMembers = snapshot.val() || {};

      // Add the new user to the existing members
      existingMembers[user] = user;

      // Update the members with the appended user
      await existingMembersRef.update(existingMembers);

      return "added";
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  InitializeCampGroup,
};
