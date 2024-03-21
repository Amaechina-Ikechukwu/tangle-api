const express = require("express");
const { checkTokenMiddleware } = require("../utils/tokenmiddleware");
const {
  checkParametersMiddleware,
} = require("../utils/checkParametersMiddleware");

const { CreateStory } = require("../controllers/Stories/CreateAStory");
const {
  SeeStory,
  StorySeenCount,
} = require("../controllers/Stories/StoriesReactions");
const { GetStories } = require("../controllers/Stories/GetStories");
const {
  GetStoryLists,
} = require("../controllers/Actions/Posts/StoriesActions");

const storiesrouter = express.Router();

storiesrouter.post(
  "/createstory",
  checkTokenMiddleware,
  checkParametersMiddleware(["caption", "imageurl"]),
  async (req, res, next) => {
    try {
      const { caption, imageurl, location } = req.body;
      const result = await CreateStory({
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
storiesrouter.post(
  "/seestory",
  checkTokenMiddleware,
  checkParametersMiddleware(["storyid"]),
  async (req, res, next) => {
    try {
      const { storyid, location } = req.body;
      const result = await SeeStory({
        currentUser: req.uid,
        storyid,
        location,
      });
      res.status(200).json(result); // Sending a success response
    } catch (error) {
      next(error); // Passing the error to the error handling middleware
    }
  }
);

storiesrouter.get(
  "/getstories",
  checkTokenMiddleware,
  async (req, res, next) => {
    try {
      const result = await GetStories({
        currentUser: req.uid,
      });
      res.status(200).json(result); // Sending a success response
    } catch (error) {
      next(error); // Passing the error to the error handling middleware
    }
  }
);
storiesrouter.get(
  "/getstorylists",
  checkTokenMiddleware,
  async (req, res, next) => {
    try {
      const result = await GetStoryLists({ currentUser: req.uid });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);
storiesrouter.get(
  "/getstoryseens",
  checkTokenMiddleware,
  async (req, res, next) => {
    try {
      const { storyid } = req.query;
      const result = await StorySeenCount({ currentUser: req.uid, storyid });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

storiesrouter.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes
  res.status(500).json({ error: "Something went wrong" });
});

module.exports = { storiesrouter };
