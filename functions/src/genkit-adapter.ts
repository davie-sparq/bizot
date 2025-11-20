// Lightweight adapter that tries to load real Genkit packages and falls back to
// local implementations when they are not installed. This lets local dev and
// emulators run without depending on unpublished packages.

let realFlow: any = null;
let realGoogleAI: any = null;
let realGenkit: any = null;

try {
  realFlow = require('@genkit-ai/flow');
} catch (e) {
  // not installed
}
try {
  realGoogleAI = require('@genkit-ai/googleai');
} catch (e) {
}
try {
  realGenkit = require('genkit');
} catch (e) {
}

export function configure(opt: any) {
  if (realFlow && typeof realFlow.configure === 'function') return realFlow.configure(opt);
  // no-op fallback
  console.debug('[genkit-adapter] configure (fallback)');
}

export function defineFlow(config: any, handler: any) {
  if (realFlow && typeof realFlow.defineFlow === 'function') return realFlow.defineFlow(config, handler);
  // fallback: return a function that invokes handler directly
  const f = async (input: any) => {
    return handler(input);
  };
  return f;
}

export async function generate(opts: any) {
  if (realFlow && typeof realFlow.generate === 'function') return realFlow.generate(opts);
  // fallback: return an object with a text() method that echoes prompt
  return {
    text: () => `FALLBACK-GENERATE: ${String(opts?.prompt ?? opts)}`,
  };
}

export function googleAI(...args: any[]) {
  if (realGoogleAI) return realGoogleAI(...args);
  return { name: 'fallback-googleAI' };
}

export function defineTool(config: any, handler: any) {
  if (realGenkit && typeof realGenkit.defineTool === 'function') return realGenkit.defineTool(config, handler);
  return {
    name: config.name,
    description: config.description,
    run: handler,
    inputSchema: config.inputSchema,
    outputSchema: config.outputSchema,
  };
}

export default {
  configure,
  defineFlow,
  generate,
  googleAI,
  defineTool,
};
