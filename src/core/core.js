import { ethers } from "ethers";
import { privateKey } from "../../accounts/accounts.js";
import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { RPC } from "./network/rpc.js";
import { WETH } from "./contract/weth.js";

export default class Core {
  constructor(acc) {
    this.acc = acc;
    this.txCount = 0;
    this.provider = new ethers.JsonRpcProvider(RPC.RPCURL, RPC.CHAINID);
  }

  async connectWallet() {
    try {
      const data = this.acc;
      const accIdx = privateKey.indexOf(this.acc);
      await Helper.delay(
        1000,
        this.acc,
        `Connecting to Account : ${accIdx + 1}`,
        this
      );
      const type = Helper.determineType(data);
      logger.info(`Account Type : ${type}`);
      if (type == "Secret Phrase") {
        /**
         * @type {Wallet}
         */
        this.wallet = new ethers.Wallet.fromPhrase(data, this.provider);
      } else if (type == "Private Key") {
        /**
         * @type {Wallet}
         */
        this.wallet = new ethers.Wallet(data.trim(), this.provider);
      } else {
        throw Error("Invalid account Secret Phrase or Private Key");
      }
      this.address = this.wallet.address;
      await Helper.delay(
        1000,
        this.acc,
        `Wallet connected ${JSON.stringify(this.wallet.address)}`,
        this
      );
    } catch (error) {
      throw error;
    }
  }

  async getBalance(update = false) {
    try {
      if (!update) {
        await Helper.delay(
          500,
          this.acc,
          `Getting Wallet Balance of ${this.wallet.address}`,
          this
        );
      }

      const ethBalance = ethers.formatEther(
        await this.provider.getBalance(this.wallet.address)
      );
      const wethContract = new ethers.Contract(
        WETH.CONTRACTADDRESS,
        WETH.ABI,
        this.provider
      );
      const wethBalance = ethers.formatEther(
        await wethContract.balanceOf(this.address)
      );
      this.balance = {
        ETH: ethBalance,
        WETH: wethBalance,
      };
      await Helper.delay(500, this.acc, `Balance updated`, this);
    } catch (error) {
      throw error;
    }
  }
  async deposit() {
    try {
      await Helper.delay(500, this.acc, `Try To Wrap ETH to WETH`, this);

      const wethContract = new ethers.Contract(
        WETH.CONTRACTADDRESS,
        WETH.ABI,
        this.wallet
      );
      const amountInWei = ethers.parseEther(
        Helper.randomFloat(0.0001, 0.001).toString()
      );
      const data = wethContract.interface.encodeFunctionData("deposit");
      const nonce = await this.provider.getTransactionCount(
        this.wallet.address,
        "latest"
      );
      const gasLimit = await this.estimateGasWithRetry(
        WETH.CONTRACTADDRESS,
        amountInWei,
        data,
        3,
        1000
      );

      const tx = {
        to: WETH.CONTRACTADDRESS,
        value: amountInWei,
        gasLimit,
        gasPrice: ethers.parseUnits("0.15", "gwei"),
        nonce: nonce,
        data: data,
      };

      await this.executeTx(tx);
    } catch (error) {
      throw error;
    }
  }
  async withdraw() {
    try {
      await Helper.delay(500, this.acc, `Trying to Withdraw WETH to ETH`, this);

      const wethContract = new ethers.Contract(
        WETH.CONTRACTADDRESS,
        WETH.ABI,
        this.wallet
      );

      const wethBalance = await wethContract.balanceOf(this.wallet.address);
      const amountInWei = wethBalance;
      const amountInEth = ethers.formatEther(amountInWei);
      logger.info(`Unwrapping ${amountInEth} WETH To ETH`);

      const data = wethContract.interface.encodeFunctionData("withdraw", [
        amountInWei,
      ]);
      // console.log(data);
      const nonce = await this.provider.getTransactionCount(
        this.wallet.address,
        "latest"
      );
      const gasLimit = await this.estimateGasWithRetry(
        WETH.CONTRACTADDRESS,
        0,
        data,
        3,
        1000
      );

      const tx = {
        to: WETH.CONTRACTADDRESS,
        value: 0,
        gasLimit,
        gasPrice: ethers.parseUnits("0.15", "gwei"),
        nonce: nonce,
        data: data,
      };

      await this.executeTx(tx);
    } catch (error) {
      throw error;
    }
  }

  async executeTx(tx) {
    logger.info(`TX DATA ${JSON.stringify(Helper.serializeBigInt(tx))}`);
    await Helper.delay(500, this.acc, `Executing TX...`, this);
    const txRes = await this.wallet.sendTransaction(tx);
    await Helper.delay(
      500,
      this.acc,
      `Tx Executed Waiting For Block Confirmation...`,
      this
    );
    const txRev = await txRes.wait();
    logger.info(`Tx Confirmed and Finalizing: ${JSON.stringify(txRev)}`);
    await Helper.delay(
      5000,
      this.acc,
      `Tx Executed \n${RPC.EXPLORER}tx/${txRev.hash}`,
      this
    );
    await this.getBalance(true);
  }

  async estimateGasWithRetry(
    address,
    amount,
    rawdata,
    retries = 3,
    delay = 3000
  ) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        logger.info(`Estimating Gas for ${rawdata} TX`);
        const gasLimit = await this.provider.estimateGas({
          from: this.wallet.address,
          to: address,
          value: amount,
          data: rawdata,
        });
        return gasLimit;
      } catch (err) {
        await Helper.delay(
          delay,
          this.acc,
          `${err.shortMessage}... Attempt ${attempt + 1} of ${retries}`,
          this
        );
        if (attempt === retries - 1) {
          throw Error(`Failed to estimate gas after ${retries} attempts.`);
        }
      }
    }
  }
}