import React from 'react';
import DrawCanvas from './DrawCanvas.jsx';


class JoinGameRoom extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="overlay join-room">
            <b className="draw-off">cadavre draw off!</b>
            <button onClick={this.props.playGame}>Play Game!</button>
        </div>
      </div>
    );
  }

}

export default JoinGameRoom;