function TransactionList({ transactions, loading }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <svg className="animate-spin h-8 w-8 text-bank-accent mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-2 text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-500">No transactions yet</p>
        <p className="text-gray-400 text-sm mt-1">Your transaction history will appear here</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
      {transactions.map((tx) => (
        <div key={tx.id} className="px-6 py-4 hover:bg-gray-50 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.type === 'add' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {tx.type === 'add' ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {tx.description || (tx.type === 'add' ? 'Money Added' : 'Money Deducted')}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(tx.created_at)} · by <span className="font-medium">{tx.added_by_name}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                tx.type === 'add' ? 'text-green-600' : 'text-red-600'
              }`}>
                {tx.type === 'add' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500">
                Bal: ₹{tx.balance_after.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;
