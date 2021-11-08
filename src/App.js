import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_BASE = `https://twitter.com`;
const TWITTER_HANDLE = '_buildspace';
const TWITTER_PROFILE = 'seba_itokazu';

const App = () => {
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">⚽ 🏆 🐐 Messi's tribute dApp 🐐 🏆 ⚽</p>
          <p className="sub-text">
            View the best moves from the best in the history right in the Solana Messiverse ✨
          </p>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <p> Built on &nbsp; 
          <a
            className="footer-text"
            href={TWITTER_BASE+'/'+TWITTER_HANDLE}
            target="_blank"
            rel="noreferrer"
          >{`@${TWITTER_HANDLE}`}</a>
           &nbsp; by&nbsp;<a
            className="footer-text"
            href={TWITTER_BASE+'/'+TWITTER_PROFILE}
            target="_blank"
            rel="noreferrer"
          >{`@${TWITTER_PROFILE}`}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
