/**
 * Base Command Class - Phase Report specific
 */

const chalk = require('chalk');
const logger = require('../../utils/logger');
const { ConfigManager } = require('../../config');

/**
 * 命令基类 - Phase Report 简化版本
 */
class BaseCommand {
  /**
   * 创建命令实例
   * @param {Object} options - 命令选项
   */
  constructor(options = {}) {
    this.options = options;
    this.configManager = null;
    this.initialized = false;
  }

  /**
   * Initialize command
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize configuration manager
      this.configManager = new ConfigManager({
        configPath: this.options.config
      });

      // Load configuration
      await this.configManager.load();

      // Set CLI configuration
      this.configManager.setCliConfig({
        verbose: this.options.verbose,
        debug: this.options.debug,
        silent: this.options.silent,
        quiet: this.options.quiet,
        output: this.options.output,
        format: this.options.format
      });

      // 在quiet模式下，设置日志级别为error以上
      if (this.options.quiet) {
        logger.setLogLevel('none', true);
      } else {
        logger.setLogLevel(this.options.logLevel || 'info', true);
      }

      this.initialized = true;
      logger.debug('Command initialization complete');
    } catch (error) {
      logger.error('Command initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute command
   * @param {...any} args - Command arguments
   * @returns {Promise<any>}
   */
  async execute(...args) {
    throw new Error('Subclass must implement execute method');
  }

  /**
   * 打印成功消息
   * @param {string} message - 消息
   * @param {Object} [data] - 附加数据
   */
  success(message, data = null) {
    if (this.options.quiet && !data) {
      return;
    }

    if (!this.options.quiet) {
      console.log(chalk.green('✓'), message);
    }

    if (data) {
      const format = this.options.format || 'text';
      if (format === 'json') {
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(data);
      }
    }
  }

  /**
   * 打印错误消息
   * @param {string} message - 消息
   * @param {Error} [error] - 错误对象
   */
  error(message, error = null) {
    if (this.options.quiet) {
      if (error && error.message) {
        const errorMsg = error.message.replace(/^API错误: /, '').replace(/^错误: /, '');
        const format = this.options.format || 'text';
        if (format === 'json') {
          console.error(JSON.stringify({ error: true, message: errorMsg }, null, 2));
        } else {
          console.error(`错误: ${errorMsg}`);
        }
      } else {
        const cleanMessage = message.replace(/^Failed to /, '').replace(/^✗ /, '');
        const format = this.options.format || 'text';
        if (format === 'json') {
          console.error(JSON.stringify({ error: true, message: cleanMessage }, null, 2));
        } else {
          console.error(`错误: ${cleanMessage}`);
        }
      }
      return;
    }

    console.error(chalk.red('✗'), message);
    if (error && this.options.verbose) {
      console.error(chalk.gray(error.stack || error.message));
    }
  }
}

module.exports = BaseCommand;