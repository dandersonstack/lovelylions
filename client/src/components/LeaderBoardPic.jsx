import React from 'react';


class LeaderBoardPic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      upVote: '',
      downVote: ''
    };
  }

  selectArtist(event) {
    this.props.fetchGallery(event.target.innerText);
  }

  upVote(){
    if(this.state.upVote === 'on') {
      this.setState({
        upVote: ''
      });
    } else {
      this.setState({
        upVote: 'on',
        downVote:''
      });
    }
  }

  downVote(){
    if(this.state.downVote === 'on') {
      this.setState({
        downVote: ''
      });
    } else {
      this.setState({
        downVote: 'on',
        upVote:''
      });
    }
  } 

  render() {
    return (
      <div className='leaderboard-row'>
        <div className='equalHW lb-row-ranking'>
          <br></br>
          <span className={'arrow-up ' + this.state.upVote} onClick={this.upVote.bind(this)}></span>
          <h3 className='ranking'>{this.props.pic.ranking}</h3>
          <span className={'arrow-down ' + this.state.downVote} onClick={this.downVote.bind(this)}></span>
          <br></br>
        </div>
        <div className="equalHW leaderboard-pic">
          <img className="pic-part" src={this.props.pic.head.path} />
          <img className="pic-part" src={this.props.pic.torso.path} />
          <img className="pic-part" src={this.props.pic.legs.path} />
        </div>
        <div className='equalHW lb-row-info'>
          <span><b>Pic Information:</b></span>
          <br></br>
          <a href="#" onClick={this.selectArtist.bind(this)}>Head: {this.props.pic.head.artist}</a>
          <br></br>
          <a href="#" onClick={this.selectArtist.bind(this)}>Torso: {this.props.pic.torso.artist}</a>
          <br></br>
          <a href="#" onClick={this.selectArtist.bind(this)}>Leggos: {this.props.pic.legs.artist}</a>

        </div>
      </div>
    );
  }
}
export default LeaderBoardPic;
