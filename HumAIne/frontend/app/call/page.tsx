'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Room, RoomEvent, DataPacket_Kind } from 'livekit-client';
import axiosClient from '@/lib/axiosClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import EventLogConsole from '@/components/EventLogConsole';
import AnimatedCard from '@/components/AnimatedCard';
import toast from 'react-hot-toast';
import { PhoneCall, Send, PhoneOff } from 'lucide-react';
import type { EventLog, ConnectionStatus } from '@/lib/types';

export default function CallPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [roomName, setRoomName] = useState('humaine_room');
  const [participantName, setParticipantName] = useState('Supervisor');
  const [helpMessage, setHelpMessage] = useState('');
  const [logs, setLogs] = useState<EventLog[]>([]);

  const addLog = (type: EventLog['type'], message: string) => {
    const newLog: EventLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  const connectToRoom = async () => {
    if (connectionStatus === 'connecting' || connectionStatus === 'connected') {
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    if (!serverUrl) {
      const msg = 'NEXT_PUBLIC_LIVEKIT_URL is not set. Configure frontend/.env.local';
      addLog('error', msg);
      toast.error(msg);
      return;
    }

    setConnectionStatus('connecting');
    addLog('info', 'Requesting LiveKit token...');

    try {
      const response = await axiosClient.post('/livekit/token', {
        room: roomName,
        identity: participantName,
      });

      const { token } = response.data;
      addLog('success', 'Token received, connecting to room...');

      const newRoom = new Room();

      newRoom.on(RoomEvent.Connected, () => {
        setConnectionStatus('connected');
        addLog('success', `Connected to room: ${roomName}`);
        toast.success('Connected to LiveKit room');
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        setConnectionStatus('disconnected');
        addLog('warning', 'Disconnected from room');
        toast.error('Disconnected from room');
      });

      newRoom.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        const message = new TextDecoder().decode(payload);
        addLog('info', `Data received: ${message}`);
      });

      await newRoom.connect(serverUrl, token);
      setRoom(newRoom);
    } catch (error: any) {
      console.error('LiveKit connect error:', error);
      const msg = `Failed to connect: ${error?.message ?? 'unknown error'}`;
      setConnectionStatus('disconnected');
      addLog('error', msg);
      toast.error(msg);
    }
  };

  const disconnectFromRoom = async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setConnectionStatus('disconnected');
      addLog('info', 'Manually disconnected from room');
    }
  };

  const sendHelpRequest = async () => {
    if (!room || !helpMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const message = `REQUEST_HELP: ${helpMessage}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(message);

      await room.localParticipant.publishData(data, { reliable: true });
      addLog('success', `Sent: ${message}`);
      toast.success('Help request sent');
      setHelpMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      addLog('error', 'Failed to send help request');
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-600';
      case 'connecting':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">Live Call Simulator</h1>
        <p className="text-gray-600 mt-2">
          Test LiveKit integration with real-time messaging
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AnimatedCard delay={0.1}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Connection</CardTitle>
                <Badge variant={connectionStatus === 'connected' ? 'success' : 'secondary'}>
                  {getStatusText()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name
                </label>
                <Input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  disabled={connectionStatus !== 'disconnected'}
                  placeholder="Enter room name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participant Name
                </label>
                <Input
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  disabled={connectionStatus !== 'disconnected'}
                  placeholder="Enter your name"
                />
              </div>

              {connectionStatus === 'disconnected' ? (
                <Button onClick={connectToRoom} className="w-full gap-2">
                  <PhoneCall size={18} />
                  Join Room
                </Button>
              ) : (
                <Button
                  onClick={disconnectFromRoom}
                  variant="destructive"
                  className="w-full gap-2"
                  disabled={connectionStatus === 'connecting'}
                >
                  <PhoneOff size={18} />
                  Leave Room
                </Button>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Help Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Input
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  disabled={connectionStatus !== 'connected'}
                  placeholder="Type your help request..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && connectionStatus === 'connected') {
                      sendHelpRequest();
                    }
                  }}
                />
              </div>

              <Button
                onClick={sendHelpRequest}
                disabled={connectionStatus !== 'connected' || !helpMessage.trim()}
                className="w-full gap-2"
              >
                <Send size={18} />
                Send Message
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Messages will be sent with "REQUEST_HELP:" prefix
                </p>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={0.3}>
        <EventLogConsole logs={logs} />
      </AnimatedCard>

      <AnimatedCard delay={0.4} className="mt-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">1.</span>
                <span>Enter a room name and your participant name</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">2.</span>
                <span>Click "Join Room" to connect to the LiveKit room</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">3.</span>
                <span>Send help requests via the DataChannel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">4.</span>
                <span>Monitor all events in the Event Logs console below</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedCard>
    </div>
  );
}