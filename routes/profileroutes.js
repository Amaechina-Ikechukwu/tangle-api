const express = require("express");
const { checkTokenMiddleware } = require("../utils/tokenmiddleware");
const {
  checkParametersMiddleware,
} = require("../utils/checkParametersMiddleware");
const { AddUserData } = require("../controllers/Profile/AddUserData");
const { InitializeDM } = require("../controllers/Chats/InitializeDM");
const { checkUserData } = require("../controllers/Profile/isProfileComplete");
const { GetUserData } = require("../controllers/Profile/GetUserData");
const profilerouter = express.Router();

profilerouter.post(
  "/adduser",
  checkTokenMiddleware,
  checkParametersMiddleware(["nickname", "camp"]),
  async (req, res, next) => {
    try {
      const { nickname, camp } = req.body;
      await AddUserData({ user: req.uid, name: nickname, camp });
      res.status(200).json({ result: "User added" });
    } catch (error) {
      throw new Error(error);
    }
  }
);
profilerouter.get("/iscomplete", checkTokenMiddleware, async (req, res) => {
  try {
    const result = await checkUserData({ userId: req.uid });
    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
});
profilerouter.post(
  "/user",
  checkTokenMiddleware,
  checkParametersMiddleware(["user"]),
  async (req, res) => {
    try {
      const { user } = req.body;
      const result = await GetUserData({ user });
      res.status(200).json({ result: result.userData });
    } catch (error) {
      next(error);
    }
  }
);
profilerouter.post(
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
profilerouter.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes
  res.status(500).json({ error: "Something went wrong" });
});
module.exports = { profilerouter };
