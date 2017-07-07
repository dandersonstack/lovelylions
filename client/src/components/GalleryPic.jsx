import React from 'react';


class GalleryPic extends React.Component {
  constructor(props) {
    super(props);
  }

  selectArtist(event) {
    this.props.fetchGallery(event.target.innerText);
  }

  handleShare(event) {
    this.props.fetchSharedPic(this.props.owner, this.props.idx);
  }

  render() {
    return (
      <div className="col-xs-4 col-lg-3 gallery-pic">
        <img className="pic-part" src={this.props.pic.head.path} />
        <img className="pic-part" src={this.props.pic.torso.path} />
        <img className="pic-part" src={this.props.pic.legs.path} />
        <a href="#" onClick={this.selectArtist.bind(this)}>{this.props.pic.head.artist}</a>
        <a href="#" onClick={this.selectArtist.bind(this)}>{this.props.pic.torso.artist}</a>
        <a href="#" onClick={this.selectArtist.bind(this)}>{this.props.pic.legs.artist}</a>
        <button onClick={this.handleShare.bind(this)}>share</button>
      </div>
    );
  }
}
export default GalleryPic;
