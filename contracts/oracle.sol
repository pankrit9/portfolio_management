// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

interface OracleInterface {
    function requestData(uint256 requestId, bytes memory data) external;
    function pushData(uint256 requestId, bytes memory data) external;
    function pushCourseData(uint256 requestId, bytes memory data) external;
    function pushExpData(uint256 requestId, bytes memory data) external;
    function pushProjectData(uint256 requestId, bytes memory data) external;

}

abstract contract OracleClient {
    address _oracleAddr;

    uint256 _requestCounter = 0;

    constructor(address oracleAd) {
        _oracleAddr = oracleAd;
    }

    modifier oracleOnly() {
        require(msg.sender == _oracleAddr);
        _;
    }

    function requestDataFromOracle(bytes memory data)
        internal
        returns (uint256)
    {
        OracleInterface(_oracleAddr).requestData(++_requestCounter, data);
        return _requestCounter;
    }

    function pushDataToOracle(bytes memory data)
        internal
        returns (uint256)
    {
        OracleInterface(_oracleAddr).pushData(++_requestCounter, data);
        return _requestCounter;
    }

    function pushCourseToOracle(bytes memory data)
        internal
        returns (uint256)
    {
        OracleInterface(_oracleAddr).pushCourseData(++_requestCounter, data);
        return _requestCounter;
    }

    function pushExpToOracle(bytes memory data)
        internal
        returns (uint256)
    {
        OracleInterface(_oracleAddr).pushExpData(++_requestCounter, data);
        return _requestCounter;
    }    
    
    function pushProjectToOracle(bytes memory data)
        internal
        returns (uint256)
    {
        OracleInterface(_oracleAddr).pushProjectData(++_requestCounter, data);
        return _requestCounter;
    }

    function receiveDataFromOracle(uint256 requestId, bytes memory data)
        public
        virtual;
}

abstract contract Oracle is OracleInterface {
    event request(uint256 requestId, address caller, bytes data);
    event push(uint256 requestId, address caller, bytes data);
    event addCourse(uint256 requestId, address caller, bytes data);
    event addExperience(uint256 requestId, address caller, bytes data);
    event addProject(uint256 requestId, address caller, bytes data);

    address public trustedServer;

    modifier trusted() {
        require(msg.sender == trustedServer);
        _;
    }

    constructor(address serverAddr) {
        trustedServer = serverAddr;
    }

    function requestData(uint256 requestId, bytes memory data) public override {
        emit request(requestId, msg.sender, data);
    }

    function pushData(uint256 requestId, bytes memory data) public override {
        emit push(requestId, msg.sender, data);
    }

    function pushCourseData(uint256 requestId, bytes memory data) public override  {
        emit addCourse(requestId, msg.sender, data);
    }

    function pushExpData(uint256 requestId, bytes memory data) public override  {
        emit addExperience(requestId, msg.sender, data);
    }

    function pushProjectData(uint256 requestId, bytes memory data) public override  {
        emit addProject(requestId, msg.sender, data);
    }

    function replyData(
        uint256 requestId,
        address caller,
        bytes memory data
    ) public virtual trusted {
        // emit printEvent(data);
        OracleClient(caller).receiveDataFromOracle(requestId, data);
    }
}

contract SPOracle is Oracle {
    constructor(address serverAddr) Oracle(serverAddr) {}
}

abstract contract SPClient is OracleClient {
    constructor(address oracleAd) OracleClient(oracleAd) {}

    function addStudentOracle(address addr, string memory name) internal returns (uint256) {
        pushDataToOracle(abi.encode(addr, name));
        return _requestCounter;
    }

    function addCourseOracle(address addr, string memory courseName) internal returns (uint256) {
        pushCourseToOracle(abi.encode(addr, courseName));
        return _requestCounter;
    }

    function addExpOracle(address addr, string memory experience) internal returns (uint256) {
        pushExpToOracle(abi.encode(addr, experience));
        return _requestCounter;
    }
    function addProjectOracle(address addr, string memory projectName) internal returns (uint256) {
        pushProjectToOracle(abi.encode(addr, projectName));
        return _requestCounter;
    }
    function requestStudentFromOracle(address stuAddr)
        internal
        returns (uint256)
    {
        requestDataFromOracle(abi.encode(stuAddr));
        return _requestCounter;
    }

    function receiveDataFromOracle(uint256 requestId, bytes memory data)
        public
        override
        oracleOnly
    {
        (string memory studentName, string memory projects, string memory courses, string memory experience ) = abi.decode(data, (string, string, string, string));
        receiveStudentFromOracle(requestId, studentName, projects, courses, experience);
    }

    function receiveStudentFromOracle(uint256 requestId, string memory name, string memory projects, string memory courses, string memory experience)
        internal
        virtual;
}
