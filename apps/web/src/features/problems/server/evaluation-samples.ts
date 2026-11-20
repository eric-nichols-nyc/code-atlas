import "server-only";

// Explicit opt-in keeps layout samples available in a local production preview.
export function evaluationSamplesEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.CODE_ATLAS_EVALUATION_SAMPLES === "true"
  );
}
