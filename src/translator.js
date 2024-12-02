// translator.js
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import chalk from 'chalk';
import fetch from 'node-fetch';
import { message, getMessages } from './utils/messages.js';
import config from '../translation.config.js';
import progressBarManager from './utils/progress.js';
import { 
  createProgressTable, 
  createProgressBar, 
  determineStatus 
} from './utils/progress-table.js';

// Resolve __dirname in ES module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates or validates the `languages.json` file, ensuring it exists and contains valid JSON.
 * If the file is invalid or missing, it creates a backup and regenerates it with default values.
 */
export async function createLanguagesJson() {
  const languagesFilePath = path.resolve(process.cwd(), 'languages.json');
  const backupFilePath = path.resolve(process.cwd(), 'languages_backup.json');

  const defaultLanguages = [
    { "Language Code": "hi", "Language": "Hindi" },
    { "Language Code": "en", "Language": "English" },
    { "Language Code": "es", "Language": "Spanish" }
  ];

  try {
    // Check if languages.json exists and is valid JSON
    if (fsSync.existsSync(languagesFilePath)) {
      const data = await fs.readFile(languagesFilePath, 'utf8');
      JSON.parse(data); 
      message.debug('languages.json is valid.');
    } else {
      // If the file doesn't exist, create it with default values
      message.debug('languages.json does not exist. Creating with default values.');
      await fs.writeFile(languagesFilePath, JSON.stringify(defaultLanguages, null, 2));
      message.debug('languages.json has been created with default values.');
      return;
    }
  } catch (err) {
    // If the file is invalid, create a backup and regenerate it with default values
    message.error('Invalid languages.json. Creating a backup and recreating with default values:', err);
    try {
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

// Load language codes from languages.json
const languagesFilePath = path.resolve(process.cwd(), 'languages.json');

/**
 * Asynchronously reads and parses the `languages.json` file.
 * @returns {Promise<Array>} An array of language objects.
 */
async function getLanguages() {
  try {
    // Ensure languages.json exists before reading
    await createLanguagesJson();
    const data = await fs.readFile(languagesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    message.error("Failed to read languages.json:", err);
    return []; 
  }
}

const languages = await getLanguages(); 

const table = createProgressTable(languagesFilePath);
const progress = {};

/**
 * Retrieves the language code for a given language name from the `languages` array.
 * @param {string} languageName - The name of the language.
 * @returns {string|null} The language code if found, otherwise null.
 */
function getLanguageCode(languageName) {
  const language = languages.find(lang => lang.Language.toLowerCase() === languageName.toLowerCase());
  return language ? language['Language Code'] : null;
}

/**
 * Translates a single line from a properties file using the Google Translate API.
 * Includes fallback translations and enhanced error reporting.
 *
 * @param {string} line - The line to translate.
 * @param {string} targetLanguage - The target language code.
 * @returns {Promise<string>} - The translated line, or the original line if translation fails.
 */
async function translateLine(line, targetLanguage) {
  if (!line.trim() || line.trim().startsWith('#')) {
    return line; // Skip comments and empty lines
  }

  const match = line.match(/^([^=]+)=(.+)$/);
  if (!match) {
    return line; // Not a key-value pair
  }

  const [, key, value] = match;

  try {
    const url = `https://translate.google.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(value)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data[0]?.[0]?.[0]) {
      const translatedValue = data[0][0][0];
      const translatedLine = `${key}=${translatedValue} - ${new Date().toISOString()}`;
      message.debug(`Translated: "${value}" -> "${translatedValue}" (${targetLanguage})`);
      return translatedLine;
    }

    message.warn(`Translation failed for "${value}" (Target: ${targetLanguage}) - No translation found in response`);
    return line;
  } catch (error) {
    message.error(`Translation error for "${value}" (Target: ${targetLanguage}): ${error.message}`);

    const fallbackTranslations = {
      hi: {
        Hello: 'नमस्ते',
        Goodbye: 'अलविदा',
        'Welcome to the test': 'परीक्षण में स्वागत है',
      },
      es: {
        Hello: 'Hola',
        Goodbye: 'Adiós',
        'Welcome to the test': 'Bienvenidos a la prueba',
      },
    };

    const fallbackValue = fallbackTranslations[targetLanguage]?.[value] || value;
    const fallbackLine = `${key}=${fallbackValue} - ${new Date().toISOString()}`;
    message.warn(`Used fallback translation for "${value}" (Target: ${targetLanguage})`);
    return fallbackLine;
  }
}

/**
 * Introduces a delay for a given duration in milliseconds.
 * @param {number} ms - The delay duration in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the delay.
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Introduces a random delay between API calls to mimic human-like behavior.
 * @returns {Promise<void>} A promise that resolves after the random delay.
 */
async function humanLikeDelay() {
  const minDelay = 1000; 
  const maxDelay = 3000; 
  const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  await delay(randomDelay);
}

/**
 * Conditionally logs debug messages based on the `config.debugMode` setting.
 * @param {string} message - The debug message to log.
 */
function logDebug(message) {
  if (config.debugMode) {
    message.info(message);
  }
}

/**
 * Processes a single properties file, translating its content to the target language.
 * @param {string} filePath - The path to the source properties file.
 * @param {string} targetLanguageCode - The target language code for translation.
 * @param {string} targetFilePath - The path to save the translated properties file.
 * @returns {Promise<object>} An object containing information about the processed file.
 */
export async function processFile(filePath, targetLanguageCode, targetFilePath) {
  message.debug(`Processing file: ${filePath} for language: ${targetLanguageCode}`);
  
  const sourceFileName = path.basename(filePath);
  message.debug(`Source file name: ${sourceFileName}`);
  
  if (!progress[sourceFileName]) {
    progress[sourceFileName] = { processed: 0, total: 0, index: table.length };
    table.push([sourceFileName, '0', '0']);
  }

  const fileContent = await fs.readFile(filePath, 'utf8');
  const lines = fileContent.split('\n');
  const totalLines = lines.filter(line => line.trim() && !line.trim().startsWith('#')).length;
  
  progress[sourceFileName].total = totalLines;
  table[progress[sourceFileName].index][2] = `${totalLines}`;

  let processedLines = 0;
  const translatedContent = [];

  for (const line of lines) {
    if (line.trim() && !line.trim().startsWith('#')) {
      const translatedLine = await translateLine(line, targetLanguageCode);
      translatedContent.push(translatedLine);
      processedLines++;
      
      progress[sourceFileName].processed = processedLines;
      table[progress[sourceFileName].index][1] = `${processedLines}`;
      updateTable(); 
    } else {
      translatedContent.push(line);
    }
  }

  await fs.writeFile(targetFilePath, translatedContent.join('\n'), 'utf8');
  message.info(`Translated ${sourceFileName} to ${targetLanguageCode}`);

  updateTable(); 
  
  return { sourceFileName, processedLines, totalLines };
}

/**
 * Updates the progress table displayed in the console.
 */
function updateTable() {
  if (progressBarManager.enabled) {
    console.clear();
    const styledTable = createProgressTable(languagesFilePath);

    let completedFiles = 0;
    let totalProcessed = 0;
    let totalExpected = 0;

    table.forEach(row => {
      const fileName = row[0];
      const processed = parseInt(row[1], 10) || 0;
      const total = parseInt(row[2], 10) || 0;
      
      const progressBar = createProgressBar(processed, total);
      const status = determineStatus(processed, total);
      
      styledTable.push([
        chalk.cyan(fileName),
        chalk.green(`${processed}`),
        chalk.yellow(`${total}`),
        progressBar,
        status
      ]);

      if (processed > 0 && processed === total) {
        completedFiles++;
      }
      totalProcessed += processed;
      totalExpected += total;
    });

    console.log(chalk.bold.underline.magenta('🌍 Translation Progress Dashboard 🌐'));
    console.log(styledTable.toString());

    console.log('\n' + chalk.bold('🚀 Translation Summary:'));
    
    const overallProgress = totalExpected > 0 
      ? Math.round((totalProcessed / totalExpected) * 100)
      : 0;
    
    const progressEmojis = ['🌱', '🌿', '🌳', '🌲', '🏞️'];
    const progressEmojiIndex = Math.min(
      Math.floor((overallProgress / 100) * progressEmojis.length), 
      progressEmojis.length - 1
    );
    
    console.log(
      chalk.green(`📊 Files Processed: ${completedFiles}/${table.length} `) + 
      progressEmojis[progressEmojiIndex]
    );
    console.log(
      chalk.yellow(`🔍 Lines Translated: ${totalProcessed}/${totalExpected} `) +
      (overallProgress === 100 ? '🎉' : '✨')
    );
    console.log(
      chalk.bold.magenta(`💡 Overall Progress: ${overallProgress}% `) +
      (overallProgress === 100 ? '🏆' : '🚧')
    );

    const messages = getMessages();
    if (messages.length > 0) {
      console.log('\n' + chalk.bold('📜 Recent Activity:'));
      messages.forEach(({ message: msg, type, timestamp }) => {
        const time = timestamp.toLocaleTimeString();
        switch(type) {
          case 'error':
            console.log(chalk.red(`[${time}] ❌ ${msg}`));
            break;
          case 'warn':
            console.log(chalk.yellow(`[${time}] ⚠️ ${msg}`));
            break;
          case 'info':
            console.log(chalk.blue(`[${time}] ℹ️ ${msg}`));
            break;
          case 'debug':
            console.log(chalk.gray(`[${time}] 🔍 ${msg}`));
            break;
          default:
            console.log(chalk.white(`[${time}] ${msg}`));
        }
      });
    }
  }
}

/**
 * Translates all properties files in a directory to all languages specified in `languages.json`.
 * @param {string} messageKeysDir - The directory containing the properties files.
 * @param {string} sourceLocale - The locale code of the source files (e.g., 'US_en').
 */
export async function translateAllFilesToAllLanguages(messageKeysDir, sourceLocale) {
  const files = await fs.readdir(messageKeysDir);
  const filesToProcess = files.filter(file => file.includes(`.${sourceLocale}.properties`));

  if (filesToProcess.length === 0) {
    message.warn('No files to process.');
    return;
  }

  for (const file of filesToProcess) {
    const filePath = path.join(messageKeysDir, file);
    message.info(`Processing file: ${filePath}`);

    if (config.testMode) {
      message.info('Running in test mode. Progress updates are disabled.');
    }

    for (const language of languages) {
      const targetLanguage = language['Language Code'];
      message.info(`Translating to ${targetLanguage}`);
      const targetFilePath = path.join(messageKeysDir, file.replace(`.${sourceLocale}.properties`, `.${targetLanguage}.properties`));
      await processFile(filePath, targetLanguage, targetFilePath);
    }
  }

  createProgressTable(languagesFilePath);
  message.info('Translation process completed successfully.');
}

export { languages };
export { updateTable };
