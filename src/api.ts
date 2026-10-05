import { API_URL } from "./config";
import type { PredictInputs, PredictResponse } from "./types";

export class ApiError extends Error {}

const NO_CONNECTION = "Unable to connect to AI service. Please make sure the FastAPI backend is running.";

export async function predictIrrigation(inputs: PredictInputs): Promise<PredictResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let res: Response;
  try {
    res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("The AI service took too long to respond. Please try again.");
    }
    throw new ApiError(NO_CONNECTION);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      /* ignore non-JSON error bodies */
    }
    if (res.status === 422) throw new ApiError(detail || "Some of the values are invalid. Please check them and try again.");
    throw new ApiError(detail || "The AI service could not produce a prediction. Please try again.");
  }

  let data: PredictResponse;
  try {
    data = await res.json();
  } catch {
    throw new ApiError("The AI service sent an unreadable response. Please try again.");
  }
  if ((data.prediction !== 0 && data.prediction !== 1) || typeof data.status !== "string" || typeof data.reason !== "string" || !data.inputs) {
    throw new ApiError("The AI service sent an unexpected response. Please try again.");
  }
  return data;
}
