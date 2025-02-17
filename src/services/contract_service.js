import { ethers } from 'ethers';

// Define contract address without checksum
const CONTRACT_ADDRESS = '0xa5cf9ffcfced2a711c77041c86f670560ab65081';
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":true,"internalType":"address","name":"reporter","type":"address"}],"name":"ReportSubmitted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":true,"internalType":"address","name":"reporter","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"ReportVerified","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Withdrawal","type":"event"},{"inputs":[{"internalType":"address","name":"_reporter","type":"address"}],"name":"getReportsByAddress","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"reporter","type":"address"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"string","name":"evidenceLink","type":"string"},{"internalType":"bool","name":"verified","type":"bool"},{"internalType":"uint256","name":"reward","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bool","name":"visibility","type":"bool"}],"internalType":"struct ReportAndReward.ReportData[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVisibleReports","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"reporter","type":"address"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"string","name":"evidenceLink","type":"string"},{"internalType":"bool","name":"verified","type":"bool"},{"internalType":"uint256","name":"reward","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bool","name":"visibility","type":"bool"}],"internalType":"struct ReportAndReward.ReportData[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reportCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"reports","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"reporter","type":"address"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"string","name":"evidenceLink","type":"string"},{"internalType":"bool","name":"verified","type":"bool"},{"internalType":"uint256","name":"reward","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bool","name":"visibility","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_description","type":"string"},{"internalType":"string","name":"_location","type":"string"},{"internalType":"string","name":"_evidenceLink","type":"string"},{"internalType":"bool","name":"_visibility","type":"bool"}],"name":"submitReport","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"uint256","name":"_newReward","type":"uint256"}],"name":"verifyReport","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"},{
  "inputs": [],
  "name": "getVerifiedReports",
  "outputs": [
    {
      "components": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "reporter",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "location",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "evidenceLink",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "verified",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "reward",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "visibility",
          "type": "bool"
        }
      ],
      "internalType": "struct ReportAndReward.ReportData[]",
      "name": "",
      "type": "tuple[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}];

class ContractService {
  constructor() {
    this.contract = null;
    this.provider = null;
  }

  async init() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();
      
      // Create contract instance without checksum validation
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
    } catch (error) {
      console.error('Error initializing contract:', error);
      throw error;
    }
  }

  async checkOwnership(address) {
    if (!this.contract) {
      await this.init();
    }
    try {
      const owner = await this.contract.owner();
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error checking ownership:', error);
      return false;
    }
  }

  async getAllReports() {
    if (!this.contract) {
      await this.init();
    }
    
    try {
      // Get all visible reports for pending section
      const visibleReports = await this.contract.getVisibleReports();
      return visibleReports.map(report => ({
        id: Number(report.id),
        reporter: report.reporter,
        description: report.description,
        location: report.location,
        evidenceLink: report.evidenceLink,
        verified: report.verified,
        reward: Number(report.reward),
        timestamp: Number(report.timestamp),
        visibility: report.visibility
      }));
    } catch (error) {
      console.error('Error getting reports:', error);
      throw error;
    }
  }

  async getVerifiedReports() {
    if (!this.contract) {
      await this.init();
    }
    
    try {
      console.log('Contract methods:', Object.keys(this.contract));
      console.log('Calling getVerifiedReports on contract...');
      const verifiedReports = await this.contract.getVerifiedReports();
      console.log('Raw verified reports from contract:', verifiedReports);

      if (!Array.isArray(verifiedReports)) {
        throw new Error('Invalid response from contract');
      }

      return verifiedReports.map(report => ({
        id: Number(report.id),
        reporter: report.reporter,
        description: report.description,
        location: report.location,
        evidenceLink: report.evidenceLink,
        verified: report.verified,
        reward: Number(report.reward),
        timestamp: Number(report.timestamp),
        visibility: report.visibility
      }));
    } catch (error) {
      console.error('Error getting verified reports:', error);
      throw new Error(`Contract error: ${error.message}`);
    }
  }

  getIpfsUrl(cid) {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }

  async getReportsByAddress(address) {
    if (!this.contract) {
      await this.init();
    }
    try {
      const reports = await this.contract.getReportsByAddress(address);
      return reports.map(report => ({
        id: Number(report.id),
        reporter: report.reporter,
        description: report.description,
        location: report.location,
        evidenceLink: report.evidenceLink,
        verified: report.verified,
        reward: Number(report.reward),
        timestamp: Number(report.timestamp),
        visibility: report.visibility
      }));
    } catch (error) {
      console.error('Error getting reports by address:', error);
      throw error;
    }
  }
}

export default new ContractService(); 