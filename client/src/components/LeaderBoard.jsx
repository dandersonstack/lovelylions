import React from 'react';
import LeaderBoardPic from './LeaderBoardPic.jsx';

class LeaderBoard extends React.Component {
  constructor(props) {
    super(props);
  }

  selectArtist(event) {
    this.props.fetchGallery(event.target.innerText);
  }

  render() {
    return (
      <div className="gallery">
        <h4>Leader Board</h4>
        <LeaderBoardPic 
            key={0} 
            pic={this.props.pics[0]} 
            fetchGallery={this.props.fetchGallery}
          />
      </div>
    );
  }
}


export default LeaderBoard;

//{this.props.pics.map((pic, idx) => 
          