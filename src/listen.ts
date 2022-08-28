import { Contract } from 'web3-eth-contract';

export function handleRequestEvent(contract: Contract, grabData: Function) {
    contract.events["request(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId: any) {
            console.log("listening on event 'request'" + ", subscriptionId: " + subscriptionId);
        })
        .on('data', function (event: any) {
            let caller = event.returnValues.caller;
            let requestId = event.returnValues.requestId;
            let data = event.returnValues.data;
            grabData(caller, requestId, data);
        })
        .on('error', function (error: any, receipt: any) {
            console.log(error);
            console.log(receipt);
            console.log("error listening on event 'request'");
        });
}

export function handlePushEvent (contract: Contract, pushData: Function) {
    contract.events["push(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId: any) {
            console.log("listening on event 'push'" + ", subscriptionId: " + subscriptionId);
        })
        .on('data', function (event: any) {
            let caller = event.returnValues.caller;
            let requestId = event.returnValues.requestId;
            let data = event.returnValues.data;
            pushData(caller, requestId, data);
        })
        .on('error', function (error: any, receipt: any) {
            console.log(error);
            console.log(receipt);
            console.log("error listening on event 'push'");
        });
}

export function handleAddCourses (contract: Contract, addCourse: Function) {
    contract.events["addCourse(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId: any) {
            console.log("listening on event 'addCourse'" + ", subscriptionId: " + subscriptionId);
        })
        .on('data', function (event: any) {
            let caller = event.returnValues.caller;
            let requestId = event.returnValues.requestId;
            let data = event.returnValues.data;
            addCourse(caller, requestId, data);
        })
        .on('error', function (error: any, receipt: any) {
            console.log(error);
            console.log(receipt);
            console.log("error listening on event 'push'");
        });
}

export function handleAddExp (contract: Contract, addExperience: Function) {
    contract.events["addExperience(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId: any) {
            console.log("listening on event 'addExp'" + ", subscriptionId: " + subscriptionId);
        })
        .on('data', function (event: any) {
            let caller = event.returnValues.caller;
            let requestId = event.returnValues.requestId;
            let data = event.returnValues.data;
            console.log("adding exp");
            addExperience(caller, requestId, data);
        })
        .on('error', function (error: any, receipt: any) {
            console.log(error);
            console.log(receipt);
            console.log("error listening on event 'push'");
        });
}

export function handleAddProjects (contract: Contract, addProject: Function) {
    contract.events["addProject(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId: any) {
            console.log("listening on event 'addProject'" + ", subscriptionId: " + subscriptionId);
        })
        .on('data', function (event: any) {
            let caller = event.returnValues.caller;
            let requestId = event.returnValues.requestId;
            let data = event.returnValues.data;
            addProject(caller, requestId, data);
        })
        .on('error', function (error: any, receipt: any) {
            console.log(error);
            console.log(receipt);
            console.log("error listening on event 'addProject'");
        });
}