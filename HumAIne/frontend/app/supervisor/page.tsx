'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axiosClient from '@/lib/axiosClient';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AnimatedCard from '@/components/AnimatedCard';
import ReplyModal from '@/components/ReplyModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { RefreshCw, User, Clock, RotateCcw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/utils';
import type { PendingRequest, UnresolvedRequest, KnowledgeEntry } from '@/lib/types';

export default function SupervisorPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [unresolvedRequests, setUnresolvedRequests] = useState<UnresolvedRequest[]>([]);
  const [resolvedRequests, setResolvedRequests] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pendingRes, unresolvedRes, knowledgeRes] = await Promise.all([
        axiosClient.get('/supervisor/pending'),
        axiosClient.get('/supervisor/unresolved'),
        axiosClient.get('/knowledge'),
      ]);
      setPendingRequests(pendingRes.data);
      setUnresolvedRequests(unresolvedRes.data);
      setResolvedRequests(knowledgeRes.data);
    } catch (err) {
      setError('Failed to fetch supervisor data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReply = (request: PendingRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleSubmitReply = async (answer: string) => {
    if (!selectedRequest) return;

    try {
      await axiosClient.post('/supervisor/reply', {
        request_id: selectedRequest._id,
        answer,
      });
      toast.success('Reply sent successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to send reply');
      throw err;
    }
  };

  const handleReopen = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await axiosClient.patch(`/supervisor/reopen/${requestId}`);
      toast.success('Request reopened successfully!');
      fetchData();
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
      fetchData();
    } catch (err) {
      toast.error('Failed to delete request');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Supervisor Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage customer requests and build knowledge base
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCw size={18} />
          Refresh
        </Button>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="unresolved">
            Unresolved ({unresolvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedRequests.length})
          </TabsTrigger>
        </TabsList>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <>
            <TabsContent value="pending">
              {pendingRequests.length === 0 ? (
                <AnimatedCard className="text-center py-12 bg-white rounded-xl shadow-md">
                  <p className="text-gray-500 text-lg">No pending requests</p>
                  <p className="text-gray-400 text-sm mt-2">
                    All caught up! New requests will appear here.
                  </p>
                </AnimatedCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingRequests.map((request, index) => (
                    <AnimatedCard
                      key={request._id}
                      delay={index * 0.1}
                      className="glass-card p-6 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User size={18} />
                          <span className="font-medium">{request.customer_id}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          <Clock size={14} />
                          <span>{formatDateTime(request.created_at)}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm text-gray-500 mb-2">Question:</h3>
                        <p className="text-gray-800 leading-relaxed">{request.question}</p>
                      </div>

                      <Button
                        onClick={() => handleReply(request)}
                        className="w-full"
                      >
                        Reply
                      </Button>
                    </AnimatedCard>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unresolved">
              {unresolvedRequests.length === 0 ? (
                <AnimatedCard className="text-center py-12 bg-white rounded-xl shadow-md">
                  <p className="text-gray-500 text-lg">No unresolved requests</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Great! All requests have been handled.
                  </p>
                </AnimatedCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {unresolvedRequests.map((request, index) => (
                    <AnimatedCard
                      key={request._id}
                      delay={index * 0.1}
                      className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User size={18} />
                          <span className="font-medium">{request.customer_id}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          <Clock size={14} />
                          <span>{formatDateTime(request.created_at)}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm text-gray-500 mb-2">Question:</h3>
                        <p className="text-gray-800 leading-relaxed">{request.question}</p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleReopen(request._id)}
                          disabled={actionLoading === request._id}
                          className="flex-1 gap-2"
                        >
                          <RotateCcw size={18} />
                          {actionLoading === request._id ? 'Reopening...' : 'Reopen'}
                        </Button>
                        <Button
                          onClick={() => handleDelete(request._id)}
                          disabled={actionLoading === request._id}
                          variant="destructive"
                          className="flex-1 gap-2"
                        >
                          <Trash2 size={18} />
                          {actionLoading === request._id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="resolved">
              {resolvedRequests.length === 0 ? (
                <AnimatedCard className="text-center py-12 bg-white rounded-xl shadow-md">
                  <p className="text-gray-500 text-lg">No resolved requests yet</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Resolved requests will appear here
                  </p>
                </AnimatedCard>
              ) : (
                <AnimatedCard className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Question
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Answer
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {resolvedRequests.map((entry) => (
                          <tr key={entry._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4">
                              <p className="text-gray-900 font-medium">{entry.question_key}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gray-700">{entry.answer}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gray-500 text-sm">{formatDateTime(entry.created_at)}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AnimatedCard>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      <ReplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        onSubmit={handleSubmitReply}
      />
    </div>
  );
}