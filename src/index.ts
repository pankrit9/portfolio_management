import Web3 from 'web3';
import { WebsocketProvider, Account } from 'web3-core';
import { deployContract } from './deploy';
import { handleRequestEvent, handlePushEvent, handleAddCourses, handleAddExp, handleAddProjects } from './listen';
import { loadCompiledSols } from './load';
import { grabStudent } from './studentGrabber';
import { methodSend } from './send';
import { Contract } from 'web3-eth-contract';

import { ObjectId } from "mongodb";
import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
import { error } from 'console';

let fs = require('fs');
let client : mongoDB.MongoClient;
let db : mongoDB.Db ;
let studentsCollection: mongoDB.Collection

function getAccount(web3: Web3, name: string): Account {
    try {
        //Git has more generic way but don't think its necessary for this
        let account = web3.eth.accounts.wallet.add('0x' + "e339efe9b3baf6884f8342bc660efe156488ab010553bab6ea19ae1da888c43a");
        return account;
    } catch (error) {
        throw "Cannot read account";
    }
}
const collections: { students?: mongoDB.Collection } = {}

async function connectToDatabase() {
    dotenv.config();
    client = new mongoDB.MongoClient("mongodb+srv://Sarvesh:hello123@students.wv61vhh.mongodb.net/?retryWrites=true&w=majority");
    await client.connect();
    db= client.db(process.env.DB_NAME);
    studentsCollection = db.collection("students");
    collections.students = studentsCollection;
    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${studentsCollection.collectionName}`);
}

var shellArgs = process.argv.slice(2);
if (shellArgs.length < 1) {
    console.error("node programName cmd, e.g. node index.js deploy");
    process.exit(1);
}

(async function run() {
    let web3Provider!: WebsocketProvider;
    let web3!: Web3;
    try {
        web3Provider = new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545");
        web3 = new Web3(web3Provider);
    } catch (e) {
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
                let loaded = loadCompiledSols(["oracle"]);
                let contract = await deployContract(web3!, account, loaded.contracts["oracle"]["SPOracle"].abi, loaded.contracts["oracle"]["SPOracle"].evm.bytecode.object, [account.address]);
                console.log("oracle contract address: " + contract.options.address);
            } catch (err) {
                console.error("error deploying contract");
            }
        } else if (shellArgs[1] == "userapp") {
            if (shellArgs.length <= 2) {
                console.error("need to specify oracle address");
            } else {
                let oracleAddr = shellArgs[2];
                try {
                    let account = getAccount(web3, "user");
                    let loaded = loadCompiledSols(["oracle", "student_portfolio"]);
                    let contract = await deployContract(web3!, account, loaded.contracts["student_portfolio"]["StudentPortfolio"].abi, loaded.contracts["student_portfolio"]["StudentPortfolio"].evm.bytecode.object, [oracleAddr]);
                    console.log("user app contract address: " + contract.options.address);
                } catch (err) {
                    console.error("error deploying contract");
                    console.error(err);
                }
            }
        }
        web3Provider.disconnect(1000, 'Normal Closure');
    } else if (cmd0 == "listen") {
        if (shellArgs.length < 3) {
            console.error("e.g. node index.js listen oracle 0x23a01...");
            process.exit(1);
        }
        if (shellArgs[1] == "oracle") {
            //Conect to DB
            connectToDatabase();

            let account!: Account;
            let contract!: Contract;
            try {
                account = getAccount(web3, "trusted_server");
                let loaded = loadCompiledSols(["oracle"]);
                let contractAddr = shellArgs[2];
                contract = new web3.eth.Contract(loaded.contracts["oracle"]["SPOracle"].abi, contractAddr, {});
            } catch (err) {
                console.error("error listening oracle contract");
                console.error(err);
            }

            handleRequestEvent(contract, async (caller: String, requestId: Number, data: any) => {
                let stuData = web3.eth.abi.decodeParameters(['address'], data);
                let stuAddr = stuData[0];
                let student = await grabStudent(stuAddr, studentsCollection);
                if(student != null) {
                    console.log(student);
                    let stuProjects  = student.personalProjects.toString();
                    let stuCourses  = student.courses.toString();
                    let stuExp  = student.experience.toString();

                    let stuHex = web3.eth.abi.encodeParameters(['string', 'string', 'string', 'string'], [student.name, stuProjects, stuCourses, stuExp]);
                    let receipt = await methodSend(web3, account, contract.options.jsonInterface, "replyData(uint256,address,bytes)", contract.options.address, [requestId, caller, stuHex]);
                    // console.log(contract);
                } else {
                    throw error ("Student does not exist");
                }
            });

            handlePushEvent(contract, async (caller: String, requestId: Number, data: any) => {
                let stuData = web3.eth.abi.decodeParameters(['address', 'string'], data);
                let stuAddr = stuData[0];
                let stuName = stuData[1];

                const res = await studentsCollection.insertOne({"publicKey":stuAddr, "name":stuName, "personalProjects":[], "courses":[], "experience":[]});
                console.log("the inserted data is " + res);
            });

            handleAddCourses(contract, async (caller: String, requestId: Number, data: any) => {
                let stuData = web3.eth.abi.decodeParameters(['address', 'string'], data);
                let stuAddr = stuData[0];
                let courseName = stuData[1];
                const res = await studentsCollection.findOneAndUpdate({"publicKey":stuAddr}, {$push:{"courses":courseName}} );
                console.log("the inserted data is " + res);
            });

            handleAddExp(contract, async (caller: String, requestId: Number, data: any) => {
                let stuData = web3.eth.abi.decodeParameters(['address', 'string'], data);
                let stuAddr = stuData[0];
                let experiencee = stuData[1];
                const res = await studentsCollection.findOneAndUpdate({"publicKey":stuAddr}, {$push:{"experience":experiencee}} );
                console.log("the inserted data is " + res);
            });

            handleAddProjects(contract, async (caller: String, requestId: Number, data: any) => {
                let stuData = web3.eth.abi.decodeParameters(['address', 'string'], data);
                let stuAddr = stuData[0];
                let projectName = stuData[1];
                const res = await studentsCollection.findOneAndUpdate({"publicKey":stuAddr}, {$push:{"personalProjects":projectName}} );
                console.log("the inserted data is " + res);
            });
        }
        }
    })();