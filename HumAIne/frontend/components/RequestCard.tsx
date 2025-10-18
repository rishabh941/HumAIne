'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, Clock } from 'lucide-react';
import axiosClient from '@/lib/axiosClient';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/utils';

interface RequestCardProps {
  request: {
    _id: string;
    customer_id: string;
    question: string;
    created_at: string;
  };
  onReplySuccess: () => void;
}

const RequestCard = ({ request, onReplySuccess }: RequestCardProps) => {
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosClient.post('/supervisor/reply', {
        request_id: request._id,
        answer: reply,
      });
      toast.success('Reply sent successfully!');
      setReply('');
      onReplySuccess();
    } catch (error) {
      toast.error('Failed to send reply');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
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

      <div className="space-y-3">
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply here..."
          className="resize-none"
          rows={3}
        />
        <Button
          onClick={handleReply}
          disabled={isSubmitting}
          className="w-full gap-2"
        >
          <Send size={18} />
          {isSubmitting ? 'Sending...' : 'Send Reply'}
        </Button>
      </div>
    </div>
  );
};

export default RequestCard;