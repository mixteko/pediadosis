/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Database, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  lastSync: string | null;
  onSync: () => void;
  isSyncing: boolean;
  totalRecords: number;
}

export function Header({ lastSync, onSync, isSyncing, totalRecords }: HeaderProps) {
  // Translate ISO String sync to human readable spanish format
  const getSyncLabel = () => {
    if (isSyncing) return 'Sincronizando de Google Sheets...';
    if (!lastSync) return 'No sincronizado (Offline Fallback)';
    
    try {
      const diffMs = Date.now() - new Date(lastSync).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Sincronizado: hace un instante';
      if (diffMins === 1) return 'Sincronizado: hace 1 minuto';
      if (diffMins < 60) return `Sincronizado: hace ${diffMins} minutos`;
      
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs === 1) return 'Sincronizado: hace 1 hora';
      return `Sincronizado: hace ${diffHrs} horas`;
    } catch {
      return 'Sincronizado con la nube';
    }
  };

  const getInitials = () => {
    return 'DR';
  };

  return (
    <div className="w-full bg-white border-b border-sky-100/50 pb-4 pt-4 px-4 sticky top-0 z-40 shadow-sm" id="main-app-header">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Title & Brand Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 glow-effect" id="header-brand-icon-container">
            <Layers className="w-5.5 h-5.5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-deep-blue" id="header-app-title">
              Pediadosis <span className="text-primary font-sans font-medium text-xs bg-primary-container/30 px-1.5 py-0.5 rounded-md ml-1 inline-block align-middle">Pro</span>
            </h1>
            <p className="text-xs text-gray-505 font-mono">Dosis Pediátricas Seguras</p>
          </div>
        </div>

        {/* Doctor Avatar Profile */}
        <div className="flex items-center gap-3" id="header-user-profile">
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-deep-blue">Dr. Mixteko</p>
            <p className="text-[10px] text-primary font-mono select-none">Pediatra de Guardia</p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-primary/40 p-0.5 bg-gradient-to-tr from-primary to-electric-cyan overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120&h=120" 
                alt="Doctor avatar" 
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
        </div>
      </div>

      {/* Cloud Synchronizer alert */}
      <div className="max-w-5xl mx-auto mt-4" id="cloud-synchronizer-alerts">
        <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-xs text-emerald-800 font-medium">
              Conectado a Google Sheets
              <span className="hidden md:inline text-emerald-600 font-normal"> — BASE DE DATOS EN TIEMPO REAL ({totalRecords} medicamentos)</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <p className="text-[11px] text-emerald-700 font-mono flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-emerald-100 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              {getSyncLabel()}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onSync}
              disabled={isSyncing}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-white border border-emerald-200/50 hover:bg-emerald-50 px-2.5 py-1 rounded-lg shadow-2xs transition-colors"
              title="Sincronizar base de datos ahora"
              id="sync-now-header-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
