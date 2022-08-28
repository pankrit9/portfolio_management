"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAddProjects = exports.handleAddExp = exports.handleAddCourses = exports.handlePushEvent = exports.handleRequestEvent = void 0;
function handleRequestEvent(contract, grabData) {
    contract.events["request(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId) {
        console.log("listening on event 'request'" + ", subscriptionId: " + subscriptionId);
    })
        .on('data', function (event) {
        let caller = event.returnValues.caller;
        let requestId = event.returnValues.requestId;
        let data = event.returnValues.data;
        grabData(caller, requestId, data);
    })
        .on('error', function (error, receipt) {
        console.log(error);
        console.log(receipt);
        console.log("error listening on event 'request'");
    });
}
exports.handleRequestEvent = handleRequestEvent;
function handlePushEvent(contract, pushData) {
    contract.events["push(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId) {
        console.log("listening on event 'push'" + ", subscriptionId: " + subscriptionId);
    })
        .on('data', function (event) {
        let caller = event.returnValues.caller;
        let requestId = event.returnValues.requestId;
        let data = event.returnValues.data;
        pushData(caller, requestId, data);
    })
        .on('error', function (error, receipt) {
        console.log(error);
        console.log(receipt);
        console.log("error listening on event 'push'");
    });
}
exports.handlePushEvent = handlePushEvent;
function handleAddCourses(contract, addCourse) {
    contract.events["addCourse(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId) {
        console.log("listening on event 'addCourse'" + ", subscriptionId: " + subscriptionId);
    })
        .on('data', function (event) {
        let caller = event.returnValues.caller;
        let requestId = event.returnValues.requestId;
        let data = event.returnValues.data;
        addCourse(caller, requestId, data);
    })
        .on('error', function (error, receipt) {
        console.log(error);
        console.log(receipt);
        console.log("error listening on event 'push'");
    });
}
exports.handleAddCourses = handleAddCourses;
function handleAddExp(contract, addExperience) {
    contract.events["addExperience(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId) {
        console.log("listening on event 'addExp'" + ", subscriptionId: " + subscriptionId);
    })
        .on('data', function (event) {
        let caller = event.returnValues.caller;
        let requestId = event.returnValues.requestId;
        let data = event.returnValues.data;
        console.log("adding exp");
        addExperience(caller, requestId, data);
    })
        .on('error', function (error, receipt) {
        console.log(error);
        console.log(receipt);
        console.log("error listening on event 'push'");
    });
}
exports.handleAddExp = handleAddExp;
function handleAddProjects(contract, addProject) {
    contract.events["addProject(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId) {
        console.log("listening on event 'addProject'" + ", subscriptionId: " + subscriptionId);
    })
        .on('data', function (event) {
        let caller = event.returnValues.caller;
        let requestId = event.returnValues.requestId;
        let data = event.returnValues.data;
        addProject(caller, requestId, data);
    })
        .on('error', function (error, receipt) {
        console.log(error);
        console.log(receipt);
        console.log("error listening on event 'addProject'");
    });
}
exports.handleAddProjects = handleAddProjects;
