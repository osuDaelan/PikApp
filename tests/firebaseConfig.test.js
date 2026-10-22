import test from "node:test";
import assert from "node:assert/strict";
import { readFirebaseConfig } from "../src/features/auth/firebaseConfig.js";

const webConfig = {
  VITE_FIREBASE_API_KEY: "example-public-web-key",
  VITE_FIREBASE_AUTH_DOMAIN: "example-project.firebaseapp.com",
  VITE_FIREBASE_PROJECT_ID: "example-project",
  VITE_FIREBASE_APP_ID: "1:123456789:web:example",
};

test("missing or partial Firebase configuration keeps sign-in unavailable", () => {
  assert.equal(readFirebaseConfig(), null);
  for (const field of Object.keys(webConfig)) {
    assert.equal(readFirebaseConfig({ ...webConfig, [field]: " " }), null);
    assert.equal(readFirebaseConfig({ ...webConfig, [field]: undefined }), null);
  }
});

test("Firebase config exposes only the public web fields and requires a hostname", () => {
  assert.deepEqual(readFirebaseConfig({ ...webConfig, VITE_FIREBASE_PROJECT_ID: " example-project ",
    PRIVATE_KEY: "not-a-web-config-field", VITE_UNRELATED_VALUE: "not-a-web-config-field" }), {
    apiKey: webConfig.VITE_FIREBASE_API_KEY, authDomain: webConfig.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: webConfig.VITE_FIREBASE_PROJECT_ID, appId: webConfig.VITE_FIREBASE_APP_ID,
  });
  for (const authDomain of ["https://example-project.firebaseapp.com", "example-project.firebaseapp.com/path", "person@example-project.firebaseapp.com"]) {
    assert.equal(readFirebaseConfig({ ...webConfig, VITE_FIREBASE_AUTH_DOMAIN: authDomain }), null);
  }
});
