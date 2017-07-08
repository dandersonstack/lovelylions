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
    this.props.fetchGallery(event.target.innerText.split(': ')[1]);
  }

  upVote(e){
    if(this.state.upVote === 'on') {
      this.setState({
        upVote: ''
      });
      this.props.updateRanking(false);
    } else {
      this.setState({
        upVote: 'on',
        downVote:''
      });
      this.props.updateRanking(true);
    }
  }

  downVote(){
    if(this.state.downVote === 'on') {
      this.setState({
        downVote: ''
      });
      this.props.updateRanking(true);
    } else {
      this.setState({
        downVote: 'on',
        upVote:''
      });
      this.props.updateRanking(false);
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
          <div className="featureBorder">                                                               <img className="pic-part" src={this.props.pic.head.path} />
              <img className="pic-part" src={this.props.pic.torso.path} />
              <img className="pic-part" src={this.props.pic.legs.path} />
          </div>
        </div>
        <div className='equalHW lb-row-info'>
          <span><b>Pic Information:</b></span>
          <a href="#" onClick={this.selectArtist.bind(this)}><strong>Head:</strong> {this.props.pic.head.artist}</a>
          <a href="#" onClick={this.selectArtist.bind(this)}><b>Torso:</b> {this.props.pic.torso.artist}</a>
          <a href="#" onClick={this.selectArtist.bind(this)}><b>Leggos:</b> {this.props.pic.legs.artist}</a>
          <span>Date: {formatDate(new Date(Date.parse(this.props.pic.timeStamp)))}</span>
        </div>
      </div>
    );
  }
}

function addLeadingZero(n){ return n < 10 ? '0'+n : ''+n }

function formatDate(d){
  var year = d.getFullYear();
  var month = addLeadingZero(d.getMonth());
  var day = addLeadingZero(d.getDay());
  return year + '-' + month + '-' + day;
}

export default LeaderBoardPic;
