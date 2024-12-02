import { expect } from 'chai';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createLanguagesJson } from '../translator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languagesFilePath = path.resolve(__dirname, '../../languages.json');

function arraysEqualIgnoringOrder(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort((a, b) => a['Language Code'].localeCompare(b['Language Code']));
  const sorted2 = [...arr2].sort((a, b) => a['Language Code'].localeCompare(b['Language Code']));
  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
}

describe('Translator Tests', function() {
  beforeEach(function() {
    // Ensure the languages.json file does not exist before each test
    if (fs.existsSync(languagesFilePath)) {
      fs.unlinkSync(languagesFilePath);
    }
  });

  it('should create languages.json with default values if it does not exist', async function () {
    await createLanguagesJson(); // Run the createLanguagesJson function

    // Check if the languages.json file was created with default values
    const data = fs.readFileSync(languagesFilePath, 'utf8');
    const languages = JSON.parse(data);
    const expectedLanguages = [
      { "Language Code": "en", "Language": "English" },
      { "Language Code": "es", "Language": "Spanish" },
      { "Language Code": "hi", "Language": "Hindi" }
    ];
    expect(arraysEqualIgnoringOrder(languages, expectedLanguages)).to.be.true;
  });

  it('should create languages.json with default values if it does not exist', async function () {
    await createLanguagesJson(); // Run the createLanguagesJson function

    // Check if the languages.json file was created with default values
    const data = fs.readFileSync(languagesFilePath, 'utf8');
    const languages = JSON.parse(data);
    const expectedLanguages = [
      { "Language Code": "hi", "Language": "Hindi" },
      { "Language Code": "en", "Language": "English" },
      { "Language Code": "es", "Language": "Spanish" }
    ];
    expect(arraysEqualIgnoringOrder(languages, expectedLanguages)).to.be.true;
  });

  it('should translate test.html keys to all languages', function(done) {
    this.timeout(60000); // Increase timeout to 60 seconds
    
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
          
          // Verify Hindi translation
          const hiFilePath = path.resolve(__dirname, '../powerschool/MessageKeys/test.US_hi.properties');
          const hiFileContent = fs.readFileSync(hiFilePath, 'utf8');
          
          expect(hiFileContent).to.include('नमस्ते');
          expect(hiFileContent).to.include('अलविदा');
          
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
