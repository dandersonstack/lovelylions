
class GameRoom {
  constructor(id){
    this.players = [];
    this.roomId = id;
    this.image = {};
  }

  addPlayer(playerId, bodyPart) {
    this.players.push({
      playerId: playerId,
      bodyPart: bodyPart
    });
  }

  removePlayer(playerId) {
    var index = this.players.findIndex(player => player.playerId === playerId);
    if (index >= 0) {
      this.players.splice(index, 1);
    }
  }

  playersInRoom() {
    return this.players.length;
  }

  isFull() {
    return this.players.length === 3;
  }

  bodyPartsAvailable() {
    var bodyParts = ['head', 'torso', 'legs'];
    return bodyParts.filter((part, index) => {
      return this.bodyPartAvailable(part);
    });
  }

  bodyPartAvailable(bodyPart) {
    return this.players.findIndex(player => player.bodyPart === bodyPart) === -1;
  }

  getRoomId(){
    return this.roomId;
  }

  addPartToImage(imagePart){
    var bodyPart = Object.keys(imagePart)[0];
    this.image[bodyPart] = imagePart[bodyPart];
  }

  isImageComplete(){
    return Object.keys(this.image).length === 3;
  }

  deleteImage(){
    this.image = {};
  }

}

module.exports = GameRoom;