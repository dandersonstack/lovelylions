import React from 'react';


class LeaderBoardPic extends React.Component {
  constructor(props) {
    super(props);
  }

  selectArtist(event) {
    this.props.fetchGallery(event.target.innerText);
  }

  render() {
    return (
      <div className='col-sm-12 col-lg-12 leaderboard-row'>
        <div className='col-sm-4 col-md-4 col-lg-4 lb-row-ranking'>
          <span>Ranking Buttons Go Here</span>
          <button>UP</button>
          <button>DOWN</button>
        </div>
        <div className="col-sm-4 col-md-4 col-lg-4 gallery-pic">
          <img className="pic-part" src={this.props.pic.head.path} />
          <img className="pic-part" src={this.props.pic.torso.path} />
          <img className="pic-part" src={this.props.pic.legs.path} />
        </div>
        <div className='col-sm-4 col-md-4 col-lg-4 lb-row-info'>
          <span>Pic Info Goes Here</span>
          <a href="#" onClick={this.selectArtist.bind(this)}>{this.props.pic.head.artist}</a>
          <a href="#" onClick={this.selectArtist.bind(this)}>{this.props.pic.torso.artist}</a>
          <a href="#" onClick={this.selectArtist.bind(this)}>{this.props.pic.legs.artist}</a>

        </div>
      </div>
    );
  }
}
export default LeaderBoardPic;
