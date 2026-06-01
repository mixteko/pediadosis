/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Medication {
  nombre: string;
  doseMgKgDia: number; // DOSIS_MG_KG_DIA from spreadsheet
  frecuencia: number;  // FRECUENCIA from spreadsheet (times per day, e.g., 3 means 3x a day)
  concentracionMl: number; // CONCENTRACION_ML from spreadsheet
  concentracionMg: number; // CONCENTRACION_MG from spreadsheet
  dosisMaximas: string; // DOSIS MAXIMAS from spreadsheet
  via: string; // VIA from spreadsheet (e.g. ORAL, IV)
  categoria: string; // CATEGORIA from spreadsheet 
  autoCategoria: string; // Dynamic parsed category based on name keywords
  isCustom?: boolean;
}

export interface CalculationResult {
  weight: number;
  selectedMgKgDia: number;
  mgPerDay: number;
  mgPerDose: number;
  mlPerDose: number;
  dropsPerDose: number;
  frecuenciaHoras: number;
}

export interface CalculationHistory {
  id: string;
  timestamp: string;
  patientWeight: number;
  medicationName: string;
  selectedMgKgDia: number;
  frecuencia: number;
  mgPerDose: number;
  mlPerDose: number;
  dropsPerDose: number;
  frecuenciaHoras: number;
}

export interface AppSettings {
  dropsPerMl: number; // drops per ml (default 20, standard clinic conversion)
  primaryColor: string;
  useDefaultDoseOnly: boolean;
}
