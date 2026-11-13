import { launchDesktop, serverUrl } from "./launch.mjs";

console.log(
  `Opening Code Atlas desktop: ${serverUrl} (server must already be running)`,
);
launchDesktop();
