const CrowdfundingNFT = artifacts.require("CrowdfundingNFT");

module.exports = function (deployer) {
  deployer.deploy(CrowdfundingNFT, "0xe1f4f6E3ff3eFa235eaFf10aFf34f6a83Dd9357B");
};
