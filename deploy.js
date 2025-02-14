import solc from "solc";
import fs from "fs";
import path from "path";
import { privateKey } from "./accounts/accounts.js";
import { Helper } from "./src/utils/helper.js";
import input from "input";
import { RPC } from "./src/core/network/rpc.js";
import { ethers } from "ethers";
import { DeployerConfig } from "./config/deployer_config.js";

const basePath = "src/core/deployer";
const provider = new ethers.JsonRpcProvider(RPC.RPCURL, RPC.CHAINID);
const maxError = 5;
let currentError = 0;
async function compileContract() {
  console.log("Compiling Contract...");
  const contractPath = path.resolve(basePath, "SkelDropHuntToken.sol");
  const contractSource = fs.readFileSync(contractPath, "utf8");
  console.log("Contract path :", contractPath);
  const input = {
    language: "Solidity",
    sources: {
      ["SkelDropHuntToken.sol"]: {
        content: contractSource,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion:
        DeployerConfig.EVMVERSION != "default"
          ? DeployerConfig.EVMVERSION
          : undefined,
    },
  };

  const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
  const contract = compiledContract.contracts["SkelDropHuntToken.sol"];
  const contractName = Object.keys(contract)[0];
  const abi = contract[contractName].abi;
  const bytecode = contract[contractName].evm.bytecode.object;

  const abiPath = path.resolve(
    `${basePath}/artifacts`,
    `${contractName}.abi.json`
  );
  const bytecodePath = path.resolve(
    `${basePath}/artifacts`,
    `${contractName}.bytecode.txt`
  );

  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  fs.writeFileSync(bytecodePath, bytecode);

  console.log(`Contract ${contractName} Compiled successfully!`);
  console.log(`ABI saved to: ${abiPath}`);
  console.log(`Bytecode saved to: ${bytecodePath}`);

  return { abi, bytecode };
}

async function deployContract(
  wallet,
  abi,
  bytecode,
  name,
  symbol,
  initialSupply,
  gas
) {
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const initialSupplyBigNumber = ethers.parseUnits(initialSupply, 18);
  console.log(
    `Deploying Contract...
    
  Name : ${name}
  Symbol : ${symbol}
  Supply : ${initialSupplyBigNumber}
`
  );

  try {
    if (!gas) {
      gas = BigInt(DeployerConfig.GASLIMIT);
    } else {
      gas = gas + BigInt(DeployerConfig.GASLIMIT);
    }
    const fee = await provider.getFeeData();
    const customGasPrice = ethers.parseUnits(
      DeployerConfig.GWEIPRICE.toString(),
      "gwei"
    );
    const gasPrice =
      fee.gasPrice > customGasPrice ? fee.gasPrice : customGasPrice;
    console.log("Deploying using gasLimit : ", gas);
    console.log("Deploying using gasPrice : ", gasPrice);

    const contract = await factory.deploy(
      name,
      symbol,
      initialSupplyBigNumber,
      {
        gasLimit: gas,
        gasPrice: gasPrice,
      }
    );
    await confirmDeployment(contract);
  } catch (error) {
    console.warn(
      `Deployment attempt failed, ${
        currentError != maxError ? "Retrying" : "Max Error Reached"
      }`
    );
    console.error(error.message);
    if (currentError != maxError) {
      currentError += 1;
      await deployContract(
        wallet,
        abi,
        bytecode,
        name,
        symbol,
        initialSupply,
        gas
      );
    }
  }
}

async function confirmDeployment(contract) {
  console.log(
    `Contract Deployment Tx Sent: ${RPC.EXPLORER}tx/${
      contract.deploymentTransaction().hash
    }, Waiting for Block Confirmation`
  );
  const result = await contract.deploymentTransaction().wait();
  console.log(`\nContract Adress: ${result.contractAddress}`);
  console.log(
    `Contract Address On Explorer : ${RPC.EXPLORER}address/${result.contractAddress}`
  );
  console.log(
    `Please Verify Your Contract Using This Detail : 

Contract Verification Link : ${RPC.EXPLORER}address/${result.contractAddress}/contract-verification
Contract License : MIT License (MIT)
Verification methid (Compiler Type) : Solidity (Single File)
Compiler : v0.8.28
EVM Version : ${DeployerConfig.EVMVERSION}
Optimization Enabled : TRUE (200)
Contract Code : Copy Paste Everything from /src/core/deployer/SkelDropHuntToken.sol


Thanks for using our EVM TX DEPLOYER tool
Regards: Widiskel (Skel Drop Hunt)
`
  );
}

(async () => {
  try {
    console.log("Contract Deployer Bot");
    console.log();
    console.log("By : Widiskel");
    console.log("Follow On : https://github.com/Widiskel");
    console.log("Join Channel : https://t.me/skeldrophunt");
    console.log("Dont forget to run git pull to keep up to date");
    console.log();
    Helper.showSkelLogo();
    console.log();
    if (privateKey.length == 0)
      throw Error("Please input your account first on accounts.js file");

    let ctx = "Account List \n";
    for (const item of privateKey) {
      ctx += `${privateKey.indexOf(item) + 1}. Account ${
        privateKey.indexOf(item) + 1
      }\n`;
    }
    ctx += `\n \nSelect Account To Deploy Contract : `;
    const opt = await input.text(ctx);
    if (!privateKey[opt - 1]) throw Error(`Invalid Input`);

    const acc = privateKey[opt - 1];
    let wallet;
    const data = acc;
    const type = Helper.determineType(data);

    if (type == "Secret Phrase") {
      /**
       * @type {Wallet}
       */
      wallet = ethers.Wallet.fromPhrase(data, provider);
    } else if (type == "Private Key") {
      /**
       * @type {Wallet}
       */
      wallet = new ethers.Wallet(data.trim(), provider);
    } else {
      throw Error("Invalid account Secret Phrase or Private Key");
    }

    const name = await input.text("Enter token name: ");
    const symbol = await input.text("Enter token symbol: ");
    const initialSupply = await input.text("Enter initial supply: ");
    const { abi, bytecode } = await compileContract();
    await deployContract(wallet, abi, bytecode, name, symbol, initialSupply);
  } catch (error) {
    console.log("Error During executing bot", error);
  }
})();
