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
    
    function beforeAll() public {
        acc0 = TestsAccounts.getAccount(0);
        acc1 = TestsAccounts.getAccount(1);
        acc2 = TestsAccounts.getAccount(2);
        acc3 = TestsAccounts.getAccount(3);
        acc3 = TestsAccounts.getAccount(4);
    }
    /// Account at zero index (account-0) is default account, so god will be set to acc0
    function godTest() public {
        Assert.equal(god, acc0, 'God should be acc0');
    }

    /// Set students as account-0
    /// #sender doesn't need to be specified explicitly for account-0
    function setStudent() public {
        Assert.equal(addStudent(acc0, 'Iron', 'Man'), 1, 'Should be equal to 1');
        Assert.equal(addStudent(acc1, 'Captain', 'America'), 2, 'Should be equal to 2');
        Assert.equal(addStudent(acc2, 'Bruce', 'Banner'), 3, 'Should be equal to 3');
        Assert.equal(addStudent(acc3, 'Mighty', 'Thor'), 4, 'Should be equal to 4');
    }

    /// Trying to add students from an account who is not the god
    /// #sender: account-2
    function setFriendFail() public {
        (bool success, bytes memory result) = address(this).delegatecall(abi.encodeWithSignature("addStudent(address,string,string)", acc4, 'Scarlet', 'Witch'));
        if (success == false) {
            string memory reason = abi.decode(result.slice(4, result.length - 4), (string));
            Assert.equal(reason, "Can only be executed by the god", "Failed with unexpected reason");
        } else {
            Assert.ok(false, "Method Execution should fail");
        }
    }
}
    