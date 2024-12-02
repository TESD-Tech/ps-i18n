import { expect } from 'chai';
import chalk from 'chalk';
import {
  createProgressTable,
  createProgressBar,
  determineStatus
} from '../utils/progress-table.js';

describe('Progress Table Utilities', () => {
  describe('createProgressTable', () => {
    let table;

    beforeEach(() => {
      table = createProgressTable();
    });

    it('should create a table with 5 columns', () => {
      expect(table.options.head).to.have.lengthOf(5);
    });

    it('should have correct column headers', () => {
      const expectedHeaders = [
        'File',
        'Processed',
        'Total',
        'Progress',
        'Status'
      ];

      table.options.head.forEach((header, index) => {
        // Strip ANSI color codes to check text
        const cleanHeader = header.replace(/\u001b\[\d+m/g, '');
        expect(cleanHeader).to.include(expectedHeaders[index]);
      });
    });

    it('should have specified column widths', () => {
      expect(table.options.colWidths).to.deep.equal([35, 15, 15, 20, 15]);
    });

    it('should have no vertical separators', () => {
      const noSeparatorChars = [
        'top-mid', 'bottom-mid', 
        'left-mid', 'right-mid', 
        'mid', 'mid-mid', 'middle'
      ];

      noSeparatorChars.forEach(char => {
        expect(table.options.chars[char]).to.equal('');
      });
    });
  });

  describe('createProgressBar', () => {
    it('should return "∅ No content" for zero total', () => {
      const bar = createProgressBar(0, 0);
      expect(bar).to.equal(chalk.gray('∅ No content'));
    });

    it('should create a 100% progress bar', () => {
      const bar = createProgressBar(10, 10);
      expect(bar).to.include('100%');
      expect(bar).to.include('██████████');
    });

    it('should create a 50% progress bar', () => {
      const bar = createProgressBar(5, 10);
      expect(bar).to.include('50%');
      expect(bar).to.include('█████░░░░░');
    });

    it('should use different colors based on progress', () => {
      const lowProgress = createProgressBar(2, 10);
      const medProgress = createProgressBar(7, 10);
      const highProgress = createProgressBar(9, 10);

      expect(lowProgress).to.include(chalk.red('██').substring(0, 2));
      expect(medProgress).to.include(chalk.yellow('███').substring(0, 3));
      expect(highProgress).to.include(chalk.green('████').substring(0, 4));
    });
  });

  describe('determineStatus', () => {
    it('should return "Skipped" for zero total', () => {
      const status = determineStatus(0, 0);
      expect(status).to.equal(chalk.gray('🚫 Skipped'));
    });

    it('should return "Pending" for zero processed', () => {
      const status = determineStatus(0, 10);
      expect(status).to.equal(chalk.red('🔄 Pending'));
    });

    it('should return "In Progress" for partial processing', () => {
      const status = determineStatus(5, 10);
      expect(status).to.equal(chalk.yellow('🚧 In Progress'));
    });

    it('should return "Completed" when all lines processed', () => {
      const status = determineStatus(10, 10);
      expect(status).to.equal(chalk.green('✅ Completed'));
    });
  });
});
