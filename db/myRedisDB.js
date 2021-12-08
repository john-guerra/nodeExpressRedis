const { createClient } = require("redis");

async function getRConnection() {
  let rclient = createClient();
  rclient.on("error", (err) => console.log("Redis Client Error", err));
  await rclient.connect();

  console.log("redis connected");
  return rclient;
}

async function getTweet(tweetId) {
  let rclient;
  try {
    rclient = await getRConnection();

    return await rclient.hGetAll(`${tweetId}`);
  } finally {
    rclient.quit();
  }
}
async function createTweet(user , text) {
  let rclient;
  try {
    rclient = await getRConnection();

    const nextId = await rclient.incr("tweetCount");

    console.log("creating tweet", nextId, text);
    const key = `tweet:${nextId}`;
    await rclient.hSet(key, {
      user: user,
      text: text,
      id: nextId
    });

    await rclient.rPush("tweets", key);
  } finally {
    rclient.quit();
  }
}

async function getTweets() {
  let rclient;
  try {
    rclient = await getRConnection();

    const tweetIds = await rclient.lRange("tweets", -5, -1);

    console.log("tweets tweetIds", tweetIds);

    const tweets =[];
    for (let tId of tweetIds) {
      const tweet = await getTweet(tId);
      tweets.push(tweet);
    }

    return tweets;
  } finally {
    rclient.quit();
  }
}

async function deleteTweet(tweetId) {
  let rclient;
  try {
    rclient = await getRConnection();

    const key = `tweet:${tweetId}`;
    await rclient.lRem("tweets", 0, key);
    await rclient.del(key);
  } finally {
    rclient.quit();
  }
}

module.exports.getTweet = getTweet;
module.exports.createTweet = createTweet;
module.exports.getTweets = getTweets;
module.exports.deleteTweet = deleteTweet;
