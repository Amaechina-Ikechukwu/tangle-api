const express = require("express");
const admin = require("firebase-admin");
const { fetchAndListMajors } = require("./controllers/camps/ListOfCamps.js");
const serviceAccount = require("./x.json");
const { profilerouter } = require("./routes/profileroutes.js");
const { chatsRouter } = require("./routes/chats.js");
const { groupsrouter } = require("./routes/groupsrouter.js");
const port = process.env.PORT || 3006;
const app = express();
app.use(express.json());
require("dotenv").config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://corpers-hang-default-rtdb.firebaseio.com/",
});

app.get("/camp", async (req, res, next) => {
  try {
    const result = await fetchAndListMajors();
    res.status(200).json({ result });
  } catch (error) {
    console.error(error);
    next(error); // Pass error to the error handling middleware
  }
});

app.use("/profile", profilerouter);
app.use("/chats", chatsRouter);
app.use("/groups", groupsrouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "An error occurred" });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
