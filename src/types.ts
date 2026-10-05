export interface PredictInputs {
  crop_type: number;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  soil_temperature: number;
}

export interface PredictResponse {
  prediction: 0 | 1;
  prediction_label?: string;
  status: string;
  duration: string;
  reason: string;
  inputs: PredictInputs;
}

export type ScheduleStatus = "Recommended" | "Completed" | "Skipped" | "No irrigation";

export interface HistoryRecord {
  id: string;
  timestamp: string; // ISO date-time
  crop: string;
  cropType: number;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  soilTemperature: number;
  prediction: 0 | 1;
  status: string;
  duration: string;
  durationMinutes: number;
  reason: string;
  scheduleStatus: ScheduleStatus;
}

// Farm profile: NOT used by the ML model (profile information only)
export interface FarmProfile {
  name: string;
  location: string;
  size: string;
  crop: string;
  soilType: string;
}

export const DEFAULT_FARM: FarmProfile = { name: "Farmer", location: "", size: "2", crop: "Tomato", soilType: "Loamy" };

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function levelOf(value: number, low: number, high: number, mid = "Moderate"): string {
  return value < low ? "Low" : value > high ? "High" : mid;
}
