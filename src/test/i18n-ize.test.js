import { expect } from 'chai';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { randomUUID } from 'crypto';

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

    // Remove existing .properties files in src/powerschool/MessageKeys
    const propertiesFiles = fs.readdirSync(path.resolve(__dirname, '../powerschool/MessageKeys')).filter(file => file.endsWith('.properties'));
    propertiesFiles.forEach(file => {
      fs.unlinkSync(path.resolve(__dirname, '../powerschool/MessageKeys', file));
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

  it('should process test.html and update it', function (done) {
    this.timeout(5000); // Increase timeout to 5000ms
    exec(`node ${scriptPath} create-keys ${testFilePath} US_en -Y`, (error, stdout, stderr) => {
      if (error) {
        done(error);
        return;
      }
      const updatedContent = fs.readFileSync(testFilePath, 'utf8');
      expect(updatedContent).to.match(/~\[text:[\w-]+\]/); // Check for PSHTML text tag

      const propertiesFilePath = path.resolve(__dirname, '../powerschool/MessageKeys/test.US_en.properties');
      const propertiesContent = fs.readFileSync(propertiesFilePath, 'utf8');
      expect(propertiesContent).to.include(guids[0]); // Ensure the first GUID is in the properties file
      expect(propertiesContent).to.include(guids[1]); // Ensure the second GUID is in the properties file
      expect(propertiesContent).to.include(guids[2]); // Ensure the third GUID is in the properties file

      done();
    });
  });

  it('should translate the keys to another locale', function (done) {
    this.timeout(5000); // Increase timeout to 5000ms
    exec(`node ${scriptPath} create-keys ${testFilePath} US_es -Y`, (error, stdout, stderr) => {
      if (error) {
        done(error);
        return;
      }      
      const translatedFilePath = path.resolve(__dirname, '../powerschool/MessageKeys/test.US_es.properties'); 
      expect(fs.existsSync(translatedFilePath)).to.be.true; // Check if the translated file exists

      const originalContent = fs.readFileSync(path.resolve(__dirname, '../powerschool/MessageKeys/test.US_en.properties'), 'utf8');
      const translatedContent = fs.readFileSync(translatedFilePath, 'utf8');

      // Check that all keys in the original are in the translated file
      const originalKeys = originalContent.split('\n').filter(line => line.includes('=')).map(line => line.split('=')[0]);
      const translatedKeys = translatedContent.split('\n').filter(line => line.includes('=')).map(line => line.split('=')[0]);

      console.log('Original Keys:', originalKeys);
      console.log('Translated Keys:', translatedKeys);
      expect(translatedKeys).to.have.members(originalKeys);

      // Check for Spanish content (this is a simple heuristic check)
      expect(translatedContent).to.include('Hola'); // Example check for Spanish content

      done();
    });
  });

  // Add more CLI test cases as needed
});