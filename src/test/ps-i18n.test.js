import { expect } from 'chai';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { createLanguagesJson } from '../translator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.resolve(__dirname, '../../index.js');
const testFilePath = path.resolve(__dirname, 'test.html');
const messageKeysDir = path.resolve(__dirname, '../powerschool/MessageKeys');

function createTestFile() {
  const guid1 = randomUUID();
  const guid2 = randomUUID();
  const guid3 = randomUUID();
  const timestamp = new Date().toISOString();
  const content = `<html>
<body>
<div>[msg:${guid1}]Hello - ${timestamp}[/msg]</div>
<div>[msg:${guid2}]Goodbye - ${timestamp}[/msg]</div>
<div>[msg:${guid3}]Welcome to the test - ${timestamp}[/msg]</div>
<p>This is a paragraph with multiple lines.
  It should test how well the translation handles complex structures.
</p>
</body>
</html>`;
  fs.writeFileSync(testFilePath, content, 'utf8');
  return [guid1, guid2, guid3];
}

describe('CLI Tests', () => {
  let guids; 

  before(async () => {
    // Create MessageKeys directory if it doesn't exist
    fs.mkdirSync(messageKeysDir, { recursive: true });

    // Clear src/powerschool/MessageKeys directory
    const files = fs.readdirSync(messageKeysDir);
    for (const file of files) {
      fs.unlinkSync(path.join(messageKeysDir, file));
    }
    await createLanguagesJson(); // Ensure languages.json is created
  });

  beforeEach(async () => {
    guids = createTestFile();
    await createLanguagesJson(); // Ensure languages.json is created
  });

  afterEach(() => {
    // // Clean up test files
    // if (fs.existsSync(testFilePath)) {
    //   fs.unlinkSync(testFilePath);
    // }

  });

  after(() => {
    // // Clean up languages.json after all tests
    // const languagesFilePath = path.resolve(__dirname, '../../languages.json');
    // if (fs.existsSync(languagesFilePath)) {
    //   fs.unlinkSync(languagesFilePath);
    // }
  });

  it('should create keys from test.html', function(done) {
    this.timeout(10000); 
    exec(`node ${scriptPath} create-keys`, (error, stdout, stderr) => {
      if (error) {
        done(error);
        return;
      }

      const propertiesFilePath = path.join(messageKeysDir, 'test.US_en.properties');
      expect(fs.existsSync(propertiesFilePath)).to.be.true;

      const propertiesContent = fs.readFileSync(propertiesFilePath, 'utf8');
      guids.forEach(guid => {
        expect(propertiesContent).to.include(guid);
      });

      done();
    });
  });

  it('should process test.html and create properties file', function(done) {
    this.timeout(10000); 
    exec(`node ${scriptPath} translate`, (error, stdout, stderr) => {
      if (error) {
        done(error);
        return;
      }

      const propertiesFilePath = path.join(messageKeysDir, 'test.US_en.properties');
      expect(fs.existsSync(propertiesFilePath)).to.be.true;

      const propertiesContent = fs.readFileSync(propertiesFilePath, 'utf8');
      guids.forEach(guid => {
        expect(propertiesContent).to.include(guid);
      });

      done();
    });
  });

  it('should display help message with -h flag', (done) => {
    exec(`node ${scriptPath} -h`, (error, stdout, stderr) => {
      if (error) {
        done(error);
        return;
      }
      expect(stdout).to.include('Usage');
      done();
    });
  });

  it('should create languages.json with correct content', async () => {
    const languagesFilePath = path.resolve(__dirname, '../../languages.json');

    expect(fs.existsSync(languagesFilePath)).to.be.true;

    const expectedContent = [
    { "Language Code": "hi", "Language": "Hindi" },
    { "Language Code": "en", "Language": "English" },
    { "Language Code": "es", "Language": "Spanish" }
  ];
    const actualContent = JSON.parse(fs.readFileSync(languagesFilePath, 'utf8'));
    expect(actualContent).to.deep.equal(expectedContent);
  });

  it('should translate to Spanish correctly', function(done) {
    this.timeout(10000); // Adjust timeout as needed
    exec(`node ${scriptPath} translate --locale es`, (error, stdout, stderr) => {
      if (error) {
        done(error);
        return;
      }

      const englishFile = path.join(messageKeysDir, 'test.US_en.properties');
      const spanishFile = path.join(messageKeysDir, 'test.US_es.properties');

      expect(fs.existsSync(spanishFile)).to.be.true;

      const englishContent = fs.readFileSync(englishFile, 'utf8');
      const spanishContent = fs.readFileSync(spanishFile, 'utf8');

      // Verify keys are preserved - Simplified check
      const englishKeys = englishContent.match(/[a-f0-9-]+=/g); 
      const spanishKeys = spanishContent.match(/[a-f0-9-]+=/g); 

      expect(spanishKeys).to.have.members(englishKeys);
      expect(spanishContent).to.include('Hola');

      done();
    });
  });
});