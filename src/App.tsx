import React, { useState, useMemo } from 'react';
import { generateMockData } from './mockData';
import type { GoldenRecord } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<GoldenRecord[]>(generateMockData());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'golden' | 'review'>('golden');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<GoldenRecord | null>(null);

  const stats = useMemo(() => {
    const total = data.length;
    const matched = data.filter(r => r.overallStatus === 'matched').length;
    const rate = (matched / total) * 100;
    const needsReview = data.filter(r => r.overallStatus === 'manual_review').length;
    return { total, matched, rate, needsReview };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(r => 
      r.booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const reviewQueue = useMemo(() => {
    return data.filter(r => r.overallStatus === 'manual_review');
  }, [data]);

  const handleResolve = (id: string) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, overallStatus: 'matched', confidence: 100 } : r));
  };

  const handleFlag = (id: string) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, overallStatus: 'failed', confidence: 0 } : r));
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar */}
      <nav className="w-64 bg-slate-900 text-white p-6 space-y-8 flex-shrink-0">
        <div className="text-xl font-bold tracking-tight text-blue-400">ItalyMockup v2</div>
        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-2 rounded-md transition ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('golden')}
            className={`w-full text-left px-4 py-2 rounded-md transition ${activeTab === 'golden' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            🌟 Booking List
          </button>
          <button 
            onClick={() => setActiveTab('review')}
            className={`w-full text-left px-4 py-2 rounded-md transition ${activeTab === 'review' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            🔍 Review Queue ({stats.needsReview})
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab.replace('_', ' ')}</h1>
          <div className="flex items-center space-x-4">
            <input 
              type="text" 
              placeholder="Search bookings..." 
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="text-slate-500 text-sm mb-1">Automation Rate</div>
              <div className="text-3xl font-bold text-slate-900">{stats.rate.toFixed(1)}%</div>
              <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.rate}%` }}></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="text-slate-500 text-sm mb-1">Total Bookings</div>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="text-slate-500 text-sm mb-1">Manual Review</div>
              <div className="text-3xl font-bold text-orange-600">{stats.needsReview}</div>
            </div>
          </div>
        )}

        {activeTab === 'golden' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-bottom border-slate-200">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking ID</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">PDF Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Financial Link</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <button 
                          onClick={() => setSelectedRecord(record)}
                          className="text-blue-600 hover:text-blue-800 font-mono text-sm font-semibold underline decoration-blue-200 hover:decoration-blue-600 text-left"
                        >
                          {record.booking.id}
                        </button>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                          {record.booking.date} • 14:30
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{record.booking.customer}</td>
                    <td className="p-4 text-slate-900 font-semibold">{record.booking.amount} {record.booking.currency}</td>
                    <td className="p-4">
                      {record.ticket ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Received</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Missing</span>
                      )}
                    </td>
                    <td className="p-4">
                      {record.transaction ? (
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Linked (Revolut)</span>
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full font-medium">Unlinked</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {record.overallStatus === 'failed' ? (
                        <span className="px-2 py-1 bg-red-600 text-white text-[10px] rounded font-bold uppercase tracking-wider">Flagged</span>
                      ) : (
                        <div className="text-sm font-semibold" style={{ color: record.confidence > 90 ? '#10b981' : record.confidence > 70 ? '#f59e0b' : '#ef4444' }}>
                          {record.confidence}%
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="space-y-4">
            {reviewQueue.length === 0 ? (
              <div className="bg-green-50 p-8 rounded-xl border border-green-200 text-center text-green-700">
                ✨ All records are reconciled! No items in queue.
              </div>
            ) : (
              reviewQueue.map(record => (
                <div key={record.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                  <div className="flex space-x-8">
                    <div>
                      <div className="text-xs text-slate-500 uppercase font-bold mb-1">Booking</div>
                      <div className="font-semibold">{record.booking.customer}</div>
                      <div className="text-sm text-slate-500">{record.booking.amount} {record.booking.currency}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase font-bold mb-1">Discrepancy</div>
                      <div className="text-orange-600 font-semibold text-sm">
                        Transaction: {record.transaction?.amount} {record.transaction?.currency}
                      </div>
                      <div className="text-xs text-slate-400">Diff: 0.01 EUR</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase font-bold mb-1">Source</div>
                      <div className="text-sm bg-slate-100 px-2 py-0.5 rounded">Revolut API</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => handleResolve(record.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Confirm Match
                    </button>
                    <button 
                      onClick={() => handleFlag(record.id)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition"
                    >
                      Flag Issue
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <header className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Record Details: {selectedRecord.booking.id}</h2>
                <div className="text-sm text-slate-500">Master Reconciliation View</div>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                ✕
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Data Details */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">1. Booking Info</h3>
                    <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-slate-500">Customer</div>
                        <div className="font-semibold">{selectedRecord.booking.customer}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Date</div>
                        <div className="font-semibold">{selectedRecord.booking.date}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Amount</div>
                        <div className="font-semibold text-blue-600">{selectedRecord.booking.amount} {selectedRecord.booking.currency}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Status</div>
                        <div className="font-semibold capitalize">{selectedRecord.booking.status}</div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">2. Revolut Transaction</h3>
                    {selectedRecord.transaction ? (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded">REVOLUT API</span>
                          <span className="text-xs text-blue-600 font-mono">{selectedRecord.transaction.id}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-blue-400">Transaction Amount</div>
                            <div className="font-semibold">{selectedRecord.transaction.amount} {selectedRecord.transaction.currency}</div>
                          </div>
                          <div>
                            <div className="text-xs text-blue-400">Match Accuracy</div>
                            <div className="font-semibold">{selectedRecord.confidence}%</div>
                          </div>
                        </div>
                        <div className="text-sm italic text-blue-800">{selectedRecord.transaction.description}</div>
                      </div>
                    ) : (
                      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
                        ⚠️ No financial transaction found for this booking.
                      </div>
                    )}
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">3. System Logic</h3>
                    <div className="bg-slate-100 rounded-xl p-4 text-xs font-mono text-slate-600">
                      <div>// Reconciliation Engine Log</div>
                      <div>[INFO] Searching for amount: {selectedRecord.booking.amount}</div>
                      <div>[INFO] Result: {selectedRecord.overallStatus === 'matched' ? 'Found perfect match in Revolut' : 'Discrepancy detected'}</div>
                      <div>[INFO] PDF Extraction: {selectedRecord.ticket ? 'Confidence 0.98' : 'Not found in email inbox'}</div>
                    </div>
                  </section>
                </div>

                {/* Right Column: PDF Viewer */}
                <div className="flex flex-col h-full">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">PDF Ticket Document</h3>
                  {selectedRecord.ticket ? (
                    <div className="flex-1 bg-slate-800 rounded-xl flex flex-col items-center justify-center text-white p-8 space-y-4 border-4 border-slate-700">
                      <div className="w-16 h-16 bg-red-500 rounded flex items-center justify-center font-bold text-2xl shadow-lg">PDF</div>
                      <div className="text-center">
                        <div className="font-bold text-lg">TICKET_{selectedRecord.booking.id}.pdf</div>
                        <div className="text-slate-400 text-sm">2.4 MB • Received via Email</div>
                      </div>
                      <div className="w-full h-64 bg-slate-700/50 rounded-lg flex flex-col p-4 space-y-4">
                        <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-600 rounded w-1/2"></div>
                        <div className="h-20 bg-slate-600 rounded w-full"></div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-slate-600 rounded w-1/4"></div>
                          <div className="h-4 bg-blue-500 rounded w-1/4"></div>
                        </div>
                      </div>
                      <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition shadow-lg">
                        Download Original PDF
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                      <div className="text-4xl mb-2">📄</div>
                      <div className="text-slate-500 font-medium">No PDF Ticket available</div>
                      <button className="mt-4 text-blue-600 text-sm font-bold hover:underline">
                        Upload Manual PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
