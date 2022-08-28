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
exports.deployContract = void 0;
class Helper {
    static gasPay(gas) {
        return Math.ceil(gas * Helper.gas_mulptiplier);
    }
}
Helper.gas_mulptiplier = 1.2;
function deployContract(web3, account, abi, data, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let a_contract = new web3.eth.Contract(abi, undefined, {
            data: '0x' + data
        });
        let a_instance;
        let gasPrice;
        yield web3.eth.getGasPrice().then((averageGasPrice) => {
            console.log("Average gas price: " + averageGasPrice);
            gasPrice = averageGasPrice;
        }).catch((err) => {
            console.log("Error: ", err);
        });
        yield web3.eth.getBalance(account.address).then((account_balance) => {
            console.log("Gas in wallet: " + account_balance);
        }).catch((err) => {
        });
        yield a_contract.deploy({ data: a_contract.options.data, arguments: args }).send({
            from: account.address,
            gasPrice: gasPrice,
            gas: Helper.gasPay(yield a_contract.deploy({ data: a_contract.options.data, arguments: args }).estimateGas({ from: account.address })),
        }).then((instance) => {
            a_instance = instance;
        }).catch(console.error);
        return a_instance;
    });
}
exports.deployContract = deployContract;
