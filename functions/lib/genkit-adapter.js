"use strict";
// Lightweight adapter that tries to load real Genkit packages and falls back to
// local implementations when they are not installed. This lets local dev and
// emulators run without depending on unpublished packages.
Object.defineProperty(exports, "__esModule", { value: true });
exports.configure = configure;
exports.defineFlow = defineFlow;
exports.generate = generate;
exports.googleAI = googleAI;
exports.defineTool = defineTool;
let realFlow = null;
let realGoogleAI = null;
let realGenkit = null;
try {
    realFlow = require('@genkit-ai/flow');
}
catch (e) {
    // not installed
}
try {
    realGoogleAI = require('@genkit-ai/googleai');
}
catch (e) {
}
try {
    realGenkit = require('genkit');
}
catch (e) {
}
function configure(opt) {
    if (realFlow && typeof realFlow.configure === 'function')
        return realFlow.configure(opt);
    // no-op fallback
    console.debug('[genkit-adapter] configure (fallback)');
}
function defineFlow(config, handler) {
    if (realFlow && typeof realFlow.defineFlow === 'function')
        return realFlow.defineFlow(config, handler);
    // fallback: return a function that invokes handler directly
    const f = async (input) => {
        return handler(input);
    };
    return f;
}
async function generate(opts) {
    if (realFlow && typeof realFlow.generate === 'function')
        return realFlow.generate(opts);
    // fallback: return an object with a text() method that echoes prompt
    return {
        text: () => `FALLBACK-GENERATE: ${String(opts?.prompt ?? opts)}`,
    };
}
function googleAI(...args) {
    if (realGoogleAI)
        return realGoogleAI(...args);
    return { name: 'fallback-googleAI' };
}
function defineTool(config, handler) {
    if (realGenkit && typeof realGenkit.defineTool === 'function')
        return realGenkit.defineTool(config, handler);
    return {
        name: config.name,
        description: config.description,
        run: handler,
        inputSchema: config.inputSchema,
        outputSchema: config.outputSchema,
    };
}
exports.default = {
    configure,
    defineFlow,
    generate,
    googleAI,
    defineTool,
};
