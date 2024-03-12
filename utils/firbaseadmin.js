const admin = require("firebase-admin");
const { getDatabase } = require("firebase-admin/database");
const db = getDatabase();
const auth = admin.auth();
module.exports = { db, auth };
