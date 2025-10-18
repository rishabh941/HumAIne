'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axiosClient from '@/lib/axiosClient';
import StatsCard from '@/components/StatsCard';
import AnimatedCard from '@/components/AnimatedCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CheckCircle, Clock, BookOpen, MessageSquare } from 'lucide-react';
import type { SystemStats } from '@/lib/types';

export default function Home() {
  const [stats, setStats] = useState<SystemStats>({
    totalQuestions: 0,
    resolvedCount: 0,
    pendingCount: 0,
    knowledgeCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [pendingRes, knowledgeRes] = await Promise.all([
          axiosClient.get('/supervisor/pending'),
          axiosClient.get('/knowledge'),
        ]);
        
        const pendingCount = pendingRes.data.length;
        const knowledgeCount = knowledgeRes.data.length;
        const totalQuestions = pendingCount + knowledgeCount;
        
        setStats({
          totalQuestions,
          resolvedCount: knowledgeCount,
          pendingCount,
          knowledgeCount,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          AI Learning Activity Overview
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Questions"
          value={stats.totalQuestions}
          icon={MessageSquare}
          delay={0}
          gradient="gradient-primary"
        />
        <StatsCard
          title="Resolved"
          value={stats.resolvedCount}
          icon={CheckCircle}
          delay={0.1}
          gradient="bg-green-600"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingCount}
          icon={Clock}
          delay={0.2}
          gradient="bg-yellow-600"
        />
        <StatsCard
          title="Knowledge Entries"
          value={stats.knowledgeCount}
          icon={BookOpen}
          delay={0.3}
          gradient="gradient-accent"
        />
      </div>

      <AnimatedCard delay={0.4} className="glass-card rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to HumAIne</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          HumAIne is a Human-in-the-Loop AI Supervisor System that helps manage customer inquiries intelligently.
          The system learns from supervisor responses to build a knowledge base for future questions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white/50 rounded-lg p-4 border border-white/20">
            <h3 className="font-semibold text-gray-900 mb-2">🤖 AI-Powered Responses</h3>
            <p className="text-sm text-gray-600">
              Automatically answers questions from the knowledge base
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-4 border border-white/20">
            <h3 className="font-semibold text-gray-900 mb-2">👨‍💼 Human Supervision</h3>
            <p className="text-sm text-gray-600">
              Escalates unknown questions to human supervisors
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-4 border border-white/20">
            <h3 className="font-semibold text-gray-900 mb-2">📚 Continuous Learning</h3>
            <p className="text-sm text-gray-600">
              Builds knowledge base from resolved inquiries
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-4 border border-white/20">
            <h3 className="font-semibold text-gray-900 mb-2">📞 Live Integration</h3>
            <p className="text-sm text-gray-600">
              Real-time call support with LiveKit integration
            </p>
          </div>
        </div>
      </AnimatedCard>

      <AnimatedCard delay={0.5}>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Quick Start Guide</h2>
          <ul className="space-y-2 mt-4">
            <li className="flex items-start gap-2">
              <span className="text-xl">1️⃣</span>
              <span>Use <strong>Ask AI</strong> to simulate customer questions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">2️⃣</span>
              <span>Check <strong>Supervisor</strong> dashboard for pending requests</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">3️⃣</span>
              <span>Reply to questions to add them to the knowledge base</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">4️⃣</span>
              <span>View <strong>Knowledge Base</strong> for all learned answers</span>
            </li>
          </ul>
        </div>
      </AnimatedCard>
    </div>
  );
}