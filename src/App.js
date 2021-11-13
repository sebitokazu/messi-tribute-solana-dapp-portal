import { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
  Program, Provider, web3
} from '@project-serum/anchor';

import idl from './idl.json';
import kp from './keypair.json';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

// Constants
const TWITTER_BASE = `https://twitter.com`;
const TWITTER_HANDLE = '_buildspace';
const TWITTER_PROFILE = 'seba_itokazu';
const YOUTUBE_EMBED_BASE = 'https://www.youtube.com/embed/';

const App = () => {

  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [videoList, setVideoList] = useState([]);

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

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createVideoAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getVideoList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  const sendVideo = async () => {
    if (inputValue.length > 0) {
      console.log('Video link:', inputValue);
      let ref = inputValue.substring(inputValue.indexOf('watch?v=')+8);
      let embedLink = YOUTUBE_EMBED_BASE + ref;

      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
    
        await program.rpc.addVideo(embedLink, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          },
        });
        console.log("Video successfully sent to program", inputValue)
    
        await getVideoList();
      } catch (error) {
        console.log("Error sending video:", error)
      }
    } else {
      console.log('Empty input. Try again.');
      return;
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

  const renderConnectedContainer = () => {
    if(videoList === null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createVideoAccount}>
            Do One-Time Initialization For Messi Tribute Program Account
          </button>
        </div>
      )
    }else{
      return(
        <div className="connected-container">
          <input 
          type="text" 
          placeholder="Enter YT link! (eg. https://www.youtube.com/watch?v=X4Z_prRI9B4)"
          value={inputValue}
          onChange={onInputChange} />
          <button className="cta-button submit-gif-button" onClick={sendVideo}>Submit</button>
          <div className="gif-grid">
            {videoList.map((video,idx) => (
              <div key={video}>
                <div className="gif-item">
                  <iframe src={video.videoLink} allowFullScreen frameBorder="0" title={`video_${idx}`}/>
                </div>
                <p style={{color:"#ffffff", wordWrap:'break-word'}}>Shared by: <strong>{video.userAddress.toString()}</strong></p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

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
    // eslint-disable-next-line
  }, []);


  const getVideoList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Got the account", account)
      setVideoList(account.videoList)
  
    } catch (error) {
      console.log("Error in getVideoList: ", error)
      setVideoList(null);
    }
  }

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching Video list...');
      getVideoList();
    }
    // eslint-disable-next-line
  }, [walletAddress]);


  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">⚽ 🏆 🐐 Messi's tribute dApp 🐐 🏆 ⚽</p>
          <p className="sub-text">
            View the best moves from the best in the history right in the Solana Messiverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
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
