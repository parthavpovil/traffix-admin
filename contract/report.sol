/**
 *Submitted for verification at Etherscan.io on 2025-02-17
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReportAndReward {
    struct ReportData {
        uint256 id;
        address reporter;
        string description;
        string location;
        string evidenceLink; // IPFS hash of the evidence
        bool verified;
        uint256 reward;
        uint256 timestamp;
        bool visibility; // Determines if the report is visible to others
    }

    ReportData[] public reports;
    
    uint256 public reportCount; // Count of reports submitted
    address public owner;

    event ReportSubmitted(uint256 indexed id, address indexed reporter);
    event ReportVerified(uint256 indexed id, address indexed reporter, uint256 reward);
    event Withdrawal(uint256 amount, address indexed to);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() payable {
        owner = msg.sender;
        reportCount = 0; // Initialize report count
    }

    // Function to submit a report
    function submitReport(string memory _description, string memory _location, string memory _evidenceLink, bool _visibility) public {
        uint256 id = reports.length;
        reports.push(ReportData({
            id: id,
            reporter: msg.sender,
            description: _description,
            location: _location,
            evidenceLink: _evidenceLink,
            verified: false,
            reward: 0, // Default reward, to be set during verification
            timestamp: block.timestamp,
            visibility: _visibility // User decides visibility when submitting
        }));

        reportCount++; // Increment the report count

        emit ReportSubmitted(id, msg.sender);
    }

    // Function to verify a report and transfer the reward (Only owner can verify)
    function verifyReport(uint256 _id, uint256 _newReward) public payable onlyOwner {
        ReportData storage report = reports[_id];
        require(!report.verified, "Report already verified");

        // Set or update the reward amount
        report.reward = _newReward;

        // Mark the report as verified
        report.verified = true;

        // Transfer the reward to the reporter
        require(address(this).balance >= report.reward, "Insufficient contract balance");
        payable(report.reporter).transfer(report.reward);

        emit ReportVerified(_id, report.reporter, report.reward);
    }

    // Function to withdraw Ether from the contract (restricted to owner)
    function withdraw(uint256 _amount) public onlyOwner {
        require(address(this).balance >= _amount, "Insufficient contract balance");
        payable(owner).transfer(_amount);
        emit Withdrawal(_amount, owner);
    }

    // Function to get reports by a reporter's address
    function getReportsByAddress(address _reporter) public view returns (ReportData[] memory) {
        uint256 reportCountByUser = 0;

        // Count how many reports belong to the given reporter
        for (uint256 i = 0; i < reports.length; i++) {
            if (reports[i].reporter == _reporter) {
                reportCountByUser++;
            }
        }

        // Create an array to hold the reports for the given address
        ReportData[] memory userReports = new ReportData[](reportCountByUser);
        uint256 index = 0;

        // Populate the array with the user's reports
        for (uint256 i = 0; i < reports.length; i++) {
            if (reports[i].reporter == _reporter) {
                userReports[index] = reports[i];
                index++;
            }
        }

        return userReports;
    }

    // Function to get reports that have visibility set to true
    function getVisibleReports() public view returns (ReportData[] memory) {
        uint256 visibleCount = 0;

        // Count how many reports are visible
        for (uint256 i = 0; i < reports.length; i++) {
            if (reports[i].visibility) {
                visibleCount++;
            }
        }

        // Create an array to hold visible reports
        ReportData[] memory visibleReports = new ReportData[](visibleCount);
        uint256 index = 0;

        // Populate the array with only visible reports
        for (uint256 i = 0; i < reports.length; i++) {
            if (reports[i].visibility) {
                visibleReports[index] = reports[i];
                index++;
            }
        }

        return visibleReports;
    }

    // Function to get all verified reports
    function getVerifiedReports() public view returns (ReportData[] memory) {
        uint256 verifiedCount = 0;

        // Count how many reports are verified
        for (uint256 i = 0; i < reports.length; i++) {
            if (reports[i].verified) {
                verifiedCount++;
            }
        }

        // Create an array to hold verified reports
        ReportData[] memory verifiedReports = new ReportData[](verifiedCount);
        uint256 index = 0;

        // Populate the array with only verified reports
        for (uint256 i = 0; i < reports.length; i++) {
            if (reports[i].verified) {
                verifiedReports[index] = reports[i];
                index++;
            }
        }

        return verifiedReports;
    }
    


    // Fallback function to receive Ether into the contract
    receive() external payable {}
}