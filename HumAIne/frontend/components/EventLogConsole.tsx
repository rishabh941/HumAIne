'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EventLog } from '@/lib/types';

interface EventLogConsoleProps {
  logs: EventLog[];
}

const getLogColor = (type: EventLog['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'error':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'warning':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};

const getBadgeVariant = (type: EventLog['type']) => {
  switch (type) {
    case 'success':
      return 'success' as const;
    case 'error':
      return 'destructive' as const;
    case 'warning':
      return 'warning' as const;
    default:
      return 'default' as const;
  }
};

export default function EventLogConsole({ logs }: EventLogConsoleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Event Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No events yet</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border text-sm ${getLogColor(log.type)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getBadgeVariant(log.type)} className="text-xs">
                        {log.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs opacity-75">{log.timestamp}</span>
                    </div>
                    <p className="font-medium">{log.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}