/**
 * PRD Push Project Command
 * Pushes project path to visualization dashboard database for PRD file viewer
 */

const BaseCommand = require('./base');
const axios = require('axios');
const path = require('path');

class PrdPushProjectCommand extends BaseCommand {
  async execute(options) {
    await this.init();

    try {
      const projectPath = options.path || process.cwd();

      const realPath = path.resolve(projectPath);

      const reporterConfig = this.configManager.get('eventReporter') || {};
      const apiBaseUrl = reporterConfig.apiBaseUrl || 'http://localhost:5001/api';
      const timeout = reporterConfig.timeout || 5000;

      const projectName = path.basename(realPath);

      const response = await axios.post(
        `${apiBaseUrl}/prd-projects`,
        { path: realPath },
        { timeout }
      );

      if (response.data.success) {
        const isExisting = response.data.message && response.data.message.includes('already exists');
        if (isExisting) {
          this.success(`Project "${projectName}" already registered, skipped`, response.data.data);
        } else {
          this.success(`Project "${projectName}" registered to dashboard`, response.data.data);
        }
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to register project');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        this.error('Dashboard API not available, skipped', error);
        return { success: true, message: 'Dashboard unavailable, gracefully skipped' };
      }
      this.error('Failed to push project path', error);
      throw error;
    }
  }
}

module.exports = PrdPushProjectCommand;