#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { Command } from 'commander';
import { processFile, languages, createLanguagesJson } from './src/translator.js';
import { message, setDebug, setConfirm } from './src/utils/messages.js';
import config from './translation.config.js';
import { processFile as createKeys } from './src/i18n-ize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messageKeysDir = './src/powerschool/MessageKeys';
const fallbackFilePath = path.join(__dirname, 'src/config/US_en_example');
const sourceLocale = 'US_en';

const program = new Command();

async function translate(options) {
  message.log('Starting translation process...');

  try {
    let currentDir = messageKeysDir;
    let files = await fs.readdir(currentDir);

    // If no .properties files exist, copy from the example directory
    if (files.length === 0 || files.every(file => !file.includes(`.${sourceLocale}.properties`))) {
      message.log('No matching files found in MessageKeys, copying from example.');
      const exampleFiles = await fs.readdir(fallbackFilePath);
      const exampleFile = exampleFiles.find(file => file.includes(`.${sourceLocale}.properties`));
      if (exampleFile) {
        await fs.copyFile(path.join(fallbackFilePath, exampleFile), path.join(currentDir, exampleFile));
        files = [exampleFile];
      }
    }

    const filesToProcess = files.filter(file => file.includes(`.${sourceLocale}.properties`));

    if (filesToProcess.length === 0) {
      message.log('No files to process.');
      return;
    }

    for (const file of filesToProcess) {
      const filePath = path.join(currentDir, file);
      message.log(`Processing file: ${filePath}`);

      if (options.locale) {
        // Translate to specific locale only
        message.log(`Translating to ${options.locale}`);
        await processFile(filePath, options.locale, config.testingModeEnabled);
      } else {
        // Translate to all languages
        for (const language of languages) {
          const targetLanguage = language['Language Code'];
          message.log(`Translating to ${targetLanguage}`);
          await processFile(filePath, targetLanguage, config.testingModeEnabled);
        }
      }
    }
  } catch (err) {
    message.error('Unable to process files:', err);
  }
}

(async () => {
  await createLanguagesJson();

  program
    .name('ps-i18n')
    .description('CLI for translation and internationalization')
    .version('24.11.13')
    .option('-d, --debug', 'Enable debug output', false)
    .option('-Y, --yes', 'Bypass the "yes" prompt for confirmation', false);


  program
    .command('create-keys <sourceFile> <locale>')
    .description('Create message keys from a source HTML file')
    .action(async (sourceFile, locale) => {
      setDebug(program.opts().debug);
      await createKeys(sourceFile, locale);
    });

  program
    .command('translate')
    .description('Run the translation process')
    .option('--locale <code>', 'Target language code (e.g., es, zh)')
    .action(async (options) => {
      setDebug(program.opts().debug);
      setConfirm(program.opts().yes);
      await translate(options);
    });

  program
    .command('*', { noHelp: true })
    .action(() => {
      message.error('Unknown command. Use --help to see the list of available commands.');
      program.outputHelp();
    });

  await program.parseAsync();

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
})();