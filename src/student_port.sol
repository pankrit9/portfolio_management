
// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

/// @title Contract to create a Student Portfolio
contract StudentPortfolio {
    
    struct Student {
        string firstName;
        string lastName;
        // bool openToWork;
    }

    uint public numStudents = 0;
    mapping(address => Student) public users;   // hashmap of students: 
    address public god;     // God of the portfolio management

    // Creates the portfolio management contract
    constructor() {
        god = msg.sender; // Set contract creator as god as they hold the most power
    }

    /// @notice Add a new student to the blockchain
    /// @dev to simplify the student duplication is not checked
    /// @param firstName: 
        // address userAddress: student's account address
        // string fName: first name of the student
        // string lName: last name of the student
        // bool openForWork: looking for opportunities
    /// @return Number of students in the blockchain
    // function addStudent(string memory fName, string memory lName, bool openForWork) public returns (uint) {
    function addStudent(address studentAddress, string memory fName, string memory lName) public onlyGod returns (uint) {
        Student memory s;
        s.firstName = fName;
        s.lastName = lName;
        // s.openToWork = openForWork;
        users[studentAddress] = s;
        numStudents++;
        return numStudents;
    }

    /// @notice Only god can do
    modifier onlyGod() {
        require(msg.sender == god, "Can only be executed by the god");
        _;
    }
}