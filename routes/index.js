import express from "express";
const router = express.Router();

import myDB from "../db/myRedisDB.js";

router.get("/", async (req, res) => {
  const myTweetsFromDB = await myDB.getTweets();
  res.render("index", { tweets: myTweetsFromDB });
});

router.post("/tweets/create", async (req, res) => {
  try {
    const tweet = req.body;

    console.log("got tweet", tweet);
    await myDB.createTweet(tweet.user, tweet.text);
    res.redirect("/");
  } catch (e) {
    res.status(200).send("Error creating tweet" + e);
  }
});

router.post("/tweet/:tweetId/delete", async (req, res) => {
  const tweetId = req.params.tweetId;
  try {
    await myDB.deleteTweet(tweetId);
    res.redirect("/");
  } catch (e) {
    res.status(200).send("Error deleting tweet" + e);
  }
});

export default router;
