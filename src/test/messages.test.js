import { expect } from 'chai';
import sinon from 'sinon';
import { message, setDebug } from '../utils/messages.js';

describe('Message Utility Tests', () => {
  let consoleLogStub;
  let consoleWarnStub;
  let consoleErrorStub;

  beforeEach(() => {
    // Create stubs for console methods
    consoleLogStub = sinon.stub(console, 'log');
    consoleWarnStub = sinon.stub(console, 'warn');
    consoleErrorStub = sinon.stub(console, 'error');
  });

  afterEach(() => {
    // Restore console methods
    consoleLogStub.restore();
    consoleWarnStub.restore();
    consoleErrorStub.restore();
  });

  describe('Debug Mode', () => {
    it('should not show any messages when debug is disabled', () => {
      setDebug(false);
      message.debug('test debug message');
      message.info('test info message');
      message.log('test log message');
      message.warn('test warn message');
      message.error('test error message');
      
      expect(consoleLogStub.called).to.be.false;
      expect(consoleWarnStub.called).to.be.false;
      expect(consoleErrorStub.called).to.be.false;
    });

    it('should show all messages when debug is enabled', () => {
      setDebug(true);
      message.debug('test debug message');
      expect(consoleLogStub.calledWith('[DEBUG]', 'test debug message')).to.be.true;

      message.info('test info message');
      expect(consoleLogStub.calledWith('[INFO]', 'test info message')).to.be.true;

      message.log('test log message');
      expect(consoleLogStub.calledWith('[LOG]', 'test log message')).to.be.true;

      message.warn('test warn message');
      expect(consoleWarnStub.calledWith('[WARN]', 'test warn message')).to.be.true;

      message.error('test error message');
      expect(consoleErrorStub.calledWith('[ERROR]', 'test error message')).to.be.true;
    });
  });

  describe('Multiple Arguments', () => {
    it('should handle multiple arguments in messages when debug is enabled', () => {
      setDebug(true);
      const error = new Error('test error');
      message.error('Failed operation:', error, { details: 'more info' });
      expect(consoleErrorStub.calledWith('[ERROR]', 'Failed operation:', error, { details: 'more info' })).to.be.true;
    });

    it('should not show multiple arguments in messages when debug is disabled', () => {
      setDebug(false);
      const error = new Error('test error');
      message.error('Failed operation:', error, { details: 'more info' });
      expect(consoleErrorStub.called).to.be.false;
    });
  });
});
