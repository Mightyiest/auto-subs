import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { TimelineInfo } from '@/types';
import { useIntegration } from '@/contexts/IntegrationContext';
import { loadSubtitleDocumentSubtitles } from '@/utils/file-utils';

interface CavalryContextType {
  isConnected: boolean;
  timelineInfo: TimelineInfo;
  refresh: () => Promise<void>;
  pushToTimeline: (filename?: string) => Promise<void>;
}

const CavalryContext = createContext<CavalryContextType | null>(null);

const emptyTimeline: TimelineInfo = {
  name: "",
  timelineId: "",
  templates: [],
  inputTracks: [],
  outputTracks: [],
  projectName: ""
};

export function CavalryProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const { selectedIntegration } = useIntegration();

  const refresh = useCallback(async () => {
    if (selectedIntegration !== 'cavalry') return;
    try {
      const status = await invoke<boolean>('cavalry_bridge_status');
      setIsConnected(status);
    } catch {
      setIsConnected(false);
    }
  }, [selectedIntegration]);

  useEffect(() => {
    if (selectedIntegration !== 'cavalry') {
      setIsConnected(false);
      return;
    }
    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedIntegration, refresh]);

  const pushToTimeline = async (filename?: string) => {
    if (!filename) return;
    try {
      const subs = await loadSubtitleDocumentSubtitles(filename);
      toast.info('Sending subtitles to Cavalry...');
      await invoke('cavalry_bridge_send', { subtitles: subs });
      toast.success('Subtitles imported successfully in Cavalry!');
    } catch (e: any) {
      toast.error('Failed to connect to Cavalry: ' + (e.message || String(e)));
    }
  };

  const timelineInfo = isConnected ? { ...emptyTimeline, timelineId: "cavalry_session", name: "Cavalry Project" } : emptyTimeline;

  return (
    <CavalryContext.Provider value={{ isConnected, timelineInfo, refresh, pushToTimeline }}>
      {children}
    </CavalryContext.Provider>
  );
}

export const useCavalry = () => {
  const context = useContext(CavalryContext);
  if (!context) throw new Error('useCavalry must be used within a CavalryProvider');
  return context;
};
