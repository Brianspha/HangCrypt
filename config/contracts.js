require("dotenv").config({
  path: "config/Infura/config.env",
  encoding: "utf8"
})
module.exports = {
  // default applies to all environments
  default: {
    // Blockchain node to deploy the contracts
    deployment: {
      host: "localhost", // Host of the blockchain node
      port: 8546, // Port of the blockchain node
      type: "ws" // Type of connection (ws or rpc),
      // Accounts to use instead of the default account to populate your wallet
      // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
      /*,accounts: [
        {
          privateKey: "your_private_key",
          balance: "5 ether"  // You can set the balance of the account in the dev environment
                              // Balances are in Wei, but you can specify the unit with its name
        },
        {
          privateKeyFile: "path/to/file", // Either a keystore or a list of keys, separated by , or ;
          password: "passwordForTheKeystore" // Needed to decrypt the keystore file
        },
        {
          mnemonic: "12 word mnemonic",
          addressIndex: "0", // Optional. The index to start getting the address
          numAddresses: "1", // Optional. The number of addresses to get
          hdpath: "m/44'/60'/0'/0/" // Optional. HD derivation path
        },
        {
          "nodeAccounts": true // Uses the Ethereum node's accounts
        }
      ]*/
    },
    // order of connections the dapp should connect to
    dappConnection: [
      "$WEB3", // uses pre existing web3 object if available (e.g in Mist)
      "ws://localhost:8546",
      "http://localhost:8545"
    ],

    // Automatically call `ethereum.enable` if true.
    // If false, the following code must run before sending any transaction: `await EmbarkJS.enableEthereum();`
    // Default value is true.
    // dappAutoEnable: true,

    gas: "auto",

    // Strategy for the deployment of the contracts:
    // - implicit will try to deploy all the contracts located inside the contracts directory
    //            or the directory configured for the location of the contracts. This is default one
    //            when not specified
    // - explicit will only attempt to deploy the contracts that are explicitly specified inside the
    //            contracts section.
    //strategy: 'implicit',

    contracts: {
      // example:
      //SimpleStorage: {
      //  args: [ 100 ]
      //}
    }
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
    dappConnection: [
      "ws://localhost:8546",
      "http://localhost:8545",
      "$WEB3" // uses pre existing web3 object if available (e.g in Mist)
    ]
  },

  // merges with the settings in default
  // used with "embark run privatenet"
  privatenet: {},

  // merges with the settings in default
  // used with "embark run testnet"
  testnet: {},

  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {},
  chain: {
    gas: "8000000",
    deployment: {
      type: "ws",
      protocol: "ws",
      port: "12000",
      host: "localhost"
    },
    contracts: {
      HangToken: {
        args: [
          "HangToken",
          "HTK",
          18,
          1000000000
        ]
      },
      HangCrypt: {
        args: [
          "$HangToken" //@dev address of theb ERC20Detailed depolyed using the NFTManager
        ]
      }
    }
  },
  infura: {
    deployment: {
      host: process.env.ROPSTEN,
      port: false,
      protocol: 'https',
      type: "rpc",
      accounts: [{
        mnemonic: process.env.MNEUMONIC,
        addressIndex: "0", // Optional. The index to start getting the address
        numAddresses: "10"
      }]
    },
    gas: "8000000",
    contracts: {
      HangToken: {
        args: [
          "HangToken",
          "HTK",
          18,
          2000000000
        ],
        gasPrice:300
      },
      HangCrypt: {
        args: [
          "$HangToken" //@dev address of theb ERC20Detailed depolyed using the NFTManager
        ],
        gasPrice:300
      }
    }
  }
  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  //custom_name: {
  //}
};