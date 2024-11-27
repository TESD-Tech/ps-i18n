let DEBUG = false;

export const setDebug = (enabled) => {
  DEBUG = enabled;
};

export const setConfirm = (enabled) => {
  const message = enabled ? 'Confirmation is set.' : 'Confirmation is not set.';
  console.log(message);
};

export const message = {
  debug: (...args) => {
    if (DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args) => {
    if (DEBUG) {
      console.log('[INFO]', ...args);
    }
  },
  log: (...args) => {
    if (DEBUG) {
      console.log('[LOG]', ...args);
    }
  },
  warn: (...args) => {
    if (DEBUG) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args) => {
    if (DEBUG) {
      console.error('[ERROR]', ...args);
    }
  }
};
