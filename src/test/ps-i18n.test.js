import { expect } from 'chai';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { createLanguagesJson } from '../translator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptPath = path.resolve(__dirname, '../i18n-ize.js');
const testFilePath = path.resolve(__dirname, 'test.html');

function createTestFile() {
  const guid1 = randomUUID();
  const guid2 = randomUUID();
  const guid3 = randomUUID();
  const timestamp = new Date().toISOString();
  const content = `<html>\n<body>\n<div>[msg:${guid1}]Hello - ${timestamp}[/msg]</div>\n<div>\t[msg:${guid2}]Goodbye - ${timestamp}[/msg]</div>\n<div>[msg:${guid3}]Welcome to the test - ${timestamp}[/msg]</div>\n<p>This is a paragraph with multiple lines.\n\tIt should test how well the translation handles complex structures.\n</p>\n</body>\n</html>`;
  fs.writeFileSync(testFilePath, content, 'utf8');
  return [guid1, guid2, guid3];
}

let guids; // Store the generated GUIDs for verification

describe('CLI Tests', function () {
  before(function () {
    // Create the test file and get GUIDs only once before all tests
    guids = createTestFile();

    // Ensure the MessageKeys directory exists
    const messageKeysDir = path.resolve(__dirname, '../powerschool/MessageKeys');
    if (!fs.existsSync(messageKeysDir)) {
      fs.mkdirSync(messageKeysDir, { recursive: true });
    }

    // Remove existing .properties files in src/powerschool/MessageKeys
    const propertiesFiles = fs.readdirSync(messageKeysDir).filter(file => file.endsWith('.properties'));
    propertiesFiles.forEach(file => {
      fs.unlinkSync(path.resolve(messageKeysDir, file));
    });


  });

  // Make tests run sequentially
  afterEach(function () {
    this.timeout(5000); // Increase timeout to 5000ms
    return new Promise(async (resolve, reject) => {
      try {
        // Add any cleanup or asynchronous operations here if needed
        // For example, waiting for file operations or network requests to complete
        
        // Resolve the promise to signal completion
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
  
  it('should display help message with -h flag', function (done) {
    exec(`node ${scriptPath} -h`, (error, stdout, stderr) => {
      if (error) {
        done(error);
        return;
      }
      expect(stdout).to.include('Usage'); // Adjust based on actual help message
      done();
    });
  });

  it('should create languages.json with default values if it does not exist', async function () {
    const languagesFilePath = path.resolve(__dirname, '../../languages.json');
    const backupFilePath = path.resolve(__dirname, '../../languages_backup.json');

    // Ensure the languages.json file does not exist before the test
    if (fs.existsSync(languagesFilePath)) {
      fs.unlinkSync(languagesFilePath);
    }

    // Run the function
    await createLanguagesJson();

    // Check if the languages.json file was created with default values
    const data = fs.readFileSync(languagesFilePath, 'utf8');
    const languages = JSON.parse(data);
    expect(languages).to.deep.equal([
      { "Language Code": "hi", "Language": "Hindi" },
      { "Language Code": "en", "Language": "English" },
      { "Language Code": "es", "Language": "Spanish" }
    ]);

  });
  

  // Add more CLI test cases as needed
  it('should run create-keys on test.html and generate keys for US_en locale', function (done) {
    this.timeout(10000); // Increase timeout to 10000ms
    console.log('Running create-keys command...');
    exec(`node index.js create-keys src/test/test.html US_en -Y`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing command:', error);
        return done(error);
      }
      console.log('Command executed successfully.');
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);

      const propertiesFilePath = path.resolve(__dirname, '../powerschool/MessageKeys/test.US_en.properties');
      console.log('Checking if properties file exists at:', propertiesFilePath);
      if (!fs.existsSync(propertiesFilePath)) {
        console.error('Properties file does not exist.');
        return done(new Error('Properties file was not created.'));
      }

      const propertiesContent = fs.readFileSync(propertiesFilePath, 'utf8');
      console.log('Properties file content:', propertiesContent);
      let allGuidsFound = true;
      guids.forEach(guid => {
        console.log('Checking for GUID:', guid);
        if (!propertiesContent.includes(guid)) {
          console.error(`GUID ${guid} not found in properties file.`);
          allGuidsFound = false;
        }
      });

      if (allGuidsFound) {
        console.log('All checks passed.');
        done(); // Ensure done() is called after all checks
      } else {
        done(new Error('One or more GUIDs not found in properties file.'));
      }
    });
  });
});
