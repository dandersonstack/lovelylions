import React from 'react';
import GameRoomCanvas from './GameRoomCanvas.jsx';
import JoinGameRoom from './JoinGameRoom.jsx';
import io from 'socket.io-client';
import Countdown from 'react-countdown-clock';
import Composite from './composite.jsx';



class GameRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentView:  <JoinGameRoom playGame={this.playGame.bind(this)}/>,
      drawDisabled: true,
      bodyPart: 'head',
      showCanvas: true
    };
    this.socket = io();
  }


  compmonentDidMount() {
    this.setState({
      imageView: <GameRoomCanvas 
          drawDisabled={this.state.drawDisabled}
          bodyPart={this.state.bodyPart}
          generateImage={this.sendImage.bind(this)}
          ref="canvas"/>
        });
  }

  playGame() {
    this.socket.emit('play game', true);
    this.socket.on('play game', (isRoomAvailable, bodyParts, roomId) => {
      console.log('lets play: ', isRoomAvailable, bodyParts);
      if (isRoomAvailable) {
        this.setState({
          currentView: this.chooseBodyParts(bodyParts),
          roomId: roomId
        });
      }
    });
  }

  selectBodyPart(event) {
    this.socket.emit('join game', event.target.value, this.state.roomId);
    this.joinGame();
    this.playerJoined();   
    this.startingGame();
  }

  startingGame(){
    this.socket.on('starting game', (seconds) => {
      this.setState({
        currentView: this.startingGameDisplay()
      });
      this.startGame(seconds);
    });
  }

  joinGame() {
    this.socket.on('join game', (didJoin, bodyPart, playersMissing) => {
      if (didJoin) {
        this.setState({
          bodyPart: bodyPart,
          currentView: (playersMissing !== 0) ? this.waitForPlayers(playersMissing): this.startingGame()
        });
      }
    });
  }

  playerJoined() {
    this.socket.on('player joined', (playersMissing) => {
      this.setState({
        currentView: this.waitForPlayers(playersMissing)
      });
    });
  }

  startGame(seconds) {
    this.setState({
      currentView: <Countdown seconds={seconds}
        color="#846946"
        alpha={0.9}
        size={40} 
        onComplete={this.endGame.bind(this)}/>,
      drawDisabled: false
    });
  }

  endGame() {
    this.setState({
      drawDisabled: true
    });
    this.refs.canvas.submitImage();
  }

  sendImage(userImage) {
    console.log('image sent!');
    this.socket.emit('game end', userImage);
    this.socket.on('image complete', (image) => {
      console.log(image);
      this.imageComplete(image);
    });
  }

  imageComplete(image) {
    this.setState({
      // currentView: '',
      showCanvas: false,
      currentView: <Composite pic={image} 
          userPart={this.state.bodyPart} 
          login={this.props.login}
          dontShowRegenerate={true}/>
    });
  }

  componentWillUnmount() {
    this.socket.emit('leave game', this.state.roomId);
  }

  waitForPlayers(players) {
    var playerString = (players === 1 ? 'player' : 'players');
    return (
      <div className="overlay join-room">
        <b className="draw-off">Waiting for {players} {playerString} to join game...</b>
      </div>
    )
  }

  startingGameDisplay() {
    return (
      <div className="overlay join-room">
        <b className="draw-off">Game about to start...</b>
      </div>
    )
  }

  chooseBodyParts(bodyParts) {
    return (
      <div className="overlay join-room">
          <b className="draw-off">Choose body part:</b>
          <select name="select-body-part" 
            onChange={this.selectBodyPart.bind(this)}>
            <option selected disabled>Choose here</option>
            {bodyParts.map((part, index) => (
              <option value={part} key={index}>{part}</option>
            ))}
          </select>
      </div>
    );
  }

  render() {
    return (
      <div>
        { this.state.showCanvas &&  
          <GameRoomCanvas 
            drawDisabled={this.state.drawDisabled}
            bodyPart={this.state.bodyPart}
            generateImage={this.sendImage.bind(this)}
            ref="canvas"/>
        }
        {this.state.currentView}
      </div>
    );
  }

}

export default GameRoom;