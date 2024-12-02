#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { Command } from 'commander';
import { processFile, languages, createLanguagesJson, translateAllFilesToAllLanguages } from './src/translator.js';
import { message, setDebug, setConfirm } from './src/utils/messages.js';
import config from './translation.config.js';
import { processFile as createKeys } from './src/i18n-ize.js';
import progressBarManager from './src/utils/progress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messageKeysDir = './src/powerschool/MessageKeys';
const fallbackFilePath = path.join(__dirname, 'src/config/US_en_example');
const sourceLocale = 'US_en';

const packageJsonPath = path.resolve(__dirname, 'package.json');
const packageJson = JSON.parse(fsSync.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

const program = new Command();

// Check if running in test environment
const isTestMode = process.env.NODE_ENV === 'test' || process.argv.includes('--test-mode');

// Disable progress bar in test mode
if (isTestMode) {
  progressBarManager.setEnabled(false);
}

async function translate(options) {
  message.log('Starting translation process...');

  try {
    const languagesFilePath = path.resolve(process.cwd(), 'languages.json');
    message.info(`Checking for languages.json at: ${languagesFilePath}`);
    const defaultLanguages = [
      { "Language Code": "en", "Language": "English" },
      { "Language Code": "es", "Language": "Spanish" },
      { "Language Code": "hi", "Language": "Hindi" }
    ];

    // Check if languages.json exists
    if (!fsSync.existsSync(languagesFilePath)) {
      message.warn('languages.json not found. Creating with default values.');
      await fs.writeFile(languagesFilePath, JSON.stringify(defaultLanguages, null, 2));
      message.info('languages.json has been created with default values.');
    } else {
      message.info('languages.json already exists.');
    }

    let currentDir = messageKeysDir;
    let files = await fs.readdir(currentDir);

    // If no .properties files exist, copy from the example directory
    if (files.length === 0 || files.every(file => !file.includes(`.${sourceLocale}.properties`))) {
      message.warn('No matching files found in MessageKeys, copying from example.');
      const exampleFiles = await fs.readdir(fallbackFilePath);
      const exampleFile = exampleFiles.find(file => file.includes(`.${sourceLocale}.properties`));
      if (exampleFile) {
        await fs.copyFile(path.join(fallbackFilePath, exampleFile), path.join(currentDir, exampleFile));
        files = [exampleFile];
      }
    }

    const filesToProcess = files.filter(file => file.includes(`.${sourceLocale}.properties`));

    if (filesToProcess.length === 0) {
      message.warn('No files to process.');
      return;
    }

    for (const file of filesToProcess) {
      const filePath = path.join(currentDir, file);
      message.info(`Processing file: ${filePath}`);

      if (options.locale) {
        // Translate to specific locale only
        message.info(`Translating to ${options.locale}`);
        await processFile(filePath, options.locale, config.testingModeEnabled);
      } else {
        // Translate to all languages
        for (const language of languages) {
          const targetLanguage = language['Language Code'];
          message.info(`Translating to ${targetLanguage}`);
          await processFile(filePath, targetLanguage, config.testingModeEnabled);
        }
      }
    }
    message.info('Translation process completed successfully.');
  } catch (err) {
    message.error('Unable to process files:', err);
  }
}

(async () => {
  await createLanguagesJson();

  program
    .name('ps-i18n')
    .description('CLI for translation and internationalization')
    .version(version)
    .option('-d, --debug', 'Enable debug output', false)
    .option('-Y, --yes', 'Bypass the "yes" prompt for confirmation', false)
    .option('--test-mode', 'Run in test mode (disables progress bar)');

  program
    .command('create-keys <sourceFile> <locale>')
    .description('Create message keys from a source HTML file')
    .action(async (sourceFile, locale) => {
      setDebug(program.opts().debug);
      const skipPrompt = program.opts().yes;
      await createKeys(sourceFile, locale, skipPrompt);
    });

  program
    .command('translate <locale>')
    .description('Translate all message keys to the specified locale')
    .option('-d, --debug', 'Enable debug output', false)
    .option('-Y, --yes', 'Bypass the "yes" prompt for confirmation', false)
    .option('--test-mode', 'Run in test mode (disables progress bar)')
    .action(async (locale) => {
      setDebug(program.opts().debug);
      setConfirm(program.opts().yes);

      if (program.opts().testMode) {
        progressBarManager.setEnabled(false);
      }

      const messageKeysDir = path.resolve(process.cwd(), 'src/powerschool/MessageKeys');
      await translateAllFilesToAllLanguages(messageKeysDir, sourceLocale);
    });

  program
    .command('*', { noHelp: true })
    .action(() => {
      message.error('Unknown command. Use --help to see the list of available commands.');
      program.outputHelp();
      console.log('Usage!:');
      console.log('  create-keys <sourceFile> <locale>');
      console.log('  translate <locale>');
    });

  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
})();