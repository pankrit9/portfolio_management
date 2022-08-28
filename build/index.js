"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const deploy_1 = require("./deploy");
const listen_1 = require("./listen");
const load_1 = require("./load");
const studentGrabber_1 = require("./studentGrabber");
const send_1 = require("./send");
const mongoDB = __importStar(require("mongodb"));
const dotenv = __importStar(require("dotenv"));
const console_1 = require("console");
let fs = require('fs');
let client;
let db;
let studentsCollection;
function getAccount(web3, name) {
    try {
        //Git has more generic way but don't think its necessary for this
        let account = web3.eth.accounts.wallet.add('0x' + "e339efe9b3baf6884f8342bc660efe156488ab010553bab6ea19ae1da888c43a");
        return account;
    }
    catch (error) {
        throw "Cannot read account";
    }
}
const collections = {};
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        dotenv.config();
        client = new mongoDB.MongoClient("mongodb+srv://Sarvesh:hello123@students.wv61vhh.mongodb.net/?retryWrites=true&w=majority");
        yield client.connect();
        db = client.db(process.env.DB_NAME);
        studentsCollection = db.collection("students");
        collections.students = studentsCollection;
        console.log(`Successfully connected to database: ${db.databaseName} and collection: ${studentsCollection.collectionName}`);
    });
}
var shellArgs = process.argv.slice(2);
if (shellArgs.length < 1) {
    console.error("node programName cmd, e.g. node index.js deploy");
    process.exit(1);
}
(function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let web3Provider;
        let web3;
        try {
            web3Provider = new web3_1.default.providers.WebsocketProvider("ws://127.0.0.1:7545");
            web3 = new web3_1.default(web3Provider);
        }
        catch (e) {
            throw "web3 cannot be initialized";
        }
        var cmd0 = shellArgs[0];
        if (cmd0 == "deploy") {
            if (shellArgs.length < 2) {
                console.error("e.g. node index.js deploy oracle");
                process.exit(1);
            }
            if (shellArgs[1] == "oracle") {
                try {
                    let account = getAccount(web3, "trusted_server");
                    let loaded = (0, load_1.loadCompiledSols)(["oracle"]);
                    let contract = yield (0, deploy_1.deployContract)(web3, account, loaded.contracts["oracle"]["SPOracle"].abi, loaded.contracts["oracle"]["SPOracle"].evm.bytecode.object, [account.address]);
                    console.log("oracle contract address: " + contract.options.address);
                }
                catch (err) {
                    console.error("error deploying contract");
                }
            }
            else if (shellArgs[1] == "userapp") {
                if (shellArgs.length <= 2) {
                    console.error("need to specify oracle address");
                }
                else {
                    let oracleAddr = shellArgs[2];
                    try {
                        let account = getAccount(web3, "user");
                        let loaded = (0, load_1.loadCompiledSols)(["oracle", "student_portfolio"]);
                        let contract = yield (0, deploy_1.deployContract)(web3, account, loaded.contracts["student_portfolio"]["StudentPortfolio"].abi, loaded.contracts["student_portfolio"]["StudentPortfolio"].evm.bytecode.object, [oracleAddr]);
                        console.log("user app contract address: " + contract.options.address);
                    }
                    catch (err) {
                        console.error("error deploying contract");
                        console.error(err);
                    }
                }
            }
            web3Provider.disconnect(1000, 'Normal Closure');
        }
        else if (cmd0 == "listen") {
            if (shellArgs.length < 3) {
                console.error("e.g. node index.js listen oracle 0x23a01...");
                process.exit(1);
            }
            if (shellArgs[1] == "oracle") {
                //Conect to DB
                connectToDatabase();
                let account;
                let contract;
                try {
                    account = getAccount(web3, "trusted_server");
                    let loaded = (0, load_1.loadCompiledSols)(["oracle"]);
                    let contractAddr = shellArgs[2];
                    contract = new web3.eth.Contract(loaded.contracts["oracle"]["SPOracle"].abi, contractAddr, {});
                }
                catch (err) {
                    console.error("error listening oracle contract");
                    console.error(err);
                }
                (0, listen_1.handleRequestEvent)(contract, (caller, requestId, data) => __awaiter(this, void 0, void 0, function* () {
                    let stuData = web3.eth.abi.decodeParameters(['address'], data);
                    let stuAddr = stuData[0];
                    let student = yield (0, studentGrabber_1.grabStudent)(stuAddr, studentsCollection);
                    if (student != null) {
                        console.log(student);
                        let stuProjects = student.personalProjects.toString();
                        let stuCourses = student.courses.toString();
                        let stuExp = student.experience.toString();
                        let stuHex = web3.eth.abi.encodeParameters(['string', 'string', 'string', 'string'], [student.name, stuProjects, stuCourses, stuExp]);
                        let receipt = yield (0, send_1.methodSend)(web3, account, contract.options.jsonInterface, "replyData(uint256,address,bytes)", contract.options.address, [requestId, caller, stuHex]);
                        // console.log(contract);
                    }
                    else {
                        throw (0, console_1.error)("Student does not exist");
                    }
                }));
                (0, listen_1.handlePushEvent)(contract, (caller, requestId, data) => __awaiter(this, void 0, void 0, function* () {
                    let stuData = web3.eth.abi.decodeParameters(['address', 'string'], data);
                    let stuAddr = stuData[0];
                    let stuName = stuData[1];
                    const res = yield studentsCollection.insertOne({ "publicKey": stuAddr, "name": stuName, "personalProjects": [], "courses": [], "experience": [] });
                    console.log("the inserted data is " + res);
                }));
                (0, listen_1.handleAddCourses)(contract, (caller, requestId, data) => __awaiter(this, void 0, void 0, function* () {
                    let stuData = web3.eth.abi.decodeParameters(['address', 'string'], data);
                    let stuAddr = stuData[0];
                    let courseName = stuData[1];
                    const res = yield studentsCollection.findOneAndUpdate({ "publicKey": stuAddr }, { $push: { "courses": courseName } });
                    console.log("the inserted data is " + res);
                }));
                (0, listen_1.handleAddExp)(contract, (caller, requestId, data) => __awaiter(this, void 0, void 0, function* () {
                    let stuData = web3.eth.abi.decodeParameters(['address', 'string'], data);
                    let stuAddr = stuData[0];
                    let experiencee = stuData[1];
                    const res = yield studentsCollection.findOneAndUpdate({ "publicKey": stuAddr }, { $push: { "experience": experiencee } });
                    console.log("the inserted data is " + res);
                }));
                (0, listen_1.handleAddProjects)(contract, (caller, requestId, data) => __awaiter(this, void 0, void 0, function* () {
                    let stuData = web3.eth.abi.decodeParameters(['address', 'string'], data);
                    let stuAddr = stuData[0];
                    let projectName = stuData[1];
                    const res = yield studentsCollection.findOneAndUpdate({ "publicKey": stuAddr }, { $push: { "personalProjects": projectName } });
                    console.log("the inserted data is " + res);
                }));
            }
        }
    });
})();
