const admin = require("firebase-admin");

// Initialize Firebase Admin with appropriate credentials and configurations
// Make sure to initialize Firebase Admin before using any Firebase services
// admin.initializeApp({...});

async function checkIfUIDExists(uid) {
  const auth = admin.auth();

  try {
    await auth.getUser(uid);
    return true; // Return true or any relevant data indicating existence
  } catch (error) {
    return false;
  }
}

module.exports = checkIfUIDExists;
