import bip39 from "bip39";
import twist from "./twist.js";
import moment from "moment-timezone";
import { ethers } from "ethers";

export class Helper {
  static delay = (ms, acc, msg, obj) => {
    return new Promise(async (resolve) => {
      let remainingMilliseconds = ms;

      if (acc != undefined) {
        await twist.log(msg, acc, obj, `Delaying for ${this.msToTime(ms)}`);
      } else {
        twist.info(`Delaying for ${this.msToTime(ms)}`);
      }

      const interval = setInterval(async () => {
        remainingMilliseconds -= 1000;
        if (acc != undefined) {
          await twist.log(
            msg,
            acc,
            obj,
            `Delaying for ${this.msToTime(remainingMilliseconds)}`
          );
        } else {
          twist.info(`Delaying for ${this.msToTime(remainingMilliseconds)}`);
        }

        if (remainingMilliseconds <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);

      setTimeout(async () => {
        clearInterval(interval);
        await twist.clearInfo();
        if (acc) {
          await twist.log(msg, acc, obj);
        }
        resolve();
      }, ms);
    });
  };

  static randomUserAgent() {
    const list_useragent = [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/125.2535.60 Mobile/15E148 Safari/605.1.15",
      "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 EdgA/124.0.2478.104",
      "Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 EdgA/124.0.2478.104",
      "Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 OPR/76.2.4027.73374",
      "Mozilla/5.0 (Linux; Android 10; SM-N975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 OPR/76.2.4027.73374",
    ];
    return list_useragent[Math.floor(Math.random() * list_useragent.length)];
  }

  static readTime(milliseconds) {
    const date = moment.unix(milliseconds);
    return date.format("YYYY-MM-DD HH:mm:ss");
  }

  static getCurrentTimestamp() {
    const timestamp = moment().tz("Asia/Singapore").unix();
    return timestamp.toString();
  }

  static random(min, max) {
    const rand = Math.floor(Math.random() * (max - min + 1)) + min;
    return rand;
  }

  static randomFloat(min, max, fixed = 4) {
    const rand = Math.random() * (max - min) + min;
    return parseFloat(rand.toFixed(fixed));
  }

  static msToTime(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const remainingMillisecondsAfterHours = milliseconds % (1000 * 60 * 60);
    const minutes = Math.floor(remainingMillisecondsAfterHours / (1000 * 60));
    const remainingMillisecondsAfterMinutes =
      remainingMillisecondsAfterHours % (1000 * 60);
    const seconds = Math.round(remainingMillisecondsAfterMinutes / 1000);

    return `${hours} Hours ${minutes} Minutes ${seconds} Seconds`;
  }

  static generateRandomString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  static serializeBigInt = (obj) => {
    return JSON.parse(
      JSON.stringify(obj, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
  };

  static isMnemonic(input) {
    return bip39.validateMnemonic(input);
  }

  static isPrivateKey(input) {
    const data = input.replace(/^0x/, "");
    const regex = /^[a-fA-F0-9]{64}$/;
    return regex.test(data);
  }

  static determineType(input) {
    if (this.isMnemonic(input)) {
      return "Secret Phrase";
    } else if (this.isPrivateKey(input)) {
      return "Private Key";
    } else {
      return "Unknown";
    }
  }

  static generateNonce() {
    return ethers.hexlify(ethers.randomBytes(16));
  }

  static isToday(date) {
    const lastCheckInDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastCheckInDateOnly = new Date(lastCheckInDate);
    lastCheckInDateOnly.setHours(0, 0, 0, 0);
    if (lastCheckInDateOnly.getTime() === today.getTime()) {
      return true;
    } else {
      return false;
    }
  }

  static findFunctionBySelector(targetSelector, ABIs) {
    for (const abi of ABIs) {
      for (const item of abi) {
        if (item.type === "function") {
          const functionSignature = `${item.name}(${item.inputs
            .map((input) => input.type)
            .join(",")})`;
          const selector =
            "0x" +
            ethers.keccak256(ethers.toUtf8Bytes(functionSignature)).slice(0, 8);

          // Check if the computed selector matches the target selector
          if (selector.includes(targetSelector)) {
            console.log(`Function found: ${functionSignature}`);
            return functionSignature; // or return item if you need the whole item
          }
        }
      }
    }
    console.log("Function not found");
    return null;
  }

  static showSkelLogo() {
    console.log(`
                                                          
                      ...                                 
                     .;:.                                 
                    .;ol,.                                
                   .;ooc:'                                
            ..    .;ooccc:'.    ..                        
          .',....'cdxlccccc;.....,'.                      
         .;;..'';clolccccccc:,''..;;.                     
        ':c'..':cccccccccccccc;...'c:.                    
       ':cc,.'ccccccccccccccccc:..;cc:'                   
    ...:cc;.':cccccccccccccccccc:..:cc:...                
   .;';cc;.':;;:cccccccccccccc:;;;'.;cc,,;.               
  .cc':c:.',.....;cccccccccc;.....,..:c:'c:               
  ,x:'cc;.,'     .':cccccc:'.     ',.;cc':x'              
  lO,'cc;.;,       .;cccc:.       ,;.;cc';0l              
 .o0;.;c;.,:'......',''''''......':,.;c;.:0l.             
 .lxl,.;,..;c::::;:,.    .,:;::::c;..,;.,oxl.             
 .lkxOl..  ..'..;::'..''..'::;..'..  ..c0xkl.             
  .cKMx.        .;c:;:cc:;:c:.        .xMKc.              
    ;KX:         ;o::l:;cc;o:.        ;KK;                
     :KK:.       ,d,cd,'ol'o:       .:0K:                 
      ;0NOl:;:loo;. ... .. .;ldlc::lkN0:                  
       .lONNNKOx0Xd,;;'.,:,lKKkk0XNN0o.                   
         .','.. .lX0doooodOXd.  .','.                     
                 .,okkddxkd;.                             
                    'oxxd;.                               
   ........................................                              
   .OWo  xNd lox  xxl Ald   xoc dakkkkkxsx.              
   .OWo  o0W cXW  dM0 MMN   lNK laddKMNkso.               
   .kMKoxsNN oWX  dW0 MMMWO lWK    axM0   .                
   .OMWXNaMX dM0  kM0 MMKxNXKW0    axMk   .                 
   .OMk  dWK oWX XWdx Mxx  XMMO    akMx   .                 
   'OWo  dM0 'kNNXNNd DMD   OWk    aoWd   .                 
   ........................................                 
                                                                      
`);
  }
}
