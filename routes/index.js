var express = require("express");
var router = express.Router();

const myDB = require("../db/myRedisDB.js");

router.get("/", async function (req, res) {
  const myTweetsFromDB = await myDB.getTweets();
  res.render("index", { tweets: myTweetsFromDB });
});

router.post("/tweets/create", async function (req, res) {
  try {
    const tweet = req.body;

    console.log("got tweet", tweet);
    await myDB.createTweet(tweet.user, tweet.text);
    res.redirect("/");
  } catch (e) {
    res.status(200).send("Error creating tweet" + e);
  }
});

router.post("/tweet/:tweetId/delete", async function (req, res) {
  const tweetId = req.params.tweetId;
  try {
    await myDB.deleteTweet(tweetId);
    res.redirect("/");
  }catch (e) {
    res.status(200).send("Error creating tweet" + e);
  }

});

module.exports = router;
