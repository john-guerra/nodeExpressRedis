import { createClient } from "redis";

const getRConnection = async () => {
  const rclient = createClient();
  rclient.on("error", (err) => console.log("Redis Client Error", err));
  await rclient.connect();

  console.log("redis connected");
  return rclient;
};

const getTweet = async (tweetId) => {
  let rclient;
  try {
    rclient = await getRConnection();

    return await rclient.hGetAll(`${tweetId}`);
  } finally {
    rclient.quit();
  }
};

const createTweet = async (user, text) => {
  let rclient;
  try {
    rclient = await getRConnection();

    const nextId = await rclient.incr("tweetCount");

    console.log("creating tweet", nextId, text);
    const key = `tweet:${nextId}`;
    await rclient.hSet(key, {
      user: user,
      text: text,
      id: nextId,
    });

    await rclient.rPush("tweets", key);
  } finally {
    rclient.quit();
  }
};

const getTweets = async () => {
  let rclient;
  try {
    rclient = await getRConnection();

    const tweetIds = await rclient.lRange("tweets", -5, -1);

    console.log("tweets tweetIds", tweetIds);

    const tweets = [];
    for (let tId of tweetIds) {
      const tweet = await getTweet(tId);
      tweets.push(tweet);
    }

    return tweets;
  } finally {
    rclient.quit();
  }
};

const deleteTweet = async (tweetId) => {
  let rclient;
  try {
    rclient = await getRConnection();

    const key = `tweet:${tweetId}`;
    await rclient.lRem("tweets", 0, key);
    await rclient.del(key);
  } finally {
    rclient.quit();
  }
};


export default {
  getRConnection,
  getTweet,
  createTweet,
  getTweets,
  deleteTweet,
};
