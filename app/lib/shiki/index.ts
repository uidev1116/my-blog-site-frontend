import type { Highlighter, BundledTheme, BundledLanguage } from 'shiki';
import { getHighlighter } from 'shiki';
import { ModelOperations } from '@vscode/vscode-languagedetection';

type ShikiLanguage =
  | Extract<
      BundledLanguage,
      | 'ts'
      | 'js'
      | 'json'
      | 'markdown'
      | 'sh'
      | 'yaml'
      | 'css'
      | 'html'
      | 'xml'
      | 'csv'
      | 'jsx'
      | 'tsx'
      | 'md'
      | 'php'
      | 'sass'
      | 'scss'
      | 'vue'
      | 'sql'
      | 'postcss'
    >
  | 'text';
type ShikiTheme = Extract<BundledTheme, 'houston'>;

const langs: ShikiLanguage[] = [
  'ts',
  'js',
  'json',
  'markdown',
  'sh',
  'yaml',
  'css',
  'html',
  'xml',
  'csv',
  'jsx',
  'md',
  'php',
  'sass',
  'scss',
  'vue',
  'sql',
  'postcss',
] as const;
const themes: ShikiTheme[] = ['houston'] as const;

let highlighter: Highlighter | undefined;
export async function highlight(
  code: string,
  theme: ShikiTheme,
  lang?: ShikiLanguage,
) {
  if (!highlighter) {
    highlighter = await getHighlighter({
      langs,
      themes,
    });
  }

  let detectedLang: string | undefined;
  if (!lang) {
    const detectedLangs = await detectLanguages(code);
    detectedLang = detectedLangs.find((detectedLang) =>
      langs.includes(detectedLang as ShikiLanguage),
    ) as ShikiLanguage;
  }

  const html = highlighter.codeToHtml(code, {
    lang: lang || detectedLang || 'text',
    theme,
  });

  return html;
}

let modelOperations: ModelOperations;
async function detectLanguages(code: string): Promise<string[]> {
  if (!modelOperations) {
    modelOperations = new ModelOperations({
      async modelJsonLoaderFunc() {
        const fs = await import('fs');
        return new Promise<any>((resolve, reject) => {
          fs.readFile(
            'node_modules/@vscode/vscode-languagedetection/model/model.json',
            (err, data) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(JSON.parse(data.toString()));
            },
          );
        });
      },
      async weightsLoaderFunc() {
        const fs = await import('fs');
        return new Promise<ArrayBuffer>((resolve, reject) => {
          fs.readFile(
            'node_modules/@vscode/vscode-languagedetection/model/group1-shard1of1.bin',
            (err, data) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(data.buffer);
            },
          );
        });
      },
    });
  }

  const results = await modelOperations.runModel(code);
  return results.map((result) => result.languageId);
}
