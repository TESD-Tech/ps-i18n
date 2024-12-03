import Table from 'cli-table3';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create a visually appealing progress table
 * @param {string} languagesFilePath - Path to the languages.json file
 * @returns {Table} Configured progress table
 */
export function createProgressTable(languagesFilePath) {
  const table = new Table({
    head: [
      chalk.bold.blue('File'),
      chalk.bold.green('Processed'),
      chalk.bold.yellow('Total'),
      chalk.bold.magenta('Progress'),
      chalk.bold.cyan('Status')
    ],
    colWidths: [35, 15, 10, 20, 14],
    style: {
      head: [],
      border: []
    },
    chars: {
      'top': '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      'bottom': '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      'left': '│',
      'left-mid': '├',
      'mid': '─',
      'mid-mid': '┼',
      'right': '│',
      'right-mid': '┤',
      'middle': '│'
    }
  });

  // Display the languages.json file path
  console.log(chalk.bold(`Languages configuration: ${languagesFilePath}`));

  return table;
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
  
  // Correctly resolve the path to languages.json
  const languagesFilePath = path.resolve(__dirname, '../languages.json');
  const styledTable = createProgressTable(languagesFilePath);

  // Track overall progress
  let completedFiles = 0;
  let totalProcessed = 0;
  let totalExpected = 0;

  // Get table data from the current state
  const tableData = [
    ['empty.US_en.properties', 0, 0],
    ['test.US_en.properties', 6, 6]
  ];

  // Populate the table with enhanced information
  tableData.forEach(row => {
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
