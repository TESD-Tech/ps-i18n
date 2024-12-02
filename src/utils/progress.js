import { SingleBar, Presets } from 'cli-progress';

class ProgressBarManager {
  constructor() {
    this.progressBar = null;
  }

  initialize(total, status) {
    this.progressBar = new SingleBar({
      format: 'Progress |{bar}| {percentage}% || {value}/{total} Lines || {status}',
      hideCursor: true,
    }, Presets.shades_classic);
    this.progressBar.start(total, 0, { status: status || 'Starting...' });
  }

  increment(status) {
    if (this.progressBar) {
      this.progressBar.increment(1, { status: status || '' });
    }
  }

  stop() {
    if (this.progressBar) {
      this.progressBar.stop();
      this.progressBar = null;
    }
  }

  logOutput(output) {
    if (this.progressBar) {
      this.progressBar.stop();
      console.log(output);
      this.progressBar.start();
    }
  }

  logError(error) {
    if (this.progressBar) {
      this.progressBar.stop();
      console.error(error);
      this.progressBar.start();
    }
  }
}

export default new ProgressBarManager();
