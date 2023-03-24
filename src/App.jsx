import './App.css';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import abi from "./utils/Lottery.json"
import Header from './components/Header';
import Partcipants from './pages/Partcipants';
import Manager from './pages/Manager';
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
  const [participants, setParticipants] = useState([]);
  const [manager, setManager] = useState();
  const [winner, setWinner] = useState();
  const [error, seterror] = useState();

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


  const getManager = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const LotteryContract = new ethers.Contract(contractAddress, contractABI, signer);
        let manager = await LotteryContract.manager();
        setManager(manager.toLowerCase());
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    findMetaMaskAccount().then((account) => {
      if (account !== null) {
        setCurrentAccount(account);
        getManager();
      }
    });
  }, [currentAccount]);

  const getEvents = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const LotteryContract = new ethers.Contract(contractAddress, contractABI, signer);
        const filter = LotteryContract.filters.LotteryParticipant();
        const events = await LotteryContract.queryFilter(filter);
        const newParticipants = events.map((event) => {
          let participant = event.args[0];
          let time = event.args[1].toString();
          return { participant, time };
        });
        setParticipants((oldParticipants) => {
          // Remove duplicates from the newParticipants array
          const uniqueParticipants = newParticipants.filter((newParticipant) => {
            return !oldParticipants.some((oldParticipant) => {
              return oldParticipant.participant === newParticipant.participant;
            });
          });
          // Concatenate the old and new participants arrays
          return [...oldParticipants, ...uniqueParticipants];
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getEvents()
    getManager();
    getWinner();
  }, [])



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
  useEffect(() => {
    let LotteryContract;
    async function onNewParticipant(p, t) {
      console.log(p + "     " + t);
      const newParticipants = {
        participant: p,
        time: t.toString()
      }
      setParticipants(oldParticipant => [...oldParticipant, newParticipants])
    }
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      LotteryContract = new ethers.Contract(contractAddress, contractABI, signer);
      LotteryContract.on("LotteryParticipant", onNewParticipant)
    }

    return () => {
      if (LotteryContract) {
        LotteryContract.off("LotteryParticipant", onNewParticipant);
      }
    };
  }, [])


  const declareWinner = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const LotteryContract = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await LotteryContract.declareWinner();
        await tx.wait();
        console.log(tx);
        getWinner();
      }
    } catch (error) {
      console.log(error);
    }
  }
  const getWinner = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const LotteryContract = new ethers.Contract(contractAddress, contractABI, signer);
      const wi = await LotteryContract.winner();
      setWinner(wi);
      console.log("Winner " + wi);
    }
  }

  const newLottery = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const LotteryContract = new ethers.Contract(contractAddress, contractABI, signer);

        const tx = await LotteryContract.newLottery();
        console.log(tx)
      }
    } catch (error) {
      seterror(error.message)
      console.log(error)
    }
  }


  return (
    <div className="App">
      <Header account={currentAccount} />
      {
        !currentAccount ?
          (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )
          :
          (
            <div>
              {
                currentAccount === manager ?
                  (
                    <Manager declareWinner={declareWinner} newLottery={newLottery} error={error} />
                  )
                  :
                  ""
              }

              <div>
                <div className='manager'>Address of Manager for the Lottery  {manager}</div>
                <div><button className='btn-t' onClick={takePartInLottery} >Take Part in Lottery</button></div>
                {winner === 0x0000000000000000000000000000000000000000 && <div>Winner {winner}</div>}
                <Partcipants participants={participants} />
              </div>

            </div>
          )
      }
    </div>
  );
}


export default App;
