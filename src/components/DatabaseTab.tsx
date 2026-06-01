/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Layers, 
  Pill, 
  Activity, 
  ChevronRight, 
  FileSpreadsheet, 
  Database,
  Calculator,
  Trash2,
  BookmarkCheck,
  Award
} from 'lucide-react';
import { Medication } from '../types';
import { getAutoCategory } from '../services/medicationService';
import { motion, AnimatePresence } from 'motion/react';

interface DatabaseTabProps {
  medications: Medication[];
  onSelectMedication: (medName: string) => void;
  onAddCustomMedication: (med: Medication) => void;
  onDeleteCustomMedication?: (medName: string) => void;
}

export function DatabaseTab({ 
  medications, 
  onSelectMedication, 
  onAddCustomMedication,
  onDeleteCustomMedication
}: DatabaseTabProps) {
  // 1. Filtering and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  
  // 2. Custom drug creator state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newDose, setNewDose] = useState<number>(30);
  const [newFreq, setNewFreq] = useState<number>(3);
  const [newConcMg, setNewConcMg] = useState<number>(250);
  const [newConcMl, setNewConcMl] = useState<number>(5);
  const [newVia, setNewVia] = useState('ORAL');
  const [newMaxDosis, setNewMaxDosis] = useState('');
  const [newCat, setNewCat] = useState('ANALGESICO');

  // Available interactive Filter categories (caps matching normalized auto-category outputs)
  const categories = [
    { id: 'TODOS', label: 'Todos', count: medications.length },
    { id: 'ANTIBIÓTICO', label: 'Antibióticos', count: medications.filter(m => m.autoCategoria === 'ANTIBIÓTICO').length },
    { id: 'ANALGÉSICO / ANTIPIRÉTICO', label: 'Analgésicos', count: medications.filter(m => m.autoCategoria === 'ANALGÉSICO / ANTIPIRÉTICO').length },
    { id: 'ANTIINFLAMATORIO', label: 'Antiinflamatorios', count: medications.filter(m => m.autoCategoria === 'ANTIINFLAMATORIO').length },
    { id: 'RESPIRATORIO / MUCOLÍTICO', label: 'Respiratorios/Mucolíticos', count: medications.filter(m => m.autoCategoria === 'RESPIRATORIO / MUCOLÍTICO').length },
    { id: 'ANTIHISTAMÍNICO', label: 'Antihistamínicos', count: medications.filter(m => m.autoCategoria === 'ANTIHISTAMÍNICO').length }
  ];

  // Search filter
  const searchedMeds = medications.filter(med => {
    const matchesSearch = med.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      med.autoCategoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'TODOS') {
      return matchesSearch;
    }
    return matchesSearch && med.autoCategoria === selectedCategory;
  });

  // Featured medication list (e.g., standard Paracetamol, Ibuprofen, Amoxicillin etc.)
  const featuredMeds = medications.filter(m => 
    m.nombre.toUpperCase() === 'PARACETAMOL/GOTAS 1/100MG' || 
    m.nombre.toUpperCase() === 'AMOXICILINA' || 
    m.nombre.toUpperCase() === 'IBUPROFENO'
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) return;

    const autoCatGenerated = getAutoCategory(newNombre, newCat);

    const customMed: Medication = {
      nombre: newNombre.trim().toUpperCase() + ' (Custom)',
      doseMgKgDia: newDose,
      frecuencia: newFreq,
      concentracionMl: newConcMl,
      concentracionMg: newConcMg,
      dosisMaximas: newMaxDosis.trim(),
      via: newVia.toUpperCase(),
      categoria: newCat.toUpperCase(),
      autoCategoria: autoCatGenerated,
      isCustom: true
    };

    onAddCustomMedication(customMed);
    
    // Reset Form
    setNewNombre('');
    setNewDose(30);
    setNewFreq(3);
    setNewConcMg(250);
    setNewConcMl(5);
    setNewVia('ORAL');
    setNewMaxDosis('');
    setShowAddForm(false);
  };

  return (
    <div className="w-full pb-10 space-y-6" id="database-tab-panel">
      
      {/* Featured medication spotlight card (matching Screen 1 primary hero item) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featuredMeds.slice(0, 2).map((featured, idx) => (
          <div 
            key={idx} 
            className="bg-white border border-sky-100 rounded-3xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between"
            id={`featured-card-${idx}`}
          >
            {/* Top accent badge */}
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-primary tracking-wider uppercase bg-primary-container/20 px-2.5 py-0.5 rounded-full inline-block">
                ✨ MÁS BUSCADO
              </span>
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs shadow-2xs">
                💊
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="text-xl font-display font-bold text-deep-blue">{featured.nombre}</h3>
              <p className="text-xs text-gray-500 font-medium">
                Sugerencia médica: {featured.autoCategoria === 'ANTIBIÓTICO' ? 'Antibiótico sistémico oral de alto espectro para amigdalitis o neumonías.' : 'Analgésico y antipirético pediátrico de primera elección.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-sky-50/45 border border-sky-100 p-3 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold text-sky-950/70 block uppercase">Dosis Recomendada</span>
                <span className="text-sm font-bold text-deep-blue">{featured.doseMgKgDia} mg/kg/día</span>
              </div>
              
              <div className="bg-sky-50/45 border border-sky-100 p-3 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold text-sky-950/70 block uppercase">Frecuencia Estándar</span>
                <span className="text-sm font-bold text-primary">Cada {parseFloat((24 / featured.frecuencia).toFixed(1))}h</span>
              </div>
            </div>

            <button 
              onClick={() => onSelectMedication(featured.nombre)}
              className="mt-5 w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer glow-btn"
            >
              <Calculator className="w-4 h-4" />
              <span>CALCULAR DOSIS</span>
            </button>
          </div>
        ))}
      </div>

      {/* Main database header, additions & inputs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-display font-semibold text-deep-blue flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <span>Lista de la Base de Datos</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Filtre y seleccione medicamentos para autocompletar la dosis.</p>
        </div>

        {/* Floating Custom Medicine Addition Toggle */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 self-start cursor-pointer shadow-sm transition-colors"
          id="add-custom-medicine-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Medicamento</span>
        </button>
      </div>

      {/* Form modal container to add custom drug */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border-2 border-primary/20 rounded-2xl p-5 shadow-lg max-w-2xl"
            id="add-medicine-form-container"
          >
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="border-b border-gray-100 pb-2.5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-deep-blue">Carga Personalizada de Medicamento</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  Local-Only Cache
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Nombre del Fármaco</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: FOSFOMICINA SUSPENSIÓN"
                    value={newNombre}
                    onChange={(e) => setNewNombre(e.target.value)}
                    className="w-full bg-white h-10 px-3 border border-gray-200 rounded-lg text-sm text-deep-blue font-semibold outline-none"
                    id="new-med-name"
                  />
                </div>

                {/* Categoría */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Familia Terapéutica</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full bg-white h-10 px-3 border border-gray-200 rounded-lg text-sm text-deep-blue font-semibold outline-none"
                  >
                    <option value="ANTIBIOTICO">Antibiótico</option>
                    <option value="ANALGESICO">Analgésico / Antipirético</option>
                    <option value="ANTIINFLAMATORIO">Antiinflamatorio</option>
                    <option value="MUCOLITICO">Respiratorio / Mucolítico</option>
                    <option value="ALERGIA">Antihistamínico / Alergias</option>
                    <option value="CORTICOIDE">Corticoide</option>
                    <option value="OTROS">Otro / Especialidad</option>
                  </select>
                </div>

                {/* Dosis mg/kg/día */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Dosis sugerida diaria (mg/kg/día)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newDose || ''}
                    onChange={(e) => setNewDose(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white h-10 px-3 border border-gray-200 rounded-lg text-sm text-deep-blue font-semibold outline-none"
                  />
                </div>

                {/* Frecuencia (tomas) */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Frecuencia (tomas al día)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newFreq || ''}
                    onChange={(e) => setNewFreq(parseInt(e.target.value) || 1)}
                    className="w-full bg-white h-10 px-3 border border-gray-200 rounded-lg text-sm text-deep-blue font-semibold outline-none"
                  />
                </div>

                {/* Concentración (mg en jarabe) */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Concentración en mg</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 250"
                    value={newConcMg || ''}
                    onChange={(e) => setNewConcMg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white h-10 px-3 border border-gray-200 rounded-lg text-sm text-deep-blue font-semibold outline-none"
                  />
                </div>

                {/* Concentración (en ml de volumen) */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Volumen en ml</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 5"
                    value={newConcMl || ''}
                    onChange={(e) => setNewConcMl(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white h-10 px-3 border border-gray-200 rounded-lg text-sm text-deep-blue font-semibold outline-none"
                  />
                </div>

                {/* Dosis Maxima */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Límites / Dosis Máxima (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Max 1.5g por día"
                    value={newMaxDosis}
                    onChange={(e) => setNewMaxDosis(e.target.value)}
                    className="w-full bg-white h-10 px-3 border border-gray-200 rounded-lg text-sm text-deep-blue font-semibold outline-none"
                  />
                </div>

                {/* Vía */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Vía de administración</label>
                  <input
                    type="text"
                    value={newVia}
                    onChange={(e) => setNewVia(e.target.value)}
                    className="w-full bg-white h-10 px-3 border border-gray-200 rounded-lg text-sm text-deep-blue font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  id="confirm-submit-custom-medication"
                >
                  Guardar Medicamento
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Database Search Input bar (Real Time Checklist finder) */}
      <div className="relative" id="database-search-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar medicamento en la base de datos (Ej: Amoxicilina)..."
          className="w-full h-12 pl-11 pr-5 rounded-2xl border border-gray-250 focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-medium outline-none bg-white transition-all shadow-2xs"
          id="medication-checklist-search"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Interactive Category Tabs matching Screen 1 visual layout */}
      <div className="w-full flex gap-2 overflow-x-auto pb-2 scrollbar-none" id="categories-filter-rail">
        {categories.map((cat, ix) => (
          <button
            key={ix}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-primary border-primary text-white shadow-sm font-bold'
                : 'bg-white border-gray-200/85 text-gray-620 hover:bg-sky-50'
            }`}
            id={`category-pill-${cat.id.substring(0, 5)}`}
          >
            <span>{cat.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 ml-1 rounded-full ${
              selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* List layout of matching meds */}
      <div className="space-y-3" id="medication-records-grid">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-400 font-mono px-1">
          <span>{searchedMeds.length} Medicaciones encontradas</span>
          <span>Sincronizado vía Cloud CSV</span>
        </div>

        {searchedMeds.length > 0 ? (
          searchedMeds.map((med, index) => {
            const autoCat = med.autoCategoria;
            const singleDose = med.frecuencia > 0 ? parseFloat((med.doseMgKgDia / med.frecuencia).toFixed(2)) : med.doseMgKgDia;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                key={index}
                className="bg-white hover:bg-sky-50/20 border border-gray-100 rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-2xs hover:shadow-xs group hover:border-sky-100"
                id={`record-${index}`}
              >
                {/* Left content block */}
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 bg-sky-50 rounded-xl flex items-center justify-center shrink-0 border border-sky-100/50">
                    <Pill className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display font-bold text-deep-blue leading-tight group-hover:text-primary transition-colors text-base">
                        {med.nombre}
                      </h4>
                      <span className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 bg-sky-100 text-sky-800 rounded-md">
                        {autoCat}
                      </span>
                      {med.isCustom && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                          Personalizado
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                      <span className="font-mono text-gray-400">
                        Concentración: <b className="text-deep-blue font-sans">{med.concentracionMg}mg / {med.concentracionMl}ml</b>
                      </span>
                      <span>•</span>
                      <span>Dosis: <b className="text-secondary">{med.doseMgKgDia} mg/kg/dia</b></span>
                      <span>•</span>
                      <span>Intervalo: <b className="text-primary">Cada {parseFloat((24 / med.frecuencia).toFixed(1))}h</b></span>
                    </div>
                  </div>
                </div>

                {/* Right actions block */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {med.isCustom && onDeleteCustomMedication && (
                    <button
                      onClick={() => onDeleteCustomMedication(med.nombre)}
                      className="p-2 border border-rose-100 hover:bg-rose-50 rounded-xl text-rose-500 cursor-pointer hover:text-rose-600 transition-colors"
                      title="Eliminar medicamento personalizado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onSelectMedication(med.nombre)}
                    className="bg-sky-50 text-primary hover:bg-primary hover:text-white border border-primary/20 hover:border-primary rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    id={`select-med-btn-${index}`}
                  >
                    <span>Calcular</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="bg-white border rounded-2xl py-12 text-center text-gray-400 space-y-2">
            <Layers className="w-8 h-8 mx-auto opacity-40 text-gray-400" />
            <p className="text-sm font-semibold">No se encontraron medicamentos</p>
            <p className="text-xs">Intente otra consulta o agregue un medicamento personalizado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
