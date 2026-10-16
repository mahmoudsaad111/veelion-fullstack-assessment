const reportsService = require('../services/reports.service');

// Plain object with no { data } wrapper, like the docs show.
async function getTasksSummary(req, res) {
  const summary = await reportsService.getTasksSummary();
  res.status(200).json(summary);
}

module.exports = {
  getTasksSummary,
};
