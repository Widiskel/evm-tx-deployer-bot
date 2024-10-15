import { Config } from "../../../config/config.js";

export class RPC {
  static CHAINID = Config.RPC.CHAINID ?? 1301;
  static RPCURL = Config.RPC.RPCURL ?? "https://sepolia.unichain.org";
  static EXPLORER = Config.RPC.EXPLORER ?? "https://sepolia.uniscan.xyz/";
  static SYMBOL = Config.RPC.SYMBOL ?? "ETH";
}
