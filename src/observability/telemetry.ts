import { OpenTelemetry } from "@ai-sdk/otel";
import { getTracer, Laminar } from "@lmnr-ai/lmnr";
import { registerTelemetry } from "ai";

export const initializeTelemetry = () => {
  Laminar.initialize({
    projectApiKey: process.env.LMNR_PROJECT_API_KEY,
  });

  registerTelemetry(new OpenTelemetry({ tracer: getTracer() }));
};
