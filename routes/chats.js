const express = require("express");
const { checkTokenMiddleware } = require("../utils/tokenmiddleware");
const {
  checkParametersMiddleware,
} = require("../utils/checkParametersMiddleware");
const { InitializeDM } = require("../controllers/Chats/InitializeDM");
const { SendDM } = require("../controllers/Chats/SendMessage");
const { SeenMessage } = require("../controllers/Chats/SeenMessage");
const { ChatList } = require("../controllers/Chats/ChatList");
const {
  GetTotalUnreadMessages,
} = require("../controllers/Chats/utils/TotalUnreadMessages");
const chatsRouter = express.Router();

chatsRouter.post(
  "/initializedm",
  checkTokenMiddleware,
  checkParametersMiddleware(["friend"]),
  async (req, res, next) => {
    try {
      const { friend } = req.body;
      await InitializeDM({ user: req.uid, friend: friend });
      res.status(200).json({ result: "chat Initialized" });
    } catch (error) {
      throw new Error(error);
    }
  }
);
chatsRouter.post(
  "/senddm",
  checkTokenMiddleware,
  checkParametersMiddleware(["friend", "message"]),
  async (req, res, next) => {
    try {
      const { friend, message, refid } = req.body;
      await SendDM({
        user: req.uid,
        friend: friend,
        message: message,
        refid: refid,
      });
      res.status(200).json({ result: "chat sent" });
    } catch (error) {
      throw new Error(error);
    }
  }
);
chatsRouter.post(
  "/seendm",
  checkTokenMiddleware,
  checkParametersMiddleware(["friend", "chatid"]),
  async (req, res, next) => {
    try {
      const { friend, chatid } = req.body;
      await SeenMessage({
        user: req.uid,
        friend: friend,
        chatid: chatid,
      });
      res.status(200).json({ result: true });
    } catch (error) {
      throw new Error(error);
    }
  }
);
chatsRouter.get("/chatlist", checkTokenMiddleware, async (req, res, next) => {
  try {
    const result = await ChatList({ user: req.uid });
    res.status(200).json({ result });
  } catch (error) {
    throw new Error(error);
  }
});
chatsRouter.get(
  "/numofunread",
  checkTokenMiddleware,
  async (req, res, next) => {
    try {
      const result = await GetTotalUnreadMessages({ user: req.uid });
      res.status(200).json({ result });
    } catch (error) {
      throw new Error(error);
    }
  }
);
chatsRouter.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes
  res.status(500).json({ error: "Something went wrong" });
});
module.exports = { chatsRouter };
