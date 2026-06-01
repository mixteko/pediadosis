/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Settings, 
  RefreshCw, 
  Database,
  Sliders,
  Sparkles,
  Layers,
  Heart,
  ExternalLink
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSync: () => void;
  isSyncing: boolean;
  lastSync: string | null;
  totalRecords: number;
}

export function SettingsTab({ 
  settings, 
  onUpdateSettings,
  onSync,
  isSyncing,
  lastSync,
  totalRecords
}: SettingsTabProps) {

  // Formats human date
  const formatFullDate = (isoText: string | null) => {
    if (!isoText) return 'Nunca sincronizado';
    try {
      const date = new Date(isoText);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) + ' - ' + date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Sincronizado vía nube';
    }
  };

  return (
    <div className="w-full pb-10 space-y-6" id="settings-tab-panel">
      <div className="space-y-1">
        <h2 className="text-lg font-display font-semibold text-deep-blue flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Configuración del Sistema</span>
        </h2>
        <p className="text-xs text-gray-505 font-medium">Ajuste factores de conversión de dosis y administre sincronización con Google Sheets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Drop configuration Column (8 Columns) */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs space-y-5">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-primary" />
              <h3 className="text-sm font-bold text-deep-blue">Parámetros de Cálculo</h3>
            </div>

            {/* Drop-to-ml Factor setting */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-bold text-sky-950/90 uppercase tracking-wide">Fórmula de Conversión de Gotas</label>
                <p className="text-xs text-gray-420 mt-0.5">Especifique el número de gotas equivalente a 1 ml (Norma clínica estándar: 20 gotas/ml).</p>
              </div>

              <div className="flex gap-2">
                {[15, 20, 24].map((factor) => (
                  <button
                    key={factor}
                    onClick={() => onUpdateSettings({ dropsPerMl: factor })}
                    className={`flex-1 height-11 rounded-xl text-xs font-bold border transition-all cursor-pointer py-3 text-center ${
                      settings.dropsPerMl === factor
                        ? 'bg-primary border-primary text-white shadow-sm font-extrabold'
                        : 'bg-white hover:bg-sky-50 border-gray-250 text-deep-blue'
                    }`}
                  >
                    {factor} Gotas / ml
                  </button>
                ))}
              </div>
            </div>

            {/* General parameters checkbox */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.useDefaultDoseOnly}
                  onChange={(e) => onUpdateSettings({ useDefaultDoseOnly: e.target.checked })}
                  className="mt-1 accent-primary w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-deep-blue block">Sugerir Dosis Predeterminada Únicamente</span>
                  <span className="text-xs text-gray-400 font-medium">Bloquea temporalmente el deslizador de dosis para evitar sobredosis accidentales al calcular rápido.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Cloud sync detailed administration */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-emerald-500" />
              <h3 className="text-sm font-bold text-deep-blue">Nube & Google Sheets</h3>
            </div>

            <div className="space-y-1.5 text-xs text-gray-500">
              <p>
                La base de datos de medicamentos de <b>Pediadosis Pro</b> se actualiza en vivo utilizando el archivo publicado de Google Sheets. El sistema almacena una copia local en el navegador para operar sin conexión o con conexiones deficientes de hospital de forma transparente.
              </p>
              
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 mt-3 font-medium">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-gray-400">Dirección Origen:</span>
                  <a 
                    href="https://docs.google.com/spreadsheets/d/1g11Z0WwUX9L" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-primary hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Google Sheets CSV</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-gray-400">Total Medicamentos:</span>
                  <span className="text-deep-blue font-bold">{totalRecords} registros</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Última Sincronización exitosa:</span>
                  <span className="text-deep-blue font-bold text-right">{formatFullDate(lastSync)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onSync}
              disabled={isSyncing}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer mt-4"
              id="settings-sync-force-btn"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar base de datos ahora</span>
            </button>
          </div>
        </div>

        {/* Info Column (4 Columns) */}
        <div className="md:col-span-4 space-y-6">
          {/* Mobile Installation Guide Card */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="p-1 px-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">Celular</span>
              <h3 className="text-sm font-semibold text-deep-blue">Instalar en tu Celular</h3>
            </div>

            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
              Puedes instalar <b>Pediadosis Pro</b> como si fuera una aplicación nativa para acceder instantáneamente desde tu pantalla de inicio y trabajar 100% sin conexión.
            </p>

            <div className="space-y-3.5 pt-2 border-t border-emerald-100">
              {/* Android instructions */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800">En Android (Chrome)</span>
                <p className="text-xs text-gray-600 font-medium">
                  Toca el menú de tres puntos <span className="font-bold">⋮</span> en tu navegador y selecciona <span className="font-bold">"Instalar aplicación"</span> o <span className="font-bold">"Agregar a la pantalla principal"</span>.
                </p>
              </div>

              {/* iOS instructions */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 font-sans">En iOS / iPhone (Safari)</span>
                <p className="text-xs text-gray-600 font-medium">
                  Toca el botón oficial de compartir <span className="font-bold text-emerald-700 font-mono">📤</span> (abajo en tu pantalla) y busca la opción <span className="font-bold">"Agregar al inicio"</span> <span className="font-bold text-emerald-600">(Add to Home Screen)</span>.
                </p>
              </div>
            </div>

            <div className="bg-emerald-500/10 text-emerald-800 text-[10px] p-2.5 rounded-xl font-bold text-center leading-normal">
              ⚡ ¡Se autoguardará todo el vademécum médico en la memoria interna del teléfono!
            </div>
          </div>

          <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 shrink-0" />
              <h3 className="text-sm font-semibold text-deep-blue">Acerca de Pediadosis</h3>
            </div>

            <div className="text-xs text-sky-900 font-medium leading-relaxed space-y-3">
              <p>
                <b>Versión:</b> v3.1.0 (Edición 2026)
              </p>
              <p>
                Diseñado exclusivamente para médicos pediatras, médicos generales e internos de guardia con el objetivo de agilizar y estandarizar la dosificación segura de pediatría ante fluctuaciones de peso.
              </p>
              <p className="pt-2 border-t border-sky-100 text-[10px] text-sky-700 italic">
                *Aviso Legal: El uso de esta herramienta recae únicamente en la responsabilidad civil-médica del facultativo. Validar dosis ante guías de práctica clínica locales.*
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
