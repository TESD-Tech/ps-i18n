import { SingleBar, Presets } from 'cli-progress';

class ProgressBarManager {
  constructor() {
    this.progressBar = null;
    this.enabled = true;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled && this.progressBar) {
      this.stop();
    }
  }

  initialize(total, status) {
    if (!this.enabled) return;
    
    this.progressBar = new SingleBar({
      format: 'Progress |{bar}| {percentage}% || {value}/{total} Lines || {status}',
      hideCursor: true,
    }, Presets.shades_classic);
    this.progressBar.start(total, 0, { status: status || 'Starting...' });
  }

  increment(status) {
    if (this.progressBar && this.enabled) {
      this.progressBar.increment(1, { status: status || '' });
    }
  }

  stop() {
    if (this.progressBar && this.enabled) {
      this.progressBar.stop();
      this.progressBar = null;
    }
  }

  logOutput(output) {
    if (this.progressBar && this.enabled) {
      this.progressBar.stop();
      console.log(output);
      this.progressBar.start();
    } else {
      console.log(output);
    }
  }

  logError(error) {
    if (this.progressBar && this.enabled) {
      this.progressBar.stop();
      console.error(error);
      this.progressBar.start();
    } else {
      console.error(error);
    }
  }
}

export default new ProgressBarManager();
