import React from 'react';

const exports = {};
const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));


// Player views must be extended.
// It does not have its own Wrapper view.

exports.GetNum = class extends React.Component {
  render() {
    const {parent, defaultWager, standardUnit, defaultNum} = this.props;
    const num = (this.state || {}).num || defaultNum;
    return (
      <div>
        <input
          type='number'
          placeholder={defaultNum}
          onChange={(e) => this.setState({num: e.currentTarget.value})}
        />
        <br />
        <button
          onClick={() => parent.playGuess(num)}
        >Lock in Guess</button>
      </div>
    );
  }
}


exports.SeeActual = class extends React.Component {
  render() {
    const {num} = this.props;
    console.log(num);
    return (
      <h1 className="Test">
        The total was:{num}
      </h1>
    );
  }
}


exports.WaitingForResults = class extends React.Component {
  render() {
    return (
      <div className="Test">
        Waiting for results...
      </div>
    );
  }
}

exports.Done = class extends React.Component {
  render() {
    const {outcome} = this.props;
    return (
      <div className="Test">
        Thank you for playing. The outcome of this game was:
        <br />{outcome || 'Unknown'}
      </div>
    );
  }
}

exports.Timeout = class extends React.Component {
  render() {
    return (
      <div className="Test">
        There's been a timeout. (Someone took too long.)
      </div>
    );
  }
}

exports.SetWager = class extends React.Component {
  render() {
    const {parent, defaultWager, standardUnit} = this.props;
    const wager = (this.state || {}).wager || defaultWager;
    return (
      <div>
        <input
          type='number'
          placeholder={defaultWager}
          onChange={(e) => this.setState({wager: e.currentTarget.value})}
        /> {standardUnit}
        <br />
        <button
          onClick={() => parent.setWager(wager)}
        >Set wager</button>
      </div>
    );
  }
}

export default exports;
