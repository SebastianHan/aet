/**
 * Command Line Interface Configuration - Phase Report API
 */

const { Command } = require('commander');
const chalk = require('chalk');
const { version } = require('../../package.json');

// Create main program
const program = new Command();

// Basic configuration
program
  .name('phase-report-api')
  .description('Phase Report API CLI Tool - Report phase status to visualization dashboard')
  .version(version)
  .option('-c, --config <path>', 'Config file path', '.aet/config.json')
  .option('-p, --platform <platform>', 'Platform type (github/gitcode/gitlab)', 'gitcode')
  .option('--token <token>', 'API token (overrides config)')
  .option('-o, --owner <owner>', 'Repository owner (overrides config)')
  .option('-r, --repo <repository>', 'Repository name (overrides config)')
  .option('-v, --verbose', 'Verbose output', false)
  .option('-d, --debug', 'Debug mode', false)
  .option('-s, --silent', 'Silent mode', false)
  .option('-q, --quiet', 'Quiet mode (minimal output)', true)
  .option('--no-quiet', 'Disable quiet mode (show all output)')
  .option('--no-color', 'Disable colored output', false)
  .option('--output <format>', 'Output format (text/json/table/concise)', 'concise')
  .option('--log-level <level>', 'Log level (error/warn/info/debug/verbose)', 'info')
  .option('--dry-run', 'Dry run mode (no API calls)', false);

// Phase Report command - Report phase status without executing git
program
  .command('phase-report')
  .description('Report phase status (start/complete) to visualization dashboard')
  .requiredOption('-p, --phase <phase>', 'Phase name: design, development, testing')
  .requiredOption('-i, --issue <number>', 'Issue number for phase reporting')
  .option('-s, --status <status>', 'Status: start or complete (default: complete)')
  .option('-u, --user-id <id>', 'User ID for reporting')
  .option('--format <format>', 'Output format (text/json/table/concise)', 'concise')
  .action(async (options) => {
    try {
      const { PhaseReportCommand } = require('./commands');
      const commandInstance = new PhaseReportCommand({ ...program.opts(), ...options });
      await commandInstance.execute(options);
    } catch (error) {
      console.error(chalk.red('✗ Phase report failed:'), error.message);
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// PRD Push Project command - Push project path to dashboard for PRD file viewer
program
  .command('prd-push-project')
  .description('Push project path to visualization dashboard database for PRD file viewer')
  .option('--path <path>', 'Project path (default: current working directory)')
  .option('--format <format>', 'Output format (text/json/table/concise)', 'concise')
  .action(async (options) => {
    try {
      const { PrdPushProjectCommand } = require('./commands');
      const commandInstance = new PrdPushProjectCommand({ ...program.opts(), ...options });
      await commandInstance.execute(options);
    } catch (error) {
      console.error(chalk.red('✗ PRD push project failed:'), error.message);
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Add help information
program.on('--help', () => {
  console.log('');
  console.log(chalk.cyan('Examples:'));
  console.log('  $ phase-report-api phase-report --phase design --issue 123');
  console.log('  $ phase-report-api phase-report --phase development --issue 123 --status start');
  console.log('');
  console.log(chalk.cyan('Configuration:'));
  console.log('  Config file location: .aet/config.json');
  console.log('  Required fields: token, owner, repo');
  console.log('  Optional fields: mode, platformType, targetBranch');
});

module.exports = { program };