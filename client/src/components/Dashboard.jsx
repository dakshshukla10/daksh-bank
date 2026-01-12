import { useState, useEffect } from 'react';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

function Dashboard({ user, onLogout, setUser }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/balance?userId=savings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUser(prev => ({ ...prev, balance: data.balance }));
      } else if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        onLogout();
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      // Fetch all transactions (shared savings - no user filter)
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      } else if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        onLogout();
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [filters]);

  const handleTransactionComplete = () => {
    fetchBalance();
    fetchTransactions();
  };

  const exportToCSV = () => {
    const token = localStorage.getItem('authToken');
    const params = new URLSearchParams({ format: 'csv' });
    if (filters.type) params.append('type', filters.type);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    // Create a temporary link with auth header (via fetch and blob)
    const fetchCSV = async () => {
      try {
        const response = await fetch(`/api/transactions?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        console.error('Failed to export CSV:', err);
      }
    };
    fetchCSV();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-bank-primary shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Daksh Bank</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-blue-200">Welcome, {user.name}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-bank-primary to-bank-secondary rounded-2xl p-8 text-white mb-8 shadow-xl">
          <p className="text-blue-200 text-sm mb-1">Total Savings</p>
          <h2 className="text-4xl font-bold">₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          <p className="text-blue-200 text-sm mt-2">Logged in as: {user.name}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Transaction Form */}
          <div className="md:col-span-1">
            <TransactionForm 
              userId={user.id}
              userName={user.name}
              currentBalance={user.balance}
              onComplete={handleTransactionComplete} 
            />
          </div>

          {/* Transaction History */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 text-gray-500 hover:text-bank-primary hover:bg-gray-100 rounded-lg transition"
                    title="Filter"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="p-2 text-gray-500 hover:text-bank-primary hover:bg-gray-100 rounded-lg transition"
                    title="Export CSV"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-bank-accent focus:border-transparent outline-none"
                      >
                        <option value="">All</option>
                        <option value="add">Add</option>
                        <option value="deduct">Deduct</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-bank-accent focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-bank-accent focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setFilters({ type: '', startDate: '', endDate: '' })}
                    className="mt-3 text-sm text-bank-accent hover:text-bank-primary"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              <TransactionList transactions={transactions} loading={loading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
