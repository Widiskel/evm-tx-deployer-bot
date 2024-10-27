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
    const weth = balance.WETH ?? "-";

    const tx = (await sqlite.getTodayTxLog(address, "tx")).length;
    const raw = (await sqlite.getTodayTxLog(address, "raw")).length;

    this.twisters.put(acc, {
      text: `
================== Account ${accIdx + 1} =================
Address      : ${address}
Balance      : ${eth} ${RPC.SYMBOL}
               ${weth} WETH
W/U Count    : ${tx} of ${Config.WRAPUNWRAPCOUNT ?? "?"}
RAWTX Count  : ${raw} of ${Config.RAWTXCOUNT ?? "?"}
               
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
