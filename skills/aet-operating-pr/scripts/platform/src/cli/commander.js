/**
 * Command Line Interface Configuration - PR API
 */

const { Command } = require('commander');
const chalk = require('chalk');
const { version } = require('../../package.json');

// Create main program
const program = new Command();

// Basic configuration
program
  .name('pr-api')
  .description('PR API CLI Tool - Manage GitHub/GitCode/GitLab pull requests')
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

// Create Pull Request command
program
  .command('create-pr')
  .description('Create a Pull Request with template system')
  .requiredOption('--source-branch <branch>', 'Source branch')
  .requiredOption('--target-branch <branch>', 'Target branch')
  .requiredOption('-t, --title <title>', 'PR title')
  .requiredOption('-d, --description <description>', 'PR description (use heredoc for multi-line: --description "$(cat <<\'EOF\'\nmulti-line\ndescription\nEOF\n)")')
  .option('--pr-type <type>', 'PR template type (feature/bugfix/documentation/refactor/generic). Auto-detected if not specified.')
  .option('-l, --labels <labels>', 'Label list, comma separated')
  .option('--format <format>', 'Output format (text/json/table/concise)', 'concise')
  .option('--draft', 'Create as draft PR')
  .option('--non-interactive', 'Skip interactive review and editing')
  .option('--issue <number>', 'Issue number for event reporting')
  .action(async (options) => {
    try {
      const { CreatePrCommand } = require('./commands');
      const command = new CreatePrCommand({ ...program.opts(), ...options });
      await command.execute(options);
    } catch (error) {
      console.error(chalk.red('✗ Creation failed:'), error.message);
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Update Pull Request command
program
  .command('update-pr [prNumber]')
  .description('Update Pull Request info')
  .option('--id <prNumber>', 'PR number (alternative to positional argument)')
  .option('-t, --title <title>', 'New PR title')
  .option('-d, --description <description>', 'New PR description (use heredoc for multi-line: --description "$(cat <<\'EOF\'\nmulti-line\ndescription\nEOF\n)")')
  .option('-s, --state <state>', 'PR state (open/closed)')
  .option('-l, --labels <labels>', 'New label list, comma separated')
  .option('--target-branch <branch>', 'New target branch')
  .option('--format <format>', 'Output format (text/json/table/concise)', 'concise')
  .action(async (prNumber, options) => {
    try {
      const { UpdatePrCommand } = require('./commands');
      const command = new UpdatePrCommand({ ...program.opts(), ...options });

      // 支持--id选项和位置参数
      const finalPrNumber = options.id || prNumber;
      if (!finalPrNumber) {
        console.error(chalk.red('✗ Error:'), 'PR number is required. Use --id <number> or provide as positional argument.');
        process.exit(1);
      }

      await command.execute(finalPrNumber, options);
    } catch (error) {
      console.error(chalk.red('✗ Update failed:'), error.message);
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// List Pull Requests command
program
  .command('list-prs')
  .description('List all Pull Requests')
  .option('--state <state>', 'Filter by state (all/open/closed)', 'open')
  .option('--head <head>', 'Filter by source branch')
  .option('--base <base>', 'Filter by target branch')
  .option('--sort <sort>', 'Sort field (created/updated/popularity)', 'created')
  .option('--direction <direction>', 'Sort direction (asc/desc)', 'desc')
  .option('--labels <labels>', 'Filter by labels, comma separated')
  .option('--assignee <assignee>', 'Filter by assignee')
  .option('--format <format>', 'Output format (text/json/table/concise)', 'concise')
  .action(async (options) => {
    try {
      const { ListPrsCommand } = require('./commands');
      const command = new ListPrsCommand({ ...program.opts(), ...options });
      await command.execute(options);
    } catch (error) {
      console.error(chalk.red('✗ List failed:'), error.message);
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
  console.log('  $ pr-api create-pr --source-branch feat/new --target-branch main --title "New Feature PR"');
  console.log('  $ pr-api update-pr 123 --title "Updated title"');
  console.log('  $ pr-api list-prs --state open --format json');
  console.log('');
  console.log(chalk.cyan('Configuration:'));
  console.log('  Config file location: .aet/config.json');
  console.log('  Required fields: token, owner, repo');
  console.log('  Optional fields: mode, platformType, targetBranch');
});

module.exports = { program };