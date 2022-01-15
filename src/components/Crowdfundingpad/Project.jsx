import React, { useState, useEffect } from "react";
import { useMoralis, useMoralisCloudFunction } from "react-moralis";
import { Card, Image, Button, InputNumber, Menu, Form, Space, Dropdown } from "antd";
import { Moralis } from "moralis";
import { CrowdfundingNFTAddress, CrowdfundingNFTABI, SuperTokenFactoryAddress, ISuperTokenABI, SuperTokenFactoryABI, IERC20ABI } from "../../helpers/contractABI";
import { DateConverted } from "../../helpers/formatters";
import Projectfunding from "./Projectfunding";

Moralis.start({
  serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
  appId: process.env.REACT_APP_MORALIS_APPLICATION_ID,
});

function Project({ project, index }) {
  const { Moralis, user } = useMoralis();
  const walletAddress = user ? user.attributes.ethAddress : null;
  const [fundingTokenAmount, setFundingTokenAmount] = useState();
  const [fundingTokenName, setFundingTokenName] = useState("Choose a Token");
  const [fundingTokenAddress, setFundingTokenAddress] = useState();
  const [fundingTokenSymbol, setFundingTokenSymbol] = useState("");
  const [fundingTokenDecimals, setFundingTokenDecimals] = useState();
  const [transaction, setTransaction] = useState("");
  const { data, error } = useMoralisCloudFunction(
    "getTokenBalances",
    { walletAddress },
    [],
    { live: true }
  );

  let menu;
  if (data) {
    menu = (
      <Menu>
        {data.map((item, index) => (
          <Menu.Item key={index}>
            <Button
              type="text"
              onClick={() => {
                setFundingTokenAddress(item.token_address);
                setFundingTokenName(item.name);
                setFundingTokenDecimals(item.decimals);
                setFundingTokenSymbol(item.symbol);
              }}
            >
              {item.name}
            </Button>
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  const invest = async function () {
    //check if projecttoken is a superfluid token
    const superTokens = await Moralis.Cloud.run("getSuperTokens");
    //if project is not already funded with an nft the nft has to be minted
    //if(project.attributes.isFunded == false) {
      let _projectSuperTokenAddress;
      let _projectERC20TokenAddress;
      let _projectTokenName;
      let _projectTokenSymbol;
      let _isSupertoken;
      // calculating the streamrate
      const streamAmount = (parseFloat(fundingTokenAmount) * 10**parseFloat(fundingTokenDecimals));
      let streamRate;
      if (project.attributes.streamperiod === "days") {
        streamRate = Math.round(streamAmount / (project.attributes.streamduration * 24 * 60 * 60));
      }
      if (project.attributes.streamperiod === "weeks") {
        streamRate = Math.round(streamAmount / (project.attributes.streamduration * 7 * 24 * 60 * 60));
      }
      if (project.attributes.streamperiod === "months") {
        streamRate = Math.round(streamAmount / (project.attributes.streamduration * 30 * 24 * 60 * 60));
      }
      const securityAmount = streamRate * ( 60 * 60);
      //#1 fundingtoken is a supertoken
      if(superTokens.includes(fundingTokenAddress)) {
        _projectSuperTokenAddress = fundingTokenAddress;
        _projectERC20TokenAddress = fundingTokenAddress;
        _projectTokenName = fundingTokenName;
        _projectTokenSymbol = fundingTokenSymbol;
        _isSupertoken = 1;

        //allow the crowdfundingnft contract to handle my supertoken token
        const optionsApproveSuperToken = {
          contractAddress: _projectSuperTokenAddress,
          functionName: "approve",
          abi: ISuperTokenABI,
          params: {
            spender: CrowdfundingNFTAddress,
            amount: (streamAmount + securityAmount).toString(),
          },
        };
        await Moralis.executeFunction(optionsApproveSuperToken);
      }
      //#2 projecttoken is not a supertoken
      else {
        //deploy the wrapper
        _projectTokenName = "Super" + fundingTokenName;
        _projectTokenSymbol = fundingTokenSymbol + "x";
        _projectERC20TokenAddress = fundingTokenAddress;
        _isSupertoken = 2;

        const optionsWrapper = {
          contractAddress: SuperTokenFactoryAddress,
          functionName: "createERC20Wrapper",
          abi: SuperTokenFactoryABI,
          params: {
              underlyingToken: _projectERC20TokenAddress,
              upgradability: 1,
              name: _projectTokenName,
              symbol: _projectTokenSymbol,
          },
        };
        const createWrapper = await Moralis.executeFunction(optionsWrapper);
        _projectSuperTokenAddress = createWrapper.events.SuperTokenCreated.returnValues.token;

        //saving the address
        const Supertoken = Moralis.Object.extend("Superfluidtokens");
        const supertoken = new Supertoken();

        supertoken.set("tokenAddress", _projectSuperTokenAddress);
        await supertoken.save();

        //allow the magepad contract to handle my erc20 token
        const optionsApproveERC20 = {
          contractAddress: _projectERC20TokenAddress,
          functionName: "approve",
          abi: IERC20ABI,
          params: {
            spender: CrowdfundingNFTAddress,
            amount: (streamAmount + securityAmount).toString(),
          },
        };
        await Moralis.executeFunction(optionsApproveERC20);
      }
      const optionsMintNFT = {
        contractAddress: CrowdfundingNFTAddress,
        functionName: "mint",
        abi: CrowdfundingNFTABI, 
        params: {
          _isSupertoken: _isSupertoken,
          _streamAmount: streamAmount.toString(),
          _streamRate: streamRate.toString(),
          _streamToken: _projectSuperTokenAddress,
          _erc20TokenAddress: _projectERC20TokenAddress,
          _projectOwner: project.attributes.projectAddress,
        },
      };
      const tx = await Moralis.executeFunction(optionsMintNFT);
      setTransaction(tx);
      //putting the tokenId into our moralis db
      //fetching the tokenId from onChain
      const optionsTokenId = {
        contractAddress: CrowdfundingNFTAddress,
        functionName: "oldTokenId",
        abi: CrowdfundingNFTABI,
      };
      const _tokenId = await Moralis.executeFunction(optionsTokenId);
      const Project = Moralis.Object.extend("Crowdfundingrojects");
      const query = new Moralis.Query(Project);
      query.equalTo("objectId", project.id);
      const result = await query.first();
      let tokenIds = [];
      tokenIds = result.get("tokenId");
      tokenIds.push(_tokenId);
      result.set("tokenId", tokenIds);
      result.set("isFunded", true);
      result.set("initialFundingToken", _projectSuperTokenAddress);
      await result.save();
    //}
    //project is already funded
    /*else {
      //allow the crowdfundingnft contract to handle my supertoken token
      const optionsApproveSuperToken = {
        contractAddress: project.attributes.initialFundingToken,
        functionName: "approve",
        abi: ISuperTokenABI,
        params: {
          spender: CrowdfundingNFTAddress,
          amount: fundingTokenAmount.toString(),
        },
      };
      await Moralis.executeFunction(optionsApproveSuperToken);

      const optionsFundNFT = {
        contractAddress: CrowdfundingNFTAddress,
        functionName: "fundNFT",
        abi: CrowdfundingNFTABI, 
        params: {
          _tokenId: project.attributes.tokenId,
          _streamToken: project.attributes.initialFundingToken,
          _fundAmount: fundingTokenAmount.toString(),
        },
      };
      const tx = await Moralis.executeFunction(optionsFundNFT);
      setTransaction(tx);
    }*/
  }

  return (
      <Card
      hoverable
      bordered={true}
      style={{
        width: 500,
        backgroundColor: "transparent",
        padding: "10px",
        boxshadow: "20px 20px",
        borderRadius: "30px",
        borderColor: "black",
        color: "white",
      }}
      cover={
        <div style={{display: "flex", flexDirection:"row", justifyContent:"space-between"}}>
            <div style={{display: "flex", flexDirection:"column", color: "black"}}>
                <h2 style={{color: "black"}}>{"Projectname: " + project.attributes.name}</h2>
            </div>
            <Image
                width={100}
                height={100}
                style={{borderRadius: "50px"}}
                src={project.attributes.image._url} />
        </div>
      }
      //key={nft.id}
    >
        <div style={{display: "flex", flexDirection:"column", color: "black"}}>
            <p>Projectowner: {project.attributes.projectAddress}</p>
            <p>Project created at: {DateConverted(project.attributes.projectCreation)}</p>            
        </div>
        {project.attributes.isFunded == false ?
          <div style={{display: "flex", flexDirection:"column", color: "black"}}>
          <h3 style={{color: "black"}}>Fund project</h3>
          <div style={{display: "flex", justifyContent: "center", flexDirection:"column", gap: "5px"}}>
          <Form.Item
            //label={<h4 style={{ color: "white" }}>Fundingtoken</h4>}
            //rules={[{ required: true, message: 'Please select a token!' }]}
          >
            <Space wrap>
              <Dropdown.Button overlay={menu} placement="bottomCenter">
                {fundingTokenName}
              </Dropdown.Button>
            </Space>
          </Form.Item>
          <p style={{color: "black"}}> Tokenamount </p>
          <InputNumber defaultValue={0} onChange={(value) => setFundingTokenAmount(value)} />
          <Button
              onClick={invest}
              style={{
              color: "orange",
              backgroundColor: "blue",
              borderRadius: "15px",
              border: "0px",
              }}
          >
              Invest
          </Button>  
          </div>
          </div> : 
          <div style={{display: "flex", flexDirection:"column", color: "black"}}>
            {project.attributes.tokenId.map((tokenId, index) => (
              <Projectfunding tokenId={tokenId} key={index} />
            ))}
          <div style={{display: "flex", justifyContent: "center", flexDirection:"row", gap: "5px"}}>
            
            <div style={{display: "flex", justifyContent: "center", flexDirection:"column", gap: "5px"}}>
          <p style={{color: "black"}}> Tokenamount </p>
          <div style={{display: "flex", justifyContent: "center", flexDirection:"row", gap: "5px"}}>
          <InputNumber defaultValue={0} onChange={(value) => setFundingTokenAmount(value)} />
          <Dropdown.Button overlay={menu} placement="bottomCenter">
                {fundingTokenName}
              </Dropdown.Button>         
          </div>
          <Button
              onClick={invest}
              style={{
              color: "orange",
              backgroundColor: "blue",
              borderRadius: "15px",
              border: "0px",
              }}
          >
              Invest with a new NFT
          </Button> 
            </div>            
          </div>
          </div>
        
        }
    </Card>
  );
}

export default Project;

/*
<div style={{display: "flex", justifyContent: "center", flexDirection:"column", gap: "5px"}}>
            <p style={{color: "black"}}> Tokenamount </p>
          <InputNumber defaultValue={0} onChange={(value) => setFundingTokenAmount(value)} />
          <Button
              onClick={invest}
              style={{
              color: "black",
              backgroundColor: "blue",
              borderRadius: "15px",
              border: "0px",
              }}
          >
              Invest with the same NFT
          </Button>
            </div>

*/