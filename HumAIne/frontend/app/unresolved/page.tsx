'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axiosClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { RefreshCw, RotateCcw, Trash2, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface UnresolvedRequest {
  _id: string;
  customer_id: string;
  question: string;
  created_at: string;
  status: string;
}

export default function UnresolvedPage() {
  const [requests, setRequests] = useState<UnresolvedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUnresolvedRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.get('/supervisor/unresolved');
      setRequests(response.data);
    } catch (err) {
      setError('Failed to fetch unresolved requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnresolvedRequests();
  }, []);

  const handleReopen = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await axiosClient.patch(`/supervisor/reopen/${requestId}`);
      toast.success('Request reopened successfully!');
      fetchUnresolvedRequests();
    } catch (err) {
      toast.error('Failed to reopen request');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) {
      return;
    }

    setActionLoading(requestId);
    try {
      await axiosClient.delete(`/supervisor/${requestId}`);
      toast.success('Request deleted successfully!');
      fetchUnresolvedRequests();
    } catch (err) {
      toast.error('Failed to delete request');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unresolved Requests</h1>
          <p className="text-gray-600 mt-2">
            Requests that timed out without a response
          </p>
        </div>
        <button
          onClick={fetchUnresolvedRequests}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg px-4 py-2 transition-colors duration-200"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {loading && <LoadingSpinner />}

      {error && <ErrorMessage message={error} />}

      {!loading && !error && requests.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-xl shadow-md p-8">
            <p className="text-gray-500 text-lg">No unresolved requests</p>
            <p className="text-gray-400 text-sm mt-2">
              Great! All requests have been handled.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={18} />
                  <span className="font-medium">{request.customer_id}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Clock size={14} />
                  <span>{formatDate(request.created_at)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm text-gray-500 mb-2">Question:</h3>
                <p className="text-gray-800 leading-relaxed">{request.question}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReopen(request._id)}
                  disabled={actionLoading === request._id}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg px-4 py-2 font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  {actionLoading === request._id ? 'Reopening...' : 'Reopen'}
                </button>
                <button
                  onClick={() => handleDelete(request._id)}
                  disabled={actionLoading === request._id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg px-4 py-2 font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  {actionLoading === request._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}