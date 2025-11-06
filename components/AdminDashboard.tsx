'use client';

import { useState, useMemo } from 'react';
import { Lead } from '@/types';
import { formatDate } from '@/lib/utils';
import ConfirmDialog from './ConfirmDialog';

interface AdminDashboardProps {
  leads: Lead[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
  onDeleteLead: (id: string) => void;
  onExportCSV: () => void;
}

type SortField = 'name' | 'createdAt' | 'emergencyLevel' | 'status';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'new' | 'contacted' | 'scheduled' | 'completed';

export default function AdminDashboard({
  leads,
  onUpdateLead,
  onDeleteLead,
  onExportCSV,
}: AdminDashboardProps) {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [emergencyFilter, setEmergencyFilter] = useState<'all' | 'emergency'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    leadId: string | null;
    leadName: string;
  }>({
    isOpen: false,
    leadId: null,
    leadName: '',
  });

  // Calculate analytics
  const stats = useMemo(() => {
    const total = leads.length;
    const emergencies = leads.filter((l) => l.emergencyLevel >= 3).length;
    const newLeads = leads.filter((l) => l.status === 'new').length;
    const contacted = leads.filter((l) => l.status === 'contacted').length;
    const scheduled = leads.filter((l) => l.status === 'scheduled').length;
    const completed = leads.filter((l) => l.status === 'completed').length;
    
    // Conversion rate: (completed / total) * 100
    const conversionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
    
    // Emergency rate: (emergencies / total) * 100
    const emergencyRate = total > 0 ? ((emergencies / total) * 100).toFixed(1) : '0.0';

    return {
      total,
      emergencies,
      new: newLeads,
      contacted,
      scheduled,
      completed,
      conversionRate,
      emergencyRate,
    };
  }, [leads]);

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter((lead) => {
      // Status filter
      const matchesStatusFilter =
        filter === 'all' || lead.status === filter;

      // Emergency filter
      const matchesEmergencyFilter =
        emergencyFilter === 'all' ||
        (emergencyFilter === 'emergency' && lead.emergencyLevel >= 3);

      // Search filter
      const matchesSearch =
        !searchTerm ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email ? lead.email.toLowerCase().includes(searchTerm.toLowerCase()) : false);

      return matchesStatusFilter && matchesEmergencyFilter && matchesSearch;
    });

    // Sort leads
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'emergencyLevel':
          aValue = a.emergencyLevel;
          bValue = b.emergencyLevel;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [leads, filter, emergencyFilter, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Phone',
      'Email',
      'Address',
      'Problem',
      'Emergency Level',
      'Status',
      'Preferred Contact',
      'Scheduled Time',
      'Created At',
    ];

    const rows = leads.map((lead) => [
      lead.name,
      lead.phone,
      (lead as any).email || '',
      lead.address,
      lead.problem,
      lead.emergencyLevel.toString(),
      lead.status,
      lead.preferredContact,
      lead.scheduledTime || '',
      new Date(lead.createdAt).toLocaleString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    onExportCSV();
  };

  const handleQuickAction = (leadId: string, action: 'contacted' | 'completed') => {
    onUpdateLead(leadId, { status: action });
  };

  const getEmergencyBadge = (level: number) => {
    if (level >= 5) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-red-200 text-red-900 rounded-full border border-red-300">
          Critical
        </span>
      );
    } else if (level >= 4) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
          Urgent
        </span>
      );
    } else if (level >= 3) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">
          High
        </span>
      );
    }
    return null;
  };

  const getStatusBadge = (status: Lead['status']) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <span className="text-gray-400 ml-1">
          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      );
    }
    return (
      <span className="text-primary ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-xs text-gray-600 mb-1">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-xs text-gray-600 mb-1">Emergencies</p>
          <p className="text-2xl font-bold text-red-600">{stats.emergencies}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.emergencyRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-xs text-gray-600 mb-1">New Leads</p>
          <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-xs text-gray-600 mb-1">Contacted</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-xs text-gray-600 mb-1">Scheduled</p>
          <p className="text-2xl font-bold text-green-600">{stats.scheduled}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-xs text-gray-600 mb-1">Conversion Rate</p>
          <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{stats.completed} completed</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, phone, address, or problem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <div className="flex gap-2">
                {(['all', 'new', 'contacted', 'scheduled', 'completed'] as StatusFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === f
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Priority:</label>
              <div className="flex gap-2">
                {(['all', 'emergency'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setEmergencyFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      emergencyFilter === f
                        ? f === 'emergency'
                          ? 'bg-red-600 text-white'
                          : 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'emergency' ? '🚨 Emergency' : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className="ml-auto px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedLeads.length} of {leads.length} leads
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    <SortIcon field="name" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('emergencyLevel')}
                >
                  <div className="flex items-center">
                    Priority
                    <SortIcon field="emergencyLevel" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Created
                    <SortIcon field="createdAt" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No leads found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedLeads.map((lead) => {
                  const isEmergency = lead.emergencyLevel >= 3;
                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isEmergency ? 'bg-red-50/50 border-l-4 border-red-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isEmergency && (
                            <span className="text-red-500" title="Emergency">🚨</span>
                          )}
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.phone}</div>
                        {(lead as any).email && (
                          <div className="text-xs text-gray-500">{((lead as any).email as string)}</div>
                        )}
                        <div className="text-xs text-gray-500 capitalize mt-1">
                          {lead.preferredContact}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={lead.address}>
                          {lead.address}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={lead.problem}>
                          {lead.problem}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            isEmergency ? 'text-red-600' : 'text-gray-700'
                          }`}>
                            Level {lead.emergencyLevel}
                          </span>
                          {getEmergencyBadge(lead.emergencyLevel)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(lead.status)}
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              onUpdateLead(lead.id, {
                                status: e.target.value as Lead['status'],
                              })
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1 ml-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(new Date(lead.createdAt))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {lead.status === 'new' && (
                            <button
                              onClick={() => handleQuickAction(lead.id, 'contacted')}
                              className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                              title="Mark as Contacted"
                            >
                              ✓ Contacted
                            </button>
                          )}
                          {lead.status !== 'completed' && (
                            <button
                              onClick={() => handleQuickAction(lead.id, 'completed')}
                              className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                              title="Mark as Completed"
                            >
                              ✓ Complete
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setDeleteConfirm({
                                isOpen: true,
                                leadId: lead.id,
                                leadName: lead.name,
                              });
                            }}
                            className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
                            title="Delete Lead"
                            aria-label={`Delete ${lead.name}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteConfirm.leadName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm.leadId) {
            onDeleteLead(deleteConfirm.leadId);
          }
          setDeleteConfirm({ isOpen: false, leadId: null, leadName: '' });
        }}
        onCancel={() => {
          setDeleteConfirm({ isOpen: false, leadId: null, leadName: '' });
        }}
      />
    </div>
  );
}

