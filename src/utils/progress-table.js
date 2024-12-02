import Table from 'cli-table3';
import chalk from 'chalk';

/**
 * Create a visually appealing progress table
 * @returns {Table} Configured progress table
 */
export function createProgressTable() {
  return new Table({
    head: [
      chalk.bold.blue('🗂️  File'),
      chalk.bold.green('✅ Processed'),
      chalk.bold.yellow('🌐 Total'),
      chalk.bold.magenta('📊 Progress'),
      chalk.bold.cyan('⏱️ Status')
    ],
    colWidths: [35, 15, 15, 20, 15], // Adjusted widths for better spacing
    style: {
      'padding-left': 1,
      'padding-right': 2,
      head: ['bold'], 
      border: ['gray']
    },
    chars: {
      'top': '═',
      'top-left': '╔',
      'top-right': '╗',
      'bottom': '═',
      'bottom-left': '╚',
      'bottom-right': '╝',
      'left': '║',
      'right': '║',
      // Remove vertical separators
      'top-mid': '',
      'bottom-mid': '',
      'left-mid': '',
      'right-mid': '',
      'mid': '',
      'mid-mid': '',
      'middle': ''
    }
  });
}

/**
 * Create a progress bar visualization
 * @param {number} processed - Number of processed lines
 * @param {number} total - Total number of lines
 * @returns {string} Colorful progress bar
 */
export function createProgressBar(processed, total) {
  if (total === 0) return chalk.gray('∅ No content');
  
  const percentage = Math.round((processed / total) * 100);
  const barLength = 10;
  const filledLength = Math.round((percentage / 100) * barLength);
  
  let color = chalk.red;
  if (percentage > 33) color = chalk.yellow;
  if (percentage > 66) color = chalk.green;
  
  const progressBar = color('█'.repeat(filledLength) + '░'.repeat(barLength - filledLength));
  return `${progressBar} ${percentage}%`;
}

/**
 * Determine translation status
 * @param {number} processed - Number of processed lines
 * @param {number} total - Total number of lines
 * @returns {string} Status emoji and text
 */
export function determineStatus(processed, total) {
  if (total === 0) return chalk.gray('🚫 Skipped');
  if (processed === 0) return chalk.red('🔄 Pending');
  if (processed < total) return chalk.yellow('🚧 In Progress');
  return chalk.green('✅ Completed');
}

/**
 * Update the progress table with enhanced styling and information
 * @returns {void}
 */
export async function updateTable() {
  console.clear();
  
  // Create the table
  const styledTable = createProgressTable();

  // Track overall progress
  let completedFiles = 0;
  let totalProcessed = 0;
  let totalExpected = 0;

  // Populate the table with enhanced information
  getProgressTable().forEach(row => {
    const fileName = row[0];
    const processed = parseInt(row[1], 10) || 0;
    const total = parseInt(row[2], 10) || 0;
    
    // Calculate file-level progress
    const progressBar = createProgressBar(processed, total);
    const status = determineStatus(processed, total);
    
    // Add row to styled table
    styledTable.push([
      chalk.cyan(fileName),
      chalk.green(`${processed}`),
      chalk.yellow(`${total}`),
      progressBar,
      status
    ]);

    // Update overall progress tracking
    if (processed > 0 && processed === total) {
      completedFiles++;
    }
    totalProcessed += processed;
    totalExpected += total;
  });

  // Display the table
  console.log(chalk.bold.underline.magenta('🌍 Translation Progress Dashboard 🌐'));
  console.log(styledTable.toString());

  // Overall summary with visual flair
  console.log('\n' + chalk.bold('🚀 Translation Summary:'));
  
  // Animated progress indicators
  const overallProgress = totalExpected > 0 
    ? Math.round((totalProcessed / totalExpected) * 100)
    : 0;
  
  const progressEmojis = ['🌱', '🌿', '🌳', '🌲', '🏞️'];
  const progressEmojiIndex = Math.min(
    Math.floor((overallProgress / 100) * progressEmojis.length), 
    progressEmojis.length - 1
  );
  
  console.log(
    chalk.bold.blue(`${progressEmojis[progressEmojiIndex]} Overall Progress: `) +
    chalk.green(`${overallProgress}% `) +
    chalk.gray(`(${totalProcessed}/${totalExpected} files)`)
  );

  console.log(chalk.bold.green(`✅ Completed Files: ${completedFiles}`));
  
  // Optional: Provide additional insights or recommendations
  if (overallProgress === 100) {
    console.log(chalk.bold.green('🎉 Translation Mission Accomplished! 🌈'));
  } else if (overallProgress > 75) {
    console.log(chalk.yellow('🚧 Almost there! Final push needed.'));
  } else if (overallProgress > 50) {
    console.log(chalk.yellow('🌈 Halfway through! Keep going!'));
  } else {
    console.log(chalk.yellow('🚀 Translation journey has begun!'));
  }
}
