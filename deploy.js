import solc from "solc";
import fs from "fs";
import path from "path";
import { privateKey } from "./accounts/accounts.js";
import { Helper } from "./src/utils/helper.js";
import input from "input";
import { RPC } from "./src/core/network/rpc.js";
import { ethers } from "ethers";

const basePath = "src/core/deployer";
const provider = new ethers.JsonRpcProvider(RPC.RPCURL, RPC.CHAINID);
async function compileContract() {
  console.log("Compiling Contract...");
  const contractPath = path.resolve(basePath, "YourToken.sol");
  const contractSource = fs.readFileSync(contractPath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      ["YourToken.sol"]: {
        content: contractSource,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
  const contract = compiledContract.contracts["YourToken.sol"];
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
  initialSupply
) {
  console.log(`Deploying Contract...`);
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const initialSupplyBigNumber = ethers.parseUnits(initialSupply, 18);
  const contract = await factory.deploy(name, symbol, initialSupplyBigNumber);
  const result = await contract.deploymentTransaction().wait();

  console.log(`Contract Deployed`);
  console.log(`Contract Hash: ${RPC.EXPLORER}tx/${result.hash}`);
  console.log(`Contract Address: ${result.contractAddress}`);
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
      wallet = new ethers.Wallet.fromPhrase(data, provider);
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
