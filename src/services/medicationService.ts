/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Medication } from '../types';

const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDl2i7g0UIQW5Jw6dKXmStMBcrYrcsJ2Kxd0dinPfV75Wjoe0z-fxFBQLtxMsD3A8Xby3DpbKmPXMU/pub?gid=0&single=true&output=csv';

// High-quality offline fallback medications in case the Google Sheet is unreachable or slow to load.
const FALLBACK_MEDICATIONS: Medication[] = [
  {
    nombre: 'PARACETAMOL/GOTAS 1/100MG',
    doseMgKgDia: 60,
    frecuencia: 4,
    concentracionMl: 1,
    concentracionMg: 100,
    dosisMaximas: '75 mg/kg/día',
    via: 'ORAL',
    categoria: 'ANALGESICO',
    autoCategoria: 'ANALGÉSICO / ANTIPIRÉTICO'
  },
  {
    nombre: 'PARACETAMOL / 3.2/100MG (Jarabe)',
    doseMgKgDia: 60,
    frecuencia: 4,
    concentracionMl: 5,
    concentracionMg: 160,
    dosisMaximas: '75 mg/kg/día',
    via: 'ORAL',
    categoria: 'ANALGESICO',
    autoCategoria: 'ANALGÉSICO / ANTIPIRÉTICO'
  },
  {
    nombre: 'IBUPROFENO (Suspensión 100mg/5ml)',
    doseMgKgDia: 30, // 30mg/kg/dia total split into 3 doses (10mg/kg per dose)
    frecuencia: 3,
    concentracionMl: 5,
    concentracionMg: 100,
    dosisMaximas: '40 mg/kg/día',
    via: 'ORAL',
    categoria: 'ANALGESICO',
    autoCategoria: 'ANTIINFLAMATORIO'
  },
  {
    nombre: 'AMOXICILINA (Suspensión 250mg/5ml)',
    doseMgKgDia: 50,
    frecuencia: 3,
    concentracionMl: 5,
    concentracionMg: 250,
    dosisMaximas: '90 mg/kg/día',
    via: 'ORAL',
    categoria: 'ANTIBIOTICO',
    autoCategoria: 'ANTIBIÓTICO'
  },
  {
    nombre: 'AMOXICILINA 12 HRS (Suspensión 400mg/5ml)',
    doseMgKgDia: 50,
    frecuencia: 2,
    concentracionMl: 5,
    concentracionMg: 400,
    dosisMaximas: '90 mg/kg/día',
    via: 'ORAL',
    categoria: 'ANTIBIOTICO',
    autoCategoria: 'ANTIBIÓTICO'
  },
  {
    nombre: 'SALBUTAMOL (Jarabe 2mg/5ml)',
    doseMgKgDia: 0.3, // 0.1 mg/kg/dosis, 3 veces al día
    frecuencia: 3,
    concentracionMl: 5,
    concentracionMg: 2,
    dosisMaximas: '12 mg/día',
    via: 'ORAL',
    categoria: 'RESPIRATORIO',
    autoCategoria: 'RESPIRATORIO / MUCOLÍTICO'
  },
  {
    nombre: 'CETIRIZINA (Jarabe 5mg/5ml)',
    doseMgKgDia: 0.5,
    frecuencia: 1,
    concentracionMl: 5,
    concentracionMg: 5,
    dosisMaximas: '10 mg/día',
    via: 'ORAL',
    categoria: 'ALERGIA',
    autoCategoria: 'ANTIHISTAMÍNICO'
  },
  {
    nombre: 'LORATADINA (Jarabe 5mg/5ml)',
    doseMgKgDia: 0.2,
    frecuencia: 1,
    concentracionMl: 5,
    concentracionMg: 5,
    dosisMaximas: '10 mg/día',
    via: 'ORAL',
    categoria: 'ALERGIA',
    autoCategoria: 'ANTIHISTAMÍNICO'
  }
];

// Dynamically categorize medications based on keywords for beautiful UI chips and styling
export function getAutoCategory(name: string, csvCategory: string): string {
  const normalized = name.toUpperCase();
  const cCat = csvCategory ? csvCategory.toUpperCase().trim() : '';

  if (cCat === 'ANTIBIOTICO' || normalized.includes('AMOXICILINA') || normalized.includes('AMPICILINA') || normalized.includes('CEFALEXINA') || normalized.includes('CEFTRIAXONA') || normalized.includes('CLARITROMICINA') || normalized.includes('ERITROMICINA') || normalized.includes('PENICILINA') || normalized.includes('TRIMETOPRIMA') || normalized.includes('CEFUROXIMA') || normalized.includes('CEFIXIMA') || normalized.includes('CEFADROXILO') || normalized.includes('AZITROMICINA') || normalized.includes('CLINDAMICINA') || normalized.includes('DICLOXACILINA') || normalized.includes('MACROLIDO') || normalized.includes('SULFA')) {
    return 'ANTIBIÓTICO';
  }

  if (cCat === 'ANALGESICO' || normalized.includes('PARACETAMOL') || normalized.includes('METAMIZOL') || normalized.includes('DIPIRONA') || normalized.includes('CLONIXINATO') || normalized.includes('ANALGESICO')) {
    return 'ANALGÉSICO / ANTIPIRÉTICO';
  }

  if (normalized.includes('IBUPROFENO') || normalized.includes('NAPROXEN') || normalized.includes('KETOROLACO') || normalized.includes('AC.TOLFENAMICO') || normalized.includes('DICLOFENACO') || normalized.includes('MELOXICAM') || normalized.includes('NIMESULIDA') || normalized.includes('ANTIINFLAMATORI') || normalized.includes('ANTI-INFLAMATORIO')) {
    return 'ANTIINFLAMATORIO';
  }

  if (cCat === 'MUCOLITICO' || normalized.includes('SALBUTAMOL') || normalized.includes('AMBROXOL') || normalized.includes('IPRATROPIO') || normalized.includes('BUDESONIDA') || normalized.includes('MONTELUKAST') || normalized.includes('TEOFILINA') || normalized.includes('DEXTROMETORFANO') || normalized.includes('LEVODROPROPICINA') || normalized.includes('OXIMETAZOLINA') || normalized.includes('GUAIFENESINA') || normalized.includes('MUCOLITICO') || normalized.includes('BRONCODILATADOR')) {
    return 'RESPIRATORIO / MUCOLÍTICO';
  }

  if (normalized.includes('LORATADINA') || normalized.includes('CETIRIZINA') || normalized.includes('CLORFENAMINA') || normalized.includes('DIFENHIDRAMINA') || normalized.includes('DESLORATADINA') || normalized.includes('EBASTINA') || normalized.includes('HIDROXICINA') || normalized.includes('ALERGIA') || normalized.includes('ANTIHISTAMIN')) {
    return 'ANTIHISTAMÍNICO';
  }

  if (cCat === 'ANTIHEMETICO' || normalized.includes('METOCLOPRAMIDA') || normalized.includes('ONDANSETRON') || normalized.includes('DOMPERIDONA') || normalized.includes('DIFENIDOL') || normalized.includes('ALIZAPRIDA') || normalized.includes('ANTIEMETICO')) {
    return 'ANTIEMÉTICO';
  }

  if (cCat === 'ANTIVIRAL' || normalized.includes('ACICLOVIR') || normalized.includes('AMANTADINA') || normalized.includes('OSELTAMIVIR')) {
    return 'ANTIVIRAL';
  }

  if (normalized.includes('METRONIDAZOL') || normalized.includes('ALBENDAZOL') || normalized.includes('MEBENDAZOL') || normalized.includes('NITAZOXANIDA') || normalized.includes('ANTIPARASITARIO')) {
    return 'ANTIPARASITARIO';
  }

  if (normalized.includes('RANITIDINA') || normalized.includes('OMEPRAZOL') || normalized.includes('PANTOPRAZOL') || normalized.includes('ESOMEPRAZOL') || normalized.includes('GASTROPROTECTOR') || normalized.includes('SUCRALFATO')) {
    return 'GASTROPROTECTOR';
  }

  if (normalized.includes('PREDNISOLONA') || normalized.includes('PREDNISONA') || normalized.includes('DEXAMETASONA') || normalized.includes('BETAMETASONA') || normalized.includes('HIDROCORTISONA') || normalized.includes('DEFLAZACORT') || normalized.includes('CORTICOIDE')) {
    return 'CORTICOIDE';
  }

  // Default mappings based on cCat
  if (cCat) {
    if (cCat === 'ANALGESICO') return 'ANALGÉSICO / ANTIPIRÉTICO';
    if (cCat === 'ANTIBIOTICO') return 'ANTIBIÓTICO';
    if (cCat === 'ANTIVIRAL') return 'ANTIVIRAL';
    if (cCat === 'MUCOLITICO') return 'RESPIRATORIO / MUCOLÍTICO';
    if (cCat === 'ANTIHEMETICO') return 'ANTIEMÉTICO';
    return cCat;
  }

  return 'OTROS';
}

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [''];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push('');
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += char;
    }
  }

  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }

  return lines;
}

export interface SyncStatus {
  lastSyncTime: string | null;
  success: boolean;
  totalRecords: number;
}

export const medicationService = {
  // Load cached medications or return fallbacks
  getMedications(): Medication[] {
    try {
      const cached = localStorage.getItem('pediadosis_medications');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Error reading localStorage cached medications', e);
    }
    return FALLBACK_MEDICATIONS;
  },

  // Save customized custom drugs alongside sync ones
  saveMedications(meds: Medication[]) {
    try {
      localStorage.setItem('pediadosis_medications', JSON.stringify(meds));
    } catch (e) {
      console.error('Error writing medications to localStorage', e);
    }
  },

  // Get synchronization status
  getSyncStatus(): SyncStatus {
    try {
      const lastSync = localStorage.getItem('pediadosis_last_sync');
      const total = this.getMedications().length;
      return {
        lastSyncTime: lastSync,
        success: lastSync !== null,
        totalRecords: total
      };
    } catch (e) {
      return { lastSyncTime: null, success: false, totalRecords: 0 };
    }
  },

  // Process the raw text fetched from Google Sheets
  processCSVData(csvText: string): Medication[] {
    const parsedText = parseCSV(csvText);
    if (!parsedText || parsedText.length <= 1) {
      throw new Error('Formato de CSV no válido o vacío');
    }

    // Header structure: NOMBRE,DOSIS_MG_KG_DIA,FRECUENCIA,CONCENTRACION_ML,CONCENTRACION_MG,DOSIS MAXIMAS,VIA,CATEGORIA
    const headers = parsedText[0].map(h => h.toUpperCase().trim());
    const nameIdx = headers.indexOf('NOMBRE');
    const doseIdx = headers.indexOf('DOSIS_MG_KG_DIA');
    const freqIdx = headers.indexOf('FRECUENCIA');
    const concMlIdx = headers.indexOf('CONCENTRACION_ML');
    const concMgIdx = headers.indexOf('CONCENTRACION_MG');
    const maxIdx = headers.indexOf('DOSIS MAXIMAS');
    const viaIdx = headers.indexOf('VIA');
    const catIdx = headers.indexOf('CATEGORIA');

    if (nameIdx === -1) {
      throw new Error('Falta la columna "NOMBRE" crítica de medicamentos');
    }

    const medications: Medication[] = [];

    for (let i = 1; i < parsedText.length; i++) {
      const row = parsedText[i];
      if (!row || row.length < 2 || !row[nameIdx]?.trim()) {
        continue;
      }

      const rawNombre = row[nameIdx].trim();
      
      // Parse values with robust fallbacks
      const rawDose = doseIdx !== -1 ? row[doseIdx] : '0';
      const rawFreq = freqIdx !== -1 ? row[freqIdx] : '1';
      const rawConcMl = concMlIdx !== -1 ? row[concMlIdx] : '1';
      const rawConcMg = concMgIdx !== -1 ? row[concMgIdx] : '1';

      const doseMgKgDia = parseFloat(rawDose.replace(',', '.')) || 0;
      const frecuencia = parseFloat(rawFreq.replace(',', '.')) || 1;
      const concentracionMl = parseFloat(rawConcMl.replace(',', '.')) || 1;
      const concentracionMg = parseFloat(rawConcMg.replace(',', '.')) || 1;
      
      const dosisMaximas = maxIdx !== -1 ? row[maxIdx]?.trim() || '' : '';
      const via = viaIdx !== -1 ? row[viaIdx]?.trim() || 'ORAL' : 'ORAL';
      const categoria = catIdx !== -1 ? row[catIdx]?.trim() || '' : '';

      const autoCategoria = getAutoCategory(rawNombre, categoria);

      medications.push({
        nombre: rawNombre,
        doseMgKgDia,
        frecuencia,
        concentracionMl,
        concentracionMg,
        dosisMaximas,
        via,
        categoria,
        autoCategoria
      });
    }

    return medications;
  },

  // Perform full synchronization from the remote published sheet
  async syncWithRemote(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

      // Add a timestamp to prevent browser cache
      const response = await fetch(`${GOOGLE_SHEETS_CSV_URL}&_ts=${Date.now()}`, {
        signal: controller.signal
      });
      clearTimeout(id);

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const csvText = await response.text();
      const medications = this.processCSVData(csvText);

      // Keep user-created custom medications if they exist
      const existingMeds = this.getMedications();
      const customMeds = existingMeds.filter(m => m.isCustom);

      const mergedMeds = [...customMeds, ...medications];

      // Save merged array
      this.saveMedications(mergedMeds);
      localStorage.setItem('pediadosis_last_sync', new Date().toISOString());

      return { success: true, count: mergedMeds.length };
    } catch (e: any) {
      console.error('Remote sync failed, utilizing fallback cache', e);
      return { success: false, count: 0, error: e.message || String(e) };
    }
  }
};
