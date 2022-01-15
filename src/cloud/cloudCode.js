Moralis.Cloud.define("getTokenBalances", async (request) => {    
  const options = {
    chain: "0x2a",
    address: request.params.walletAddress
  }  
  const balances = await Moralis.Web3API.account.getTokenBalances(options);
    return balances;
});

Moralis.Cloud.define("getSuperTokens", async (request) => {
  let tokens = [];
  const query = new Moralis.Query("Superfluidtokens");
  let result = await query.find();
  if(result) {
    for(let i = 0; i < result.length; i++) {
      tokens.push(result[i].get("tokenAddress").toLowerCase());
    }
  }
  return tokens;
});

Moralis.Cloud.define("getMyCrowdfundingNFTs", async (request) => {
  const options = {
    chain: "0x2a",
    address: request.params.walletAddress,
    token_addresses: [request.params.CrowdfundingNFTAddress],
  }  
  const balances = await Moralis.Web3API.account.getNFTs(options);
  return balances;
});

Moralis.Cloud.job("checkNFTs", async (request) => {
  const CrowdfundingNFTAddress = "0xC9B8f7A5FC6d20Fb2B8E453E020F0951299a370d";
  const web3 = Moralis.web3ByChain("0x2a");
  const contract= new web3.eth.Contract(CrowdfundingNFTABI, CrowdfundingNFTAddress);
  let salesToClose = [];
  salesToClose = await contractMarketplace.methods.checkForUpdate(MagePadNFTAddress).call();
  let newFlowsToStop = [];
    for (let i = 0; i < flowsToStop.length; i++) {
      flowsToStop[i] != 0 && newFlowsToStop.push(parseInt(flowsToStop[i]));
    }
  
    if(newFlowsToStop.length > 0) {
    const data = contract.methods.performUpdate(newFlowsToStop, CrowdfundingNFTAddress);
    const txData = data.encodeABI();
    let config;
    config = await Moralis.Config.get({useMasterKey: true});
    const address = config.get("address");
    const gas = await data.estimateGas({from: address});
    const gasPrice = await web3.eth.getGasPrice();
    const txNonce = await web3.eth.getTransactionCount(address);
    const privateKey = config.get("privateKey");

    tx = {
      to: CrowdfundingNFTAddress,
      data: txData,
      gas: gas,
      gasPrice: gasPrice,
      nonce: txNonce,
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  }
})

const CrowdfundingNFTABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_operator",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allNFTs",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "startingBlockTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endingBlockTime",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "streamReceiver",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "streamAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "streamRate",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "streamToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "securityAmount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "minter",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isStopped",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "originalStreamAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "nftAccounting",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "oldTokenId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "checkForUpdate",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "_flowsToStop",
        "type": "uint256[]"
      }
    ],
    "name": "performUpdate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "_isSupertoken",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_streamAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_streamRate",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_streamToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_erc20TokenAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_projectOwner",
        "type": "address"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "getAlreadyStreamed",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "stopFlow",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_streamToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_fundAmount",
        "type": "uint256"
      }
    ],
    "name": "fundNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];