#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { DOMParser } from 'xmldom';

async function getPluginDetails() {
    try {
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

async function readFile(filePath) {
    try {
        return await fs.promises.readFile(filePath, 'utf8');
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        process.exit(1);
    }
}

async function writeFile(filePath, content) {
    try {
        await fs.promises.writeFile(filePath, content, 'utf8');
    } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
        process.exit(1);
    }
}

function generateHeader(name, version, sourceFileName, locale) {
    return `# ${name} - Version: ${version}\n# MessageKeys for: ${sourceFileName} (${locale})\n`;
}

async function extractMessages(content, sourceFile) {
    const extractedMessages = {};
    let startIndex = 0;

    while (startIndex < content.length) {
        const startTagIndex = content.indexOf('[msg:', startIndex);
        if (startTagIndex === -1) break;
        const endOfStartTag = content.indexOf(']', startTagIndex);
        if (endOfStartTag === -1) break;

        const key = content.slice(startTagIndex + 5, endOfStartTag);

        const endTagIndex = content.indexOf('[/msg]', endOfStartTag);
        if (endTagIndex === -1) break;

        const messageContent = content.slice(endOfStartTag + 1, endTagIndex).trim();
        extractedMessages[key] = messageContent;

        startIndex = endTagIndex + 6;
    }

    return extractedMessages;
}

async function handleDuplicateKeys(messages, content, sourceFile) {
    const duplicateKeys = findDuplicateKeys(messages);
    if (duplicateKeys.length === 0) {
        return false;
    }

    console.log('Duplicate keys found:', duplicateKeys);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Do you want to re-index the file? (yes/no): ', async (answer) => {
            rl.close();
            if (answer.toLowerCase() === 'yes') {
                await reindexKeys(content, sourceFile, messages);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

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

    console.log('Consolidation complete. Duplicate values have been merged and source file updated.');
    return messages;
}

async function handleConsolidationPrompt() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Do you want to consolidate duplicate values in the source file? (yes/no): ', async (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes');
        });
    });
}

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

        const consolidate = await handleConsolidationPrompt();
        if (consolidate) {
            messages = await consolidateMessages(messages, sourceFile);
        }

        const sourceFileName = path.basename(sourceFile, path.extname(sourceFile));
        const destinationDir = path.join('src', 'powerschool', 'MessageKeys');
        await fs.promises.mkdir(destinationDir, { recursive: true });
        const destinationFile = path.join(destinationDir, `${sourceFileName}.${locale}.properties`);

        const headerComments = generateHeader(name, version, sourceFileName, locale);
        const fileContent = `${headerComments}\n${Object.entries(messages).map(([key, value]) => `${key}=${value}`).join('\n')}`;

        await writeFile(destinationFile, fileContent);
        console.log('File updated successfully at', destinationFile);

        // Convert msg tags to PSHTML text tags
        const updatedData = data.replace(/\[msg:(.*?)\](.*?)\[\/msg\]/g, '~[text:$1]');
        await writeFile(sourceFile, updatedData);
        console.log('Source file updated with PSHTML text tags:', sourceFile);
    } catch (error) {
        console.error('Error processing the file:', error);
    }
}

(async () => {
    const args = process.argv.slice(2);
    const sourceFile = args[0];
    const locale = args[1];

    if (!sourceFile || !locale) {
        console.error('Please provide both a source file and a locale.');
        process.exit(1);
    }

    try {
        await processFile(sourceFile, locale);
    } catch (err) {
        console.error('Error processing the files:', err);
    }
})();