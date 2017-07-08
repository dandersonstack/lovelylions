require('dotenv').config();
var express = require('express');
var db = require('../database/index.js');
var bodyParser = require('body-parser');

var fs = require('fs');
var crypto = require('crypto');

var session = require('express-session');
var app = express();
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/../client/dist'));
app.use(bodyParser.json({limit: '5mb'}));

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var router = express.Router();
var session = require('express-session');
require('../config/passport.js')(passport);

var http = require('http').Server(app);
var io = require('socket.io')(http);
var GameRoom = require('./models/GameRooms.js');
var gameRoomSocket = require('./middleware/gameRoomSocket.js');

app.use(logger('dev'));
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));


app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/',
}));


app.get('/profile', isLoggedIn, function(req, res) {
  res.redirect('/?username=' + req.user[0]['name']);
});


app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.redirect('/');
}


var generateFilename = (fileData) => {
  var hash = crypto.createHash('sha256');
  hash.update(fileData);
  return hash.digest('hex');
}

app.get('/gallery', (req, res) => {
  var username = req.query.username;
  db.getUserId(username, artistId => {
    db.getAllFinalImagesOfArtist(artistId, galleryImages => {
      res.end(JSON.stringify(galleryImages));
    });
  });
});

app.put('/incrementRanking/:image_id', (req, res) => {
  var image_id = req.params.image_id;
  db.changeRanking(image_id, 1, galleryImages => {
    res.end(JSON.stringify(galleryImages));
  });
});

app.put('/decrementRanking/:image_id', (req, res) => {
  var image_id = req.params.image_id;
  db.changeRanking(image_id, -1, galleryImages => {
    res.end(JSON.stringify(galleryImages));
  });
});


app.get('/leaderboard/topRated/:time', (req, res) => {
  var time = req.params.time;
  db.getTopRatedImages(time, galleryImages => {
    res.end(JSON.stringify(galleryImages));
  });
});

app.get('/leaderboard/newest', (req, res) => {
  var username = req.query.username;
  db.getNewestImages(galleryImages => {
    res.end(JSON.stringify(galleryImages));
  });
});

app.get('/generate', (req, res) => {
  var userPart = req.query.part;
  db.getTwoImages(userPart, (data) => {
    res.send(JSON.stringify(data));
  });
});

app.get('/share', (req, res) => {
  var imgInfo = req.query.pic.split('_');
  var username = imgInfo[0];
  var idx = imgInfo[1];
  db.getUserId(username, artistId => {
    db.getAllFinalImagesOfArtist(artistId, galleryImages => {
      // res.replaceURL('/?pic=' + username + '_' + idx);
      res.end(JSON.stringify(galleryImages[idx]));
    });
  });
});

app.post('/save', (req, res) => {
  var base64Data = req.body[req.query.part].path.split(',')[1];
  var fileName = generateFilename(base64Data);
  var username = req.body.head.artist;
  fs.writeFile(`./server/images/${fileName}.png`, base64Data, 'base64', (err) => {
    if (err) console.log(err);
    req.body[req.query.part].path = `./images/${fileName}.png`;
    let thePath = `images?path=${fileName}.png`;
    db.saveImageToFinalImage(req.body, req.query.part, thePath, (data) => {
      res.end();
    });
  });
});

app.get('/images', (req, res) => {
  var file = req.query.path;
  res.sendFile(`${__dirname}/images/${file}`, () => res.end());
});


//#####################################################################
// Sockets and game rooms

gameRoomSocket.init(io);

http.listen(port, function() {
  console.log(`listening on port ${port}!`);
});