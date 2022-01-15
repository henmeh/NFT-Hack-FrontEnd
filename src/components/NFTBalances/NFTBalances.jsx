import React, { useState } from "react";
import { useMoralis, useMoralisCloudFunction } from "react-moralis";
import { Modal, Input, Skeleton } from "antd";
import { Moralis } from "moralis";
import { CrowdfundingNFTAddress } from "../../helpers/contractABI";
import NFTBalance from "./NFTBalance";

Moralis.start({
  serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
  appId: process.env.REACT_APP_MORALIS_APPLICATION_ID,
});

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "center",
    margin: "0 auto",
    //maxWidth: "1000px",
    width: "100%",
    gap: "10px",
    //backgroundColor: "red"
  },
};

function NFTBalances() {
  const { Moralis, user } = useMoralis();
  const walletAddress = user ? user.attributes.ethAddress : null;
  const { data, error, isLoading } = useMoralisCloudFunction(
    "getMyCrowdfundingNFTs",
    { CrowdfundingNFTAddress, walletAddress },
    [],
    { live: true }
  );
  
  return (
      <div style={styles.NFTs}>
        <Skeleton loading={!data}>
          {data &&
            data.result.map((nft, index) => {
                return (
                  <NFTBalance nft={nft} index={index} key={nft.id} />
                );
              }
            )}
        </Skeleton>
      </div>
  );
}

export default NFTBalances;
