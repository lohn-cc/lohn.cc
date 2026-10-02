// Load the ALTCHA widget (CSP-safe "external" build) and register its PBKDF2 worker.
import '/assets/altcha/altcha.min.js';
globalThis.$altcha.algorithms.set('PBKDF2/SHA-256', () => new Worker('/assets/altcha/pbkdf2.js'));
