import React, { useState, useEffect } from "react";
import { useMoralis, useMoralisCloudFunction } from "react-moralis";
import SuperfluidSDK from "@superfluid-finance/js-sdk";
import { Moralis } from "moralis";
import { Web3Provider } from "@ethersproject/providers";
import { ISuperTokenABI } from "../../helpers/contractABI";
import { ethers } from "ethers";
import { Framework } from "@superfluid-finance/sdk-core";
import Web3 from "web3";


Moralis.start({
    serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
    appId: process.env.REACT_APP_MORALIS_APPLICATION_ID,
  });
  


function Balance({balance, decimals, tokenAddress}) {
    const { Moralis, user } = useMoralis();
    const walletAddress = user ? user.attributes.ethAddress : null;
    const { data, error, isLoading } = useMoralisCloudFunction("getSuperTokens");
    const [ tokenBalance, setTokenBalance ] = useState(0);
    const [ tokenFlow, setTokenFlow ] = useState(0);

    const initialzeSuperFluid = async () => {
        if(data) {
            if(data.includes(tokenAddress)) {
                console.log(tokenAddress);
                const web3 = await Moralis.enableWeb3();
                const web3_1 = new Web3("wss://speedy-nodes-nyc.moralis.io/cff6f789838e10c4008b1baa/avalanche/testnet/ws");
                const url = "https://speedy-nodes-nyc.moralis.io/cff6f789838e10c4008b1baa/eth/kovan/archive";
                const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

                const sf = await Framework.create({
                    networkName: "kovan",
                    provider: customHttpProvider
                });

                //getting outFlow of token
                const outFlow = await sf.query.listStreams({sender: walletAddress, token: tokenAddress});
                //getting inFlow of token
                const inFlow = await sf.query.listStreams({receiver: walletAddress, token: tokenAddress});

                console.log(outFlow.data);
                console.log(inFlow.data);
                
                let outFlowRate = 0;
                let inFlowRate = 0;

                if(outFlow.data.length > 0) {
                    for(let i = 0; i < outFlow.data.length; i++) {
                        outFlowRate = outFlowRate + parseInt(outFlow.data[i].currentFlowRate) 
                    }
                }

                if(inFlow.data.length > 0) {
                    for(let i = 0; i < inFlow.data.length; i++) {
                        inFlowRate = inFlowRate + parseInt(inFlow.data[i].currentFlowRate) 
                    }
                }

                console.log(outFlowRate);
                console.log(inFlowRate);

                const netFlowRate = inFlowRate - outFlowRate;
                setTokenFlow(netFlowRate);
                console.log(netFlowRate);

                const contract = new web3.eth.Contract(ISuperTokenABI, tokenAddress);
                const balance = await contract.methods.balanceOf(walletAddress).call();
                setTokenBalance(balance);                  
        
                const interval = setInterval(async () => {
                    //setTokenFlow(parseInt(details.cfa.netFlow));
                    setTokenBalance(tokenBalance => parseInt(tokenBalance) + netFlowRate / 10);
                }, 100);
                return () => clearInterval(interval);
            }
            else {
                setTokenBalance(balance);
            }
        }
    }

    useEffect(() =>{
        initialzeSuperFluid();
    },[data, tokenFlow, balance])

    if(tokenFlow === 0) {
        return (
            <div>
                {parseFloat(Moralis.Units.FromWei(tokenBalance.toString(), decimals).toFixed(6))}
            </div>
        )
    }

    else if(tokenFlow > 0) {
        return (
            <div style={{color: "green"}}>
                {parseFloat(Moralis.Units.FromWei(tokenBalance.toString(), decimals).toFixed(6))}
            </div>
        )
    }

    else {
        return (
            <div style={{color: "red"}}>
                {parseFloat(Moralis.Units.FromWei(tokenBalance.toString(), decimals).toFixed(6))}
            </div>
        )
    }

}
export default Balance;
