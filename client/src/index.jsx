import React from 'react';
import ExquisiteWriter from './components/ExquisiteWriter.jsx';
import DrawCanvas from './components/DrawCanvas.jsx';
import GameRoom from './components/GameRoom.jsx';
import Gallery from './components/Gallery.jsx';
import LeaderBoard from './components/LeaderBoard.jsx';
import ReactDOM from 'react-dom';
import Composite from './components/composite.jsx';

var testURL = '/images/?file=legs.png'


class App extends React.Component {
  constructor(props) {
    super(props);
    //setting username or imgRoute
    var currentUser = window.location.href.split('username=');
    var imgRoute = window.location.href.split('pic=');
    var name;
    if (currentUser[1]) {
      name = currentUser[1].replace('#_=_', '');
      name = name.replace(/%20/g, ' ');
    }
    if (imgRoute[1]) {
      this.imgData = imgRoute[1].replace('#_=_', '');
      this.imgData = this.imgData.replace(/%20/g, ' ');
    }
    //
    this.state = {
      currentViewName: 'LeaderBoard',
      login: name ? name : null,
      currentView: <DrawCanvas generateImage={this.generateImage.bind(this)}/>,
      pics: []
    };
    this.componentSwitch = this.componentSwitch.bind(this);
    this.fetchLeaderBoard = this.fetchLeaderBoard.bind(this);
    this.generateImage = this.generateImage.bind(this);
    this.saveComposite = this.saveComposite.bind(this);
    this.updateRanking = this.updateRanking.bind(this);
  }

  componentDidMount() {
    if (this.imgData) {
      let imgInfo = this.imgData.split('_');
      let username = imgInfo[0];
      let id = imgInfo[1];
      this.fetchSharedPic(username, id);
    }
  }

  componentSwitch(e) {
    e.preventDefault();
    var targetVal = e.target.innerText;
    if (targetVal === 'canvas') {
      this.setState({currentView: <DrawCanvas generateImage={this.generateImage.bind(this)}/>});
    } else if (targetVal === 'gallery') {
      this.fetchGallery();
    } else if (targetVal === 'multiplayer') {
      this.showGameRoom();
    }
  }

  fetchLeaderBoard(query, time) {    
    if(query && query === 'Newest') {
      this.fetchNewest();
    } else{
      this.fetchTopRated(time);
    }
  }

  fetchTopRated(time) {
    if(typeof time !== 'string' || time === 'All Time'){
      time = 'total';
    }
    fetch(`/leaderboard/topRated/${time}`).then(res => res.json())
      .then(galleryImages => {
        this.setState({pics: galleryImages}
        );
        this.setState({currentView: <LeaderBoard pics={this.state.pics} 
                                      fetchLeaderBoard={this.fetchLeaderBoard}
                                      fetchGallery={this.fetchGallery.bind(this)}
                                      updateRanking={this.updateRanking}/>
        })
      }
    );
  }

  fetchNewest() {
    fetch(`/leaderboard/newest`).then(res => res.json())
      .then(galleryImages => {
        this.setState({pics: galleryImages});
        this.setState({currentView: <LeaderBoard pics={this.state.pics}
                                      fetchGallery={this.fetchGallery.bind(this)}
                                      fetchLeaderBoard={this.fetchLeaderBoard}
                                      updateRanking={this.updateRanking}/>
        })
      }
    );
  }

  updateRankingState(index, positive) {
    var pics = this.state.pics;
    if(positive){
      pics[index].ranking++;
    } else {
      pics[index].ranking--;
    }
    this.setState({pics: pics});
  }

  updateRanking(index, positive) {
    this.updateRankingState(index, positive);
    if(positive){
      fetch(`/incrementRanking/${this.state.pics[index].title}`, {method: 'PUT'}).then(res => res.json())
        .then((result)=> {})
    } else {
      fetch(`/incrementRanking/${this.state.pics[index].title}`, {method: 'PUT'}).then(res => res.json())
        .then((result)=>{})
    }
  }


  fetchSharedPic(username, idx) {
    console.log(username);
    console.log(idx);
    fetch(`/share?pic=${username}_${idx}`).then(res => res.json())
      .then(finalImage => this.setState({
        currentView: <Composite pic={finalImage} generateImage={this.generateImage} saveImage={this.saveComposite} login={this.state.login} idx={idx} username={username} dontShowRegenerate={true} showShare={true}/>
      })
    );
  }

  showGameRoom() {
    this.setState({
      currentView: <GameRoom 
                      login={this.state.login}
                      generateImage={this.generateImage.bind(this)}/>
    });
  }

  fetchGallery(artist = this.state.login) {
    fetch(`/gallery?username=${artist}`).then(res => res.json())
      .then(galleryImages => this.setState({currentView: <Gallery galleryOwner={artist} pics={galleryImages} fetchGallery={this.fetchGallery.bind(this)} fetchSharedPic={this.fetchSharedPic.bind(this)}/>}));
  }

  generateImage(userImage) {
    var userPart = Object.keys(userImage)[0];
    fetch(`/generate?part=${userPart}`).then(res => res.json())
      .then(generatedImage => {
        generatedImage[userPart] = userImage[userPart];
        this.setState({currentView: ''});
        this.setState({
          currentView: <Composite pic={generatedImage} userPart={userPart} generateImage={this.generateImage} saveImage={this.saveComposite} login={this.state.login}/>
        });
      });
  }

  saveComposite(compositeImage, userPart) {
    compositeImage[userPart].artist = this.state.login;
    fetch(`/save?part=${userPart}`, {
      'method': 'POST',
      'headers': {'Content-Type': 'application/json'},
      'body': JSON.stringify(compositeImage)
    }).then(() => this.fetchGallery())
  }

  render() {
    return (
      <div>
        <ExquisiteWriter />
        <div className="foreground">
          <div className="nav-bar">
            <h1>cadavre exquis</h1>
            <a href="#" onClick={this.componentSwitch}>canvas</a>
            <a href="#" onClick={this.componentSwitch}>multiplayer</a>
            {this.state.login ? (
              <span>
                <a href="#" onClick={this.componentSwitch}>gallery</a>
                <a className="user-button" href="/logout">
                  <span className="login">{this.state.login.toLowerCase()}</span>
                  <span className="logout"></span>
                </a>
              </span>
            ) : (
              <a href="/auth/facebook" >login</a>
            )}
            <a className="gallery-button" href="#" onClick={this.fetchLeaderBoard}>LeaderBoard</a>
          </div>
          {this.state.currentView}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
