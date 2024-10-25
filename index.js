import { privateKey } from "./accounts/accounts.js";
import { Config } from "./config/config.js";
import Core from "./src/core/core.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";
import twist from "./src/utils/twist.js";

async function operation(acc) {
  const core = new Core(acc);
  try {
    await core.connectWallet();
    await core.getBalance();

    if (core.balance.ETH < 0.0015)
      throw Error("Minimum Eth Balance Is 0.0015 ETH");
    if (Config.USEWRAPUNWRAP ?? true)
      for (const count of Array(Config.WRAPUNWRAPCOUNT)) {
        if (core.balance.ETH < 0.0015)
          throw Error(
            "Balance is less than 0.0015 ETH, please fill up your balance"
          );
        try {
          await core.deposit();
          await core.withdraw();
          core.txCount += 1;
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

    if (
      (Config.USERAWTXDATA ?? false) &&
      (Config.RAWTX ?? undefined) !=
        {
          CONTRACTTOINTERACT: "CONTRACTADDRESSTOINTERACT",
          RAWDATA: "RAWDATA",
        }
    )
      for (const tx of Array(Config.RAWTXCOUNT)) {
        await core.rawTx();
        core.rawTxCount += 1;
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
