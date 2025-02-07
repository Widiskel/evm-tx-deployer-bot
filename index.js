import { privateKey } from "./accounts/accounts.js";
import { Config } from "./config/config.js";
import Core from "./src/core/core.js";
import sqlite from "./src/core/db/sqlite.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";
import twist from "./src/utils/twist.js";

async function operation(acc) {
  await sqlite.connectToDatabase();
  await sqlite.createTable();
  const core = new Core(acc);
  try {
    await core.connectWallet();
    await core.getBalance();

    if (core.balance.ETH < 0.0015)
      throw Error("Minimum Eth Balance Is 0.0015 ETH");

    if (Config.USEWRAPUNWRAP ?? true) {
      if (Config.WRAPPEDTOKENCONTRACTADDRESS == undefined)
        throw Error("Please Configure WRAPPEDTOKENCONTRACTADDRESS first");
      const currentCount =
        Number(Config.WRAPUNWRAPCOUNT) -
        Number((await sqlite.getTodayTxLog(core.address, "tx")).length);
      const txCount = currentCount > 0 ? currentCount : 0;
      for (const count of Array(txCount)) {
        if (core.balance.ETH < 0.0015)
          throw Error(
            "Balance is less than 0.0015 ETH, please fill up your balance"
          );
        try {
          await core.deposit();
          await core.withdraw();
          await sqlite.insertData(core.address, new Date().toISOString(), "tx");
        } catch (error) {
          await Helper.delay(
            3000,
            acc,
            `Error during deposit/withdraw operation: ${error.message}`,
            core
          );
        }
        const delay = Helper.random(10000, 60000 * 2);
        await Helper.delay(
          delay,
          acc,
          `Delaying for ${Helper.msToTime(delay)} Before Executing Next TX`,
          core
        );
      }
    }

    if (Config.USETRANSFER ?? false) {
      const selfTransferCount =
        Number(Config.SELFTRANSFERCOUNT) -
        Number((await sqlite.getTodayTxLog(core.address, "self")).length);
      const txCount = selfTransferCount > 0 ? selfTransferCount : 0;
      const otherTransferCount =
        Number(Config.OTHERUSERTRANSFERCOUNT) -
        Number((await sqlite.getTodayTxLog(core.address, "other")).length);
      const otherTxCount = otherTransferCount > 0 ? otherTransferCount : 0;
      for (const tx of Array(txCount)) {
        await core.transfer();
        await sqlite.insertData(core.address, new Date().toISOString(), "self");
      }
      for (const tx of Array(otherTxCount)) {
        await core.transfer(false);
        await sqlite.insertData(
          core.address,
          new Date().toISOString(),
          "other"
        );
      }
    }

    if (Config.DEPLOYCONTRACTINTERACTION ?? false) {
      if (
        (Config.DEPLOYCONTRACTADDRESS == undefined) &
        (Config.DEPLOYCONTRACTADDRESS == "")
      )
        throw Error(
          "Please set DEPLOYCONTRACTADDRESS with your deployed contract address first "
        );

      const deployedContractInteractCount =
        Number(Config.DEPLOYCONTRACTINTERACTIONCOUNT) -
        Number((await sqlite.getTodayTxLog(core.address, "deployed")).length);
      const txCount =
        deployedContractInteractCount > 0 ? deployedContractInteractCount : 0;

      for (const tx of Array(txCount)) {
        await core.deployedContractTx();
        await sqlite.insertData(
          core.address,
          new Date().toISOString(),
          "deployed"
        );
      }
    }

    if (Config.USERAWTXDATA ?? false) {
      if (Config.RAWTX == undefined || Config.RAWTX == [])
        throw Error("Please Configure RAWTX first");
      if (Config.RAWTXCONTRACTADDRESS == undefined)
        throw Error("Please Configure RAWTXCONTRACTADDRESS first");
      const currentCount =
        Number(Config.RAWTXCOUNT) -
        Number((await sqlite.getTodayTxLog(core.address, "raw")).length);
      const txCount = currentCount > 0 ? currentCount : 0;
      for (const tx of Array(txCount)) {
        await core.rawTx();
        await sqlite.insertData(core.address, new Date().toISOString(), "raw");
      }
    }

    const delay = 60000 * 60 * 24;
    await Helper.delay(
      delay,
      acc,
      `Account ${
        privateKey.indexOf(acc) + 1
      } Processing Done, Delaying for ${Helper.msToTime(delay)}`,
      core
    );
    await operation(acc);
  } catch (error) {
    if (error.message) {
      await Helper.delay(
        10000,
        acc,
        `Error : ${error.message}, Retry again after 10 Second`,
        core
      );
    } else {
      await Helper.delay(
        10000,
        acc,
        `Error :${JSON.stringify(error)}, Retry again after 10 Second`,
        core
      );
    }

    await operation(acc);
  }
}

async function startBot() {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`BOT STARTED`);
      if (privateKey.length == 0)
        throw Error("Please input your account first on accounts.js file");
      const promiseList = [];

      for (const acc of privateKey) {
        promiseList.push(operation(acc));
      }

      await Promise.all(promiseList);
      resolve();
    } catch (error) {
      logger.info(`BOT STOPPED`);
      logger.error(JSON.stringify(error));
      reject(error);
    }
  });
}

(async () => {
  try {
    logger.clear();
    logger.info("");
    logger.info("Application Started");
    console.log("EVM TX DEPLOYER BOT");
    console.log();
    console.log("By : Widiskel");
    console.log("Follow On : https://github.com/Widiskel");
    console.log("Join Channel : https://t.me/skeldrophunt");
    console.log("Dont forget to run git pull to keep up to date");
    console.log();
    console.log();
    Helper.showSkelLogo();
    await startBot();
  } catch (error) {
    twist.clear();
    twist.clearInfo();
    console.log("Error During executing bot", error);
    await startBot();
  }
})();
