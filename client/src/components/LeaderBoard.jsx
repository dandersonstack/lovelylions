import React from 'react';
import GalleryPic from './GalleryPic.jsx';

class LeaderBoard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="gallery">
        <h4>{this.props.galleryOwner + "'s gallery"}</h4>
        {this.props.pics.map((pic, idx) => <GalleryPic key={idx} pic={pic} fetchGallery={this.props.fetchGallery}/>)}
      </div>
    );
  }
}


export default LeaderBoard;
