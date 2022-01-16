import React, { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import { Card } from "antd";
import { Moralis } from "moralis";
import { CrowdfundingNFTAddress, CrowdfundingNFTABI } from "../../helpers/contractABI";
import "./nftbalance_styling.css";


Moralis.start({
  serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
  appId: process.env.REACT_APP_MORALIS_APPLICATION_ID,
});

function NFTBalance({ nft, index }) {
  const tokenId = nft.token_id;
  const { Moralis, user } = useMoralis();
  const [alreadyStreamed, setAlreadyStreamed] = useState(0);
  const [streamRate, setStreamRate] = useState(0);
  const [leftToStream, setLeftToStream] = useState(0);
  const [tokenAddress, setTokenAddress] = useState("");
  const [isStateLoading, setIsStateLoading] = useState(false);
  const _walletAddress = user ? user.attributes.ethAddress : null;
  
  const fetchNFTData = async function () {
    const optionsnftInfo = {
      contractAddress: CrowdfundingNFTAddress,
      functionName: "allNFTs",
      abi: CrowdfundingNFTABI,
      params: {
        "": tokenId,
      },
    };
    const nftInfo = await Moralis.executeFunction(optionsnftInfo);
    const optionsalreadyStreamed = {
      contractAddress: CrowdfundingNFTAddress,
      functionName: "getAlreadyStreamed",
      abi: CrowdfundingNFTABI,
      params: {
        _tokenId: tokenId,
      },
    };
    const _alreadyStreamed = parseInt(await Moralis.executeFunction(optionsalreadyStreamed));
    let _streamRate;
    nftInfo.isStopped == true ? _streamRate = 0 :  _streamRate = parseInt(nftInfo.streamRate);
    console.log(parseInt(nftInfo.originalStreamAmount) - parseInt(_alreadyStreamed));
    const _leftToStream = parseInt(nftInfo.originalStreamAmount) - parseInt(_alreadyStreamed)
    setAlreadyStreamed(parseInt(_alreadyStreamed));
    setLeftToStream(parseInt(_leftToStream));
    setStreamRate(parseInt(_streamRate));
    setTokenAddress(nftInfo.streamToken);

    const interval = setInterval(() => {
      setAlreadyStreamed(alreadyStreamed => alreadyStreamed + _streamRate / 10);
      setLeftToStream(leftToStream => leftToStream - _streamRate / 10);
    }, 100);
    return () => clearInterval(interval);
  };

  useEffect(() => {
    fetchNFTData();
  }, []);

  return (
      <Card
      hoverable
      bordered={true}
      style={{
        //width: 480,
        backgroundColor: "transparent",
        padding: "10px",
        boxshadow: "20px 20px",
        borderRadius: "30px",
        borderColor: "black",
        color: "white",
      }}
      //key={nft.id}
    >
      <h3 style={{ color: "black" }}>{nft.name + " " + nft.token_id} </h3>
      <p style={{ color: "black" }}>Tokens left to stream</p>
      <p style={{color: "red"}}>{(leftToStream / 1000000000000000000).toFixed(6) + "(Tokenaddress: " + tokenAddress + ")"}</p>
      <p style={{ color: "black" }}>Tokens already streamed</p>
      <p style={{color: "green"}}>{(alreadyStreamed / 1000000000000000000).toFixed(6) + "(Tokenaddress: " + tokenAddress + ")"}</p>    
    </Card>
  );
}

export default NFTBalance;


/*
<div style={{display: "flex", flexDirection: "row"}}>
        <p>Already streamed Token:</p>
        {nft.isStopped ? <p style={{color: "white"}}>{tokenValue(alreadyStreamed, 18).toFixed(6)}</p> : <p style={{color: "green"}}>{tokenValue(alreadyStreamed, 18).toFixed(6)}</p>}
      </div>
      <p>Streamrate per second: {tokenValue(nft.streamRate, 18).toFixed(6)} </p>
      <div style={{display: "flex", flexDirection: "row"}}>
        <p> Tokens left for Stream: </p>
        {nft.streamAmount == 0
          ? <p style={{color: "white"}}>{tokenValue(nft.streamAmount, 18).toFixed(6)}</p>
          : 
          nft.isStopped ? <p style={{color: "white"}}>{tokenValue(nft.streamAmount, 18).toFixed(6)}</p> :
          
          <p style={{color: "red"}}>{tokenValue(leftToStream, 18).toFixed(6)}</p>}
      </div>
      <p>Streamed Tokenaddress: {getEllipsisTxt(nft.streamToken)} </p>
      <p>Stream is stopped: {nft.isStopped.toString()} </p>
      <p>Stream goes to: {getEllipsisTxt(nft.streamReceiver)} </p>
      <p>Is for sale on the market: {nft.marketInfo.isActive.toString()}</p>
      {nft.marketInfo.isActive === true && <p>Actual highest bidder: {getEllipsisTxt(nft.marketInfo.bidder)} </p>}
      {nft.marketInfo.isActive === true && <p>Actual highest bid: {tokenValue(nft.marketInfo.price, 18).toFixed(6) + " AVAX"} </p>}
      {nft.marketInfo.isActive === true && <p>Offer accepted: {nft.marketInfo.offerAccepted.toString()} </p>}
      {nft.marketInfo.isActive === false ?
      <div style={{display: "flex", justifyContent: "center"}}>
        < Button onClick={putOnSale} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>Put on Sale</Button>
      </div>
       :
       nft.marketInfo.isActive === true && !nft.marketInfo.offerAccepted ?  
      <div style={{display: "flex", justifyContent: "space-around"}}>
        < Button onClick={removeOffer} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>Remove Offer</Button>
        < Button onClick={acceptOffer} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>Accept Offer</Button>
      </div> 
        :
        <div style={{display: "flex", justifyContent: "center"}}>
        < Button onClick={removeOffer} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>Remove Offer</Button>
        </div>
      }


*/