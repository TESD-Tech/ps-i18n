import { Command } from 'commander';
import { processFile, languages } from './src/translator.js';
import { main as i18nMain } from './src/i18n-ize.js';
import config from './translation.config.js';
import fs from 'fs';
import path from 'path';

// Define constants for directory path and source locale
let directoryPath = './src/PowerSchool/MessageKeys';
const fallbackFilePath = 'src/config/US_en_example/';
const sourceLocale = 'US_en'; // Default source locale

const program = new Command();

program
  .name('ps-i18n')
  .description('CLI for translation and internationalization')
  .version('24.11.02');

program
  .command('translate')
  .description('Run the translation process')
  .action(() => {
    console.log('Starting translation process...');
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error('Unable to scan directory:', err);
        return;
      }

      console.log('Files in directory:', files);

      // Check if directory is empty or no matching files
      if (files.length === 0 || files.every(file => !file.includes(`.${sourceLocale}.properties`))) {
        console.log('No matching files found, using example file.');
        files = ['tet_parent_example.US_en.properties'];
        directoryPath = fallbackFilePath
      }

      // Filter files that match the source locale pattern
      const filesToProcess = files.filter(file => file.includes(`.${sourceLocale}.properties`));

      if (filesToProcess.length === 0) {
        console.log('No files to process.');
        return;
      }

      // Process each file
      filesToProcess.forEach(file => {
        const filePath = path.join(directoryPath, file);
        console.log(`Processing file: ${filePath}`);

        // Check if testing mode is enabled
        if (config.testingModeEnabled) {
          console.log('Testing mode enabled. Translating one line per language.');
          // Translate one line for each language in testing mode
          languages.forEach(language => {
            const targetLanguage = language['Language Code'];
            console.log(`Translating to ${targetLanguage}`);
            processFile(filePath, targetLanguage);
          });
        } else {
          console.log('Processing all languages.');
          // Process all languages in non-testing mode
          languages.forEach(language => {
            const targetLanguage = language['Language Code'];
            console.log(`Translating to ${targetLanguage}`);
            processFile(filePath, targetLanguage);
          });
        }
      });
    });
  });

program
  .command('i18n')
  .description('Run the i18n process')
  .action(() => {
    i18nMain();
  });

program.parse(process.argv);
