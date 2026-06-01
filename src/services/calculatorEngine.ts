/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Medication, CalculationResult } from '../types';

export function calculateDosage(
  weight: number,
  medication: Medication,
  customMgKgDia?: number,
  customFrecuencia?: number,
  customConcMl?: number,
  customConcMg?: number,
  dropsPerMl: number = 20
): CalculationResult {
  // Use active config values (fallback to medication values if custom inputs are empty or invalid)
  const activeMgKgDia = customMgKgDia !== undefined && !isNaN(customMgKgDia) ? customMgKgDia : medication.doseMgKgDia;
  const activeFrecuencia = customFrecuencia !== undefined && !isNaN(customFrecuencia) && customFrecuencia > 0 ? customFrecuencia : medication.frecuencia;
  const activeConcMl = customConcMl !== undefined && !isNaN(customConcMl) && customConcMl > 0 ? customConcMl : medication.concentracionMl;
  const activeConcMg = customConcMg !== undefined && !isNaN(customConcMg) && customConcMg > 0 ? customConcMg : medication.concentracionMg;

  // 1. Calculate total daily mg dosage
  const mgPerDay = weight * activeMgKgDia;

  // 2. Calculate mg dosage per single dose based on frequency times per day
  const mgPerDose = mgPerDay / activeFrecuencia;

  // 3. Calculare liquid volume (ml) to administer per dose
  const mlPerDose = (mgPerDose * activeConcMl) / activeConcMg;

  // 4. Calculate medicine drops per single dose (1 ml = 20 drops by default)
  const dropsPerDose = mlPerDose * dropsPerMl;

  // 5. Calculate hourly interval (e.g. 3 times daily = every 8 hours)
  const frecuenciaHoras = activeFrecuencia > 0 ? 24 / activeFrecuencia : 24;

  return {
    weight,
    selectedMgKgDia: activeMgKgDia,
    mgPerDay: parseFloat(mgPerDay.toFixed(2)),
    mgPerDose: parseFloat(mgPerDose.toFixed(2)),
    mlPerDose: parseFloat(mlPerDose.toFixed(2)),
    dropsPerDose: Math.round(dropsPerDose),
    frecuenciaHoras: parseFloat(frecuenciaHoras.toFixed(1))
  };
}

export function formatIntervalLabel(frecuencia: number): string {
  if (frecuencia <= 0) return 'Dosis única';
  if (frecuencia === 1) return 'Cada 24h';
  if (frecuencia === 2) return 'Cada 12h (2 veces al día)';
  if (frecuencia === 3) return 'Cada 8h (3 veces al día)';
  if (frecuencia === 4) return 'Cada 6h (4 veces al día)';
  
  const hrs = 24 / frecuencia;
  if (Number.isInteger(hrs)) {
    return `Cada ${hrs}h (${frecuencia} veces al día)`;
  }
  return `Cada ${hrs.toFixed(1)}h (${frecuencia} veces al día)`;
}
