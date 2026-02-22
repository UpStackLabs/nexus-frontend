import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';

interface PriceUpdate {
  ticker: string;
  companyName: string;
  sector: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});
  const [latestEvent, setLatestEvent] = useState<any>(null);
  const [latestShock, setLatestShock] = useState<any>(null);
  const [latestSimulation, setLatestSimulation] = useState<any>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Subscribe to all rooms
      socket.emit('subscribe:events');
      socket.emit('subscribe:shocks');
      socket.emit('subscribe:prices');
      socket.emit('subscribe:surprises');
      socket.emit('subscribe:simulation');
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('prices:update', (data: PriceUpdate) => {
      setPrices(prev => ({ ...prev, [data.ticker]: data }));
    });

    socket.on('events:new', (data: any) => {
      setLatestEvent(data);
    });

    socket.on('shocks:update', (data: any) => {
      setLatestShock(data);
    });

    socket.on('simulation:result', (data: any) => {
      setLatestSimulation(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const priceList = useCallback(() => {
    return Object.values(prices).sort((a, b) =>
      Math.abs(b.changePercent) - Math.abs(a.changePercent),
    );
  }, [prices]);

  return { connected, prices, priceList, latestEvent, latestShock, latestSimulation };
}
