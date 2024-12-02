import { expect } from 'chai';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptPath = path.resolve(__dirname, '../../index.js');

describe('CLI Index Tests', function() {
  it('should display help message with -h flag', function(done) {
    const helpProcess = spawn('node', [scriptPath, '-h']);
    
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
        const combinedOutput = stdout + stderr;
        
        // Check exit code (help should typically exit successfully)
        expect(code).to.equal(0, 'Help command should exit successfully');
        
        // Check for key help message components
        expect(combinedOutput).to.include('Usage: ps-i18n [options] [command]', 'Should include usage instructions');
        expect(combinedOutput).to.include('CLI for translation and internationalization', 'Should include CLI description');
        expect(combinedOutput).to.include('Commands:', 'Should list available commands');
        expect(combinedOutput).to.include('create-keys', 'Should include create-keys command');
        expect(combinedOutput).to.include('translate', 'Should include translate command');
        expect(combinedOutput).to.include('Options:', 'Should include options section');
        expect(combinedOutput).to.include('-V, --version', 'Should include version option');
        expect(combinedOutput).to.include('-d, --debug', 'Should include debug option');
        expect(combinedOutput).to.include('-Y, --yes', 'Should include yes option');
        expect(combinedOutput).to.include('--test-mode', 'Should include test-mode option');
        
        done();
      } catch (error) {
        // If an assertion fails, provide more context
        console.error('Help output:', stdout, stderr);
        done(error);
      }
    });

    helpProcess.on('error', (err) => {
      done(err);
    });
  });

  it('should reject unknown commands', function(done) {
    // Increase timeout to ensure we capture the full output
    this.timeout(5000);

    const unknownProcess = spawn('node', [scriptPath, 'unknown-command']);
    
    let stdout = '';
    let stderr = '';
    let processCompleted = false;

    const timeoutId = setTimeout(() => {
      if (!processCompleted) {
        unknownProcess.kill();
        done(new Error('Process did not complete within the expected time'));
      }
    }, 3000);

    unknownProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    unknownProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    unknownProcess.on('close', (code) => {
      processCompleted = true;
      clearTimeout(timeoutId);

      try {
        const combinedOutput = stdout + stderr;
        
        // Check for the standard help output
        expect(combinedOutput).to.include('Usage: ps-i18n [options] [command]', 'Should show main usage');
        expect(combinedOutput).to.include('CLI for translation and internationalization', 'Should include CLI description');
        expect(combinedOutput).to.include('Options:', 'Should list options');
        expect(combinedOutput).to.include('Commands:', 'Should list commands');
        
        // Check for the additional usage details
        expect(combinedOutput).to.include('Usage!:', 'Should show additional usage details');
        expect(combinedOutput).to.include('create-keys <sourceFile> <locale>', 'Should show create-keys usage');
        expect(combinedOutput).to.include('translate <locale>', 'Should show translate usage');
        
        // Commander typically exits with 0 for unknown commands
        expect(code).to.equal(0, 'Process should exit with zero code');
        
        done();
      } catch (error) {
        // If an assertion fails, provide more context
        console.error('Unknown command output:', stdout, stderr);
        done(error);
      }
    });

    unknownProcess.on('error', (err) => {
      clearTimeout(timeoutId);
      done(err);
    });
  });
});
