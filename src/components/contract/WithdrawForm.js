import React, { useState, useEffect } from 'react';
import { ethers, parseEther, formatEther } from 'ethers';
import ContractService from '../../services/contract_service';

const WithdrawForm = () => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [contractBalance, setContractBalance] = useState('0');
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState('');

  const fetchContractBalance = async () => {
    setBalanceLoading(true);
    setBalanceError('');
    
    try {
      await ContractService.init(); // Ensure contract is initialized
      const balance = await ContractService.getContractBalance();
      
      if (!balance) {
        console.warn('Balance returned is falsy:', balance);
        setContractBalance('0');
      } else {
        console.log('Raw balance value:', balance.toString());
        const formattedBalance = formatEther(balance);
        console.log('Formatted balance:', formattedBalance);
        setContractBalance(formattedBalance);
      }
    } catch (err) {
      console.error('Error fetching contract balance:', err);
      setBalanceError('Failed to load balance: ' + (err.message || 'Unknown error'));
      setContractBalance('Error');
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchContractBalance();
  }, []);

  const handleWithdraw = async () => {
    setError('');
    setSuccess('');
    setIsProcessing(true);

    try {
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      await ContractService.withdraw(parseEther(amount));
      setSuccess(`Successfully withdrew ${amount} ETH`);
      // Refresh the contract balance after withdrawal
      fetchContractBalance();
    } catch (err) {
      console.error('Withdrawal error:', err);
      setError(err.message || 'Failed to withdraw');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-blue-800">Withdraw ETH</h3>
      
      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">Contract Balance:</p>
        {balanceLoading ? (
          <p className="text-lg">Loading balance...</p>
        ) : balanceError ? (
          <div className="text-red-500 text-sm">{balanceError}</div>
        ) : (
          <p className="text-lg font-semibold">{contractBalance} ETH</p>
        )}
      </div>

      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in ETH"
        className="w-full p-2 border rounded mb-4"
      />
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}
      <button
        onClick={handleWithdraw}
        disabled={isProcessing}
        className={`w-full p-2 rounded ${
          isProcessing ? 'bg-gray-400' : 'bg-blue-600 text-white'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Withdraw'}
      </button>
    </div>
  );
};

export default WithdrawForm; 