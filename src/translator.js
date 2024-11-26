// Import necessary modules
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { SingleBar, Presets } from 'cli-progress';
import Table from 'cli-table3';
import config from '../translation.config.js';

// Load language codes from languages.json
const languages = JSON.parse(fs.readFileSync('./languages.json', 'utf8'));

// Initialize ASCII table
const table = new Table({
    head: ['Source File', 'Processed', 'Total'],
    colWidths: [40, 10, 10]
});

// Centralized progress tracking
const progress = {};

/**
 * Update the progress table
 */
function updateTable() {
    console.clear();
    console.log(table.toString());
}

/**
 * Get a language code by language name
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
        console.error('Translation error:', error);
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
 * Introduce a human-like delay
 * @returns {Promise<void>} A promise that resolves after a human-like delay
 */
function humanLikeDelay() {
    const variance = Math.floor(Math.random() * config.delayVariance);
    const totalDelay = config.delayBetweenRequests + variance;
    return delay(totalDelay);
}

/**
 * Log debug messages
 * @param {string} message - The message to log
 */
function logDebug(message) {
    if (config.debugMode) {
        console.log(message);
    }
}

/**
 * Process a properties file
 * @param {string} filePath - The path to the properties file
 * @param {string} targetLanguageCode - The target language code
 */
async function processFile(filePath, targetLanguageCode) {
    const sourceFileName = path.basename(filePath, path.extname(filePath)).replace(`.${config.sourceLocale}`, '');
    if (!progress[sourceFileName]) {
        progress[sourceFileName] = { processed: 0, total: 0, index: table.length };
        table.push([sourceFileName, 0, 0]);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    const totalLines = lines.filter(line => line.trim() && !line.trim().startsWith('#')).length;
    progress[sourceFileName].total += totalLines;

    const targetFilePath = filePath.replace('.US_en', `.US_${targetLanguageCode}`);
    const writeStream = fs.createWriteStream(targetFilePath);
    const progressBar = new SingleBar({}, Presets.shades_classic);
    progressBar.start(totalLines, 0);

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) {
            writeStream.write(line + '\n');
            continue;
        }

        const [keyPart, ...valueParts] = trimmedLine.split('=');
        if (valueParts.length === 0) {
            writeStream.write(line + '\n');
            continue;
        }

        if (config.testingModeEnabled && progress[sourceFileName].processed >= 1) {
            writeStream.write(line + '\n');
            continue;
        }

        const valuePart = valueParts.join('=').trim();
        const translatedValue = await translateLine(valuePart, targetLanguageCode);
        writeStream.write(`${keyPart.trim()}=${translatedValue.trim()}\n`);

        progress[sourceFileName].processed++;
        progressBar.increment();

        table[progress[sourceFileName].index][1] = progress[sourceFileName].processed;
        updateTable();

        if (!config.testingModeEnabled) {
            await humanLikeDelay();
        }
    }

    progressBar.stop();
    writeStream.end();
    console.log(`Translation completed. Translated file saved as ${targetFilePath}`);
}

export { processFile, languages };
