module.exports = {
  facebookAuth: {
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: `${process.env.HOST}/auth/facebook/callback`,
  }
};
