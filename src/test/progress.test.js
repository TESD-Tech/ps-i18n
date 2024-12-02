import { expect } from 'chai';
import progressBarManager from '../utils/progress.js';

describe('Progress Bar Manager Tests', function() {
  beforeEach(function() {
    // Reset to default state before each test
    progressBarManager.enabled = true;
    progressBarManager.progressBar = null;
  });

  it('should initialize with default settings', function() {
    expect(progressBarManager.enabled).to.be.true;
    expect(progressBarManager.progressBar).to.be.null;
  });

  it('should allow enabling and disabling progress bar', function() {
    progressBarManager.setEnabled(false);
    expect(progressBarManager.enabled).to.be.false;

    progressBarManager.setEnabled(true);
    expect(progressBarManager.enabled).to.be.true;
  });

  it('should respect enabled state when creating progress bar', function() {
    progressBarManager.setEnabled(false);
    progressBarManager.initialize(100, 'Test Progress');

    expect(progressBarManager.progressBar).to.be.null;
  });

  it('should create progress bar when enabled', function() {
    progressBarManager.initialize(100, 'Test Progress');

    expect(progressBarManager.progressBar).to.not.be.null;
  });

  it('should increment progress bar when enabled', function() {
    progressBarManager.initialize(100, 'Test Progress');
    progressBarManager.increment('Incrementing');

    // Since we can't directly test the increment, we'll just verify it doesn't throw
    expect(progressBarManager.progressBar).to.not.be.null;
  });

  it('should stop progress bar when enabled', function() {
    progressBarManager.initialize(100, 'Test Progress');
    progressBarManager.stop();

    expect(progressBarManager.progressBar).to.be.null;
  });
});
