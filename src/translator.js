// translator.js
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { SingleBar, Presets } from 'cli-progress';
import Table from 'cli-table3';
import fetch from 'node-fetch';
import { message } from './utils/messages.js';
import config from '../translation.config.js';

// Resolve __dirname in ES module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createLanguagesJson() {
  const languagesFilePath = path.resolve(__dirname, '../languages.json');
  const backupFilePath = path.resolve(__dirname, '../languages_backup.json');

  const defaultLanguages = [
    { "Language Code": "hi", "Language": "Hindi" },
    { "Language Code": "en", "Language": "English" },
    { "Language Code": "es", "Language": "Spanish" }
  ];

  try {
    // Check if languages.json exists
    if (fsSync.existsSync(languagesFilePath)) {
      const data = await fs.readFile(languagesFilePath, 'utf8');
      JSON.parse(data); // Attempt to parse to check validity
      message.debug('languages.json is valid.');
    } else {
      message.debug('languages.json does not exist. Creating with default values.');
      await fs.writeFile(languagesFilePath, JSON.stringify(defaultLanguages, null, 2));
      message.debug('languages.json has been created with default values.');
      return;
    }
  } catch (err) {
    message.error('Invalid languages.json. Creating a backup and recreating with default values:', err);
    try {
      // Only attempt to backup if the file exists
      if (fsSync.existsSync(languagesFilePath)) {
        await fs.copyFile(languagesFilePath, backupFilePath);
        message.debug('Backup created at', backupFilePath);
      }
    } catch (backupErr) {
      message.error('Failed to create a backup of languages.json:', backupErr);
    }

    await fs.writeFile(languagesFilePath, JSON.stringify(defaultLanguages, null, 2));
    message.debug('languages.json has been recreated with default values.');
  }
}

// Load language codes from languages.json (wrapped in an async function)
const languagesFilePath = path.resolve(__dirname, '../languages.json');

async function getLanguages() {
  try {
    const data = await fs.readFile(languagesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    message.error("Failed to read languages.json:", err);
    return []; // Return an empty array or handle the error as needed
  }
}

const languages = await getLanguages(); // Await the promise

// Initialize ASCII table
const table = new Table({
  head: ['Source File', 'Processed', 'Total'],
  colWidths: [40, 10, 10]
});

const progress = {};

/**
 * Get language code from language name
 * @param {string} languageName - The name of the language
 * @returns {string|null} The language code or null if not found
 */
function getLanguageCode(languageName) {
  const language = languages.find(lang => lang.Language.toLowerCase() === languageName.toLowerCase());
  return language ? language['Language Code'] : null;
}

/**
 * Translate a single line in a properties file
 * @param {string} line - The line to translate
 * @param {string} targetLanguage - The target language code
 * @returns {Promise<string>} The translated line
 */
async function translateLine(line, targetLanguage) {
  try {
    const response = await fetch(
      `https://translate.google.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(line)}`
    );
    const data = await response.json();
    logDebug('Translation response:', data); // Log the response for debugging
    return data[0][0][0];
  } catch (error) {
    message.error('Translation error:', error);
    return line; // Return the original line if translation fails
  }
}

/**
 * Introduce a delay
 * @param {number} ms - The delay in milliseconds
 * @returns {Promise<void>} A promise that resolves after the delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Introduce a random delay between API calls
 * @returns {Promise<void>} A promise that resolves after a random delay
 */
async function humanLikeDelay() {
  const minDelay = 1000; // 1 second
  const maxDelay = 3000; // 3 seconds
  const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  await delay(randomDelay);
}

/**
 * Log debug messages
 * @param {string} message - The message to log
 */
function logDebug(message) {
  if (config.debugMode) {
    message.info(message);
  }
}

/**
 * Update the progress table
 */
function updateTable() {
  console.clear();
  console.log(table.toString());
}

/**
 * Process a properties file
 * @param {string} filePath - The path to the properties file
 * @param {string} targetLanguageCode - The target language code
 */
export async function processFile(filePath, targetLanguageCode) {
  const sourceFileName = path.basename(filePath, path.extname(filePath)).replace(`.${config.sourceLocale}`, '');
  if (!progress[sourceFileName]) {
    progress[sourceFileName] = { processed: 0, total: 0, index: table.length };
    table.push([sourceFileName, 0, 0]);
  }

  const fileContent = await fs.readFile(filePath, 'utf8');
  const lines = fileContent.split('\n');
  const totalLines = lines.filter(line => line.trim() && !line.trim().startsWith('#')).length;
  progress[sourceFileName].total += totalLines;

  const targetFilePath = filePath.replace('.US_en', `.US_${targetLanguageCode}`);

  // Use fs.promises.open for creating the write stream
  const fileHandle = await fs.open(targetFilePath, 'w'); 
  
  const progressBar = new SingleBar({}, Presets.shades_classic);
  progressBar.start(totalLines, 0);

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      await fileHandle.write(line + '\n'); // Use fileHandle.write
      continue;
    }

    const [keyPart, ...valueParts] = trimmedLine.split('=');
    if (valueParts.length === 0) {
      await fileHandle.write(line + '\n'); // Use fileHandle.write
      continue;
    }

    if (config.testingModeEnabled && progress[sourceFileName].processed >= 1) {
      await fileHandle.write(line + '\n'); // Use fileHandle.write
      continue;
    }

    const valuePart = valueParts.join('=').trim();
    const translatedValue = await translateLine(valuePart, targetLanguageCode);
    await fileHandle.write(`${keyPart.trim()}=${translatedValue.trim()}\n`); // Use fileHandle.write

    progress[sourceFileName].processed++;
    progressBar.increment();

    table[progress[sourceFileName].index][1] = progress[sourceFileName].processed;
    updateTable();

    if (!config.testingModeEnabled) {
      await humanLikeDelay();
    }
  }

  progressBar.stop();
  await fileHandle.close(); // Close the file handle
  message.info(`Translation completed. Translated file saved as ${targetFilePath}`);
}

export { languages };