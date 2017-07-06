import React from 'react';
import LeaderBoardPic from './LeaderBoardPic.jsx';

class LeaderBoard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="gallery">
        <h4>Leader Board</h4>
        <ul>
        {this.props.pics.map((pic, idx) => 
          <li><LeaderBoardPic 
            key={idx} 
            pic={pic} 
            fetchGallery={this.props.fetchGallery}
          /></li>)}
        </ul>
      </div>
    );
  }
}


export default LeaderBoard;
