"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Users, Search, Star, Ban, Repeat, Calendar, DollarSign, Mail, Phone, ChevronDown, ChevronRight, Plus, Edit, X, Check, AlertCircle, Download } from 'lucide-react';

interface GuestProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  tags: ('vip' | 'blacklist' | 'repeat')[];
  notes: string;
  createdAt: string;
  source: 'Airbnb' | 'Booking.com' | 'Direct' | 'Phone' | 'Walk-in' | string;
}

interface Inquiry {
  id: string;
  guestId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  apartmentId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message?: string;
  status: 'inquiry' | 'confirmed' | 'checked-in' | 'checked-out' | 'reviewed' | 'declined';
  source: string;
  totalPrice?: number;
  createdAt: string;
  notes: string;
  locale?: string;
  guest?: GuestProfile | null;
}

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function nights(checkIn: string, checkOut: string) {
  return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
}

function getCountryFlag(country?: string) {
  const flags: Record<string, string> = {
    'DE': '🇩🇪', 'AT': '🇦🇹', 'CH': '🇨🇭', 'HR': '🇭🇷', 'SI': '🇸🇮',
    'IT': '🇮🇹', 'FR': '🇫🇷', 'ES': '🇪🇸', 'GB': '🇬🇧', 'NL': '🇳🇱',
    'BE': '🇧🇪', 'CZ': '🇨🇿', 'PL': '🇵🇱', 'HU': '🇭🇺', 'SK': '🇸🇰',
    'US': '🇺🇸', 'CA': '🇨🇦', 'AU': '🇦🇺'
  };
  return flags[country?.toUpperCase() || ''] || '';
}

function getSourceColor(source: string) {
  const s = source.toLowerCase();
  if (s.includes('airbnb')) return 'bg-red-100 text-red-700 border-red-200';
  if (s.includes('booking')) return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-emerald-100 text-emerald-700 border-emerald-200';
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    'inquiry': 'border-amber-200 bg-amber-50',
    'confirmed': 'border-emerald-200 bg-emerald-50',
    'checked-in': 'border-blue-200 bg-blue-50',
    'checked-out': 'border-stone-200 bg-stone-50',
    'reviewed': 'border-purple-200 bg-purple-50',
    'declined': 'border-red-200 bg-red-50'
  };
  return colors[status] || 'border-stone-200 bg-stone-50';
}

function TagBadge({ tag }: { tag: string }) {
  const tags: Record<string, { emoji: string; color: string }> = {
    'vip': { emoji: '⭐', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'repeat': { emoji: '🔄', color: 'bg-sand-100 text-sand-800 border-sand-200' },
    'blacklist': { emoji: '🚫', color: 'bg-red-100 text-red-800 border-red-200' }
  };
  const tagInfo = tags[tag] || { emoji: '', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${tagInfo.color}`}>
      {tagInfo.emoji} {tag}
    </span>
  );
}

export default function CRMTab({ data, setData }: { data: any; setData: (data: any) => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'guests'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGuestId, setExpandedGuestId] = useState<string | null>(null);
  const [draggedInquiry, setDraggedInquiry] = useState<Inquiry | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [guests, setGuests] = useState<GuestProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guestsRes, inquiriesRes] = await Promise.all([
          fetch('/api/admin/guests'),
          fetch('/api/admin/inquiries')
        ]);
        
        if (guestsRes.ok) {
          const guestsData = await guestsRes.json();
          setGuests(guestsData);
        }
        
        if (inquiriesRes.ok) {
          const inquiriesData = await inquiriesRes.json();
          setInquiries(inquiriesData);
        }
      } catch (error) {
        console.error('Failed to fetch CRM data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate KPIs
  const kpi = useMemo(() => {
    const totalGuests = guests.length;
    const repeatGuests = guests.filter(g => g.tags.includes('repeat')).length;
    const repeatRate = totalGuests > 0 ? (repeatGuests / totalGuests) * 100 : 0;
    
    const confirmedInquiries = inquiries.filter(i => 
      ['confirmed', 'checked-in', 'checked-out', 'reviewed'].includes(i.status)
    );
    const avgLtv = confirmedInquiries.length > 0 
      ? confirmedInquiries.reduce((sum, i) => sum + (i.totalPrice || 0), 0) / confirmedInquiries.length 
      : 0;
    
    const activeInquiries = inquiries.filter(i => 
      ['inquiry', 'confirmed'].includes(i.status)
    ).length;

    return { totalGuests, repeatRate, avgLtv, activeInquiries };
  }, [guests, inquiries]);

  // Pipeline columns
  const pipelineColumns = [
    { id: 'inquiry', title: 'Inquiry', color: 'amber' },
    { id: 'confirmed', title: 'Confirmed', color: 'emerald' },
    { id: 'checked-in', title: 'Checked-in', color: 'blue' },
    { id: 'checked-out', title: 'Checked-out', color: 'stone' },
    { id: 'reviewed', title: 'Reviewed', color: 'purple' }
  ];

  // Filter and group inquiries by status
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inquiry => 
      inquiry.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.guestEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inquiries, searchTerm]);

  const inquiriesByStatus = useMemo(() => {
    const grouped: Record<string, Inquiry[]> = {};
    pipelineColumns.forEach(col => {
      grouped[col.id] = filteredInquiries.filter(i => i.status === col.id);
    });
    // Add declined inquiries to inquiry column
    const declined = filteredInquiries.filter(i => i.status === 'declined');
    if (declined.length > 0) {
      grouped.inquiry = [...(grouped.inquiry || []), ...declined];
    }
    return grouped;
  }, [filteredInquiries]);

  // Handle drag and drop
  const handleDragStart = (inquiry: Inquiry) => {
    setDraggedInquiry(inquiry);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedInquiry || draggedInquiry.status === newStatus) return;

    try {
      const response = await fetch(`/api/admin/inquiries/${draggedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setInquiries(prev => prev.map(i => 
          i.id === draggedInquiry.id ? { ...i, status: newStatus as any } : i
        ));
      }
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
    }

    setDraggedInquiry(null);
  };

  // Filter guests
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [guests, searchTerm]);

  // Calculate guest stats
  const guestsWithStats = useMemo(() => {
    return filteredGuests.map(guest => {
      const guestInquiries = inquiries.filter(i => i.guestId === guest.id);
      const confirmedInquiries = guestInquiries.filter(i => 
        ['confirmed', 'checked-in', 'checked-out', 'reviewed'].includes(i.status)
      );
      const stays = confirmedInquiries.length;
      const totalRevenue = confirmedInquiries.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
      const lastStay = confirmedInquiries.length > 0 
        ? confirmedInquiries.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())[0].checkIn
        : null;

      return {
        ...guest,
        stays,
        totalRevenue,
        lastStay
      };
    });
  }, [filteredGuests, inquiries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-sand-600">
          <Users size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-5 border border-stone-100">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Total Guests</p>
          <p className="text-2xl font-bold tabular-nums text-stone-900">{kpi.totalGuests}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-100">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Repeat Rate</p>
          <p className="text-2xl font-bold tabular-nums text-emerald-600">{kpi.repeatRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-100">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Avg. LTV</p>
          <p className="text-2xl font-bold tabular-nums text-stone-900">{fmt(kpi.avgLtv)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-100">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Active Inquiries</p>
          <p className="text-2xl font-bold tabular-nums text-amber-600">{kpi.activeInquiries}</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeSubTab === 'pipeline'
              ? 'border-sand-600 text-sand-700'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          Pipeline
        </button>
        <button
          onClick={() => setActiveSubTab('guests')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeSubTab === 'guests'
              ? 'border-sand-600 text-sand-700'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          Guests
        </button>
      </div>

      {/* Pipeline Sub-tab */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sand-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {pipelineColumns.map(column => {
              const columnInquiries = inquiriesByStatus[column.id] || [];
              const revenue = columnInquiries.reduce((sum, i) => sum + (i.totalPrice || 0), 0);

              return (
                <div key={column.id} className="bg-stone-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-stone-900">{column.title}</h3>
                    <span className="text-sm text-stone-500">{columnInquiries.length}</span>
                  </div>
                  {revenue > 0 && (
                    <p className="text-xs text-stone-600 mb-3">{fmt(revenue)}</p>
                  )}
                  
                  <div
                    className="space-y-2 min-h-[200px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    {columnInquiries.map(inquiry => (
                      <div
                        key={inquiry.id}
                        draggable={inquiry.status !== 'declined'}
                        onDragStart={() => handleDragStart(inquiry)}
                        className={`bg-white rounded-xl p-3 border cursor-move hover:shadow-md transition-shadow ${
                          inquiry.status === 'declined' ? 'opacity-60 border-red-200' : getStatusColor(inquiry.status)
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCountryFlag(inquiry.guest?.country)}</span>
                            <div>
                              <p className="font-medium text-sm text-stone-900">{inquiry.guestName}</p>
                              <p className="text-xs text-stone-500">{data.apartments?.find((a: any) => a.id === inquiry.apartmentId)?.name || inquiry.apartmentId}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getSourceColor(inquiry.source)}`}>
                            {inquiry.source}
                          </span>
                        </div>
                        
                        <div className="text-xs text-stone-600 space-y-1">
                          <p>{inquiry.checkIn} → {inquiry.checkOut}</p>
                          <p>{nights(inquiry.checkIn, inquiry.checkOut)} nights</p>
                          {inquiry.totalPrice && <p className="font-semibold">{fmt(inquiry.totalPrice)}</p>}
                        </div>

                        <div className="flex gap-1 mt-2">
                          <button className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                          {inquiry.status === 'inquiry' && (
                            <>
                              <button className="text-xs text-emerald-600 hover:text-emerald-800">Confirm</button>
                              <button className="text-xs text-red-600 hover:text-red-800">Decline</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Guests Sub-tab */}
      {activeSubTab === 'guests' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sand-200"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-sand-600 text-white rounded-xl hover:bg-sand-700 transition-colors">
              <Plus size={16} />
              Add Guest
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-stone-700 uppercase tracking-wider">Guest</th>
                    <th className="text-left p-4 text-xs font-semibold text-stone-700 uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 text-xs font-semibold text-stone-700 uppercase tracking-wider">Stays</th>
                    <th className="text-left p-4 text-xs font-semibold text-stone-700 uppercase tracking-wider">Revenue</th>
                    <th className="text-left p-4 text-xs font-semibold text-stone-700 uppercase tracking-wider">Tags</th>
                    <th className="text-left p-4 text-xs font-semibold text-stone-700 uppercase tracking-wider">Last Stay</th>
                    <th className="text-left p-4 text-xs font-semibold text-stone-700 uppercase tracking-wider">Source</th>
                    <th className="text-left p-4 text-xs font-semibold text-stone-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guestsWithStats.map(guest => (
                    <React.Fragment key={guest.id}>
                      <tr 
                        className="border-b border-stone-100 hover:bg-stone-50 cursor-pointer"
                        onClick={() => setExpandedGuestId(expandedGuestId === guest.id ? null : guest.id)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCountryFlag(guest.country)}</span>
                            <span className="font-medium text-stone-900">{guest.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-stone-600">{guest.email}</td>
                        <td className="p-4 text-sm text-stone-900">{guest.stays}</td>
                        <td className="p-4 text-sm text-stone-900">{fmt(guest.totalRevenue)}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {guest.tags.map(tag => (
                              <TagBadge key={tag} tag={tag} />
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-stone-600">{guest.lastStay || '—'}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getSourceColor(guest.source)}`}>
                            {guest.source}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button className="text-sand-600 hover:text-sand-800">
                              <Edit size={16} />
                            </button>
                            <button className="text-stone-400 hover:text-stone-600">
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedGuestId === guest.id && (
                        <tr>
                          <td colSpan={8} className="bg-stone-50 p-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-stone-900 mb-2">Notes</h4>
                                <p className="text-sm text-stone-600">{guest.notes || 'No notes'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-stone-900 mb-2">Inquiry History</h4>
                                <div className="space-y-2">
                                  {inquiries.filter(i => i.guestId === guest.id).map(inquiry => (
                                    <div key={inquiry.id} className="bg-white p-3 rounded-lg border border-stone-200">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="text-sm font-medium">{data.apartments?.find((a: any) => a.id === inquiry.apartmentId)?.name}</p>
                                          <p className="text-xs text-stone-600">{inquiry.checkIn} → {inquiry.checkOut}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(inquiry.status)}`}>
                                          {inquiry.status}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
