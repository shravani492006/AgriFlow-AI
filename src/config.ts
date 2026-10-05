// Crop name -> number the ML model expects.
// The SINGLE source of truth is backend/crop_mapping.json - the FastAPI backend
// reads the same file, so frontend and backend can never disagree.
// To change a crop number, edit that JSON file only.
import cropMapping from "../backend/crop_mapping.json";

export const CROP_MAPPING: Record<string, number> = cropMapping;
export const CROPS = Object.keys(CROP_MAPPING);

// Backend address (change here, or set VITE_API_URL in a .env file)
export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const SOIL_TYPES = ["Loamy", "Sandy", "Clay", "Black Soil"];
