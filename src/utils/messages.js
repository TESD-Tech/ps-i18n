let DEBUG = false;
let messageQueue = [];
const MAX_MESSAGES = 5; // Keep last 5 messages

export const setDebug = (enabled) => {
  DEBUG = enabled;
};

export const setConfirm = (enabled) => {
  const message = enabled ? 'Confirmation is set.' : 'Confirmation is not set.';
  addToMessageQueue(message);
};

function addToMessageQueue(msg, type = 'info') {
  messageQueue.push({ message: msg, type, timestamp: new Date() });
  if (messageQueue.length > MAX_MESSAGES) {
    messageQueue.shift(); // Remove oldest message
  }
}

export const getMessages = () => messageQueue;

export const clearMessages = () => {
  messageQueue = [];
};

export const message = {
  debug: (...args) => {
    if (DEBUG) {
      const msg = args.join(' ');
      addToMessageQueue(msg, 'debug');
      console.log('[DEBUG]', msg);
    }
  },
  info: (...args) => {
    const msg = args.join(' ');
    addToMessageQueue(msg, 'info');
    console.log('[INFO]', msg);
  },
  log: (...args) => {
    const msg = args.join(' ');
    addToMessageQueue(msg, 'log');
    console.log('[LOG]', msg);
  },
  warn: (...args) => {
    const msg = args.join(' ');
    addToMessageQueue(msg, 'warn');
    console.warn('[WARN]', msg);
  },
  error: (...args) => {
    const msg = args.join(' ');
    addToMessageQueue(msg, 'error');
    console.error('[ERROR]', msg);
  }
};
