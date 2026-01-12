import React, { useState, useEffect } from 'react';
import { Plus, Minus, FileText, X, Filter, Download } from 'lucide-react';

const DakshBank = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [transactionType, setTransactionType] = useState('');
  const [pin, setPin] = useState('');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [date, setDate] = useState('');
  const [userId, setUserId] = useState('');
  const [notification, setNotification] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Users configuration - you can modify this
  const users = {
    '1234': { id: 'daksh', name: 'Daksh' },
    '5678': { id: 'brother', name: 'Brother' }
  };

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const balanceResult = await window.storage.get('daksh-bank-balance');
      const transactionsResult = await window.storage.get('daksh-bank-transactions');
      
      if (balanceResult) {
        setBalance(JSON.parse(balanceResult.value));
      }
      if (transactionsResult) {
        setTransactions(JSON.parse(transactionsResult.value));
      }
    } catch (error) {
      console.log('No existing data found, starting fresh');
    }
  };

  const saveData = async (newBalance, newTransactions) => {
    try {
      await window.storage.set('daksh-bank-balance', JSON.stringify(newBalance));
      await window.storage.set('daksh-bank-transactions', JSON.stringify(newTransactions));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleButtonClick = (type) => {
    setTransactionType(type);
    setShowPinModal(true);
    setPin('');
    setUserId('');
  };

  const verifyPin = () => {
    if (users[pin]) {
      setUserId(users[pin].id);
      setShowPinModal(false);
      setShowTransactionModal(true);
      setDate(new Date().toISOString().split('T')[0]);
      setPin('');
    } else {
      showNotification('Invalid PIN!', 'error');
      setPin('');
    }
  };

  const handleTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showNotification('Please enter a valid amount!', 'error');
      return;
    }

    const amountNum = parseFloat(amount);
    const newBalance = transactionType === 'add' 
      ? balance + amountNum 
      : balance - amountNum;

    if (newBalance < 0) {
      showNotification('Insufficient balance!', 'error');
      return;
    }

    const transaction = {
      id: Date.now(),
      type: transactionType,
      amount: amountNum,
      comment: comment || 'No comment',
      date: date,
      user: users[Object.keys(users).find(key => users[key].id === userId)].name,
      userId: userId,
      timestamp: new Date().toISOString()
    };

    const newTransactions = [transaction, ...transactions];
    
    setBalance(newBalance);
    setTransactions(newTransactions);
    await saveData(newBalance, newTransactions);

    showNotification(
      `₹${amountNum.toFixed(2)} ${transactionType === 'add' ? 'added' : 'deducted'} successfully!`,
      'success'
    );

    resetTransactionForm();
  };

  const resetTransactionForm = () => {
    setShowTransactionModal(false);
    setAmount('');
    setComment('');
    setDate('');
    setUserId('');
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(''), 3000);
  };

  const exportLogs = () => {
    const csv = [
      ['Date', 'Type', 'Amount', 'User', 'Comment'].join(','),
      ...filteredTransactions.map(t => 
        [t.date, t.type.toUpperCase(), t.amount, t.user, `"${t.comment}"`].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daksh-bank-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredTransactions = transactions.filter(t => {
    const userMatch = filterUser === 'all' || t.userId === filterUser;
    const typeMatch = filterType === 'all' || t.type === filterType;
    return userMatch && typeMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Daksh Bank</h1>
          <p className="text-gray-600">Your Virtual Savings Tracker</p>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Current Balance</p>
            <p className="text-5xl font-bold text-indigo-600">₹{balance.toFixed(2)}</p>
            <p className="text-gray-500 text-sm mt-2">{transactions.length} transactions</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => handleButtonClick('add')}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Money
          </button>
          <button
            onClick={() => handleButtonClick('deduct')}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Minus size={20} />
            Deduct Money
          </button>
          <button
            onClick={() => setShowLogsModal(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <FileText size={20} />
            Logs
          </button>
        </div>

        {/* Recent Transactions Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${t.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'add' ? '+' : '-'}₹{t.amount.toFixed(2)}
                      </span>
                      <span className="text-gray-600 text-sm">by {t.user}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{t.comment}</p>
                  </div>
                  <span className="text-gray-500 text-sm">{t.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Enter PIN</h2>
              <button onClick={() => setShowPinModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && verifyPin()}
              placeholder="Enter your PIN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-center text-2xl tracking-widest"
              maxLength="4"
              autoFocus
            />
            <button
              onClick={verifyPin}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {transactionType === 'add' ? 'Add Money' : 'Deduct Money'}
              </h2>
              <button onClick={resetTransactionForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  step="0.01"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Comment</label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={handleTransaction}
                className={`w-full ${
                  transactionType === 'add' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                } text-white font-semibold py-3 rounded-lg transition`}
              >
                {transactionType === 'add' ? 'Add' : 'Deduct'} ₹{amount || '0.00'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Transaction Logs</h2>
              <button onClick={() => setShowLogsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-medium mb-2">Filter by User</label>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Users</option>
                  {Object.values(users).map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-medium mb-2">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Types</option>
                  <option value="add">Add</option>
                  <option value="deduct">Deduct</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={exportLogs}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto">
              {filteredTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No transactions found</p>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map(t => (
                    <div key={t.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`font-bold text-lg ${t.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                              {t.type === 'add' ? '+' : '-'}₹{t.amount.toFixed(2)}
                            </span>
                            <span className="text-gray-600 text-sm">by {t.user}</span>
                          </div>
                          <p className="text-gray-700">{t.comment}</p>
                        </div>
                        <div className="text-right text-gray-500 text-sm">
                          <p>{t.date}</p>
                          <p className="text-xs">{new Date(t.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DakshBank;