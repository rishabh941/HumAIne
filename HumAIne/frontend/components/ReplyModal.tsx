'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import type { PendingRequest } from '@/lib/types';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PendingRequest | null;
  onSubmit: (answer: string) => Promise<void>;
}

export default function ReplyModal({ isOpen, onClose, request, onSubmit }: ReplyModalProps) {
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reply.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(reply);
      setReply('');
      onClose();
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Reply to Customer</DialogTitle>
          <DialogDescription>
            Customer ID: {request?.customer_id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Question:</label>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {request?.question}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your Reply:</label>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply here..."
              rows={5}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !reply.trim()}
            className="gap-2"
          >
            <Send size={16} />
            {isSubmitting ? 'Sending...' : 'Send Reply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}