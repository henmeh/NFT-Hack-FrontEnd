import React, { useState, useEffect } from "react";
import { useMoralis, useMoralisCloudFunction } from "react-moralis";
import {
  Card,
  Image,
  Button,
  InputNumber,
  Menu,
  Form,
  Space,
  Dropdown,
} from "antd";
import { Moralis } from "moralis";
import {
  CrowdfundingNFTAddress,
  CrowdfundingNFTABI,
  SuperTokenFactoryAddress,
  ISuperTokenABI,
  SuperTokenFactoryABI,
  IERC20ABI,
} from "../../helpers/contractABI";
import { DateConverted } from "../../helpers/formatters";

Moralis.start({
  serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
  appId: process.env.REACT_APP_MORALIS_APPLICATION_ID,
});

function Projectfunding({ tokenId, index }) {
  const { Moralis, user } = useMoralis();
  const walletAddress = user ? user.attributes.ethAddress : null;
  const [alreadyStreamed, setAlreadyStreamed] = useState(0);
  const [streamRate, setStreamRate] = useState(0);
  const [tokenAddress, setTokenAddress] = useState("");

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

    setAlreadyStreamed(parseInt(_alreadyStreamed));
    setStreamRate(parseInt(_streamRate));
    setTokenAddress(nftInfo.streamToken);

    const interval = setInterval(() => {
      setAlreadyStreamed(alreadyStreamed => alreadyStreamed + _streamRate / 10);
    }, 100);
    return () => clearInterval(interval);
  };

  useEffect(() => {
    fetchNFTData();
  }, []);

  return (
    <div>
      <p>{"Project funded with Crowdfunding NFT " + tokenId}</p>
      <p style={{color: "green"}}>{(alreadyStreamed / 1000000000000000000).toFixed(6) + "(Tokenaddress: " + tokenAddress + ")"}</p>
    </div>
  );
}

export default Projectfunding;
