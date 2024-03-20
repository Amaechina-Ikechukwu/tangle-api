const express = require("express");
const { checkTokenMiddleware } = require("../utils/tokenmiddleware");
const {
  checkParametersMiddleware,
} = require("../utils/checkParametersMiddleware");
const { CreatePost } = require("../controllers/Posts/CreatePosts");
const { GetPosts } = require("../controllers/Posts/GetPosts");
const { LikePost, UnLikePost } = require("../controllers/Posts/Reaction");

const postrouter = express.Router();

postrouter.post(
  "/createpost",
  checkTokenMiddleware,
  checkParametersMiddleware(["caption", "imageurl"]),
  async (req, res, next) => {
    try {
      const { caption, imageurl, location } = req.body;
      const result = await CreatePost({
        currentUser: req.uid,
        caption,
        imageurl,
        location,
      });
      res.status(200).json(result); // Sending a success response
    } catch (error) {
      next(error); // Passing the error to the error handling middleware
    }
  }
);
postrouter.post(
  "/likepost",
  checkTokenMiddleware,
  checkParametersMiddleware(["postid"]),
  async (req, res, next) => {
    try {
      const { postid, location } = req.body;
      const result = await LikePost({ currentUser: req.uid, postid, location });
      res.status(200).json(result); // Sending a success response
    } catch (error) {
      next(error); // Passing the error to the error handling middleware
    }
  }
);
postrouter.post(
  "/unlikepost",
  checkTokenMiddleware,
  checkParametersMiddleware(["postid"]),
  async (req, res, next) => {
    try {
      const { postid, location } = req.body;
      const result = await UnLikePost({
        currentUser: req.uid,
        postid,
        location,
      });
      res.status(200).json(result); // Sending a success response
    } catch (error) {
      next(error); // Passing the error to the error handling middleware
    }
  }
);
postrouter.get("/getposts", checkTokenMiddleware, async (req, res, next) => {
  try {
    const result = await GetPosts({ currentUser: req.uid });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

postrouter.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes
  res.status(500).json({ error: "Something went wrong" });
});

module.exports = { postrouter };
