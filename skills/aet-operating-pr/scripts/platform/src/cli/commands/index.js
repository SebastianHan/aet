/**
 * 命令模块入口
 */

const CreatePrCommand = require('./create-pr');
const UpdatePrCommand = require('./update-pr');
const ListPrsCommand = require('./list-prs');

module.exports = {
  CreatePrCommand,
  UpdatePrCommand,
  ListPrsCommand
};