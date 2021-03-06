import React from 'react';
import LeaderBoardPic from './LeaderBoardPic.jsx';

class LeaderBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ranking: 'Top Rated',
      followUpMenu: true,
      timeTable: 'All Time'
    };
    this.changeQuery = this.changeQuery.bind(this);
    this.changeTimeTable = this.changeTimeTable.bind(this);
  }


  changeQuery(e){
    if(e.target.value === 'Top Rated'){
      this.setState({
        followUpMenu: true
      });
    } else {
      this.setState({
        followUpMenu: false,
        timeTable: 'Hour'
      });
    }
    this.props.fetchLeaderBoard(e.target.value, this.state.timeTable);
  }

  changeTimeTable(e) {
    this.setState({
      timeTable: e.target.value
    });
    this.props.fetchLeaderBoard(e.target.value, e.target.value);

  }

  updateRanking(i, positive, e) {
    this.props.updateRanking(i, positive);
  }

  selectArtist(event) {
    this.props.fetchGallery(event.target.innerText);
  }

  render() {
    return (
      <div>
        <div className='leaderboard-header'>
          <div className='title'> LeaderBoard Rankings: </div>
          <div className="dropdown">
            <select onChange={this.changeQuery} className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              Dropdown
              {['Top Rated', 'Newest', 'Hot'].map((ordering, index) => (
                <option value={ordering} key={index}>{ordering}</option>
              ))}
            </select>
            {this.state.followUpMenu ? (
              <select onChange={this.changeTimeTable} className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                Dropdown
                {['Hour', 'Day', 'Month', 'Year', 'All Time'].map((time, index) => (
                  <option value={time} key={index}>{time}</option>
                ))}
              </select>
              ) : (<div></div>)
            }
          </div>
        </div>
        <div className="leaderboard">
        {this.props.pics.map((pic, idx) => 
          <LeaderBoardPic 
              key={idx} 
              pic={pic} 
              fetchGallery={this.props.fetchGallery}
              updateRanking={this.updateRanking.bind(this, idx)}
            />
            )}
        </div>
      </div>
    );
  }
}


export default LeaderBoard;
//<h4>Leader Board</h4>
//
          