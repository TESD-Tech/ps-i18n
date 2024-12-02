#!/usr/bin/env node

// Import necessary modules
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { DOMParser } from 'xmldom';
import progressBarManager from './utils/progress.js';

// Declare a variable for readline interface
let rl;

/**
 * Function to get plugin details from XML file
 * 
 * This function reads the plugin.xml file, parses it, and extracts the plugin name and version.
 * 
 * @returns {Promise<Object>} An object containing the plugin name and version.
 */
async function getPluginDetails() {
    try {
        // Read and parse the plugin.xml file
        const xmlData = await fs.promises.readFile('plugin.xml', 'utf8');
        const doc = new DOMParser().parseFromString(xmlData, 'text/xml');
        const pluginElement = doc.getElementsByTagName('plugin')[0];
        const name = pluginElement.getAttribute('name');
        const version = pluginElement.getAttribute('version');
        return { name, version };
    } catch (error) {
        console.error('Error reading or parsing plugin.xml:', error);
        process.exit(1);
    }
}

/**
 * Function to read a file asynchronously
 * 
 * This function reads the contents of a file and returns it as a string.
 * 
 * @param {string} filePath The path to the file to be read.
 * @returns {Promise<string>} The contents of the file.
 */
async function readFile(filePath) {
    try {
        return await fs.promises.readFile(filePath, 'utf8');
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        process.exit(1);
    }
}

/**
 * Function to write content to a file asynchronously
 * 
 * This function writes the provided content to a file.
 * 
 * @param {string} filePath The path to the file to be written.
 * @param {string} content The content to be written to the file.
 */
async function writeFile(filePath, content) {
    try {
        await fs.promises.writeFile(filePath, content, 'utf8');
    } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
        process.exit(1);
    }
}

/**
 * Function to generate a header for message key files
 * 
 * This function generates a header string containing the plugin name, version, and source file name.
 * 
 * @param {string} name The plugin name.
 * @param {string} version The plugin version.
 * @param {string} sourceFileName The source file name.
 * @param {string} locale The locale.
 * @returns {string} The generated header string.
 */
function generateHeader(name, version, sourceFileName, locale) {
    return `# ${name} - Version: ${version}\n# MessageKeys for: ${sourceFileName} (${locale})\n`;
}

/**
 * Function to extract message keys from file content
 * 
 * This function extracts message keys from the provided file content.
 * 
 * @param {string} content The file content.
 * @param {string} sourceFile The source file name.
 * @returns {Promise<Object>} An object containing the extracted message keys.
 */
async function extractMessages(content, sourceFile) {
    const extractedMessages = {};
    let startIndex = 0;

    progressBarManager.initialize(Object.keys(content).length, 'Extracting messages');

    while (startIndex < content.length) {
        // Find the start of a message tag
        const startTagIndex = content.indexOf('[msg:', startIndex);
        if (startTagIndex === -1) break;

        // Find the end of the message tag
        const endOfStartTag = content.indexOf(']', startTagIndex);
        if (endOfStartTag === -1) break;

        // Extract the message key
        const key = content.slice(startTagIndex + 5, endOfStartTag);

        // Find the end of the message content
        const endTagIndex = content.indexOf('[/msg]', endOfStartTag);
        if (endTagIndex === -1) break;

        // Extract the message content
        const messageContent = content.slice(endOfStartTag + 1, endTagIndex).trim();
        extractedMessages[key] = messageContent;

        progressBarManager.increment(`Processing key: ${key}`);

        // Move the start index past the current message tag
        startIndex = endTagIndex + 6;
    }

    progressBarManager.stop();

    return extractedMessages;
}

/**
 * Function to handle duplicate keys
 * 
 * This function checks for duplicate keys in the extracted messages and prompts the user to re-index the file if necessary.
 * 
 * @param {Object} messages The extracted messages.
 * @param {string} content The file content.
 * @param {string} sourceFile The source file name.
 * @returns {Promise<boolean>} A boolean indicating whether the file was re-indexed.
 */
async function handleDuplicateKeys(messages, content, sourceFile) {
    const duplicateKeys = findDuplicateKeys(messages);
    if (duplicateKeys.length === 0) {
        return false;
    }

    console.log('Duplicate keys found:', duplicateKeys);

    if (!rl) {
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    return new Promise((resolve) => {
        rl.question('Do you want to re-index the file? (yes/no): ', (answer) => {
            if (answer.toLowerCase() === 'yes') {
                reindexKeys(content, sourceFile, messages).then(() => {
                    resolve(true);
                });
            } else {
                resolve(false);
            }
        });
    });
}

/**
 * Function to find duplicate keys
 * 
 * This function checks for duplicate keys in the extracted messages.
 * 
 * @param {Object} messages The extracted messages.
 * @returns {Array<string>} An array of duplicate keys.
 */
function findDuplicateKeys(messages) {
    const keyCounts = {};
    const duplicateKeys = [];

    for (const key in messages) {
        keyCounts[key] = (keyCounts[key] || 0) + 1;
        if (keyCounts[key] > 1) {
            duplicateKeys.push(key);
        }
    }

    return duplicateKeys;
}

/**
 * Function to re-index keys
 * 
 * This function re-indexes the keys in the file content.
 * 
 * @param {string} content The file content.
 * @param {string} sourceFile The source file name.
 * @param {Object} messages The extracted messages.
 */
async function reindexKeys(content, sourceFile, messages) {
    let newContent = content;
    const keyUpdates = {};

    for (const key in messages) {
        let currentIndex = 0;
        let searchIndex = 0;

        while (searchIndex < newContent.length) {
            const startTagIndex = newContent.indexOf(`[msg:${key}]`, searchIndex);
            if (startTagIndex === -1) break;

            const newKey = `${key}_${currentIndex}`;
            keyUpdates[key] = keyUpdates[key] || [];
            keyUpdates[key].push(newKey);

            newContent = newContent.slice(0, startTagIndex + 5) + newKey + newContent.slice(startTagIndex + 5 + key.length);

            searchIndex = startTagIndex + 5 + newKey.length + 1;
            currentIndex++;
        }
    }

    await writeFile(sourceFile, newContent);
    console.log('Keys re-indexed successfully.');

    for (const oldKey in keyUpdates) {
        const newKeys = keyUpdates[oldKey];

        // Keep the first occurrence of the key, re-index the rest
        messages[newKeys[0]] = messages[oldKey]; 
        for (let i = 1; i < newKeys.length; i++) {
            const newKey = newKeys[i];
            messages[newKey] = messages[oldKey];
            delete messages[oldKey]; 
        }
    }
}

/**
 * Function to consolidate messages
 * 
 * This function consolidates the messages by merging duplicate values.
 * 
 * @param {Object} messages The extracted messages.
 * @param {string} sourceFile The source file name.
 * @returns {Promise<Object>} The consolidated messages.
 */
async function consolidateMessages(messages, sourceFile) {
    const valueToKeyMap = {};
    const keyUpdates = {};

    for (const [key, value] of Object.entries(messages)) {
        if (valueToKeyMap[value]) {
            const newKey = `${valueToKeyMap[value]}_multi`;
            keyUpdates[key] = newKey;
        } else {
            valueToKeyMap[value] = key;
        }
    }

    for (const [oldKey, newKey] of Object.entries(keyUpdates)) {
        messages[newKey] = messages[oldKey];
        delete messages[oldKey];
    }

    let sourceContent = await readFile(sourceFile);
    for (const [oldKey, newKey] of Object.entries(keyUpdates)) {
        const regex = new RegExp(`\\[msg:${oldKey}\\]`, 'g');
        sourceContent = sourceContent.replace(regex, `[msg:${newKey}]`);
    }
    await writeFile(sourceFile, sourceContent);

    return messages;
}

/**
 * Function to process a file
 * 
 * This function processes a file and extracts message keys.
 * 
 * @param {string} sourceFile The source file name.
 * @param {string} locale The locale.
 */
async function processFile(sourceFile, locale) {
    try {
        const { name, version } = await getPluginDetails();
        let data = await readFile(sourceFile);
        let messages = await extractMessages(data, sourceFile);

        const reindexed = await handleDuplicateKeys(messages, data, sourceFile);
        if (reindexed) {
            data = await readFile(sourceFile);
            messages = await extractMessages(data, sourceFile);
        }

        messages = await consolidateMessages(messages, sourceFile);

        const sourceFileName = path.basename(sourceFile, path.extname(sourceFile));
        const destinationDir = path.join('src', 'powerschool', 'MessageKeys');
        await fs.promises.mkdir(destinationDir, { recursive: true });
        const destinationFile = path.join(destinationDir, `${sourceFileName}.${locale}.properties`);

        const proceedWithoutConfirmation = process.argv.includes('-Y');

        if (!proceedWithoutConfirmation) {
            if (!rl) {
                rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
            }
            await new Promise((resolve) => {
                rl.question('Warning: This operation will modify both the source and destination files. Type "Yes" to proceed: ', (answer) => {
                    if (answer.toLowerCase() !== 'yes') {
                        console.log('Operation cancelled by user.');
                        process.exit(0);
                    }
                    resolve();
                });
            });
        }

        await backupFiles(sourceFile, destinationFile); // Backup before any modifications
        data = await readFile(sourceFile); // Re-read the source file after potential re-indexing
        await continueProcessing(name, version, sourceFileName, locale, destinationFile, messages, data, sourceFile);
    } catch (error) {
        console.error('Error processing the file:', error);
    }
}

/**
 * Function to create a backup of a file
 * 
 * This function creates a backup of a file.
 * 
 * @param {string} sourceFile The source file name.
 * @param {string} destinationFile The destination file name.
 */
async function backupFiles(sourceFile, destinationFile) {
    const backupDir = 'original_files_backup';
    fs.promises.mkdir(backupDir, { recursive: true });
    const sourceBackup = path.join(backupDir, path.basename(sourceFile));
    const destBackup = path.join(backupDir, path.basename(destinationFile));
    fs.promises.copyFile(sourceFile, sourceBackup);
    if (fs.existsSync(destinationFile)) {
        fs.promises.copyFile(destinationFile, destBackup);
    }
    console.log('Backup created for source and destination files.');
}

/**
 * Function to continue processing after initial operations
 * 
 * This function continues processing after the initial operations.
 * 
 * @param {string} name The plugin name.
 * @param {string} version The plugin version.
 * @param {string} sourceFileName The source file name.
 * @param {string} locale The locale.
 * @param {string} destinationFile The destination file name.
 * @param {Object} messages The extracted messages.
 * @param {string} data The file content.
 * @param {string} sourceFile The source file name.
 */
async function continueProcessing(name, version, sourceFileName, locale, destinationFile, messages, data, sourceFile) {
    let existingContent = '';
    if (fs.existsSync(destinationFile)) {
        existingContent = await readFile(destinationFile);
    }

    const existingMessages = existingContent.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key.trim()] = value.trim();
        return acc;
    }, {});

    const mergedMessages = { ...existingMessages, ...messages };
    const headerComments = generateHeader(name, version, sourceFileName, locale);
    const fileContent = `${headerComments}\n${Object.entries(mergedMessages).map(([key, value]) => `${key}=${value}`).join('\n')}`;

    await writeFile(destinationFile, fileContent);
    console.log('Consolidation complete. Duplicate values have been merged and files updated.');

    // Convert msg tags to PSHTML text tags
    const updatedData = data.replace(/\[msg:(.*?)\](.*?)\[\/msg\]/g, '~[text:$1]');
    await writeFile(sourceFile, updatedData);
}

/**
 * Function to create message keys
 * 
 * This function creates message keys.
 * 
 * @param {string} sourceFile The source file name.
 * @param {string} locale The locale.
 * @param {boolean} skipPrompt Whether to skip the confirmation prompt.
 */
async function createKeys(sourceFile, locale, skipPrompt) {
    await processFile(sourceFile, locale);
}

// Check if the script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);

    if (args.length < 3) {
        console.error('Usage: node i18n-ize.js <sourceFile> <locale>');
        process.exit(1);
    }

    const [command, sourceFile, locale] = args;

    if (command !== 'create-keys' || !sourceFile || !locale) {
        console.error('Usage: node i18n-ize.js <sourceFile> <locale>');
        process.exit(1);
    }

    const skipPrompt = args.includes('-Y');

    // Call createKeys function with arguments
    createKeys(sourceFile, locale, skipPrompt);
}

export { processFile };