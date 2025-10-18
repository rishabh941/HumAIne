'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import axiosClient from '@/lib/axiosClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AnimatedCard from '@/components/AnimatedCard';
import { Send, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface AskResponse {
  answer?: string;
  from_kb?: boolean;
  message?: string;
  request_id?: string;
}

export default function AskPage() {
  const [customerId, setCustomerId] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId.trim() || !question.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setResponse(null);

    try {
      const result = await axiosClient.post('/ask', {
        customer_id: customerId,
        question: question,
      });
      setResponse(result.data);
      toast.success('Question submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit question');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCustomerId('');
    setQuestion('');
    setResponse(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">Ask AI</h1>
        <p className="text-gray-600 mt-2">
          Test the AI system by asking questions as a customer
        </p>
      </motion.div>

      <AnimatedCard delay={0.1} className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
              Customer ID
            </label>
            <Input
              id="customerId"
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="e.g., customer_123"
            />
          </div>

          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              Question
            </label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gap-2"
            >
              <Send size={20} />
              {isSubmitting ? 'Submitting...' : 'Submit Question'}
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              variant="secondary"
            >
              Reset
            </Button>
          </div>
        </form>

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 pt-8 border-t border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response:</h3>
            
            {response.from_kb ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">
                      Answer from Knowledge Base
                    </h4>
                    <p className="text-green-800 leading-relaxed">{response.answer}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Clock className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">
                      Escalated to Supervisor
                    </h4>
                    <p className="text-yellow-800 leading-relaxed mb-3">{response.message}</p>
                    {response.request_id && (
                      <p className="text-sm text-yellow-700">
                        Request ID: <span className="font-mono">{response.request_id}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatedCard>

      <AnimatedCard delay={0.2} className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>If the question matches the knowledge base, you'll get an instant answer</li>
          <li>If not, the question will be escalated to a supervisor</li>
          <li>Check the "Pending Requests" page to see escalated questions</li>
        </ul>
      </AnimatedCard>
    </div>
  );
}