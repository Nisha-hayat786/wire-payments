import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";


const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    wirefluid: {
      url: "https://evm.wirefluid.com",
      chainId: 92533,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      wirefluid: "empty",
    },
    customChains: [
      {
        network: "wirefluid",
        chainId: 92533,
        urls: {
          apiURL: "https://wirefluidscan.com/api",
          browserURL: "https://wirefluidscan.com",
        },
      },
    ],
  },

};

export default config;
