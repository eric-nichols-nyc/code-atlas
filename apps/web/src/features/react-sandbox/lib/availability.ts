// Browser previews do not provide the production judge's resource containment.
export function isReactPilotAvailable() {
  return process.env.NODE_ENV === "development";
}
