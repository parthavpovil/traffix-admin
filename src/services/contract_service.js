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
    this.signer = null;
  }

  async init() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      console.log('Initializing contract service...');
      
      // Request accounts from MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }
      
      console.log('Connected accounts:', accounts);
      
      // Create provider
      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get signer and save as property
      this.signer = await this.provider.getSigner();
      console.log('Signer address:', await this.signer.getAddress());
      
      // Create contract instance without checksum validation
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.signer
      );
      
      console.log('Contract initialized at address:', CONTRACT_ADDRESS);
      
      // Verify the contract exists
      const code = await this.provider.getCode(CONTRACT_ADDRESS);
      if (code === '0x') {
        throw new Error('No contract code found at the specified address: ' + CONTRACT_ADDRESS);
      }
      
      return this.contract;
    } catch (error) {
      console.error('Error initializing contract:', error);
      this.provider = null;
      this.signer = null;
      this.contract = null;
      throw error;
    }
  }

  async checkOwnership(address) {
    try {
      if (!this.contract) {
        await this.init();
      }

      // Make sure we have a valid provider and contract
      if (!this.provider || !this.contract) {
        console.error('Provider or contract not initialized');
        return false;
      }

      // Make sure the address is valid
      if (!address || typeof address !== 'string') {
        console.error('Invalid address provided to checkOwnership:', address);
        return false;
      }

      // Try to call the owner function
      try {
        const owner = await this.contract.owner();
        console.log('Contract owner address:', owner);
        console.log('Current user address:', address);
        return owner.toLowerCase() === address.toLowerCase();
      } catch (ownerError) {
        console.error('Error calling owner() function:', ownerError);
        // If the function call fails, consider checking the contract code as a fallback
        const code = await this.provider.getCode(this.contract.target);
        if (code === '0x') {
          throw new Error('No contract code found at the specified address');
        }
        // Since we can't verify ownership, return false
        return false;
      }
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

  async getContractStats() {
    if (!this.contract) {
      await this.init();
    }

    try {
      // Get total reports count
      const totalReports = await this.contract.reportCount();
      
      // Get verified reports
      const verifiedReports = await this.contract.getVerifiedReports();
      
      // Get contract balance
      const balance = await this.provider.getBalance(this.contract.target);
      
      // Calculate total rewards
      const totalRewards = verifiedReports.reduce((sum, report) => sum + Number(report.reward), 0);

      return {
        totalReports: Number(totalReports),
        verifiedCount: verifiedReports.length,
        totalRewards: ethers.formatEther(totalRewards.toString()),
        contractBalance: ethers.formatEther(balance)
      };
    } catch (error) {
      console.error('Error getting contract stats:', error);
      throw error;
    }
  }

  async getContractBalance() {
    try {
      if (!this.contract || !this.provider) {
        console.log('Contract or provider not initialized, initializing now');
        await this.init();
      }

      if (!this.contract || !this.provider) {
        throw new Error('Failed to initialize contract or provider');
      }

      console.log('Fetching balance for contract address:', this.contract.target);
      const balance = await this.provider.getBalance(this.contract.target);
      console.log('Raw contract balance:', balance.toString());
      return balance;
    } catch (error) {
      console.error('Error getting contract balance:', error);
      throw error;
    }
  }

  async withdraw(amount) {
    if (!this.contract) {
      await this.init();
    }
    try {
      const tx = await this.contract.withdraw(amount);
      await tx.wait();
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  }

  async verifyReport(reportId, rewardAmount) {
    try {
      console.log(`Attempting to verify report ${reportId} with reward ${rewardAmount} ETH`);
      
      // Make sure contract is initialized
      if (!this.contract) {
        console.log('Contract not initialized, initializing now...');
        await this.init();
      }
      
      // Double-check that we have a valid contract and signer
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not properly initialized. Please check your wallet connection.');
      }
      
      // Convert the ETH amount to wei
      const rewardInWei = ethers.parseEther(rewardAmount.toString());
      console.log(`Reward in wei: ${rewardInWei.toString()}`);
      
      // Verify the current user is the owner
      const currentAddress = await this.signer.getAddress();
      const isOwner = await this.checkOwnership(currentAddress);
      if (!isOwner) {
        throw new Error('Only the contract owner can verify reports.');
      }
      
      // Call the contract's verifyReport function with the proper parameters
      // Since this is a payable function, we need to include value in the transaction
      console.log(`Sending transaction to verify report ${reportId} with ${rewardInWei} wei...`);
      const tx = await this.contract.verifyReport(reportId, rewardInWei, {
        value: rewardInWei
      });
      
      console.log('Verification transaction sent:', tx.hash);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Verification confirmed in block:', receipt.blockNumber);
      
      return receipt;
    } catch (error) {
      console.error('Error verifying report:', error);
      // Enhance error message
      if (error.message.includes('user rejected')) {
        throw new Error('Transaction was rejected in your wallet');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds to send the reward');
      } else if (error.message.toLowerCase().includes('already verified')) {
        throw new Error('This report has already been verified');
      } else {
        throw error;
      }
    }
  }
}

// Export the instance of ContractService
const contractServiceInstance = new ContractService();
export default contractServiceInstance;