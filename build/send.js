"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.methodSend = void 0;
class Helper {
    static gasPay(gas) {
        return Math.ceil(gas * Helper.gas_mulptiplier);
    }
}
Helper.gas_mulptiplier = 1.2;
function methodSend(web3, account, abi, methodName, address, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let a_contract = new web3.eth.Contract(abi, address, {});
        let gasPrice;
        yield web3.eth.getGasPrice().then((averageGasPrice) => {
            // console.log("Average gas price: " + averageGasPrice);
            gasPrice = averageGasPrice;
        }).catch(console.error);
        let gas;
        yield web3.eth.getBalance(account.address).then((account_balance) => {
            // console.log("Gas in wallet: " + account_balance);
        }).catch((err) => {
        });
        return a_contract.methods[methodName](...args).send({
            from: account.address,
            gasPrice: gasPrice,
            gas: Helper.gasPay(yield a_contract.methods[methodName](...args).estimateGas({ from: account.address })),
        }).then(function (receipt) {
            return receipt;
        }).catch((ee) => {
            console.error(ee);
        });
    });
}
exports.methodSend = methodSend;
