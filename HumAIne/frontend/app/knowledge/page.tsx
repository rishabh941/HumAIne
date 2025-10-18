'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axiosClient from '@/lib/axiosClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnimatedCard from '@/components/AnimatedCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { RefreshCw, Search, BookOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface KnowledgeEntry {
  _id: string;
  question_key: string;
  answer: string;
  created_at: string;
}

export default function KnowledgePage() {
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [filteredKnowledge, setFilteredKnowledge] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchKnowledge = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.get('/knowledge');
      setKnowledge(response.data);
      setFilteredKnowledge(response.data);
    } catch (err) {
      setError('Failed to fetch knowledge base');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredKnowledge(knowledge);
    } else {
      const filtered = knowledge.filter(
        (entry) =>
          entry.question_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredKnowledge(filtered);
    }
  }, [searchTerm, knowledge]);

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600 mt-2">
            Learned Q&A pairs from resolved requests
          </p>
        </div>
        <Button onClick={fetchKnowledge} variant="outline" className="gap-2">
          <RefreshCw size={18} />
          Refresh
        </Button>
      </motion.div>

      <AnimatedCard delay={0.1} className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search questions or answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12"
          />
        </div>
      </AnimatedCard>

      {loading && <LoadingSpinner />}

      {error && <ErrorMessage message={error} />}

      {!loading && !error && filteredKnowledge.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-xl shadow-md p-8">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No matching entries found' : 'No knowledge entries yet'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm
                ? 'Try a different search term'
                : 'Resolved requests will be added to the knowledge base'}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && filteredKnowledge.length > 0 && (
        <AnimatedCard delay={0.2} className="bg-white rounded-xl shadow-md overflow-hidden">
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
                {filteredKnowledge.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{entry.question_key}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{entry.answer}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-500 text-sm">{formatDate(entry.created_at)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedCard>
      )}

      {!loading && !error && filteredKnowledge.length > 0 && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          Showing {filteredKnowledge.length} of {knowledge.length} entries
        </div>
      )}
    </div>
  );
}