/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ClipboardList, 
  Trash2, 
  Clock, 
  Copy, 
  Check, 
  Calculator, 
  UserPlus 
} from 'lucide-react';
import { CalculationHistory } from '../types';
import { formatIntervalLabel } from '../services/calculatorEngine';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryTabProps {
  history: CalculationHistory[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: CalculationHistory) => void;
}

export function HistoryTab({ 
  history, 
  onClearHistory, 
  onSelectHistoryItem 
}: HistoryTabProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Parse ISO date string to a beautiful locale spanish format
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }) + ' - ' + date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return 'Hace unos instantes';
    }
  };

  const handleCopyRecord = (item: CalculationHistory) => {
    const text = `⚕️ REGISTRO HISTÓRICO - PEDIADOSIS PRO ⚕️
-----------------------------
Medicamento: ${item.medicationName}
Paciente Peso: ${item.patientWeight} kg
Dosis calculada: ${item.mlPerDose} ml por toma
Frecuencia: ${formatIntervalLabel(item.frecuencia)}
Miliigramos: ${item.mgPerDose} mg
Gotas: ${item.dropsPerDose} gotas
Factor: ${parseFloat((item.selectedMgKgDia / item.frecuencia).toFixed(2))} mg/kg por toma
Fecha: ${formatTime(item.timestamp)}
-----------------------------`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full pb-10 space-y-6" id="history-tab-panel">
      
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-display font-semibold text-deep-blue flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <span>Historial Clínico de Tomas</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Inspeccione dosificaciones calculadas anteriormente de pacientes de guardia.</p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 px-3 py-2 border border-rose-150 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
            id="clear-all-history-btn"
          >
            <Trash2 className="w-4 h-4" />
            <span>Borrar Historial</span>
          </button>
        )}
      </div>

      {/* History Items list */}
      <div className="space-y-4">
        {history.length > 0 ? (
          <AnimatePresence>
            {[...history].reverse().map((item) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs hover:border-sky-100 transition-colors"
                id={`history-item-${item.id}`}
              >
                {/* Left metadata */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center shrink-0 text-sky-800 font-bold border border-sky-100">
                    <Clock className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-deep-blue text-sm">
                        {item.medicationName}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-md">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                      <span>Paciente: <b className="text-deep-blue font-bold">{item.patientWeight} kg</b></span>
                      <span>•</span>
                      <span>Volumen: <b className="text-primary font-bold">{item.mlPerDose} ml</b></span>
                      <span>•</span>
                      <span>Frecuencia: <b className="text-secondary">{formatIntervalLabel(item.frecuencia)}</b></span>
                      <span>•</span>
                      <span>Por toma: <b className="text-gray-700">{item.mgPerDose} mg / {item.dropsPerDose} gotas</b></span>
                    </div>
                  </div>
                </div>

                {/* Right interactive triggers */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {/* Copy button */}
                  <button
                    onClick={() => handleCopyRecord(item)}
                    className="p-2 border border-gray-100 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    title="Copiar resumen del cálculo"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-500 animate-bounce" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Re-calculate button */}
                  <button
                    onClick={() => onSelectHistoryItem(item)}
                    className="bg-sky-50 border border-primary/10 hover:bg-primary hover:text-white rounded-xl px-3 py-1.5 text-xs font-bold text-primary transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Cargar de nuevo este paciente"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Recargar</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="bg-white border rounded-2xl py-14 text-center text-gray-400 space-y-2">
            <ClipboardList className="w-10 h-10 mx-auto opacity-30 text-gray-400" />
            <p className="text-sm font-semibold text-deep-blue">Historial vacío</p>
            <p className="text-xs">Los cálculos médicos que guarde aparecerán aquí para revisión veloz.</p>
          </div>
        )}
      </div>

    </div>
  );
}
