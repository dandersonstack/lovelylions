var GameRoom = require('../models/GameRooms.js');

var gameRoom0 = new GameRoom(0);
var gameRooms = [gameRoom0];
// for (var i = 0; i < 10; i++) {
//   gameRooms.push(new GameRoom(i));
// }

class GameRoomSocket {

  constructor(io, numberOfRooms) {
    this.io = io;
    this.createRooms(numberOfRooms);
  }

  createRooms(numberOfRooms) {
    this.gameRooms = [];
    for (var i = 0; i < numberOfRooms; i++) {
      this.gameRooms.push(new GameRoom(i));
    }
  }

  getAvailableRooms() {
    return this.gameRooms.filter((gameRoom, index) => {
      return !gameRoom.isFull();
    });
  }

  getFirstAvailableRoom() {
    return this.getAvailableRooms()[0];
  }

  playGame(socket) {
    socket.on('play game', (msg) => {
      var gameRoom = this.getFirstAvailableRoom();
      if (!gameRoom) {
        socket.emit('play game', false);
      } else {
        socket.emit('play game', true, gameRoom.bodyPartsAvailable(), gameRoom.getRoomId());
      }
    });
  }

  joinGame(socket) {
    socket.on('join game', (bodyPartChosen, roomId) => {
      var gameRoom = this.gameRooms[roomId];
      if (gameRoom.bodyPartAvailable(bodyPartChosen)) {
        socket.join(`gameRoom${roomId}`);
        gameRoom.addPlayer(socket.id, bodyPartChosen);
        socket.emit('join game', true, bodyPartChosen, 3 - gameRoom.playersInRoom());
        this.playerJoined(socket, gameRoom, roomId);
      } else {
        socket.emit('join game', false);
      }
    });
  }

  leaveGame(socket) {
    socket.on('leave game', (roomId) => {
      var gameRoom = this.gameRooms[roomId];
      gameRoom.removePlayer(socket.id);
      this.io.to(`gameRoom${roomId}`).emit('player joined', 3 - gameRoom.playersInRoom());
    });
  }

  disconnect(socket) {
    socket.on('disconnecting', () => {
      Object.keys(socket.rooms).forEach((room, index) => {
        if (index > 0) {
          var roomIndex = /\d+/.exec(room);
          var gameRoom = this.gameRooms[parseInt(roomIndex[0])];
          gameRoom.removePlayer(socket.id);
          console.log('game left: ', roomIndex);
          this.io.to(`gameRoom${roomIndex}`).emit('player joined', 3 - gameRoom.playersInRoom());
        }
      });
    });
  }

  playerJoined(socket, gameRoom, roomId) {
    if (gameRoom.playersInRoom() < 3) {
      this.io.to(`gameRoom${roomId}`).emit('player joined', 3 - gameRoom.playersInRoom());
    } else {
      this.io.to(`gameRoom${roomId}`).emit('starting game', 50);
    }
  }

  gameEnd(socket) {
    socket.on('game end', (userImage) => {
      var gameRoom = this.getSocketGameRoom(socket);
      gameRoom.addPartToImage(userImage);
      if (gameRoom.isImageComplete()) {
        var roomName = this.getSocketGameRoomName(socket);
        this.io.to(roomName).emit('image complete', gameRoom.image);
        gameRoom.deleteImage();
      }
    });
  }

  getSocketGameRoomName(socket) {
    return Object.keys(socket.rooms)[1];
  }

  getSocketGameRoomId(socket) {
    return parseInt(/\d+/.exec(this.getSocketGameRoomName(socket)));
  }

  getSocketGameRoom(socket) {
    return this.gameRooms[this.getSocketGameRoomId(socket)];
  }

};

module.exports.init = (io) => {
  const gameRoomSocket = new GameRoomSocket(io, 10);

  io.on('connection', (socket) => {
  console.log(socket.id, ' user connected!');

  // play game 
  gameRoomSocket.playGame(socket);

  // join game room lobby
  gameRoomSocket.joinGame(socket);

  // leave game room
  gameRoomSocket.leaveGame(socket);
  gameRoomSocket.disconnect(socket);

  // end game
  gameRoomSocket.gameEnd(socket);

});
}


