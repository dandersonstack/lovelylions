const Promise = require('bluebird');
const difference = require('underscore').difference;
const options = {
    promiseLib: Promise
};
const pgp = require('pg-promise')(options);
const cn = {
    host: 'localhost',
    port: 5432,
    database: 'mydb',
    user: 'postgres',
    password: ''
};

if (process.env.DATABASE_URL) {
  console.log('connected to heroku postgres db');
  pgp.pg.defaults.ssl = true;
};
const db = pgp(process.env.DATABASE_URL || cn);

let query = function(queryStr, callback){
  // simple function for querying the db
  db.query(queryStr)

    .then(data => {
        callback(data);
   })
    .catch(error => {
        callback(error);
   });
};

let getImage = (id, part, callback) => {
  //helper function, get image from particular table with specfic id(PRIMARY KEY)
  db.any(`select _path from ${part} where id = ${id}`)
    .then(path => {
      callback(path[0]._path, id);
    })
    .catch(err => {
      console.log(err);
  });
};

let getRandomImage = (part,callback) => {

  db.any(`select id from ${part} order by id desc limit 1`)
    .then(maxId => {
      var id = maxId[0].id;
      return Math.floor(Math.random() * (id)) + 1;
    })
    .then(id => {
      getImage(id, part, callback);
    })
    .catch(error => {
      console.log(error);
  });
};

let getTwoImages = (part, callback) => {
  // provide the part of body and this function will return two random image fragments of the other two parts.
    // e.g. if you give it 'head', it gives you torso image and leg image
  let arr1 = ['head', 'torso', 'legs'];
  let diff = difference(arr1, [part]);
  let partA = diff[0], partB = diff[1];

  var obj = {};
  obj[partA] = {};
  obj[partB] = {};
  getRandomImage(partA, (data, id) => {
    obj[partA]['path'] = data;
    obj[partA]['partId'] = id;
    getRandomImage(partB, (data, id) => {
      obj[partB]['path'] = data;
      obj[partB]['partId'] = id;
      callback(obj)
    });
  });
};

let getUserId = (username, callback) => {
  db.one('SELECT ID from artist where username = $1', [username])
  .then((data) => {
    callback(data.id)
  })
  .catch(error => {
    console.log('getUserId func error: ', error)
  })
}

let savePartImage = (userId, part, path, callback) => {
  db.one(`INSERT INTO ${part} (_path, user_id) values ($1, $2) RETURNING id`, [path, userId])
  .then((data) => {
    callback(data.id);
  })
  .catch(error => {
    console.log('savePartImage func error: ', error);
  })
};

let saveImageToFinalImage = (obj, part, path, callback) => {
  let username = obj[part]['artist'];
  let userId;
  getUserId(username, (data) => {
    userId = data;
    savePartImage(userId, part, path, (data) => {
      obj[part]['partId'] = data;
      let headId = obj['head']['partId'];
      let torsoId = obj['torso']['partId'];
      let legsId = obj['legs']['partId'];
      db.one('INSERT INTO final_image (head_id, torso_id, legs_id, user_id) values ($1, $2, $3, $4) RETURNING id', [headId, torsoId, legsId, userId])
      .then((data) => {
        callback(data);
      })
      .catch(error => {
        console.log('final_image insert func error: ', error);
      })
    });
  });
};

let getStartDate = function(time) {
  var date = formatDate(new Date(Date.parse(new Date())), time);
  return date;
}
function addLeadingZero(n){ return n < 10 ? '0'+n : ''+n }

function formatDate(d, time){
  var year = d.getFullYear();
  var month = addLeadingZero(d.getMonth());
  var day = addLeadingZero(d.getDay());
  var hour = addLeadingZero(d.getHours());
  var minutes = addLeadingZero(d.getMinutes());
  var seconds = addLeadingZero(d.getSeconds());
  if(time === 'total'){
    year = year - 50;
  } else if(time === 'Year'){
    year = year - 1;
  } else if(time === 'Month'){
    month = month - 1;
  } else if(time === 'Day'){
    day = day - 1;
  } else if (time === 'Hour'){
    hour = hour - 1;
  }
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds;
}

let getTopRatedImages = (time, callback) => {
  getStartDate(time);
  var queryStr = `select fi.id, fi.ranking, fi.date_added, h._path head_path, a1.name head_artist, t._path torso_path, a2.name torso_artist, l._path \
    legs_path, a3.name legs_artist from final_image fi left join head h on (h.id = fi.head_id) left join torso t \
    on (t.id = fi.torso_id) left join legs l on (l.id = fi.legs_id) \
    left join artist a1 on (a1.id = h.user_id) \
    left join artist a2 on (a2.id = t.user_id) \
    left join artist a3 on (a3.id = l.user_id) \
    where fi.date_added > timestamp '${getStartDate(time)}' \
    order by fi.ranking desc`;
  query(queryStr, (data) => {
    console.log(data);
    data = data.map(finalImage => {
      return {
        title: finalImage.id,
        head: {
          path: finalImage.head_path,
          artist: finalImage.head_artist
        },
        torso: {
          path: finalImage.torso_path,
          artist: finalImage.torso_artist
        },
        legs: {
          path: finalImage.legs_path,
          artist: finalImage.legs_artist
        },
        ranking: finalImage.ranking,
        timeStamp: finalImage.date_added
      }
    });
    callback(data);
  });
};


let getNewestImages = (callback) => {
  var queryStr = `select fi.id, fi.ranking, fi.date_added, h._path head_path, a1.name head_artist, t._path torso_path, a2.name torso_artist, l._path \
    legs_path, a3.name legs_artist from final_image fi left join head h on (h.id = fi.head_id) left join torso t \
    on (t.id = fi.torso_id) left join legs l on (l.id = fi.legs_id) \
    left join artist a1 on (a1.id = h.user_id) \
    left join artist a2 on (a2.id = t.user_id) \
    left join artist a3 on (a3.id = l.user_id)
    order by fi.date_added desc`;
  query(queryStr, (data) => {
    data = data.map(finalImage => {
      return {
        title: finalImage.id,
        head: {
          path: finalImage.head_path,
          artist: finalImage.head_artist
        },
        torso: {
          path: finalImage.torso_path,
          artist: finalImage.torso_artist
        },
        legs: {
          path: finalImage.legs_path,
          artist: finalImage.legs_artist
        },
        ranking: finalImage.ranking,
        timeStamp: finalImage.date_added
      }
    });
    callback(data);
  });
};



let getAllFinalImagesOfArtist = (id, callback) => {
  var queryStr = `select fi.id , h._path head_path, a1.name head_artist, t._path torso_path, a2.name torso_artist, l._path \
    legs_path, a3.name legs_artist from final_image fi left join head h on (h.id = fi.head_id) left join torso t \
    on (t.id = fi.torso_id) left join legs l on (l.id = fi.legs_id) \
    left join artist a1 on (a1.id = h.user_id) \
    left join artist a2 on (a2.id = t.user_id) \
    left join artist a3 on (a3.id = l.user_id) where fi.user_id = ${id}
    order by fi.id desc`;
  query(queryStr, (data) => {
    data = data.map(finalImage => {
      return {
        title: finalImage.id,
        head: {
          path: finalImage.head_path,
          artist: finalImage.head_artist
        },
        torso: {
          path: finalImage.torso_path,
          artist: finalImage.torso_artist
        },
        legs: {
          path: finalImage.legs_path,
          artist: finalImage.legs_artist
        }
      }
    });
    callback(data);
  });
};

let changeRanking = (image_id, change, callback) => {
  var queryStr = `select ranking from final_image where id=${image_id}`;
  query(queryStr, (data) => {
    var queryStr = `update final_image set ranking = ${data[0]['ranking'] + change} where id=${image_id}`;
    query(queryStr, (data) => {
      callback(data);
    });
  });
};

module.exports = {
  query: query,
  getImage: getImage,
  getRandomImage: getRandomImage,
  getTwoImages: getTwoImages,
  savePartImage: savePartImage,
  getTopRatedImages: getTopRatedImages,
  getAllFinalImagesOfArtist: getAllFinalImagesOfArtist,
  getNewestImages: getNewestImages,
  changeRanking: changeRanking,
  db: db,
  getUserId: getUserId,
  saveImageToFinalImage: saveImageToFinalImage,
};
