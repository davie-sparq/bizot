declare module '@genkit-ai/flow' {
  export function configure(arg: any): void;
  export function defineFlow(config: any, handler: any): any;
  export function generate(opts: any): Promise<any>;
}

declare module '@genkit-ai/googleai' {
  export default function googleAI(...args: any[]): any;
}

declare module 'genkit' {
  export function defineTool(config: any, handler: any): any;
}

export {};
