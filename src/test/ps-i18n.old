import { expect } from 'chai';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { createLanguagesJson } from '../translator.js';
import progressBarManager from '../utils/progress.js';

// Disable progress bar during tests
progressBarManager.setEnabled(false);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptPath = path.resolve(__dirname, '../../index.js');
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
    const indexPath = path.resolve(__dirname, '../../index.js');
    const helpProcess = spawn('node', [indexPath, '-h']);
    
    let stdout = '';
    let stderr = '';

    helpProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    helpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    helpProcess.on('close', (code) => {
      try {
        expect(code).to.equal(0);
        expect(stdout).to.include('Usage: ps-i18n [options] [command]');
        expect(stdout).to.include('CLI for translation and internationalization');
        expect(stdout).to.include('Commands:');
        expect(stdout).to.include('create-keys');
        expect(stdout).to.include('translate');
        done();
      } catch (error) {
        done(error);
      }
    });

    helpProcess.on('error', (err) => {
      done(err);
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
    this.timeout(15000); // Increase timeout to 15 seconds
    
    // Verify test file exists and has content
    if (!fs.existsSync(testFilePath)) {
      return done(new Error('Test file does not exist'));
    }
    
    console.log('Test file content:', fs.readFileSync(testFilePath, 'utf8'));
    console.log('Running create-keys command...');
    
    const cmd = `node ${path.resolve(__dirname, '../../index.js')} create-keys ${testFilePath} US_en -Y`;
    console.log('Executing command:', cmd);
    
    const childProcess = spawn('node', [scriptPath, 'create-keys', testFilePath, 'US_en', '-Y'], { 
      cwd: path.resolve(__dirname, '../..'),
      env: { ...process.env, NODE_ENV: 'test' }
    });
    let completionFound = false;
    
    childProcess.stdout.on('data', (data) => {
      console.log('stdout:', data);
      if (data.includes('Consolidation complete')) {
        completionFound = true;
        // Give a small delay for file operations to complete
        setTimeout(() => {
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
            childProcess.kill(); // Force the process to end
            done();
          } else {
            childProcess.kill(); // Force the process to end
            done(new Error('One or more GUIDs not found in properties file.'));
          }
        }, 1000);
      }
    });

    childProcess.stderr.on('data', (data) => {
      console.error('stderr:', data);
    });

    childProcess.on('error', (error) => {
      if (!completionFound) {
        console.error('Error executing command:', error);
        done(error);
      }
    });
  });

  it('should translate test.html keys to Spanish', function (done) {
    this.timeout(60000); // Increase timeout to 60 seconds
    console.log('Running create-keys command...');
    
    const scriptPath = path.resolve(__dirname, '../../index.js');
    const testFilePath = path.resolve(__dirname, 'test.html');

    // Create keys process
    const createKeysProcess = spawn('node', [
      scriptPath, 
      'create-keys', 
      testFilePath, 
      'US_en', 
      '-Y'
    ], { 
      cwd: path.resolve(__dirname, '../..'),
      env: { ...process.env, NODE_ENV: 'test' }
    });

    let createKeysOutput = '';
    let createKeysError = '';

    createKeysProcess.stdout.on('data', (data) => {
      createKeysOutput += data.toString();
      console.log('create-keys stdout:', data.toString());
    });

    createKeysProcess.stderr.on('data', (data) => {
      createKeysError += data.toString();
      console.log('create-keys stderr:', data.toString());
    });

    createKeysProcess.on('close', (createKeysCode) => {
      console.log('create-keys process exited with code:', createKeysCode);
      
      if (createKeysCode !== 0) {
        return done(new Error(`create-keys failed with code ${createKeysCode}. Error: ${createKeysError}`));
      }

      // Run translate command
      const translateProcess = spawn('node', [
        scriptPath, 
        'translate', 
        'US_en', 
        '-Y',
        '--test-mode'
      ], { 
        cwd: path.resolve(__dirname, '../..'),
        env: { ...process.env, NODE_ENV: 'test' }
      });

      let translateOutput = '';
      let translateError = '';

      translateProcess.stdout.on('data', (data) => {
        translateOutput += data.toString();
        console.log('translate stdout:', data.toString());
      });

      translateProcess.stderr.on('data', (data) => {
        translateError += data.toString();
        console.log('translate stderr:', data.toString());
      });

      translateProcess.on('close', (translateCode) => {
        console.log('translate process exited with code:', translateCode);
        
        if (translateCode !== 0) {
          return done(new Error(`Translation process failed with code ${translateCode}. Error: ${translateError}`));
        }

        // Verify Spanish translation
        try {
          const esFilePath = path.resolve(__dirname, '../powerschool/MessageKeys/test.US_es.properties');
          const esFileContent = fs.readFileSync(esFilePath, 'utf8');
          
          expect(esFileContent).to.include('Hola');
          expect(esFileContent).to.include('Adiós');
          expect(esFileContent).to.include('Bienvenidos a la prueba');
          
          // Verify Hindi translation
          const hiFilePath = path.resolve(__dirname, '../powerschool/MessageKeys/test.US_hi.properties');
          const hiFileContent = fs.readFileSync(hiFilePath, 'utf8');
          
          expect(hiFileContent).to.include('नमस्ते');
          expect(hiFileContent).to.include('अलविदा');
          expect(hiFileContent).to.include('परीक्षण में आपका स्वागत है');
          
          done();
        } catch (error) {
          done(error);
        }
      });

      translateProcess.on('error', (err) => {
        done(new Error(`Translation process error: ${err}`));
      });
    });

    createKeysProcess.on('error', (err) => {
      done(new Error(`create-keys process error: ${err}`));
    });
  });
});
