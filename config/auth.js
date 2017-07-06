module.exports = {
  facebookAuth: {
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
  }
};
