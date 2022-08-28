// SPDX-License-Identifier: GPL-3.0
        
pragma solidity >=0.4.22 <0.9.0;

// This import is automatically injected by Remix
import "remix_tests.sol"; 

// This import is required to use custom transaction context
// Although it may fail compilation in 'Solidity Compiler' plugin
// But it will work fine in 'Solidity Unit Testing' plugin
import "remix_accounts.sol";
import "../contracts/student_portfolio.sol";
import "https://github.com/GNSPS/solidity-bytes-utils/blob/master/contracts/BytesLib.sol";

// File name has to end with '_test.sol', this file can contain more than one testSuite contracts
// Inherit 'StudentPortfolio' contract
contract StudentPortfolioTest is StudentPortfolio {
    using BytesLib for bytes;

    // Variables used to emulate different accounts
    address acc0;
    address acc1;
    address acc2;
    address acc3;
    address acc4;
    address acc5;
    address acc6;
    address acc7;
    
    function beforeAll() public {
        // god: 0
        acc0 = TestsAccounts.getAccount(0);
        // students: 1 to 4
        acc1 = TestsAccounts.getAccount(1);
        acc2 = TestsAccounts.getAccount(2);
        acc3 = TestsAccounts.getAccount(3);
        acc4 = TestsAccounts.getAccount(4);
        // employers: 5 to 7
        acc5 = TestsAccounts.getAccount(5);
        acc6 = TestsAccounts.getAccount(6);
        acc7 = TestsAccounts.getAccount(7);
    }
    /// Account at zero index (account-0) is default account, so god will be set to acc0
    function godTest() public {
        Assert.equal(god, acc0, 'God should be acc0');
    }

    /// Set students as account-0
    /// #sender doesn't need to be specified explicitly for account-0
    function setStudent() public {
        Assert.equal(addStudent(acc0, 'Iron'), 1, 'Should be equal to 1');
        Assert.equal(addStudent(acc1, 'Captain'), 2, 'Should be equal to 2');
        Assert.equal(addStudent(acc2, 'Bruce'), 3, 'Should be equal to 3');
        Assert.equal(addStudent(acc3, 'Mighty'), 4, 'Should be equal to 4');
    }

    /// Trying to add students from an account who is not the god
    /// #sender: account-2
    function setFriendFail() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("addStudent(address,string)", acc4, 'Scarlet Witch'));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Only god can execute", "Failed with unexpected reason");
        } else {
            Assert.ok(false, "Method Execution should fail");
        }
    }
   
    /// #sender: account-6
    function setEmployerFail() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("addEmployer(address,string,string)", acc6, 'Athena', 'UNSW'));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Only god can execute", "Failed with unexpected reason");
        } else {
            Assert.ok(false, "Method Execution should fail");
        }
    }

    function setEmployer() public {
        Assert.equal(addEmployer(acc5, 'Odin', 'UNSW'), 1, 'Should be equal to 1');
        Assert.equal(addEmployer(acc6, 'Zues', 'University of Sydney'), 2, 'Should be equal to 2');
        Assert.equal(addEmployer(acc7, 'Loki', 'UTS'), 3, 'Should be equal to 3');
    }

    ////////////////////// ENDORSEMENT //////////////////////
   
    /// sender: account-6
    function endorseTest() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("endorse(address)", acc0));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Only employer can do this", "Failed with unexpected reason");
        } else {
            Assert.ok(true, "Method Execution should pass");
        }        
    }

    /// #sender: account-6
    function endorseNotAStudent() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("endorse(address)", acc5));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Student does not exist", "Failed with unexpected reason");
        } else {
            Assert.ok(false, "Method Execution should pass");
        }        
    }

    ///#sender: account-1
    function testStudentEndorse() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("endorse(address)", acc0));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Only employer can do this", "Failed with unexpected reason");
        } else {
            Assert.ok(false, "Method Execution should pass");
        }        
    }

    /// Test if the viewProfile function only shows the profile for the students and not the employers/ people out of the datatabse
    function testViewStudentProfile() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("viewProfile(address)", acc6));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Student does not exist", "Failed with unexpected reason");
        } else {
            Assert.ok(false, "Method Execution should pass");
        }      
    }

    /// Success case for the viewProfile function
    function testViewStudentProfileSuccess() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("viewProfile(address)", acc0));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Student does not exist", "Failed with unexpected reason");
        } else {
            Assert.ok(true, "Method Execution should pass");
        }      
    }

    ////////////////////// COURSES AND MARKS //////////////////////


    ////////////////////// ACCESS CONTROL //////////////////////

    // function to test that requestAccess only works by employers
    /// #sender: account-5
    function testRequestAccess() public {
        // Assert.ok(requestAccess(acc1), "Access should be granted and true returned");
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("requestAccess(address)", acc1));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Exception: Already have access", "Failed with unexpected reason");
        } else {
            Assert.ok(true, "Method Execution should pass");
        }
    }

    // request access should return false when anyone but an employer calls it
    /// #sender: account-4
    function requestAccessFail1() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("requestAccess(address)", acc1));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Only employer can do this", "Failed with unexpected reason");
        } else {
            Assert.ok(false, "Method execution should fail");
        }
    }


    // function fails even when the god tries to request access
    function requestAccessFail2() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("requestAccess(address)", acc2));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Only employer can do this", "Failed with unexpected reason");
        } else {
            Assert.ok(false, "Method execution should fail");
        }
    }

    // function fails if an employer requests access from another employer instead of a student
    /// #sender: account-5 
    function requestAccessFail3() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("requestAccess(address)", acc6));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Student does not exist", "Faild with unexpected reason");
        } else {
            Assert.ok(false, "Method execution should fail");
        }
    }

    // only students can call this function, on a valid employer address
    // student acc3 grants access to employer acc7
    /// #sender: account-3
    function testGrantAccess() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("grantAccess(address)", acc7));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Exception: Already have access", "Failed with unexpected reason");
        } else {
            Assert.ok(true, "Method execution should pass");
        }
    }

    // student acc2 tries to grant access to student acc3 aka invalid employerAddress
    /// #sender: account-2
    function grantAccessFail1() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("grantAccess(address)", acc3));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Employer does not exist", "Failed with unexpected reason");
        } else {
            Assert.ok(false, "Method execution should fail");
        }
    }

    // employer/god tries to grant access to anyone
    /// #sender: account-5
    function grantAccessFail2() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("grantAccess(address)", acc3));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Employer does not exist", "Failed with unexpected reason");
        } else {
            Assert.ok(false, "Method execution should fail");
        }
    }

    ////////////////////// WORK EXPERIENCE //////////////////////

    ////////////////////// PROJECTS //////////////////////
}
    
