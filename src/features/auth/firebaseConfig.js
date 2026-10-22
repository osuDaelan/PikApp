const WEB_CONFIG_FIELDS = {
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  appId: "VITE_FIREBASE_APP_ID",
};

// Firebase web identifiers are public config, not service-account credentials.
// Incomplete configuration leaves guest mode usable and never starts Firebase.
export function readFirebaseConfig(env = {}) {
  const config = Object.fromEntries(Object.entries(WEB_CONFIG_FIELDS).map(([field, name]) =>
    [field, typeof env[name] === "string" ? env[name].trim() : ""]));
  if (Object.values(config).some(value => !value)) return null;
  if (!/^(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,}$/i.test(config.authDomain)) return null;
  return Object.freeze(config);
}
