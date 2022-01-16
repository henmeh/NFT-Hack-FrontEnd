require('dotenv').config()

const CrowdfundingNFT = require("../build/contracts/CrowdfundingNFT.json");
const CrowdfundingNFTABI = CrowdfundingNFT.abi;
const CrowdfundingNFTADDRESS = "0x336da328D69b533B850C3444C41f7D391703c2Ab";

const ISuperToken = require("../build/contracts/ISuperToken.json");
const ISuperTokenABI = ISuperToken.abi;

//For Kovan
const SuperTokenADDRESS = "0xe3CB950Cb164a31C66e32c320A800D477019DCFF";

const Web3 = require("web3");
const web3 = new Web3("wss://speedy-nodes-nyc.moralis.io/cff6f789838e10c4008b1baa/eth/kovan/archive/ws");
const { address: admin } = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

const sendingOptions = { from: admin, gasLimit: "0x2dc6c0" };
const contractCrowdfunding = new web3.eth.Contract(CrowdfundingNFTABI, CrowdfundingNFTADDRESS);
const owner = "0xe1f4f6E3ff3eFa235eaFf10aFf34f6a83Dd9357B";
const newOwner = "0x1D5F1298061503ef8E2A7b578ee8ae29D81c287A";

const interact = async function () {
  try {
    const _flowAmount = web3.utils.toWei("0.08", "ether");
    const _securityAmount = _flowAmount * (60 * 60);
    const _flowRate = Math.round(_flowAmount / (5 * 60 * 60)).toString();
    const superTokenContract = new web3.eth.Contract(
      ISuperTokenABI,
      SuperTokenADDRESS
    );
    const approve = await superTokenContract.methods.approve(CrowdfundingNFTADDRESS, (_flowAmount + _securityAmount).toString()).send(sendingOptions);
    console.log(approve);
    const mint = await contractCrowdfunding.methods.mint(1, _flowAmount, _flowRate, SuperTokenADDRESS, SuperTokenADDRESS, "0x1D5F1298061503ef8E2A7b578ee8ae29D81c287A").send(sendingOptions);
    console.log(mint);
  } catch (error) {
    console.log(error);
  }
};

const transferNFT = async function () {
  const transfer = await contractCrowdfunding.methods
    .safeTransferFrom(owner, newOwner, "1")
    .send(sendingOptions);
  console.log(transfer);
};

const beforeDeleting = async function () {
  const stopFlow = await contractCrowdfunding.methods
    .stopFlow("4")
    .send(sendingOptions);
  console.log(stopFlow);
  const withdrawFunds = await contractCrowdfunding.methods
    .withdraw("4")
    .send(sendingOptions);
  console.log(withdrawFunds);
};

//die zentralisierte variante funktioniert schon mal
const checkUpdate = async function () {
  setInterval(async function () {
    const flowsToStop = await contractCrowdfunding.methods.checkForUpdate().call();
    console.log(flowsToStop);
    let newFlowsToStop = [];
    for (let i = 0; i < flowsToStop.length; i++) {
      flowsToStop[i] != 0 && newFlowsToStop.push(parseInt(flowsToStop[i]));
    }
    console.log(newFlowsToStop);
    if(newFlowsToStop.length > 0) {
      await contractCrowdfunding.methods.performUpdate(newFlowsToStop).send(sendingOptions);
    }    
  }, 5000);
};

//getNFTInfos();
//interact();
//transferNFT();
beforeDeleting();
//checkUpdate();
