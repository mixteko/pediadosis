/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Info, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  Plus, 
  Minus, 
  Copy, 
  Check, 
  Save, 
  AlertCircle 
} from 'lucide-react';
import { Medication, CalculationResult, AppSettings } from '../types';
import { calculateDosage, formatIntervalLabel } from '../services/calculatorEngine';
import { motion, AnimatePresence } from 'motion/react';

interface CalculatorTabProps {
  medications: Medication[];
  settings: AppSettings;
  onAddHistory: (historyItem: any) => void;
  // Allows other tabs to pre-select a drug
  preselectedMedicationName?: string;
  onSelectTab: (tab: string) => void;
}

export function CalculatorTab({ 
  medications, 
  settings, 
  onAddHistory, 
  preselectedMedicationName,
  onSelectTab
}: CalculatorTabProps) {
  // 1. Selector state
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // 2. Input states
  const [weight, setWeight] = useState<number>(12.5);
  const [customMgKgDia, setCustomMgKgDia] = useState<number>(60);
  const [customFrecuencia, setCustomFrecuencia] = useState<number>(4);
  const [customConcMl, setCustomConcMl] = useState<number>(5);
  const [customConcMg, setCustomConcMg] = useState<number>(160);

  // 3. UI control states
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Filter medications for dropdown search
  const filteredMeds = medications.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.autoCategoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load selected drug or custom preselected drug from list
  useEffect(() => {
    if (medications.length > 0) {
      let medToSelect = medications[0]; // default to first drug
      
      if (preselectedMedicationName) {
        const found = medications.find(m => m.nombre === preselectedMedicationName);
        if (found) medToSelect = found;
      } else {
        // Try to default to Paracetamol
        const para = medications.find(m => m.nombre.toUpperCase().includes('PARACETAMOL'));
        if (para) medToSelect = para;
      }
      
      handleSelectMedication(medToSelect);
    }
  }, [medications, preselectedMedicationName]);

  const handleSelectMedication = (med: Medication) => {
    setSelectedMed(med);
    setSearchTerm(med.nombre);
    setShowDropdown(false);

    // Populate overrides
    setCustomMgKgDia(med.doseMgKgDia);
    setCustomFrecuencia(med.frecuencia);
    setCustomConcMl(med.concentracionMl);
    setCustomConcMg(med.concentracionMg);
  };

  // Perform active calculation
  const result: CalculationResult | null = selectedMed && weight > 0
    ? calculateDosage(
        weight, 
        selectedMed, 
        customMgKgDia, 
        customFrecuencia, 
        customConcMl, 
        customConcMg, 
        settings.dropsPerMl
      )
    : null;

  // Single dosage multiplier computed based on current parameters (singleDoseMgKg = mgKgDia / Frecuencia)
  const activeSingleDoseMgKg = result 
    ? parseFloat((customMgKgDia / customFrecuencia).toFixed(2)) 
    : 0;

  // Apply quick dosis multiplier single dose chips (e.g., 15 mg/kg single dose, sets mgKgDia based on frequency)
  const handleQuickDoseChip = (singleMgKg: number) => {
    if (singleMgKg === -1) {
      // Dosis Única (frequency = 1, single dose is the full daily dose of 15 or 10)
      setCustomFrecuencia(1);
      // set daily dose to 15 or let's say 10
      setCustomMgKgDia(10);
      return;
    }
    
    // singleMgKg = mgKgDia / Frecuencia  => mgKgDia = singleMgKg * Frecuencia
    const newMgKgDia = singleMgKg * customFrecuencia;
    setCustomMgKgDia(parseFloat(newMgKgDia.toFixed(2)));
  };

  // Stepper helpers for patient weight
  const incrementWeight = (val: number) => {
    setWeight(prev => parseFloat(Math.max(1, prev + val).toFixed(1)));
  };

  // Copy clinical prescription summary to clipboard
  const handleCopySummary = () => {
    if (!selectedMed || !result) return;
    
    const viaText = selectedMed.via ? `Vía: ${selectedMed.via}` : '';
    const text = `⚕️ INFORME PEDIADOSIS PRO ⚕️
-----------------------------
Medicamento: ${selectedMed.nombre}
Peso del Paciente: ${weight} kg
Dosis Multiplicada: ${activeSingleDoseMgKg} mg/kg por toma (${customMgKgDia} mg/kg/día)
Frecuencia: ${formatIntervalLabel(customFrecuencia)}

💡 DOSIFICACIÓN CALCULADA:
👉 Volumen: ${result.mlPerDose} ml por toma
👉 Dosis (mg): ${result.mgPerDose} mg por toma
👉 Gotas: ${result.dropsPerDose} gotas por toma
👉 Total Diario: ${result.mgPerDay} mg/día

Presentación de apoyo: ${customConcMg}mg en ${customConcMl}ml
${viaText}
-----------------------------
*Advertencia: Confirmar siempre la presentación del fármaco físico antes de administrar.*`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Save current calculation to local History
  const handleSaveToHistory = () => {
    if (!selectedMed || !result) return;

    const historyItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      patientWeight: weight,
      medicationName: selectedMed.nombre,
      selectedMgKgDia: customMgKgDia,
      frecuencia: customFrecuencia,
      mgPerDose: result.mgPerDose,
      mlPerDose: result.mlPerDose,
      dropsPerDose: result.dropsPerDose,
      frecuenciaHoras: result.frecuenciaHoras
    };

    onAddHistory(historyItem);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Check if dosage seems clinically abnormally high as safety guardrails
  const getSafetyAlerts = () => {
    if (!selectedMed || !result) return null;

    const limiters: string[] = [];

    // Analyze if there are max dosage rules
    if (selectedMed.dosisMaximas) {
      limiters.push(`Nota de dosis máxima oficial: ${selectedMed.dosisMaximas}`);
    }

    // Standard high doses guardrails
    if (selectedMed.nombre.toUpperCase().includes('PARACETAMOL') && activeSingleDoseMgKg > 20) {
      limiters.push('ALERTA: Dosis de Paracetamol superior a 20 mg/kg por toma (Dosis regular: 10-15 mg/kg)');
    }
    if (selectedMed.nombre.toUpperCase().includes('IBUPROFENO') && activeSingleDoseMgKg > 15) {
      limiters.push('ALERTA: Dosis de Ibuprofeno superior a 10-12 mg/kg por toma (Dosis regular: 5-10 mg/kg)');
    }
    if (selectedMed.nombre.toUpperCase().includes('AMOXICILINA') && customMgKgDia > 95) {
      limiters.push('ALERTA: Dosis de Amoxicilina excede los 90 mg/kg/día recomendados para casos graves.');
    }

    return limiters.length > 0 ? limiters : null;
  };

  const safetyAlerts = getSafetyAlerts();

  return (
    <div className="w-full pb-10" id="calculator-tab-panel">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Calculator inputs (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Card: Calculadora */}
          <div className="bg-white rounded-2xl border border-sky-100/60 p-5 shadow-sm space-y-5">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display font-semibold text-deep-blue">Calculadora de Dosis</h2>
            </div>

            {/* Fármaco Selector Dropdown */}
            <div className="relative space-y-2">
              <label className="block text-xs font-bold tracking-wider text-sky-950 uppercase">MEDICAMENTO</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Escriba para buscar medicamento..."
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-medium outline-none transition-all"
                    id="medication-search-input-calculator"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => { setSearchTerm(''); setSelectedMed(null); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 px-1"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => onSelectTab('medicines')}
                  className="px-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-deep-blue text-center flex items-center transition-colors"
                  title="Ver vademécum completo"
                >
                  Catálogo
                </button>
              </div>

              {/* Autocomplete dropdown suggestions */}
              {showDropdown && (
                <div className="absolute top-14 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-gray-55" id="autocomplete-suggestions">
                  {filteredMeds.length > 0 ? (
                    filteredMeds.slice(0, 15).map((med, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectMedication(med)}
                        className="w-full text-left px-4 py-3 hover:bg-sky-50/50 flex items-center justify-between transition-colors cursor-pointer"
                        id={`suggestion-${idx}`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-deep-blue">{med.nombre}</p>
                          <p className="text-xs text-gray-420 font-mono">Presentación: {med.concentracionMg}mg/{med.concentracionMl}ml</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded-md">
                          {med.autoCategoria}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-center text-xs text-gray-400">
                      Ningún fármaco coincide con la búsqueda.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Patient Weight Numeric Input and Increments (Steppers) */}
            <div className="space-y-3 bg-sky-50/20 px-4 py-4 rounded-xl border border-sky-100/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold tracking-wider text-sky-950 uppercase">PESO DEL PACIENTE (KG)</label>
                <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Infante
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Manual Stepper Button minus */}
                <button
                  type="button"
                  onClick={() => incrementWeight(-1)}
                  className="w-12 h-12 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors shadow-2xs cursor-pointer active:scale-95"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => incrementWeight(-0.1)}
                  className="w-10 h-10 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 transition-colors shadow-2xs cursor-pointer active:scale-95"
                >
                  -0.1
                </button>

                {/* Main numeric Field Input */}
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="150"
                    value={weight || ''}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    placeholder="Ej: 12.5"
                    className="w-full h-12 bg-white text-center rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 font-bold text-lg outline-none pr-8 transition-all"
                    id="patient-weight-input-field"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                    KG
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => incrementWeight(0.1)}
                  className="w-10 h-10 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 transition-colors shadow-2xs cursor-pointer active:scale-95"
                >
                  +0.1
                </button>
                {/* Manual Stepper Button plus */}
                <button
                  type="button"
                  onClick={() => incrementWeight(1)}
                  className="w-12 h-12 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors shadow-2xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Fast weight sliders */}
              <input
                type="range"
                min="2.5"
                max="50"
                step="0.5"
                value={weight || 2.5}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                className="w-full accent-primary h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-400 font-mono px-1">
                <span>Rango Lactantes (2.5 kg)</span>
                <span>Preescolar/Escolar (50 kg)</span>
              </div>
            </div>

            {/* Quick Dosis Multipliers Chips */}
            {selectedMed && (
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-wider text-sky-950 uppercase">DOSIFICACIONES COMUNES (POR TOMA)</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDoseChip(15)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      activeSingleDoseMgKg === 15
                        ? 'bg-primary border-primary text-white shadow-sm glow-effect'
                        : 'bg-white border-gray-200 text-deep-blue hover:bg-sky-50/40'
                    }`}
                  >
                    15 mg/kg
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDoseChip(10)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      activeSingleDoseMgKg === 10
                        ? 'bg-primary border-primary text-white shadow-sm glow-effect'
                        : 'bg-white border-gray-200 text-deep-blue hover:bg-sky-50/40'
                    }`}
                  >
                    10 mg/kg
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDoseChip(5)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      activeSingleDoseMgKg === 5
                        ? 'bg-primary border-primary text-white shadow-sm glow-effect'
                        : 'bg-white border-gray-200 text-deep-blue hover:bg-sky-50/40'
                    }`}
                  >
                    5 mg/kg
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDoseChip(-1)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      customFrecuencia === 1
                        ? 'bg-secondary border-secondary text-white shadow-sm'
                        : 'bg-white border-gray-200 text-deep-blue hover:bg-sky-50/40'
                    }`}
                  >
                    Dosis Única
                  </button>
                </div>
              </div>
            )}

            {/* Toggle advanced adjustments */}
            {selectedMed && (
              <div className="border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{showDetails ? 'Ocultar' : 'Ajustar'} parámetros de concentración y dosis del fármaco</span>
                  <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                </button>

                {showDetails && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200/50"
                  >
                    {/* Dosis mg/kg/día */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase">Multiplicador Diario (mg/kg/día)</label>
                      <input
                        type="number"
                        value={customMgKgDia || ''}
                        onChange={(e) => setCustomMgKgDia(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white h-10 px-3 border border-gray-200 rounded-lg text-sm text-deep-blue font-semibold outline-none"
                      />
                      <span className="text-[10px] text-gray-400 font-mono">Dosis recomendada: {selectedMed.doseMgKgDia} mg/kg/día</span>
                    </div>

                    {/* Frecuencia */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase">Tomas por día (Frecuencia)</label>
                      <select
                        value={customFrecuencia}
                        onChange={(e) => setCustomFrecuencia(parseInt(e.target.value) || 1)}
                        className="w-full bg-white h-10 px-3 border border-gray-200 rounded-lg text-sm text-deep-blue font-semibold outline-none"
                      >
                        <option value={1}>1 vez al día (Cada 24 horas)</option>
                        <option value={2}>2 veces al día (Cada 12 horas)</option>
                        <option value={3}>3 veces al día (Cada 8 horas)</option>
                        <option value={4}>4 veces al día (Cada 6 horas)</option>
                        <option value={6}>6 veces al día (Cada 4 horas)</option>
                      </select>
                    </div>

                    {/* Concentración MG */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase">Concentración en mg (Ej: 250)</label>
                      <input
                        type="number"
                        value={customConcMg || ''}
                        onChange={(e) => setCustomConcMg(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white h-10 px-3 border border-gray-200 rounded-lg text-sm text-deep-blue font-semibold outline-none"
                      />
                    </div>

                    {/* Concentración ML */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase">En cuántos ml (Ej: 5)</label>
                      <input
                        type="number"
                        value={customConcMl || ''}
                        onChange={(e) => setCustomConcMl(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white h-10 px-3 border border-gray-200 rounded-lg text-sm text-deep-blue font-semibold outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Clinical Security Shield Card */}
          <div className="bg-slate-100 border border-slate-200/60 rounded-2xl p-4 flex gap-3 items-start">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-deep-blue">Seguridad Clínica Garantizada</p>
              <p className="text-xs text-gray-499 mt-0.5">
                Datos actualizados dinámicamente según protocolos de pediatría 2026. El sistema calcula fórmulas basadas en peso exacto para mitigar riesgos estacionales.
              </p>
            </div>
          </div>
          
          {/* Top updates illustration promotion card */}
          <div className="relative bg-gradient-to-r from-teal-700 to-deep-blue text-white rounded-2xl p-5 shadow-sm overflow-hidden flex items-center justify-between">
            <div className="space-y-1 relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-wider bg-electric-cyan text-deep-blue px-2 py-0.5 rounded-full">
                Nueva Actualización
              </span>
              <h3 className="text-base font-display font-semibold">Protocolos Clínicos Sincronizados</h3>
              <p className="text-xs text-cyan-100 max-w-sm">
                Hemos verificado las tomas recomendadas del vademécum contra los estándares de dosificación pediátrica para aminopenicilinas y analgésicos.
              </p>
            </div>
            {/* Soft decorative background circular glow */}
            <div className="absolute right-[-40px] bottom-[-40px] w-40 h-40 bg-electric-cyan opacity-20 rounded-full blur-2xl"></div>
          </div>
          
        </div>

        {/* Right Column: Display dosage results (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {!selectedMed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border rounded-2xl p-8 text-center space-y-4 shadow-2xs"
              >
                <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto">
                  <Calculator className="w-8 h-8 text-sky-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-deep-blue">Esperando selección...</h3>
                  <p className="text-xs text-gray-500">Seleccione un fármaco arriba para calcular dosis pediátrica exacta.</p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
                id="calculated-dosage-results-box"
              >
                {/* Main calculation display card */}
                <div className="bg-gradient-to-b from-white to-sky-50/30 rounded-2xl border-2 border-primary border-t-[8px] p-5 shadow-md flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-primary tracking-wider uppercase bg-primary-container/20 px-2.5 py-0.5 rounded-full inline-block">
                        {selectedMed.autoCategoria}
                      </span>
                      <h3 className="text-md font-display font-semibold text-deep-blue mt-1.5">{selectedMed.nombre}</h3>
                    </div>
                    
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/25 glow-effect shrink-0">
                      <span className="text-lg font-bold text-primary">🩺</span>
                    </div>
                  </div>

                  {/* Gigantic VOLUME highlight display */}
                  <div className="bg-white/80 border border-sky-100 rounded-xl p-4 text-center relative overflow-hidden space-y-1 shadow-2xs">
                    <p className="text-xs font-bold text-primary tracking-wider uppercase">Dosis por Toma recomendada</p>
                    
                    <div className="flex items-baseline justify-center gap-1.5 select-all">
                      <p className="text-4xl font-display font-black text-deep-blue tracking-tight">
                        {result.mlPerDose}
                      </p>
                      <p className="text-xl font-bold text-primary">ml</p>
                    </div>

                    <p className="text-sm font-semibold text-primary/95 mt-1 font-sans">
                      {formatIntervalLabel(customFrecuencia)}
                    </p>
                  </div>

                  {/* Segmented breakdown statistics */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Milligrams per dose */}
                    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Dosis en miligramos</p>
                      <p className="text-md font-bold text-deep-blue">{result.mgPerDose} mg</p>
                      <p className="text-[10px] text-gray-400 font-semibold italic">por toma</p>
                    </div>

                    {/* Equivalent in Drops */}
                    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Equitativo Gotas</p>
                      <p className="text-md font-bold text-primary">{result.dropsPerDose} gotas</p>
                      <p className="text-[10px] text-gray-400 font-semibold italic">({settings.dropsPerMl} gotas = 1ml)</p>
                    </div>
                  </div>

                  {/* Auxiliary breakdown metadata */}
                  <div className="bg-gray-50 rounded-xl p-4.5 border border-gray-200/50 space-y-2 border-l-4 border-l-secondary">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-400">Peso paciente:</span>
                      <span className="text-deep-blue font-bold">{weight} kg</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-400">Fórmula activa:</span>
                      <span className="text-deep-blue font-bold">{activeSingleDoseMgKg} mg/kg /toma</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-400">Total diario:</span>
                      <span className="text-deep-blue font-semibold">{result.mgPerDay} mg/día</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-400">Presentación base:</span>
                      <span className="text-deep-blue font-mono">{customConcMg}mg / {customConcMl}ml</span>
                    </div>
                    {selectedMed.via && (
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-400">Vía administración:</span>
                        <span className="text-primary font-bold bg-primary-container/20 px-1.5 py-0.5 rounded">
                          {selectedMed.via}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleCopySummary}
                      className="flex-1 h-11 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500 animate-bounce" />
                          <span className="text-emerald-600 font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Receta</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSaveToHistory}
                      className="flex-1 h-11 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm glow-btn active:scale-95 cursor-pointer"
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-4 h-4 animate-ping" />
                          <span>Guardado</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Guardar Registro</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Safety Warning Card */}
                {safetyAlerts && (
                  <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4.5 space-y-2 text-red-900 border-l-[6px] border-l-rose-600 animate-pulse">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <p className="text-xs font-bold uppercase tracking-wider text-red-800">Advertencias Pediátricas Clínicas</p>
                    </div>
                    <ul className="list-disc pl-5 text-xs font-medium space-y-1">
                      {safetyAlerts.map((txt, idx) => (
                        <li key={idx}>{txt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AVISO DE SEGURIDAD (bottom banner image match) */}
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>AVISO DE SEGURIDAD</span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium">
                    Confirme la concentración (mg/ml) del envase físico contra la fuente en la nube antes de proceder a la administración. Algún jarabe comercial puede contener dosis atípicas.
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Quick instructions of use card */}
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm font-semibold text-deep-blue">Instrucciones de uso</p>
            </div>
            
            <ol className="text-xs text-sky-900 space-y-2 list-decimal pl-5 font-medium leading-relaxed">
              <li>Seleccione el fármaco sincronizado con la nube escribiendo su nombre.</li>
              <li>Ingrese el peso exacto del infante ajustando con los botones rápidos.</li>
              <li>El sistema calculará automáticamente la dosificación en mililitros, gotas y frecuencia según los factores clínicos cargados.</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
}
