import { Twisters } from "twisters";
import logger from "./logger.js";
import Core from "../core/core.js";
import { privateKey } from "../../accounts/accounts.js";
import { RPC } from "../core/network/rpc.js";
import { Config } from "../../config/config.js";
import sqlite from "../core/db/sqlite.js";

class Twist {
  constructor() {
    /** @type  {Twisters}*/
    this.twisters = new Twisters();
  }

  /**
   * @param {string} acc
   * @param {Core} core
   * @param {string} msg
   * @param {string} delay
   */
  async log(msg = "", acc = "", core = new Core(), delay) {
    const accIdx = privateKey.indexOf(acc);
    if (delay == undefined) {
      logger.info(`Account ${accIdx + 1} - ${msg}`);
      delay = "-";
    }

    const address = core.address ?? "-";
    const balance = core.balance ?? {};
    const eth = balance.ETH ?? "-";
    const txCount = core.onchainCount ?? "-";

    const tx = (await sqlite.getTodayTxLog(address, "tx")).length;
    const txEnabled = Config.USEWRAPUNWRAP == true ? "ON" : "OFF";
    const raw = (await sqlite.getTodayTxLog(address, "raw")).length;
    const rawEnabled = Config.USERAWTXDATA == true ? "ON" : "OFF";
    const self = (await sqlite.getTodayTxLog(address, "self")).length;
    const other = (await sqlite.getTodayTxLog(address, "other")).length;
    const transferEnabled = Config.USETRANSFER == true ? "ON" : "OFF";
    const deploy = (await sqlite.getTodayTxLog(address, "deployed")).length;
    const deployEnabled =
      Config.DEPLOYCONTRACTINTERACTION == true ? "ON" : "OFF";

    this.twisters.put(acc, {
      text: ` 
================== Account ${accIdx + 1} =================
Address          : ${address}
Balance          : ${eth} ${RPC.SYMBOL}
Onchain TX Total : ${txCount} Onchain Transaction
Transfer Count   : ${self} of ${
        Config.SELFTRANSFERCOUNT ?? "?"
      } SELF & ${other} of ${
        Config.OTHERUSERTRANSFERCOUNT ?? "?"
      } OTHER (${transferEnabled})
RAWTX Count      : ${raw} of ${Config.RAWTXCOUNT ?? "?"} (${rawEnabled})
W/U Count        : ${tx} of ${Config.WRAPUNWRAPCOUNT ?? "?"} (${txEnabled})
Deploy Tx Count  : ${deploy} of ${
        Config.DEPLOYCONTRACTINTERACTIONCOUNT ?? "?"
      } (${deployEnabled})
               
Status : ${msg}
Delay : ${delay}
==============================================`,
    });
  }
  /**
   * @param {string} msg
   */
  info(msg = "") {
    this.twisters.put(2, {
      text: `
==============================================
Info : ${msg}
==============================================`,
    });
    return;
  }

  clearInfo() {
    this.twisters.remove(2);
  }

  clear(acc) {
    this.twisters.remove(acc);
  }
}
export default new Twist();
