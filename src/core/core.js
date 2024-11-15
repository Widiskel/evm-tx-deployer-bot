import { ethers } from "ethers";
import { privateKey } from "../../accounts/accounts.js";
import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { RPC } from "./network/rpc.js";
import { WETH } from "./contract/weth.js";
import { Config } from "../../config/config.js";
import sqlite from "./db/sqlite.js";
import { DEPLOYEDTOKEN } from "./contract/deployed_token.js";

export default class Core {
  constructor(acc) {
    this.acc = acc;
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
      let wethContract;
      let wethBalance;
      if (WETH.CONTRACTADDRESS) {
        wethContract = new ethers.Contract(
          WETH.CONTRACTADDRESS,
          WETH.ABI,
          this.provider
        );
        wethBalance = ethers.formatEther(
          await wethContract.balanceOf(this.address)
        );
        this.tokenSymbol = await wethContract.symbol();
      }
      this.balance = {
        ETH: ethBalance,
        WETH: wethContract ? wethBalance : "-",
      };
      await Helper.delay(500, this.acc, `Balance updated`, this);
    } catch (error) {
      throw error;
    }
  }
  async deposit() {
    try {
      await Helper.delay(
        500,
        this.acc,
        `Try To Wrap ${RPC.SYMBOL} to ${this.tokenSymbol}`,
        this
      );

      const wethContract = new ethers.Contract(
        WETH.CONTRACTADDRESS,
        WETH.ABI,
        this.wallet
      );
      const amountInWei = ethers.parseEther(
        Helper.randomFloat(Config.TXAMOUNTMIN, Config.TXAMOUNTMAX).toString()
      );
      const data = wethContract.interface.encodeFunctionData("deposit");
      const nonce = await this.getOptimalNonce();
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
        gasPrice: ethers.parseUnits(Config.GWEIPRICE.toString(), "gwei"),
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
      await Helper.delay(
        500,
        this.acc,
        `Trying to Unwrap ${this.tokenSymbol} to ${RPC.SYMBOL}`,
        this
      );

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

      const nonce = await this.getOptimalNonce();
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
        gasPrice: ethers.parseUnits(Config.GWEIPRICE.toString(), "gwei"),
        nonce: nonce,
        data: data,
      };

      await this.executeTx(tx);
    } catch (error) {
      throw error;
    }
  }

  async rawTx() {
    try {
      await Helper.delay(
        500,
        this.acc,
        `Try To Executing RAW Transaction`,
        this
      );

      const amountInWei = ethers.parseEther(
        Helper.randomFloat(Config.TXAMOUNTMIN, Config.TXAMOUNTMAX).toString()
      );
      const data = Config.RAWTX.RAWDATA;
      const nonce = await this.getOptimalNonce();
      const gasLimit = await this.estimateGasWithRetry(
        Config.RAWTX.CONTRACTTOINTERACT,
        amountInWei,
        data,
        3,
        1000
      );

      const tx = {
        to: Config.RAWTX.CONTRACTTOINTERACT,
        value: amountInWei,
        gasLimit,
        gasPrice: ethers.parseUnits(Config.GWEIPRICE.toString(), "gwei"),
        nonce: nonce,
        data: data,
      };

      await this.executeTx(tx);
    } catch (error) {
      throw error;
    }
  }

  async transfer() {
    const amount = Helper.randomFloat(Config.TXAMOUNTMIN, Config.TXAMOUNTMAX);
    try {
      await Helper.delay(
        1000,
        this.acc,
        `Trying to transfer ${amount}${RPC.SYMBOL} to ${this.address}`,
        this
      );
      const nonce = await this.getOptimalNonce();

      let tx;
      if (DEPLOYEDTOKEN.CONTRACTADDRESS) {
        const tokenContract = new ethers.Contract(
          DEPLOYEDTOKEN.CONTRACTADDRESS,
          DEPLOYEDTOKEN.ABI,
          this.wallet
        );
        const allowance = await tokenContract.allowance(
          this.address,
          DEPLOYEDTOKEN.CONTRACTADDRESS
        );
        if (allowance == 0) {
          await Helper.delay(1000, this.acc, `Approving Token Spend`, this);
          const approval = await tokenContract.approve(
            DEPLOYEDTOKEN.CONTRACTADDRESS,
            ethers.MaxUint256
          );
          await approval.wait();
          await Helper.delay(1000, this.acc, `Token Approved`, this);
        }
        const data = await tokenContract.transfer.populateTransaction(
          this.address,
          ethers.parseEther(amount.toString())
        );
        const gasLimit = await this.estimateGasWithRetry(
          data.to,
          0,
          data.data,
          3,
          1000
        );

        tx = {
          to: data.to,
          nonce,
          data: data.data,
          gasLimit,
          gasPrice: ethers.parseUnits(Config.GWEIPRICE.toString(), "gwei"),
        };
      } else {
        const fee = await this.provider.estimateGas({
          to: this.address,
        });
        tx = {
          to: this.address,
          value: ethers.parseEther(amount.toString()),
          nonce,
          gasLimit: fee,
          gasPrice: ethers.parseUnits(Config.GWEIPRICE.toString(), "gwei"),
        };
      }

      await this.executeTx(tx);
    } catch (error) {
      throw error;
    }
  }

  async executeTx(tx) {
    try {
      logger.info(`TX DATA ${JSON.stringify(Helper.serializeBigInt(tx))}`);
      await Helper.delay(500, this.acc, `Executing TX...`, this);
      const txRes = await this.wallet.sendTransaction(tx);
      if (Config.WAITFORBLOCKCONFIRMATION) {
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
      } else {
        await Helper.delay(500, this.acc, `Tx Executed...`, this);
        await Helper.delay(
          5000,
          this.acc,
          `Tx Executed \n${RPC.EXPLORER}tx/${txRes.hash}`,
          this
        );
      }

      await this.getBalance(true);
    } catch (error) {
      if (error.message.includes("504")) {
        await Helper.delay(5000, this.acc, error.message, this);
      } else {
        throw error;
      }
    }
  }

  async getOptimalNonce() {
    try {
      const latestNonce = await this.provider.getTransactionCount(
        this.wallet.address,
        "latest"
      );
      const pendingNonce = await this.provider.getTransactionCount(
        this.wallet.address,
        "pending"
      );
      const optimalNonce =
        pendingNonce > latestNonce ? pendingNonce : latestNonce;
      return optimalNonce;
    } catch (error) {
      throw error;
    }
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
        console.log(gasLimit);
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
