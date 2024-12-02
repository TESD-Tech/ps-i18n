// translator.js
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import Table from 'cli-table3';
import chalk from 'chalk';
import fetch from 'node-fetch';
import { message, getMessages } from './utils/messages.js';
import config from '../translation.config.js';
import progressBarManager from './utils/progress.js';

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

// Create a more visually appealing and informative progress table
function createProgressTable() {
  return new Table({
    head: [
      chalk.bold.blue('🗂️  File'), 
      chalk.bold.green('✅ Processed'), 
      chalk.bold.yellow('🌐 Total'), 
      chalk.bold.magenta('📊 Progress'), 
      chalk.bold.cyan('⏱️ Status')
    ],
    colWidths: [35, 15, 15, 25, 20],
    style: {
      'padding-left': 1,
      'padding-right': 1,
      head: ['bold'],
      border: ['gray']
    },
    chars: {
      'top': '═',
      'top-mid': '╤',
      'top-left': '╔',
      'top-right': '╗',
      'bottom': '═',
      'bottom-mid': '╧',
      'bottom-left': '╚',
      'bottom-right': '╝',
      'left': '║',
      'left-mid': '╟',
      'right': '║',
      'right-mid': '╢',
      'mid': '─',
      'mid-mid': '┼',
      'middle': '│'
    }
  });
}

/**
 * Create a progress bar visualization
 * @param {number} processed - Number of processed lines
 * @param {number} total - Total number of lines
 * @returns {string} Colorful progress bar
 */
function createProgressBar(processed, total) {
  if (total === 0) return chalk.gray('∅ No content');
  
  const percentage = Math.round((processed / total) * 100);
  const barLength = 10;
  const filledLength = Math.round((percentage / 100) * barLength);
  
  let color = chalk.red;
  if (percentage > 33) color = chalk.yellow;
  if (percentage > 66) color = chalk.green;
  
  const progressBar = color('█'.repeat(filledLength) + '░'.repeat(barLength - filledLength));
  return `${progressBar} ${percentage}%`;
}

/**
 * Determine translation status
 * @param {number} processed - Number of processed lines
 * @param {number} total - Total number of lines
 * @returns {string} Status emoji and text
 */
function determineStatus(processed, total) {
  if (total === 0) return chalk.gray('🚫 Skipped');
  if (processed === 0) return chalk.red('🔄 Pending');
  if (processed < total) return chalk.yellow('🚧 In Progress');
  return chalk.green('✅ Completed');
}

/**
 * Update the progress table with enhanced styling and information
 */
function updateTable() {
  if (progressBarManager.enabled) {
    console.clear();
    
    // Create the table
    const styledTable = createProgressTable();

    // Track overall progress
    let completedFiles = 0;
    let totalProcessed = 0;
    let totalExpected = 0;

    // Populate the table with enhanced information
    table.forEach(row => {
      const fileName = row[0];
      const processed = parseInt(row[1], 10) || 0;
      const total = parseInt(row[2], 10) || 0;
      
      // Calculate file-level progress
      const progressBar = createProgressBar(processed, total);
      const status = determineStatus(processed, total);
      
      // Add row to styled table
      styledTable.push([
        chalk.cyan(fileName),
        chalk.green(`${processed}`),
        chalk.yellow(`${total}`),
        progressBar,
        status
      ]);

      // Update overall progress tracking
      if (processed > 0 && processed === total) {
        completedFiles++;
      }
      totalProcessed += processed;
      totalExpected += total;
    });

    // Display the table
    console.log(chalk.bold.underline.magenta('🌍 Translation Progress Dashboard 🌐'));
    console.log(styledTable.toString());

    // Overall summary with visual flair
    console.log('\n' + chalk.bold('🚀 Translation Summary:'));
    
    // Animated progress indicators
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

    // Display recent messages with enhanced styling
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

const table = createProgressTable();

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
 * Process a properties file
 * @param {string} filePath - The path to the properties file
 * @param {string} targetLanguageCode - The target language code
 * @param {string} targetFilePath - The target file path
 */
export async function processFile(filePath, targetLanguageCode, targetFilePath) {
  message.debug(`Processing file: ${filePath} for language: ${targetLanguageCode}`);
  
  // Use the full filename with extension
  const sourceFileName = path.basename(filePath);
  message.debug(`Source file name: ${sourceFileName}`);
  
  if (!progress[sourceFileName]) {
    progress[sourceFileName] = { processed: 0, total: 0, index: table.length };
    
    // Use full filename in the table
    table.push([
      sourceFileName, 
      '0', 
      '0'
    ]);
  }

  const fileContent = await fs.readFile(filePath, 'utf8');
  const lines = fileContent.split('\n');
  const totalLines = lines.filter(line => line.trim() && !line.trim().startsWith('#')).length;
  
  // Update total lines for this file
  progress[sourceFileName].total = totalLines;
  table[progress[sourceFileName].index][2] = `${totalLines}`;

  // Process translations
  let processedLines = 0;
  const translatedContent = [];

  for (const line of lines) {
    if (line.trim() && !line.trim().startsWith('#')) {
      const translatedLine = await translateLine(line, targetLanguageCode);
      translatedContent.push(translatedLine);
      processedLines++;
      
      // Update processed lines
      progress[sourceFileName].processed = processedLines;
      table[progress[sourceFileName].index][1] = `${processedLines}`;
      
      // Update table after each line
      updateTable();
    } else {
      translatedContent.push(line);
    }
  }

  // Write translated content
  await fs.writeFile(targetFilePath, translatedContent.join('\n'), 'utf8');
  
  message.info(`Translated ${sourceFileName} to ${targetLanguageCode}`);

  // Ensure table is updated one final time after file completion
  updateTable();
  
  return {
    sourceFileName,
    processedLines,
    totalLines
  };
}

/**
 * Translate all files to all languages
 * @param {string} messageKeysDir - The directory containing message keys
 */
export async function translateAllFilesToAllLanguages(messageKeysDir) {
  const files = await fs.readdir(messageKeysDir);
  const sourceFiles = files.filter(file => file.endsWith(`.${config.sourceLocale}.properties`));

  // Get target languages from languages array, excluding source locale
  const targetLangs = languages
    .map(lang => `${config.sourceLocale.split('_')[0]}_${lang['Language Code']}`)
    .filter(lang => lang !== config.sourceLocale);

  for (const sourceFile of sourceFiles) {
    const sourceFilePath = path.join(messageKeysDir, sourceFile);
    const sourceFileName = path.basename(sourceFile, path.extname(sourceFile));
    const baseFileName = sourceFileName.replace(`.${config.sourceLocale}`, '');

    for (const lang of targetLangs) {
      const targetFileName = `${baseFileName}.${lang}.properties`;
      const targetFilePath = path.join(messageKeysDir, targetFileName);
      await processFile(sourceFilePath, lang, targetFilePath);
    }
  }

  // Ensure final table update
  updateTable();
  
  // Add a completion message
  message.info(chalk.bold.green('✨ Translation completed successfully! ✨'));
}

export { languages };