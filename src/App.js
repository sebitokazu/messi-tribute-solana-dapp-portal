import { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_BASE = `https://twitter.com`;
const TWITTER_HANDLE = '_buildspace';
const TWITTER_PROFILE = 'seba_itokazu';

const App = () => {

  // State
  const [walletAddress, setWalletAddress] = useState(null);

  /*
   * This function holds the logic for deciding if a Phantom Wallet is
   * connected or not
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          
          /*
          * The solana object gives us a function that will allow us to connect
          * directly with the user's wallet!
          */
         connectWallet(true);
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async (onlyIfTrusted) => {
    const {solana} = window;
    if (solana) {
      const response = onlyIfTrusted !== undefined ? await solana.connect() : await solana.connect({onlyIfTrusted:true});
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  /*
   * We want to render this UI when the user hasn't connected
   * their wallet to our app yet.
   */
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  /*
   * When our component first mounts, let's check to see if we have a connected
   * Phantom Wallet
   */
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);


  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">⚽ 🏆 🐐 Messi's tribute dApp 🐐 🏆 ⚽</p>
          <p className="sub-text">
            View the best moves from the best in the history right in the Solana Messiverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
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
