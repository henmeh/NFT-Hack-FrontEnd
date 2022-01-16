 //SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import {RedirectAll, ISuperToken, IConstantFlowAgreementV1, ISuperfluid} from "./RedirectAll.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {
    ISuperfluid,
    ISuperToken,
    ISuperApp,
    ISuperAgreement,
    ContextDefinitions,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

// Interface for ChainlinkKeepers
//interface KeeperCompatibleInterface {
//    function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData);
//    function performUpkeep(bytes calldata performData) external;
//}

//contract MagePadNFT is ERC721, RedirectAll, KeeperCompatibleInterface {
contract CrowdfundingNFT is ERC721 {    
    uint256 tokenId;
    address operator;
    uint256 public oldTokenId;
    
    //For Kovantestnet
    ISuperfluid host = ISuperfluid(0xF0d7d1D47109bA426B9D8A3Cde1941327af1eea3);
    IConstantFlowAgreementV1 cfa = IConstantFlowAgreementV1(0xECa8056809e7e8db04A8fF6e4E82cD889a46FE2F);
    
    // Storing single NFT Data
    struct nftData {
        uint256 startingBlockTime;
        uint256 endingBlockTime;
        address streamReceiver;
        uint256 streamAmount;
        uint256 streamRate;
        address streamToken;
        uint256 securityAmount;
        address minter;
        bool isStopped;
        address[] investors;
        uint256 originalStreamAmount;
    }

    // storing which address funded which nft with how many tokens
    mapping (uint256 => mapping(address => uint256)) public nftAccounting;

    // Storing all NFTs
    mapping (uint256 => nftData) public allNFTs;

    constructor (address _operator) ERC721 ("CrowdfundingNFT", "CFNFT") {
        tokenId = 1;
        operator = _operator;
        
        uint256 configWord =
            SuperAppDefinitions.APP_LEVEL_FINAL |
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

        host.registerApp(configWord);
    }

    function checkForUpdate() public view returns(uint256[] memory) {
        uint256[] memory flowsToStop = new uint256[](tokenId);
        uint256 counter = 0;
        for(uint256 i = 1; i < tokenId; i++) {
            //calculating the actual streamed amount
            uint256 _alreadyStreamedAmount = (block.timestamp - allNFTs[tokenId].startingBlockTime) * allNFTs[tokenId].streamRate; 
            if(_alreadyStreamedAmount >= allNFTs[i].streamAmount && allNFTs[i].isStopped == false) {
                flowsToStop[counter] = i;
                counter = counter + 1;
            }
        }
        return flowsToStop;        
    }

    function performUpdate(uint256[] memory _flowsToStop) public {
        for(uint256 i = 0; i < _flowsToStop.length; i++) {
            // Stop the Flow
            stopFlow(_flowsToStop[i]);
            uint256 _toMuchStreamedAmount = (block.timestamp - allNFTs[_flowsToStop[i]].endingBlockTime) * allNFTs[_flowsToStop[i]].streamRate;
            uint256 _resultingSecurityAmount = allNFTs[_flowsToStop[i]].securityAmount - _toMuchStreamedAmount;
            ISuperToken(allNFTs[_flowsToStop[i]].streamToken).transfer(allNFTs[_flowsToStop[i]].minter, _resultingSecurityAmount);
            // set NFT to zero
            allNFTs[_flowsToStop[i]].streamRate = 0;
            allNFTs[_flowsToStop[i]].securityAmount = 0;
            allNFTs[_flowsToStop[i]].streamAmount = 0;
        }
    }

    function mint(uint8 _isSupertoken, uint256 _streamAmount, uint256 _streamRate, address _streamToken, address _erc20TokenAddress, address _projectOwner) public {      
        uint256 _startingBlockTime = block.timestamp;
        uint256 _securityAmount = _streamRate * (60 * 60);
        address[] memory _investor = new address[](1);
        _investor[0] = msg.sender;

        //decide if the token to be streamed is a supertoken or not
        if(_isSupertoken == 1) {
            //get the supertoken out of the senders pocket and store the balance in the mapping
            require(ISuperToken(_streamToken).balanceOf(msg.sender) > (_streamAmount + _securityAmount), "Not enough funds in your wallet to pay for stream and security");
            ISuperToken(_streamToken).transferFrom(msg.sender, address(this), (_streamAmount + _securityAmount));
        } 
        if(_isSupertoken == 2) {
            //get the erc20 token out of the senders pocket, store and start upgrading
            require(IERC20(_erc20TokenAddress).balanceOf(msg.sender) > (_streamAmount + _securityAmount), "Not enough funds in your wallet to pay for stream and security");
            IERC20(_erc20TokenAddress).transferFrom(msg.sender, address(this), (_streamAmount + _securityAmount));
            //approve wrapper to spend ERC20_token
            IERC20(_erc20TokenAddress).approve(_streamToken, (_streamAmount + _securityAmount));
            //upgrading the ERC20_token 
            ISuperToken(_streamToken).upgrade((_streamAmount + _securityAmount));        
        }

        //storing nft data on chain
        allNFTs[tokenId] = nftData(_startingBlockTime, 0, _projectOwner, _streamAmount, _streamRate, _streamToken, _securityAmount, msg.sender, false, _investor,  _streamAmount);
        //add investor to the accounting
        nftAccounting[tokenId][msg.sender] = nftAccounting[tokenId][msg.sender] + (_streamAmount + _securityAmount);
        //actual minting of the nft directly in the wallet of the project
        _mint(_projectOwner, tokenId);
        //start the flow
        _startFlow(tokenId);
        oldTokenId = tokenId;
        tokenId = tokenId + 1;
    }

    function _startFlow(uint256 _tokenId) private returns(bool) {
        // calculating the endingBlock
        uint256 _duration = allNFTs[_tokenId].streamAmount / allNFTs[_tokenId].streamRate;
        uint256 _endingBlock = allNFTs[_tokenId].startingBlockTime + _duration;
        allNFTs[_tokenId].endingBlockTime = _endingBlock;
        allNFTs[_tokenId].isStopped = false;
        host.callAgreement(cfa, abi.encodeWithSelector(cfa.createFlow.selector, allNFTs[_tokenId].streamToken, allNFTs[_tokenId].streamReceiver, allNFTs[_tokenId].streamRate, new bytes(0)), "0x");
        return true;
    }

    function getAlreadyStreamed(uint256 _tokenId) public view returns(uint256) {
      uint256 _actualTime = block.timestamp;
      uint256 _alreadyStreamedAmount = (_actualTime - allNFTs[_tokenId].startingBlockTime) * allNFTs[_tokenId].streamRate;
      // #1 stream is stopped beacuse out of money
      if(allNFTs[_tokenId].isStopped && allNFTs[_tokenId].streamAmount == 0) {
          return allNFTs[_tokenId].originalStreamAmount;
      } 
      // #2 stream is ongoing
      else {
          return _alreadyStreamedAmount;
      }
    }

    function stopFlow(uint256 _tokenId) public returns(bool) {
        require(allNFTs[_tokenId].isStopped == false, "Stream is already stopped");
        require(msg.sender == operator, "You are not allowed to stop the stream");
        allNFTs[_tokenId].isStopped = true;
        // calculating the already streamed amount and set the rest of initial streaming amount to the new streamAmount for this nft
        uint256 _actualTime = block.timestamp;
        uint256 _alreadyStreamedAmount = (_actualTime - allNFTs[_tokenId].startingBlockTime) * allNFTs[_tokenId].streamRate;
        // _newStreamAmount as an uint256 value can never be negative
        uint256 _newStreamAmount = 0;
        if(_alreadyStreamedAmount <= allNFTs[_tokenId].streamAmount) {
            _newStreamAmount = allNFTs[_tokenId].streamAmount - _alreadyStreamedAmount;
        }
        allNFTs[_tokenId].streamAmount = _newStreamAmount;
        host.callAgreement(cfa, abi.encodeWithSelector(cfa.deleteFlow.selector, allNFTs[_tokenId].streamToken, address(this), allNFTs[_tokenId].streamReceiver, new bytes(0)), "0x");
        return true;
    }

    function withdraw(uint256 _tokenId) public returns(bool) {
        require(allNFTs[_tokenId].isStopped == true, "Stream is not stopped yet");
        require(msg.sender == operator, "You are not allowed to withdraw");
        uint256 balance = allNFTs[_tokenId].streamAmount + allNFTs[_tokenId].securityAmount;
        allNFTs[_tokenId].streamAmount = 0;
        allNFTs[_tokenId].securityAmount = 0;
        ISuperToken(allNFTs[_tokenId].streamToken).transfer(msg.sender, balance);
        return true;
    }

    function fundNFT(uint256 _tokenId, address _streamToken, uint256 _fundAmount) public {
        require(allNFTs[_tokenId].streamToken == _streamToken, "You can only fund the token that is already streamed");
        //get the supertoken out of the senders pocket and store the balance in the mapping
        require(ISuperToken(_streamToken).balanceOf(msg.sender) > _fundAmount, "Not enough funds in your wallet");
        ISuperToken(_streamToken).transferFrom(msg.sender, address(this), _fundAmount); 
        
        //adding the investor to the nft
        allNFTs[_tokenId].investors.push(msg.sender);
        //adding the fundingamount to the nft
        allNFTs[_tokenId].streamAmount = allNFTs[_tokenId].streamAmount + _fundAmount;
        allNFTs[_tokenId].originalStreamAmount = allNFTs[_tokenId].originalStreamAmount + _fundAmount;
        //add investor to the accounting
        nftAccounting[_tokenId][msg.sender] = nftAccounting[_tokenId][msg.sender] + _fundAmount;
        //calculating 
        //update stream
        //host.callAgreement(cfa, abi.encodeWithSelector(cfa.updateFlow.selector, allNFTs[_tokenId].streamToken, allNFTs[_tokenId].streamReceiver, allNFTs[_tokenId].streamRate, new bytes(0)), "0x");
    }

    //now I will insert a nice little hook in the _transfer, including the RedirectAll function I need
    function _beforeTokenTransfer(address from, address to, uint256 _tokenId) internal override {
        // should not be called if the nft is minted
        if(from != address(0)) {
            (,int96 outFlowRate,,) = cfa.getFlow(ISuperToken(allNFTs[_tokenId].streamToken), address(this), allNFTs[_tokenId].streamReceiver);
            if(outFlowRate > 0) {
                stopFlow(_tokenId);
                allNFTs[_tokenId].streamReceiver = to;
                allNFTs[_tokenId].isStopped = false;
                host.callAgreement(cfa, abi.encodeWithSelector(cfa.createFlow.selector, allNFTs[_tokenId].streamToken, allNFTs[_tokenId].streamReceiver, allNFTs[_tokenId].streamRate, new bytes(0)), "0x");
            }
            else {
              allNFTs[_tokenId].streamReceiver = to;
              allNFTs[_tokenId].isStopped = false;
              host.callAgreement(cfa, abi.encodeWithSelector(cfa.createFlow.selector, allNFTs[_tokenId].streamToken, allNFTs[_tokenId].streamReceiver, allNFTs[_tokenId].streamRate, new bytes(0)), "0x");
            }
        }
    }
}