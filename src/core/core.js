import { ethers } from "ethers";
import { privateKey } from "../../accounts/accounts.js";
import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { RPC } from "./network/rpc.js";
import { Config } from "../../config/config.js";
import { ERC20TOKEN } from "./contract/erc20_token.js";
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
        this.wallet = ethers.Wallet.fromPhrase(data, this.provider);
      } else if (type == "Private Key") {
        /**
         * @type {Wallet}
         */
        this.wallet = new ethers.Wallet(data.trim(), this.provider);
      } else {
        throw Error("Invalid account Secret Phrase or Private Key");
      }
      this.address = this.wallet.address;
      this.onchainCount = await this.provider.getTransactionCount(this.address);

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

      this.balance = {
        ETH: ethBalance,
      };

      await Helper.delay(500, this.acc, `Balance updated`, this);
    } catch (error) {
      throw error;
    }
  }
  async deposit() {
    try {
      await Helper.delay(500, this.acc, `Try To Wrap ${RPC.SYMBOL}`, this);

      const wrappedTOken = new ethers.Contract(
        ERC20TOKEN.WRAPPEDTOKEN,
        ERC20TOKEN.ABI,
        this.wallet
      );
      const amountInWei = ethers.parseEther(
        Helper.randomFloat(Config.TXAMOUNTMIN, Config.TXAMOUNTMAX).toString()
      );
      const data = wrappedTOken.deposit.populateTransaction();
      const tx = await this.buildTxBody(data, amountInWei);

      await this.executeTx(tx);
    } catch (error) {
      throw error;
    }
  }

  async withdraw() {
    try {
      await Helper.delay(500, this.acc, `Trying to Unwrap Token`, this);

      const wrappedTOken = new ethers.Contract(
        ERC20TOKEN.WRAPPEDTOKEN,
        ERC20TOKEN.ABI,
        this.wallet
      );
      const wethBalance = await wrappedTOken.balanceOf(this.wallet.address);
      const amountInWei = wethBalance;
      const amountInEth = ethers.formatEther(amountInWei);
      logger.info(`Unwrapping ${amountInEth} Token`);

      const data = wrappedTOken.withdraw.populateTransaction(amountInWei);
      const tx = await this.buildTxBody(data, 0);

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

      const amountInWei = ethers.parseEther(Config.RAWTXAMOUNT.toString());
      const accIdx = privateKey.indexOf(this.acc);
      const data = {
        data: Config.RAWTX[accIdx],
        to: Config.RAWTXCONTRACTADDRESS,
      };
      const tx = await this.buildTxBody(
        data,
        amountInWei == 0 ? 0 : amountInWei
      );

      await this.executeTx(tx);
    } catch (error) {
      throw error;
    }
  }

  async deployedContractTx() {
    try {
      await Helper.delay(
        500,
        this.acc,
        `Try To Executing Deployed Contract Transaction`,
        this
      );

      const contract = new ethers.Contract(
        DEPLOYEDTOKEN.CONTRACTADDRESS,
        DEPLOYEDTOKEN.ABI,
        this.wallet
      );

      const amountInWei = 1;
      await this.tokenApproval(DEPLOYEDTOKEN.CONTRACTADDRESS, this.address);
      const data = await contract.ping.populateTransaction(amountInWei);
      const tx = await this.buildTxBody(data, amountInWei, 0);

      await this.executeTx(tx);
    } catch (error) {
      throw error;
    }
  }

  async transfer(toaddr = true, dest = undefined) {
    const amount = Helper.randomFloat(Config.TXAMOUNTMIN, Config.TXAMOUNTMAX);
    const amountInWei = ethers.parseEther(amount.toString());
    try {
      let tx;
      if (toaddr) {
        await Helper.delay(
          1000,
          this.acc,
          `Trying to transfer ${amount} ${RPC.SYMBOL} to ${this.address}`,
          this
        );

        tx = await this.buildTxBody(
          undefined,
          amountInWei,
          dest ?? this.address
        );
      } else {
        if (Config.OTHERUSERADDRESSLIST.length == 1)
          throw Error("Please set OTHERUSERADDRESSLIST on config file");
        const destAddress =
          Config.OTHERUSERADDRESSLIST[
            Helper.random(Config.OTHERUSERADDRESSLIST - 1)
          ];
        await Helper.delay(
          1000,
          this.acc,
          `Trying to transfer ${amount}${RPC.SYMBOL} to ${destAddress}`,
          this
        );

        tx = await this.buildTxBody(undefined, amountInWei, destAddress);
      }

      await this.executeTx(tx);
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {ethers.Transaction} tx
   *
   */
  async executeTx(tx) {
    try {
      logger.info(`TX DATA ${JSON.stringify(Helper.serializeBigInt(tx))}`);
      const explorer = RPC.EXPLORER;

      await Helper.delay(500, this.acc, `Executing TX...`, this);
      const txRes = await this.wallet.sendTransaction(tx);

      if (Config.WAITFORBLOCKCONFIRMATION) {
        logger.info(`Tx Executed \n${explorer}tx/${txRes.hash}`);
        await Helper.delay(
          500,
          this.acc,
          `Tx Executed Waiting For Block Confirmation...`,
          this
        );
        const txRev = await this.waitWithTimeout(txRes, 5 * 60 * 1000); // 5 minutes timeout

        logger.info(`Tx Confirmed and Finalizing: ${JSON.stringify(txRev)}`);
        await Helper.delay(
          5000,
          this.acc,
          `Tx Executed and Confirmed \n${explorer}tx/${txRev.hash}`,
          this
        );
      } else {
        await Helper.delay(500, this.acc, `Tx Executed...`, this);
        await Helper.delay(
          5000,
          this.acc,
          `Tx Executed \n${explorer}tx/${txRes.hash}`,
          this
        );
      }

      await this.getBalance();
      this.onchainCount = await this.provider.getTransactionCount(this.address);
    } catch (error) {
      if (error.message.includes("504")) {
        await Helper.delay(5000, this.acc, error.message, this);
      } else {
        logger.error(`Error in executing transaction: ${error.message}`);
        throw error;
      }
    }
  }

  async getOptimalNonce() {
    try {
      const latestNonce = await this.provider.getTransactionCount(
        this.address,
        "latest"
      );
      const pendingNonce = await this.provider.getTransactionCount(
        this.address,
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
    directThrow = false,
    retries = 3,
    delay = 3000
  ) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        logger.info(`Estimating Gas for ${rawdata} TX`);
        const gasLimit = await this.provider.estimateGas({
          from: this.address,
          to: address,
          value: amount,
          data: rawdata,
        });

        return gasLimit;
      } catch (err) {
        if (directThrow) {
          throw err;
        } else {
          await Helper.delay(
            delay,
            this.acc,
            `${err.reason ?? err.shortMessage}... Attempt ${
              attempt + 1
            } of ${retries}`,
            this
          );

          if (attempt === retries - 1) {
            throw Error(`Failed to estimate gas after ${retries} attempts.`);
          }
        }
      }
    }
  }

  /**
   * Builds the transaction body with optimal nonce and optional gas estimation.
   *
   * @param {boolean} [options.estimateGas=true] - Whether to estimate gas.
   * @returns {Promise<ethers.Transaction>} - The constructed transaction object.
   */
  async buildTxBody(data, value = 0, to, estimateGas = true) {
    const nonce = await this.getOptimalNonce();

    const recipient = to ?? data?.to;
    const txData = data?.data;
    const fee = await this.provider.getFeeData();
    const customGasPrice = ethers.parseUnits(
      Config.GWEIPRICE.toString(),
      "gwei"
    );

    /**
     * @type {ethers.Transaction}
     */
    const baseTx = {
      to: recipient,
      from: this.address,
      value,
      fee,
      gasPrice: fee.gasPrice > customGasPrice ? fee.gasPrice : customGasPrice,
      nonce,
      data: txData,
    };

    if (estimateGas) {
      const gasLimit = await this.estimateGasWithRetry(
        recipient,
        value,
        txData
      );
      baseTx.gasLimit = gasLimit;
    }

    return baseTx;
  }

  async tokenApproval(tokenCA, spenderCA) {
    const contract = new ethers.Contract(
      tokenCA,
      DEPLOYEDTOKEN.ABI,
      this.wallet
    );
    const allowanceRes = await contract.allowance(this.address, spenderCA);

    if (Number(allowanceRes) < Config.TXAMOUNTMAX) {
      await Helper.delay(1000, this.acc, `Try To Approving Token Spend`, this);
      const approval = await contract.approve(spenderCA, ethers.MaxUint256);
      await approval.wait();
      await Helper.delay(1000, this.acc, `Token Approved`, this);
    }
  }

  async waitWithTimeout(txRes, timeout) {
    let timedOut = false;

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        timedOut = true;
        reject(
          new Error("Transaction confirmation timed out after 5 minutes.")
        );
      }, timeout);
    });

    try {
      const txRev = await Promise.race([txRes.wait(), timeoutPromise]);
      return txRev;
    } catch (error) {
      if (timedOut) {
        logger.warn("Re-executing transaction due to timeout.");
        return this.executeTx(txRes);
      }
      throw error;
    }
  }
}
