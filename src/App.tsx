import React, { useState, useMemo } from 'react';
import { generateMockData, generateRawData } from './mockData';
import type { GoldenRecord, RawData } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<GoldenRecord[]>(generateMockData());
  const [rawData] = useState<RawData>(generateRawData());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'review' | 'fareharbor' | 'revolut' | 'gmail'>('ledger');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<GoldenRecord | null>(null);
  const [collapsedBookings, setCollapsedBookings] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const inventoryUnits = data.length;
    const purchasesDetected = rawData.revolut.length;
    const documentsReceived = rawData.gmail.length;
    const needsReview = data.filter(r => r.overallStatus === 'manual_review').length;
    const unresolvedPurchases = data.filter(r => r.issueType === 'unmatched_purchase').length;
    
    return { inventoryUnits, purchasesDetected, documentsReceived, needsReview, unresolvedPurchases };
  }, [data, rawData]);

  const filteredData = useMemo(() => {
    return data.filter(r => 
      r.booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const groupedData = useMemo(() => {
    const groups: Record<string, GoldenRecord[]> = {};
    filteredData.forEach(record => {
      if (!groups[record.booking.id]) {
        groups[record.booking.id] = [];
      }
      groups[record.booking.id].push(record);
    });
    return groups;
  }, [filteredData]);

  const reviewQueue = useMemo(() => {
    return data.filter(r => r.overallStatus === 'manual_review');
  }, [data]);

  const handleResolve = (id: string) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, overallStatus: 'matched', confidence: 100 } : r));
  };

  const handleFlag = (id: string) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, overallStatus: 'failed', confidence: 0 } : r));
  };

  const toggleBooking = (bookingId: string) => {
    const newCollapsed = new Set(collapsedBookings);
    if (newCollapsed.has(bookingId)) {
      newCollapsed.delete(bookingId);
    } else {
      newCollapsed.add(bookingId);
    }
    setCollapsedBookings(newCollapsed);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar */}
      <nav className="w-64 bg-slate-900 text-white p-6 space-y-8 flex-shrink-0">
        <div className="text-xl font-bold tracking-tight text-blue-400">ItalyMockup v2</div>
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-4">Main</div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-2 rounded-md transition flex items-center space-x-2 ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <span>📊</span> <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`w-full text-left px-4 py-2 rounded-md transition flex items-center space-x-2 ${activeTab === 'ledger' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <span>📜</span> <span>Ticket Ledger</span>
          </button>
          <button 
            onClick={() => setActiveTab('review')}
            className={`w-full text-left px-4 py-2 rounded-md transition flex items-center space-x-2 ${activeTab === 'review' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <span>🔍</span> <span>Review Queue ({stats.needsReview})</span>
          </button>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-2 px-4">Raw Data (Admin)</div>
          <button 
            onClick={() => setActiveTab('fareharbor')}
            className={`w-full text-left px-4 py-2 rounded-md transition flex items-center space-x-2 ${activeTab === 'fareharbor' ? 'bg-orange-600' : 'hover:bg-slate-800'}`}
          >
            <span>🏗️</span> <span>Fareharbor</span>
          </button>
          <button 
            onClick={() => setActiveTab('revolut')}
            className={`w-full text-left px-4 py-2 rounded-md transition flex items-center space-x-2 ${activeTab === 'revolut' ? 'bg-white/10' : 'hover:bg-slate-800'}`}
          >
            <span>💳</span> <span>Revolut</span>
          </button>
          <button 
            onClick={() => setActiveTab('gmail')}
            className={`w-full text-left px-4 py-2 rounded-md transition flex items-center space-x-2 ${activeTab === 'gmail' ? 'bg-red-600/80' : 'hover:bg-slate-800'}`}
          >
            <span>📧</span> <span>Gmail Inbox</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            {activeTab === 'ledger' ? 'Ticket Ledger' : activeTab === 'fareharbor' ? 'Fareharbor Raw Data' : activeTab === 'revolut' ? 'Revolut Raw Data' : activeTab === 'gmail' ? 'Gmail Raw Data' : <span className="capitalize">{activeTab}</span>}
          </h1>
          <div className="flex items-center space-x-4">
            <input 
              type="text" 
              placeholder="Search..." 
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Purchases Detected</div>
              <div className="text-3xl font-bold text-slate-900">{stats.purchasesDetected}</div>
              <div className="text-[10px] text-slate-400 mt-1">Revolut Transactions</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Documents Received</div>
              <div className="text-3xl font-bold text-slate-900">{stats.documentsReceived}</div>
              <div className="text-[10px] text-slate-400 mt-1">Gmail PDF Parsed</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Ticket Units in Inventory</div>
              <div className="text-3xl font-bold text-slate-900">{stats.inventoryUnits}</div>
              <div className="text-[10px] text-slate-400 mt-1">Total Atomic Units</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Unresolved Purchases</div>
              <div className={`text-3xl font-bold ${stats.unresolvedPurchases > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats.unresolvedPurchases}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">No match found</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Manual Review</div>
              <div className="text-3xl font-bold text-orange-600">{stats.needsReview}</div>
              <div className="text-[10px] text-slate-400 mt-1">Action required</div>
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-bottom border-slate-200">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket ID / Passenger</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking ID</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (Share)</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">PDF</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(groupedData).map(([bookingId, tickets]) => (
                  <React.Fragment key={bookingId}>
                    {/* Booking Header / Row 1 of Group */}
                    <tr className="bg-slate-50/50 hover:bg-slate-100 transition cursor-pointer" onClick={() => toggleBooking(bookingId)}>
                      <td className="p-4" colSpan={2}>
                        <div className="flex items-center space-x-3">
                          <span className="text-slate-400 text-xs">{collapsedBookings.has(bookingId) ? '▶' : '▼'}</span>
                          <span className="font-bold text-slate-900">{tickets[0].booking.customer}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase font-bold">
                            {tickets.length} Ticket{tickets.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm text-blue-600 font-semibold">{bookingId}</td>
                      <td className="p-4 text-slate-900 font-semibold">
                        {tickets[0].booking.amount} {tickets[0].booking.currency}
                        <span className="text-[10px] text-slate-400 block font-normal">Total Booking</span>
                      </td>
                      <td className="p-4" colSpan={2}>
                        {tickets.every(t => t.overallStatus === 'matched') ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Fully Reconciled</span>
                        ) : (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">Pending Review</span>
                        )}
                      </td>
                    </tr>
                    
                    {/* Ticket Rows */}
                    {!collapsedBookings.has(bookingId) && tickets.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50 transition border-l-4 border-l-blue-400">
                        <td className="p-4 pl-8">
                          {record.overallStatus === 'matched' ? (
                            <span className="w-2 h-2 bg-green-500 rounded-full block"></span>
                          ) : (
                            <span className="w-2 h-2 bg-orange-500 rounded-full block animate-pulse"></span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <button 
                              onClick={() => setSelectedRecord(record)}
                              className="text-slate-700 hover:text-blue-800 font-medium text-sm text-left"
                            >
                              {record.ticket.passengerName}
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {record.id}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-400 text-xs font-mono">{bookingId}</td>
                        <td className="p-4 text-slate-500 text-xs">
                          {(record.booking.amount / tickets.length).toFixed(2)} {record.booking.currency}
                        </td>
                        <td className="p-4">
                          {record.ticket.status === 'received' ? (
                            <span className="text-green-600 text-xs font-bold">✓ PDF</span>
                          ) : (
                            <span className="text-red-600 text-xs font-bold">✗ MISSING</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-sm font-semibold" style={{ color: record.confidence > 90 ? '#10b981' : record.confidence > 70 ? '#f59e0b' : '#ef4444' }}>
                            {record.confidence}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="space-y-4">
            {reviewQueue.length === 0 ? (
              <div className="bg-green-50 p-8 rounded-xl border border-green-200 text-center text-green-700">
                ✨ All tickets are reconciled! No items in queue.
              </div>
            ) : (
              reviewQueue.map(record => {
                let issueLabel: string;
                let issueColor: string;
                
                switch (record.issueType) {
                  case 'unmatched_purchase':
                    issueLabel = 'Unmatched Purchase';
                    issueColor = 'text-red-600';
                    break;
                  case 'partially_matched':
                    issueLabel = 'Partially Matched';
                    issueColor = 'text-orange-600';
                    break;
                  case 'low_confidence':
                    issueLabel = 'Confidence Score Low';
                    issueColor = 'text-yellow-600';
                    break;
                  case 'pdf_missing':
                  default:
                    issueLabel = 'PDF Ticket Missing';
                    issueColor = 'text-orange-600';
                    break;
                }

                return (
                  <div key={record.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                    <div className="flex space-x-8">
                      <div>
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Passenger</div>
                        <div className="font-semibold">{record.ticket.passengerName}</div>
                        <div className="text-xs text-slate-400">ID: {record.id}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Booking ID</div>
                        <div className="font-mono text-sm text-blue-600 font-semibold">{record.booking.id}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Issue Type</div>
                        <div className={`${issueColor} font-bold text-sm`}>
                          {issueLabel}
                        </div>
                        <div className="text-[10px] text-slate-400">Detected: {record.ticket.receivedDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleResolve(record.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                      >
                        Approve Manual
                      </button>
                      <button 
                        onClick={() => handleFlag(record.id)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition"
                      >
                        Investigate Raw Data
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'fareharbor' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-orange-50 border-b border-orange-100 text-orange-800 text-sm font-medium">
              Direct Fareharbor API Feed (Read-only)
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">FH ID</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Booking Ref</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Paid</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {rawData.fareharbor.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4 text-orange-600 font-bold">{item.id}</td>
                    <td className="p-4">{item.booking_id}</td>
                    <td className="p-4">{item.customer_name}</td>
                    <td className="p-4">{item.total_paid.toFixed(2)} EUR</td>
                    <td className="p-4 text-slate-400">{item.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'revolut' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 bg-slate-900 text-white text-sm font-medium">
              Revolut Business Account Feed
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Transaction ID</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Reference</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {rawData.revolut.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-900">{item.id}</td>
                    <td className="p-4 font-bold">{item.reference}</td>
                    <td className="p-4 text-green-600">+{item.amount.toFixed(2)} {item.currency}</td>
                    <td className="p-4"><span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-[10px]">{item.state}</span></td>
                    <td className="p-4 text-slate-400">{item.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'gmail' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-red-50 text-red-800 text-sm font-medium border-b border-red-100">
              Gmail Inbox (bookings@showmeitaly.com)
            </div>
            <div className="divide-y divide-slate-100">
              {rawData.gmail.map(item => (
                <div key={item.id} className="p-4 hover:bg-slate-50 flex justify-between items-start cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{item.from}</span>
                      <span className="text-xs text-slate-400 font-mono">{item.date}</span>
                    </div>
                    <div className="text-blue-600 font-semibold text-sm mt-1">{item.subject}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-1">{item.snippet}</div>
                  </div>
                  <div className="ml-4">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">Attachment: PDF</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <header className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Ticket Details: {selectedRecord.ticket.passengerName}</h2>
                <div className="text-sm text-slate-500">Booking Link: {selectedRecord.booking.id} • Ticket: {selectedRecord.id}</div>
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
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">1. Passenger & Ticket</h3>
                    <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-slate-500">Passenger</div>
                        <div className="font-semibold">{selectedRecord.ticket.passengerName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Ticket ID</div>
                        <div className="font-mono text-xs">{selectedRecord.id}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Received Date</div>
                        <div className="font-semibold">{selectedRecord.ticket.receivedDate}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Confidence</div>
                        <div className="font-semibold" style={{ color: selectedRecord.confidence > 90 ? '#10b981' : '#f59e0b' }}>{selectedRecord.confidence}%</div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">2. Associated Booking & Payment</h3>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded">REVOLUT LINKED</span>
                        <span className="text-xs text-blue-600 font-mono">{selectedRecord.booking.id}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-blue-400">Total Booking Amount</div>
                          <div className="font-semibold">{selectedRecord.booking.amount} {selectedRecord.booking.currency}</div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-400">Main Customer</div>
                          <div className="font-semibold">{selectedRecord.booking.customer}</div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">3. Admin Quick Links</h3>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg font-bold hover:bg-slate-700 transition">View FH Raw Data</button>
                      <button className="px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg font-bold hover:bg-slate-700 transition">View Rev Transaction</button>
                      <button className="px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg font-bold hover:bg-slate-700 transition">Search Gmail</button>
                    </div>
                  </section>
                </div>

                {/* Right Column: PDF Viewer */}
                <div className="flex flex-col h-full">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">PDF Ticket Document</h3>
                  {selectedRecord.ticket.status === 'received' ? (
                    <div className="flex-1 bg-slate-800 rounded-xl flex flex-col items-center justify-center text-white p-8 space-y-4 border-4 border-slate-700">
                      <div className="w-16 h-16 bg-red-500 rounded flex items-center justify-center font-bold text-2xl shadow-lg">PDF</div>
                      <div className="text-center">
                        <div className="font-bold text-lg">TICKET_{selectedRecord.id}.pdf</div>
                        <div className="text-slate-400 text-sm">Automated Extraction Success</div>
                      </div>
                      <div className="w-full h-48 bg-slate-700/50 rounded-lg flex flex-col p-4 space-y-4 overflow-hidden relative">
                         <div className="absolute top-4 left-4 right-4 space-y-2">
                           <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                           <div className="h-4 bg-slate-600 rounded w-1/2"></div>
                           <div className="h-10 bg-slate-600 rounded w-full"></div>
                           <div className="h-4 bg-blue-500/50 rounded w-1/4"></div>
                         </div>
                         <div className="mt-20 border-t border-slate-600 pt-4 text-[10px] text-slate-500 font-mono">
                            OCR DATA: PASSENGER_NAME={selectedRecord.ticket.passengerName}
                         </div>
                      </div>
                      <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition shadow-lg">
                        Verify PDF
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                      <div className="text-4xl mb-2">📄</div>
                      <div className="text-slate-500 font-medium">No PDF Ticket found in Gmail</div>
                      <button className="mt-4 text-blue-600 text-sm font-bold hover:underline">
                        Manually Link Email
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
