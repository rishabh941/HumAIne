'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, AlertCircle, BookOpen, MessageSquare, UserCheck, PhoneCall } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Clock,
      emoji: '📊',
    },
    {
      name: 'Ask AI',
      href: '/ask',
      icon: MessageSquare,
      emoji: '💬',
    },
    {
      name: 'Supervisor',
      href: '/supervisor',
      icon: UserCheck,
      emoji: '👨‍💼',
    },
    {
      name: 'Knowledge Base',
      href: '/knowledge',
      icon: BookOpen,
      emoji: '📚',
    },
    {
      name: 'Live Call',
      href: '/call',
      icon: PhoneCall,
      emoji: '📞',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-2xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">HumAIne</h1>
        <p className="text-indigo-200 text-sm">AI Supervisor Dashboard</p>
      </div>

      <nav className="mt-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-700 border-l-4 border-white'
                  : 'hover:bg-indigo-700/50'
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-indigo-700">
        <p className="text-xs text-indigo-300">
          Human-in-the-Loop AI System
        </p>
        <p className="text-xs text-indigo-400 mt-1">v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;