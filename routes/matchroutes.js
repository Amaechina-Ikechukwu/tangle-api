const express = require("express");
const { checkTokenMiddleware } = require("../utils/tokenmiddleware");
const {
  checkParametersMiddleware,
} = require("../utils/checkParametersMiddleware");

const {
  GetOtherUsersArrays,
  GetUserArrays,
} = require("../controllers/Match/GetArrays");
const { CreateMatches } = require("../controllers/Match/CreateMatches");

const matchrouter = express.Router();

// matchrouter.use((req, res, next) => {
//   const { redirectUri } = req.query;
//   if (redirectUri) {
//     req.redirectUri = redirectUri;
//   }
//   next();
// });

matchrouter.get("/getmatches", checkTokenMiddleware, async (req, res, next) => {
  try {
    const result = await CreateMatches({ currentUser: req.uid });
    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
});

matchrouter.post(
  "/initialdm",
  checkTokenMiddleware,
  checkParametersMiddleware(["friend"]),
  async (req, res, next) => {
    try {
      const { friend } = req.body;
      await InitializeDM({ user: req.uid, friend: friend });
      res.status(200).json({ result: "User added" });
    } catch (error) {
      throw new Error(error);
    }
  }
);

matchrouter.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes
  res.status(500).json({ error: "Something went wrong" });
});
module.exports = { matchrouter };
