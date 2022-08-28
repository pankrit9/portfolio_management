// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "./oracle.sol";

/// @title Contract to create a Student Portfolio
contract StudentPortfolio is SPClient {
    
    struct Student {
        string name;
        
        mapping(uint => string) endorsed;
        uint numEndorsed;
        
        mapping(address => bool) accessControl; // emp address to access (true if access granted, false otherwise)
        uint numAccesses;
        
        mapping(string => uint) courseToMarks;  // course name to marks of that course
        mapping(uint => string) numToCourse;   // course number to course name mapping 
        uint numCourses;
        
        mapping(uint => string) numToExp;   // experience number to the string of the experience title
        uint numExperiences;

        mapping(uint => string) numToProject;  // project number to string of project title
        uint numProjects;
    }

    struct Employer {
        string name;
        string companyName;
        mapping(string => string) nameToCompany;
    }

    uint public numStudents = 0;
    mapping(address => Student) public users;   // hashmap of key:address to value:students_struct
    
    uint public numEmployers = 0;
    mapping(address => Employer) public employers; //List of employers (address, string)

    mapping(string => string) public eName2Company; // from employer name to company

    address public god;     // God of the portfolio management

    //When viewing profile
    string public requestedStudent = "NotRealName";

    // Creates the portfolio management contract
    constructor(address oracleAd) SPClient(oracleAd) {
        god = msg.sender; // Set contract creator as god as they hold the most power
    }

    function receiveStudentFromOracle(uint256 requestId, string memory name, string memory projects, string memory courses, string memory experience)
        internal override
    {
        requestedStudent = string(abi.encodePacked("Student name: ", name, ", projects: ", projects, ", courses: ", courses, ", experience: ", experience));
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
    function addStudent(address studentAddress, string memory name) public onlyGod returns (uint) {
        Student storage s = users[studentAddress];
        s.name = name;
        s.numEndorsed = 0;
        s.numCourses = 0;
        s.numAccesses = 0;
        s.numExperiences = 0;

        numStudents++;

        addStudentOracle(studentAddress, name);
        return numStudents;
    }

    // adds employer to the smart contract
    function addEmployer(address employerAddress, string memory name, string memory companyName) public onlyGod returns (uint){
        // check if student is trying to endorse
        Employer storage e = employers[employerAddress];
        e.name = name;
        e.companyName = companyName;
        eName2Company[name] = companyName;
        numEmployers++;
        return numEmployers;
    }

    /////////////////// ENDORSEMENT RELATED FUCTIONS ///////////////////
    // employers endorse the experiences of the students (FUNCTIONAL REQUIREMENT 2: TRACKING AUTHENTICITY OF DATA)

    // checks the if the student address is valid, if the msg sender is an employer and returns the total number of endorsments of a student so far
    function endorse(address studentAddress) public validStudent(studentAddress) validEmployer(msg.sender){
        Student storage s = users[studentAddress];
        s.endorsed[s.numEndorsed++] = employers[msg.sender].name;
    }

    // shows the whole profile only if access to employer
    // shows the endorsed work experiences of the students
    function viewProfile(address studentAddress) public /*isMember*/ validStudent(studentAddress) returns (string memory studentName) {
        requestStudentFromOracle(studentAddress);
        return requestedStudent;
    }

    function viewEndorsers(address studentAddress) private validStudent(studentAddress) returns (string [] memory) {
        Student storage s = users[studentAddress];

        string memory company;
        string memory empName;
        string[] memory endorsements = new string[](s.numEndorsed);

        for(uint i = 0; i < s.numEndorsed; i++){
            empName = s.endorsed[i];
            company = eName2Company[empName];
            endorsements[i] = string(abi.encodePacked(empName, " from ", company));
            
        }
        return endorsements;
    }


    /////////////////// ACCESS CONTROL RELATED FUCTIONS ///////////////////
    // FUNCTIONS where employers can either request access or students can grant access
    // these functions help meet the NON-FUNCTIONAL REQUIREMENT OF DATA PRIVACY (marks are confidential)

    // send request to student to view marks : instantly granted, ONLY ONCE
    function requestAccess(address studentAddress) public validStudent(studentAddress) validEmployer(msg.sender) {
        Student storage s = users[studentAddress];
        require(s.accessControl[msg.sender] == false, "Exception: Already have access");
        s.accessControl[msg.sender] = true;
        s.numAccesses++;
    }

    // student has option to grant access to their personal records, ONLY ONCE
    function grantAccess(address employerAddress) public validEmployer(employerAddress) validStudent(msg.sender) {
        Student storage s = users[msg.sender];
        require(s.accessControl[employerAddress] == false, "Exception: Already have access");
        s.accessControl[employerAddress] = true;
        s.numAccesses++;
    }

    /////////////////// COURSES AND MARKS RELATED FUCTIONS ///////////////////
    // add courses to students' portfolios. Student courses are visible in their profiles to everyone, but marks are confidential and only available if the employer has access. meeting the first FUNCTIONAL REQUIREMENT

    // adding data to the contract only by the student -> returns the number of courses done by the student
    function addCourse(string memory course, uint marks) public validStudent(msg.sender) returns (uint) {
        Student storage s = users[msg.sender];
        s.courseToMarks[course] = marks;
        s.numToCourse[s.numCourses] = course;
        s.numCourses++;

        addCourseOracle(msg.sender, course);
        return s.numCourses;
    }

    // returns a string of all courses
    function viewCourses(address studentAddress) private validStudent(studentAddress) returns (string [] memory) {
        Student storage s = users[studentAddress];
        string[] memory schoolRecs = new string[](s.numCourses);
        for (uint i = 0; i < s.numCourses; i++) {
            schoolRecs[i] = s.numToCourse[i];
        }
        return schoolRecs;
    }

    // returns a string of marks of all courses, only emp can request if they have access, for a valid student address
    // NFR-2: data privacy
    function viewMarks(address studentAddress) public validStudent(studentAddress) validEmployer(msg.sender) returns (uint [] memory) {
        Student storage s = users[studentAddress];
        require(s.accessControl[msg.sender] == true, "You do not have access to student's records");
        
        // if employer has access
        uint[] memory courseMarks = new uint[](s.numCourses);
        string memory course;
        for (uint i = 0; i < s.numCourses; i++) {
            course = s.numToCourse[i];
            courseMarks[i] = s.courseToMarks[course];
        }
        return courseMarks;
    }

    /////////////////// WORK EXPERIENCE ///////////////////
    // here students add their past work experiences, and leave for employers to endorse them
    // or the employers can add experiences for the students -> by default endorsed

    // students can add their work experiences: requires endorsements
    function studentAddExperience(string memory work) public validStudent(msg.sender) returns (uint) {
        Student storage s = users[msg.sender];
        s.numToExp[s.numExperiences] = work;
        s.numExperiences++;
        addExpOracle(msg.sender, work);

        return s.numExperiences;
    }

    // employers can add experiences for the students (already endorsed)
    function employerAddExperience(address studentAddress, string memory work) public validStudent(studentAddress) validEmployer(msg.sender) returns (uint) {
        Student storage s = users[studentAddress];
        s.numToExp[s.numExperiences] = work;
        endorse(studentAddress);
        s.numExperiences++;
        addExpOracle(studentAddress, work);
        return s.numExperiences;
    }

    // pvt function to return a string of all the work done by a particular student
    function viewExperience(address studentAddress) private validStudent(studentAddress) returns (string [] memory) {
        Student storage s = users[studentAddress];
        string[] memory workDone = new string[](s.numExperiences);
        for (uint i = 0; i < s.numExperiences; i++) {
            workDone[i] = s.numToExp[i];
        }
        return workDone;
    }

    /////////////////// PROJECT ///////////////////

    // add projects only by the student
    function addProject(string memory project) public validStudent(msg.sender) returns (uint) {
        Student storage s = users[msg.sender];
        s.numToProject[s.numProjects] = project;
        s.numProjects++;
        addProjectOracle(msg.sender, project);
        return s.numProjects;
    }

    // pvt function to view projects
    function viewProjects(address studentAddress) private validStudent(studentAddress) returns (string [] memory) {
        Student storage s = users[studentAddress];
        string [] memory projects = new string[](s.numProjects);
        for (uint i = 0; i < s.numProjects; i++) {
            projects[i] = s.numToProject[i];
        }
        return projects;
    }

    /////////////////// MODIFIERS ///////////////////

    /// @notice Only god can do
    modifier onlyGod() {
        require(msg.sender == god, "Only god can execute");
        _;
    }

    // 
    modifier validStudent(address studentAddress){
        if (studentAddress == msg.sender) {
            require(bytes(users[studentAddress].name).length != 0, "Only students can do this");
        } else {
            require(bytes(users[studentAddress].name).length != 0, "Student does not exist");
        }
        _;
    }
    
    modifier validEmployer(address employerAddress){
        require (bytes(employers[employerAddress].name).length != 0 && bytes(employers[employerAddress].companyName).length != 0, "Only employer can do this");
        _;
    }
}
