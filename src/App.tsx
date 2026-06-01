/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Database, 
  ClipboardList, 
  Settings,
  Pill
} from 'lucide-react';
import { Header } from './components/Header';
import { CalculatorTab } from './components/CalculatorTab';
import { DatabaseTab } from './components/DatabaseTab';
import { HistoryTab } from './components/HistoryTab';
import { SettingsTab } from './components/SettingsTab';
import { Notification } from './components/Notification';
import { Medication, CalculationHistory, AppSettings } from './types';
import { medicationService } from './services/medicationService';
import { motion } from 'motion/react';

const DEFAULT_SETTINGS: AppSettings = {
  dropsPerMl: 20,
  primaryColor: '#006877',
  useDefaultDoseOnly: false
};

export default function App() {
  // 1. Core medications database state
  const [medications, setMedications] = useState<Medication[]>([]);
  
  // 2. Local persist states (History, Settings, Sync)
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // 3. UI states
  const [activeTab, setActiveTab] = useState<string>('calculate');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [preselectedMedName, setPreselectedMedName] = useState<string | undefined>(undefined);
  
  // Floating Toast Notifications state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // On mount: Load cached medications, history, and settings
  useEffect(() => {
    // A. Fill database with cached medications or fallback presets
    const cachedMeds = medicationService.getMedications();
    setMedications(cachedMeds);

    // B. Load sync stamp
    const status = medicationService.getSyncStatus();
    setLastSync(status.lastSyncTime);

    // C. Load calculations history
    try {
      const storedHistory = localStorage.getItem('pediadosis_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error('Failed to load history log', e);
    }

    // D. Load settings
    try {
      const storedSettings = localStorage.getItem('pediadosis_settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch {
      // Keep DEFAULT_SETTINGS
    }

    // E. Perform automatic background sync on load to ensure data accuracy
    triggerSheetsSync(true);
  }, []);

  // Force fully synchronized google sheet parsing
  const triggerSheetsSync = async (isSilent: boolean = false) => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    if (!isSilent) {
      showToast('Descargando base de datos médica...', 'info');
    }

    const res = await medicationService.syncWithRemote();
    setIsSyncing(false);

    if (res.success) {
      // Reload newly merged array
      const freshMeds = medicationService.getMedications();
      setMedications(freshMeds);
      setLastSync(new Date().toISOString());
      
      if (!isSilent) {
        showToast(`Sincronización Exitosa: ${res.count} medicamentos listos!`, 'success');
      }
    } else {
      if (!isSilent) {
        showToast(`Offline Mode: Usando caché de seguridad local (${res.error || 'Server Timeout'})`, 'info');
      }
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  // Update in-memory settings state and persist to localStorage
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('pediadosis_settings', JSON.stringify(updated));
      return updated;
    });
    showToast('Ajustes guardados correctamente', 'success');
  };

  // Add a newly computed calculation entry to history log
  const handleAddHistoryItem = (item: CalculationHistory) => {
    setHistory(prev => {
      const updated = [...prev, item];
      // Limit to 100 historical logs to keep localStorage memory light
      if (updated.length > 100) {
        updated.shift();
      }
      localStorage.setItem('pediadosis_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Remove history list completely
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('pediadosis_history');
    showToast('Historial clínico limpiado correctamente', 'info');
  };

  // Add custom medication created locally
  const handleAddCustomMedication = (med: Medication) => {
    const updatedMeds = [med, ...medications];
    setMedications(updatedMeds);
    medicationService.saveMedications(updatedMeds);
    showToast(`Medicamento "${med.nombre}" agregado!`, 'success');
  };

  // Delete custom medication
  const handleDeleteCustomMedication = (medName: string) => {
    const updatedMeds = medications.filter(m => m.nombre !== medName);
    setMedications(updatedMeds);
    medicationService.saveMedications(updatedMeds);
    showToast(`Medicamento "${medName}" eliminado`, 'info');
  };

  // Select a medicine from a list card, scroll and switch back to calculator immediately
  const handleLinkToCalculator = (medName: string) => {
    setPreselectedMedName(medName);
    setActiveTab('calculate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restore history record to active calculator
  const handleRestoreHistoryItem = (item: CalculationHistory) => {
    setPreselectedMedName(item.medicationName);
    setActiveTab('calculate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Paciente de ${item.patientWeight}kg cargado en calculadora`, 'success');
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col pb-24" id="applet-root-container">
      
      {/* Dynamic Header sync bar */}
      <Header 
        lastSync={lastSync}
        onSync={() => triggerSheetsSync(false)}
        isSyncing={isSyncing}
        totalRecords={medications.length}
      />

      {/* Floating alert toasts */}
      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Main interactive Tab Content container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 mt-6">
        {activeTab === 'calculate' && (
          <CalculatorTab 
            medications={medications}
            settings={settings}
            onAddHistory={handleAddHistoryItem}
            preselectedMedicationName={preselectedMedName}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'medicines' && (
          <DatabaseTab 
            medications={medications}
            onSelectMedication={handleLinkToCalculator}
            onAddCustomMedication={handleAddCustomMedication}
            onDeleteCustomMedication={handleDeleteCustomMedication}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab 
            history={history}
            onClearHistory={handleClearHistory}
            onSelectHistoryItem={handleRestoreHistoryItem}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onSync={() => triggerSheetsSync(false)}
            isSyncing={isSyncing}
            lastSync={lastSync}
            totalRecords={medications.length}
          />
        )}
      </main>

      {/* Bottom Floating Navigation bar styled beautifully following "Vital Pulse" specs */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200/90 py-1.5 px-4 shadow-xl z-40" id="bottom-dock-navigation">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          {/* TAB 1: Calcular */}
          <button
            onClick={() => { setActiveTab('calculate'); setPreselectedMedName(undefined); }}
            className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'calculate' 
                ? 'text-primary font-bold bg-primary/10' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
            id="nav-btn-calculate"
          >
            <Calculator className={`w-5 h-5 ${activeTab === 'calculate' ? 'text-primary scale-110' : 'text-gray-400'}`} />
            <span className="text-[10px] tracking-tight">Calcular</span>
          </button>

          {/* TAB 2: Medicamentos list */}
          <button
            onClick={() => setActiveTab('medicines')}
            className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'medicines' 
                ? 'text-primary font-bold bg-primary/10' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
            id="nav-btn-medicines"
          >
            <Pill className={`w-5 h-5 ${activeTab === 'medicines' ? 'text-primary scale-110' : 'text-gray-400'}`} />
            <span className="text-[10px] tracking-tight">Medicamentos</span>
          </button>

          {/* TAB 3: Historial logs */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'history' 
                ? 'text-primary font-bold bg-primary/10' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
            id="nav-btn-history"
          >
            <ClipboardList className={`w-5 h-5 ${activeTab === 'history' ? 'text-primary scale-110' : 'text-gray-400'}`} />
            <span className="text-[10px] tracking-tight">Historial</span>
          </button>

          {/* TAB 4: Ajustes */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'settings' 
                ? 'text-primary font-bold bg-primary/10' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
            id="nav-btn-settings"
          >
            <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-primary scale-110' : 'text-gray-400'}`} />
            <span className="text-[10px] tracking-tight">Ajustes</span>
          </button>

        </div>
      </nav>
    </div>
  );
}
