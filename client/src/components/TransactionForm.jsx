import { useState } from 'react';

function TransactionForm({ userId, userName, currentBalance, onComplete }) {
  const [type, setType] = useState('add');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    if (type === 'deduct' && numAmount > currentBalance) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'savings', // shared savings account
          type,
          amount: numAmount,
          description,
          addedBy: userId // who made this entry
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Successfully ${type === 'add' ? 'added' : 'deducted'} ₹${numAmount.toLocaleString('en-IN')}` 
        });
        setAmount('');
        setDescription('');
        onComplete();
      } else {
        setMessage({ type: 'error', text: data.message || 'Transaction failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Log Transaction</h3>
      <p className="text-sm text-gray-500 mb-4">Adding as {userName}</p>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Transaction Type Toggle */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setType('add')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition ${
                type === 'add'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              + Add Money
            </button>
            <button
              type="button"
              onClick={() => setType('deduct')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition ${
                type === 'deduct'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              - Deduct
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bank-accent focus:border-transparent outline-none transition"
            placeholder="100"
            min="0"
            step="100"
            required
          />
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bank-accent focus:border-transparent outline-none transition"
            placeholder="e.g., Salary, Groceries"
            maxLength={100}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !amount}
          className={`w-full font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            type === 'add'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            type === 'add' ? 'Add Money' : 'Deduct Money'
          )}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
