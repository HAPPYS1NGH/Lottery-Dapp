import './App.css';
import { ethers } from "ethers";
import React, { useEffect , useState } from "react";
import abi from "./utils/Lottery.json"

const getEthereumObject = () => window.ethereum;

const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
    * First make sure we have access to the Ethereum object.
    */
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [random, setRandom] = useState("");
  const [participants , setParticipants] = useState([]);

  const contractABI = abi.abi;
  const contractAddress = "0xaC34aC2600be403426E9Bd6DE9b895bFbbDF8391";
  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
  
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
  
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    findMetaMaskAccount().then((account) => {
      if (account !== null) {
        setCurrentAccount(account);
      }
    });
  }, [currentAccount]);

  const sendMoney = async ()=>{
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const LotteryContract = new ethers.Contract(contractAddress, contractABI, signer);
        let randomNo = await LotteryContract.random();
        console.log(randomNo.toString());
        setRandom(randomNo.toString());
      }}
       catch (error) {
        console.log(error);
      }
    }

    const getParticipants = async ()=>{
      try {
        const { ethereum } = window;
  
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const LotteryContract = new ethers.Contract(contractAddress, contractABI, signer);
          let participants = await LotteryContract.participants(0);
          console.log(participants);
        }}
         catch (error) {
          console.log(error);
        }
    }

    const takePartInLottery = async () => {
      try {
        const { ethereum } = window;
    
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const LotteryContract = new ethers.Contract(contractAddress, contractABI, signer);
          const amountToSend = ethers.utils.parseEther('0.1');
          const transaction = await signer.sendTransaction({
            to: LotteryContract.address,
            value: amountToSend
          })
          await transaction.wait();
          console.log(`Transaction hash: ${transaction.hash}`);
        }
      } catch (error) {
        console.log(error);
      }
    }
    

  return (
    <div className="App">
      <div>Hello </div>
      {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div>
        <button className="send" onClick={sendMoney}>
            Get random Number {random ? random : 0}
          </button>
        </div>
        <div><button onClick={getParticipants} >Get Participants</button></div>
        <div><button onClick={takePartInLottery} >Take Part in Lottery</button></div>
    </div>
  );
}


export default App;