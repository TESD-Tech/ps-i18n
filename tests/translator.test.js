import fs from 'fs';
import path from 'path';
import { processFile } from '../src/translator.js';
import { jest } from '@jest/globals';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    open: jest.fn().mockResolvedValue({
      write: jest.fn(),
      close: jest.fn()
    }),
  },
  existsSync: jest.fn(),
}));

const sourceLocale = 'US_en';

const sourceFileContent = `
key1=Hello
key2=Goodbye
`;

const existingTargetFileContent = `
key1=Hola
key3=Adiós
`;

const expectedMergedContent = `
key1=Hola
key2=Goodbye
key3=Adiós
`;

fs.promises.readFile.mockImplementation((filePath) => {
  if (filePath.includes(sourceLocale)) {
    return Promise.resolve(sourceFileContent);
  }
  return Promise.resolve(existingTargetFileContent);
});

fs.existsSync.mockReturnValue(true);

fs.promises.writeFile.mockImplementation((filePath, data) => {
  expect(data).toBe(expectedMergedContent);
  return Promise.resolve();
});

fs.promises.open.mockImplementation(() => ({
  write: jest.fn(),
  close: jest.fn(),
}));

test('processFile retains existing translation keypairs not in source file', async () => {
  const filePath = path.join('src/powerschool/MessageKeys', `test.${sourceLocale}.properties`);
  const targetLanguageCode = 'es';
  const targetFilePath = filePath.replace(`.${sourceLocale}`, `.US_${targetLanguageCode}`);

  await processFile(filePath, targetLanguageCode, targetFilePath);

  expect(fs.promises.writeFile).toHaveBeenCalledWith(targetFilePath, expectedMergedContent);
});
