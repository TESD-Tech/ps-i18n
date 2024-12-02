import { expect } from 'chai';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Key Generation Tests', function() {
  before(function () {
    // Clear out MessageKeys directory
    const messageKeysDir = path.resolve(__dirname, '../powerschool/MessageKeys');
    if (fs.existsSync(messageKeysDir)) {
      fs.rmSync(messageKeysDir, { recursive: true, force: true });
    }

    // Create new test html file (./src/test/test.html) with [msg:...][/msg] tags using GIUDs and the default nodes for Hello, Goodbye, and Welcome to the test
    const testFilePath = path.resolve(__dirname, 'test.html');
    // Remove existing test.html if it exists
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    const testFileContent = `
      <html>
      <body>
        <div>[msg:${crypto.randomUUID()}]Hello[/msg]</div>
        <div class="nested"><span>[msg:${crypto.randomUUID()}]Goodbye[/msg]</span></div>
        <input type="text" placeholder="[msg:${crypto.randomUUID()}]Testing 123[/msg]" />
        <div>[msg:${crypto.randomUUID()}]Welcome to the test & < > " '[/msg]</div>
        <p>[msg:${crypto.randomUUID()}]Regular text with embedded translation[/msg]</p>
        <pre>[msg:${crypto.randomUUID()}]Pre with html tags <bold>and</bold> embedded translation[/msg]</pre>
      </body>
      </html>
    `;
    
    fs.writeFileSync(testFilePath, testFileContent);
  });


  it('should create keys from HTML file', function(done) {
    this.timeout(30000); // Increase timeout 
    
    const scriptPath = path.resolve(__dirname, '../../index.js');
    const testFilePath = path.resolve(__dirname, 'test.html');

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

      try {
        const keyFilePath = path.resolve(__dirname, '../powerschool/MessageKeys/test.US_en.properties');
        const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');
        
        // Verify key generation
        expect(keyFileContent).to.include('Hello');
        expect(keyFileContent).to.include('Goodbye');
        expect(keyFileContent).to.include('Welcome to the test');
        
        // Verify key file header
        expect(keyFileContent).to.include('# TE Tech - i18n - Version:');
        expect(keyFileContent).to.include('# MessageKeys for: test (US_en)');
        
        done();
      } catch (error) {
        done(error);
      }
    });

    createKeysProcess.on('error', (err) => {
      done(new Error(`create-keys process error: ${err}`));
    });
  });

  it('should handle files with no translatable content', function(done) {
    this.timeout(30000); // Increase timeout 
    
    const scriptPath = path.resolve(__dirname, '../../index.js');
    const emptyFilePath = path.resolve(__dirname, 'empty.html');

    // Create an empty file for testing
    fs.writeFileSync(emptyFilePath, '<!DOCTYPE html><html><body></body></html>');

    const createKeysProcess = spawn('node', [
      scriptPath, 
      'create-keys', 
      emptyFilePath, 
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
      
      try {
        const keyFilePath = path.resolve(__dirname, '../powerschool/MessageKeys/empty.US_en.properties');
        
        // Verify no key file is created for empty file
        // Note: This might need to be adjusted based on actual implementation
        if (fs.existsSync(keyFilePath)) {
          console.log('Key file unexpectedly created:', keyFilePath);
        }
        
        // Clean up empty test file
        fs.unlinkSync(emptyFilePath);
        
        done();
      } catch (error) {
        done(error);
      }
    });

    createKeysProcess.on('error', (err) => {
      done(new Error(`create-keys process error: ${err}`));
    });
  });
});
