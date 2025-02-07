# EVM TX & DEPLOYER BOT
The Evm Testnet Bot is a powerful tool designed for interacting with EVM-compatible networks. This bot automates transaction processes, enabling users to perform actions such as ETH to WETH swap interactions seamlessly and daily. Additionally, it provides a built-in smart contract deployment feature, making it an ideal solution for you to do your testnet airdrop.

## Table Of Contents
- [EVM TX \& DEPLOYER BOT](#evm-tx--deployer-bot)
  - [Table Of Contents](#table-of-contents)
  - [Prerequisite](#prerequisite)
  - [Join My Telegram Channel](#join-my-telegram-channel)
  - [BOT FEATURE](#bot-feature)
  - [Setup \& Configure BOT](#setup--configure-bot)
    - [Linux](#linux)
    - [Windows](#windows)
  - [Update Bot](#update-bot)
  - [IMPORTANT NOTE (READ IT THIS IS NOT DECORATION)](#important-note-read-it-this-is-not-decoration)
  - [UNDERSTANDING CONFIG](#understanding-config)
  - [Config Template File](#config-template-file)
  - [Example Config](#example-config)
  - [CONTRIBUTE](#contribute)
  - [SUPPORT](#support)

## Prerequisite
- Git
- Node JS (v22)

## Join My Telegram Channel
```
                                                          
                      ...                                 
                     .;:.                                 
                    .;ol,.                                
                   .;ooc:'                                
            ..    .;ooccc:'.    ..                        
          .',....'cdxlccccc;.....,'.                      
         .;;..'';clolccccccc:,''..;;.                     
        ':c'..':cccccccccccccc;...'c:.                    
       ':cc,.'ccccccccccccccccc:..;cc:'                   
    ...:cc;.':cccccccccccccccccc:..:cc:...                
   .;';cc;.':;;:cccccccccccccc:;;;'.;cc,,;.               
  .cc':c:.',.....;cccccccccc;.....,..:c:'c:               
  ,x:'cc;.,'     .':cccccc:'.     ',.;cc':x'              
  lO,'cc;.;,       .;cccc:.       ,;.;cc';0l              
 .o0;.;c;.,:'......',''''''......':,.;c;.:0l.             
 .lxl,.;,..;c::::;:,.    .,:;::::c;..,;.,oxl.             
 .lkxOl..  ..'..;::'..''..'::;..'..  ..c0xkl.             
  .cKMx.        .;c:;:cc:;:c:.        .xMKc.              
    ;KX:         ;o::l:;cc;o:.        ;KK;                
     :KK:.       ,d,cd,'ol'o:       .:0K:                 
      ;0NOl:;:loo;. ... .. .;ldlc::lkN0:                  
       .lONNNKOx0Xd,;;'.,:,lKKkk0XNN0o.                   
         .','.. .lX0doooodOXd.  .','.                     
                 .,okkddxkd;.                             
                    'oxxd;.                               
   ........................................                              
   .OWo  xNd lox  xxl Ald   xoc dakkkkkxsx.              
   .OWo  o0W cXW  dM0 MMN   lNK laddKMNkso.               
   .kMKoxsNN oWX  dW0 MMMWO lWK    axM0   .                
   .OMWXNaMX dM0  kM0 MMKxNXKW0    axMk   .                 
   .OMk  dWK oWX XWdx Mxx  XMMO    akMx   .                 
   'OWo  dM0 'kNNXNNd DMD   OWk    aoWd   .                 
   ........................................

```           
                                              
                                              

Anyway i create new telegram channel just for sharing bot or airdrop, join here
[**https://t.me/skeldrophunt**](https://t.me/skeldrophunt).


## BOT FEATURE
- Multi Account 
- Support PK & SEED
- Auto TX Daily (Wrap Unwrap ETH)
- Auto TX Daily With RAW TX DATA
- Auto TX Daily (SELF TRANSFER)
- Deploy Smart Contract


## Setup & Configure BOT

### Linux
1. Clone project repo
   ```
   git clone https://github.com/Widiskel/evm-tx-deployer-bot.git && cd evm-tx-deployer-bot
   ```
2. Run
   ```
   npm install
   ```
3. Run
   ```
   cp -r accounts/accounts_tmp.js accounts/accounts.js && cp -r config/config_tmp.js config/config.js
   ```
4. Configure your accounts
   ```
   nano accounts/accounts.js
   ```
5. Configure the bot config
    ```
   nano config/config.js
    ```
6. To run Auto TX
   ```
   npm run start
   ```
7. To run Contract Deployer
    ```
    npm run deploy
    ```
   
### Windows
1. Open your `Command Prompt` or `Power Shell`.
2. Clone project repo
   ```
   git clone https://github.com/Widiskel/evm-tx-deployer-bot.git
   ```
   and cd to project dir
   ```
   cd evm-tx-deployer-bot
   ```
3. Run 
   ```
   npm install
   ```
5. Navigate to `evm-tx-deployer-bot` directory. 
6. Navigate to `accounts` folder and rename `accounts_tmp.js` to `accounts.js`.
7. Now open `acccounts.js` and setup your accounts. 
8. Now Back to `evm-tx-deployer-bot` directory and Navigate to `config` and rename `config_tmp.js` to `config.js` adjust the `config.js` as needed.
9.  Back to `evm-tx-deployer-bot` directory.
10. To start the app open your `Command Prompt` or `Power Shell`
11. To run auto Tx Bot
    ```
    npm run start
    ```
12. To run Smart Contract Deployer
    ```
    npm run deploy
    ```

## Update Bot

To update bot follow this step :
1. run
   ```
   git pull
   ```
   or
   ```
   git pull --rebase
   ```
   if error run
   ```
   git stash && git pull
   ```
2. run
   ```
   npm update
   ```
3. start the bot
4. if any eror happen check `log/app.log`


## IMPORTANT NOTE (READ IT THIS IS NOT DECORATION)
DWYOR & Always use a new wallet when running the bot, I am not responsible for any loss of assets.

If any error regarding SQL, try to delete `database.db` first


## UNDERSTANDING CONFIG
Config `config.js` file is a configuration file for this bot, it contains this kinds of parameter

## Config Template File
config template file is on `config_tmp.js`
```js
export class Config {
  static GWEIPRICE = 0.15; //GWEI PRICE
  static WAITFORBLOCKCONFIRMATION = true; //IF TRUE AFTER TX EXECUTED BOT WILL WAIT TX TO BE MINED FIRST, IF FALSE AFTER TX EXECUTED BOT WILL CONTINUE TO NEXT TX
  static TXAMOUNTMIN = 0.0001; //TX AMOUNT MIN
  static TXAMOUNTMAX = 0.001; //TX AMOUNT MAX

  //WRAP UNWRAP SECTION
  static USEWRAPUNWRAP = false; //IF TRUE THE BOT WILL EXECUTE WRAP UNWRAP TX
  static WRAPUNWRAPCOUNT = 10; //1 WRAPUNWRAPCOUNT = 2x TX (Wrap / Unwrap) OR (SWAP ETH TO WETH AND SWAP BACK)
  static WETHCONTRACTADDRESS = undefined; //WETH SMART CONTRACT ADDRESS EX: "0x"

  //RAW TX SECTION
  static USERAWTXDATA = false; //IF TRUE THE BOT WILL EXECUTE USE RAW TX
  static RAWTXCOUNT = 10; //COUNT OF RAW TX
  static RAWTXAMOUNT = 0; //RAW DATA TRANSACTION VALUE AMOUNT CHECK ON YOUR TRANSACTION EXPLORER > VALUE EX : 0 ANOTHER EX : 0.1
  static RAWTX = []; //RAW DATA FROM A TRANSACTION EX: ["0x0fxxxxxxxxforacc1","0x0fxxxxxxxxforacc2","0x0fxxxxxxxxforacc3"] BASED ON HOUW MANY OF YOUR ACCOUNTS, EACH ACCOUNT HAVE 1 RAW DATA, MAKE SURE THIS IS RAW DATA OF TRANSACTION THAT MATCH YOUR RAWTX AMOUNT
  static RAWTXCONTRACTADDRESS = undefined; //CONTRACT ADDRESS OF RAW TX

  //TRANSFER SECTION
  static USETRANSFER = true;
  static SELFTRANSFERCOUNT = 10; //TRANSFER NATIVE TOKEN TO YOUR SELF
  static OTHERUSERTRANSFERCOUNT = 0; //TRANSFER NATIVE TOKEN TO OTHER USER
  static OTHERUSERADDRESSLIST = []; //OTHER USER LIST ["0xuser1","0xuser2","0xuser3"] USER WILL RANDOMLY PICKED

  //INTERACTION WITH DEPLOYED CONTRACT SECTION
  static DEPLOYCONTRACTINTERACTION = false;
  static DEPLOYCONTRACTINTERACTIONCOUNT = 10;
  static DEPLOYCONTRACTADDRESS = undefined; //EX : "0x0000000000" MAKE SURE CONTRACT ALREADY VERIFIED

  //RPC PROVIDER SECTION
  static RPC = {
    CHAINID: undefined, //CHAIN ID EX: 123123
    RPCURL: undefined, //RPC URL EX : "https://xxx"
    EXPLORER: undefined, //BLOCK EXPLORER EX "https://explorer"
    SYMBOL: "ETH", //CURRENCY SYMBOL EX: "ETH"
  };
}

```
im already provide description for each parameter, hope you can understand.


## Example Config 
For refference i will provide my `config.js` file for Story Oddyssey Testnet
```js
export class Config {
  static GWEIPRICE = 25;
  static WAITFORBLOCKCONFIRMATION = true;
  static TXAMOUNTMIN = 0.0001;
  static TXAMOUNTMAX = 0.001;

  static USEWRAPUNWRAP = false;
  static WRAPUNWRAPCOUNT = 0;
  static WRAPPEDTOKENCONTRACTADDRESS = undefined;

  static USERAWTXDATA = true;
  static RAWTXCOUNT = 10;
  static RAWTX = [
    "0x773acdef0000000000000000000000000000000000000000000000000000000000000001",
  ];
  static RAWTXAMOUNT = 0;
  static RAWTXCONTRACTADDRESS = "0x2ADb4Da762E8Ad3Ebf050cEe0DaEF23d0f3C1Ed2";

  static USETRANSFER = true;
  static SELFTRANSFERCOUNT = 10;
  static OTHERUSERTRANSFERCOUNT = 0;
  static OTHERUSERADDRESSLIST = [];

  static DEPLOYCONTRACTINTERACTION = true;
  static DEPLOYCONTRACTINTERACTIONCOUNT = 10;
  static DEPLOYCONTRACTADDRESS = "0x2ADb4Da762E8Ad3Ebf050cEe0DaEF23d0f3C1Ed2";

  static RPC = {
    CHAINID: 1516,
    RPCURL: "https://odyssey-evm.spidernode.net", 
    EXPLORER: "https://odyssey-testnet-explorer.storyscan.xyz/",
    SYMBOL: "IP",
  };
}
```
Explanation :
| Parameter                         | Description |
|------------------------------------|-------------|
| **GWEIPRICE**                      | Gas price used for transactions, measured in Eth. Example: `25` it will converted to gwei later. |
| **WAITFORBLOCKCONFIRMATION**       | Whether to wait for block confirmation after executing a transaction. Example: `true`. |
| **TXAMOUNTMIN**                     | Minimum transaction amount in ETH. Example: `0.0001`. |
| **TXAMOUNTMAX**                     | Maximum transaction amount in ETH. Example: `0.001`. |
| **USEWRAPUNWRAP**                   | Whether to use the wrap/unwrap feature for tokens. Example: `false`. |
| **WRAPUNWRAPCOUNT**                 | Number of wrap/unwrap operations to perform. Example: `0`. |
| **WRAPPEDTOKENCONTRACTADDRESS**     | Address of the wrapped token contract. Example: `undefined`. |
| **USERAWTXDATA**                    | Whether to use raw transaction data. Example: `true`. |
| **RAWTXCOUNT**                      | Number of raw transactions to send. Example: `10`. |
| **RAWTX**                            | List of raw transaction data in hex format. Example: `["0x773acdef0000000000000000000000000000000000000000000000000000000000000001"]`. |
| **RAWTXAMOUNT**                      | Amount to send in raw transactions. Example: `0`. |
| **RAWTXCONTRACTADDRESS**             | Contract address for raw transactions. Example: `"0x2ADb4Da762E8Ad3Ebf050cEe0DaEF23d0f3C1Ed2"`. |
| **USETRANSFER**                      | Whether to enable self or other user transfers. Example: `true`. |
| **SELFTRANSFERCOUNT**                | Number of self-transfers to perform. Example: `10`. |
| **OTHERUSERTRANSFERCOUNT**           | Number of transfers to other users. Example: `0`. |
| **OTHERUSERADDRESSLIST**             | List of addresses for transferring funds. Example: `[]` (empty array). |
| **DEPLOYCONTRACTINTERACTION**        | Whether to interact with a deployed contract. Example: `true`. |
| **DEPLOYCONTRACTINTERACTIONCOUNT**   | Number of interactions with a deployed contract. Example: `10`. |
| **DEPLOYCONTRACTADDRESS**            | Address of the deployed contract to interact with. Example: `"0x2ADb4Da762E8Ad3Ebf050cEe0DaEF23d0f3C1Ed2"`. |
| **RPC.CHAINID**                      | The blockchain network ID. Example: `1516`. |
| **RPC.RPCURL**                       | The RPC URL used to connect to the blockchain. Example: `"https://odyssey-evm.spidernode.net"`. |
| **RPC.EXPLORER**                     | Block explorer URL for transaction tracking. Example: `"https://odyssey-testnet-explorer.storyscan.xyz/"`. |
| **RPC.SYMBOL**                       | The ticker symbol of the blockchain's native currency. Example: `"IP"`. |

what contract address is it ? that is contract address that i've deployed on story chain.

on the deployer contract i create function called ping just for interaction. so you can interact with your own deployed contract on this tool

## CONTRIBUTE

Feel free to fork and contribute adding more feature thanks.

## SUPPORT

want to support me for creating another bot ?
**star** my repo or buy me a coffee on

EVM : `0x1f0ea6e0b3590e1ab6c12ea0a24d3d0d9bf7707d`

SOLANA : `3tE3Hs7P2wuRyVxyMD7JSf8JTAmEekdNsQWqAnayE1CN`
