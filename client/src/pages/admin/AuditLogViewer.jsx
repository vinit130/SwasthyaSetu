import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, AlertOctagon, User, Clock, RefreshCw } from 'lucide-react';
import { healthAdminAPI } from '../../services/api';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (roleFilter) params.role = roleFilter;
      const res = await healthAdminAPI.getAuditLogs(params);
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, roleFilter]);

  const getActionBadge = (action) => {
    switch (action) {
      case 'BREAK_GLASS_LOOKUP':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-red-600 dark:text-red-400" /> Break-Glass Lookup
          </span>
        );
      case 'UPDATE_INVENTORY_STOCK':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Stock Movement</span>;
      case 'RECORD_HOSPITAL_TREATMENT':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Hospital Treatment</span>;
      case 'VIEW_REFERRAL_BY_TOKEN':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Token Lookup</span>;
      case 'UPLOAD_MEDICAL_DOCUMENT':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">Document Upload</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          Immutable Security & Clinical Audit Trail
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Permanent chronological log of privileged healthcare actions, emergency break-glass lookups, and inventory changes
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Log:
        </span>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Action Types</option>
          <option value="BREAK_GLASS_LOOKUP">Emergency Break-Glass Lookups</option>
          <option value="VIEW_REFERRAL_BY_TOKEN">Token Validations</option>
          <option value="RECORD_HOSPITAL_TREATMENT">Hospital Treatments</option>
          <option value="UPDATE_INVENTORY_STOCK">Inventory Stock Changes</option>
          <option value="UPLOAD_MEDICAL_DOCUMENT">Document Uploads</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="DISTRICT_HOSPITAL">District Hospital</option>
          <option value="DOCTOR">Doctor</option>
          <option value="ASHA">ASHA Worker</option>
          <option value="HEALTH_DEPARTMENT_ADMIN">Health Admin</option>
        </select>

        <button
          type="button"
          onClick={() => { setActionFilter(''); setRoleFilter(''); }}
          className="text-indigo-600 dark:text-indigo-400 hover:underline ml-auto font-medium"
        >
          Reset Filters
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          Loading audit records...
        </div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          No audit logs found matching the filter criteria.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor / Role</th>
                  <th className="px-4 py-3">Facility / District</th>
                  <th className="px-4 py-3">Details & Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr
                    key={log._id || log.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                      log.action === 'BREAK_GLASS_LOOKUP' ? 'bg-red-50/30 dark:bg-red-950/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp || log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{log.actorName || log.userId?.name || 'Authorized Staff'}</div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{log.actorRole || log.role || 'USER'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {log.district || 'Pune'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200 max-w-md">
                      <p className="line-clamp-2">{log.details}</p>
                      {log.reason && (
                        <p className="text-red-700 dark:text-red-400 font-semibold text-[11px] mt-0.5">
                          Clinical Justification: {log.reason}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
