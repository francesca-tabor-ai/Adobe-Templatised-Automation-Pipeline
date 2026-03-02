/**
 * Per-run cost tracking and budget enforcement for AI API calls.
 * Accumulates costs, enforces budget limits, and writes cost reports.
 */

var path = require('path');
var fs = require('fs');

/**
 * @param {number} budgetLimitUsd - Maximum spend per pipeline run
 * @param {string} runId - Pipeline run identifier
 */
function CostTracker(budgetLimitUsd, runId) {
  this.budgetLimitUsd = budgetLimitUsd || Infinity;
  this.runId = runId || 'unknown';
  this.entries = [];
  this.totalUsd = 0;
}

/**
 * Record a cost entry for an API call.
 * @param {string} agentId - Which agent made the call
 * @param {string} variantId - Which variant it was for
 * @param {number} costUsd - Cost of this call
 * @param {string} model - Model used
 * @param {string} operation - Description of operation
 */
CostTracker.prototype.record = function (agentId, variantId, costUsd, model, operation) {
  var cost = costUsd || 0;
  this.totalUsd += cost;
  this.entries.push({
    agentId: agentId,
    variantId: variantId,
    costUsd: cost,
    model: model,
    operation: operation,
    timestamp: new Date().toISOString()
  });
};

/**
 * Check if the budget has been exceeded. Throws if over budget.
 */
CostTracker.prototype.checkBudget = function () {
  if (this.totalUsd >= this.budgetLimitUsd) {
    throw new Error('AI budget limit exceeded: $' + this.totalUsd.toFixed(4) + ' >= $' + this.budgetLimitUsd.toFixed(2));
  }
};

/**
 * Get total cost so far.
 * @returns {number}
 */
CostTracker.prototype.getTotal = function () {
  return this.totalUsd;
};

/**
 * Get cost breakdown by agent.
 * @returns {Object}
 */
CostTracker.prototype.getByAgent = function () {
  var byAgent = {};
  for (var i = 0; i < this.entries.length; i++) {
    var e = this.entries[i];
    if (!byAgent[e.agentId]) byAgent[e.agentId] = { count: 0, totalUsd: 0 };
    byAgent[e.agentId].count++;
    byAgent[e.agentId].totalUsd += e.costUsd;
  }
  return byAgent;
};

/**
 * Write cost report to output directory.
 * @param {string} outputDir - Directory to write cost_report.json
 */
CostTracker.prototype.writeReport = function (outputDir) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  var report = {
    runId: this.runId,
    totalCostUsd: this.totalUsd,
    budgetLimitUsd: this.budgetLimitUsd,
    entries: this.entries,
    byAgent: this.getByAgent()
  };
  var reportPath = path.join(outputDir, 'cost_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  return reportPath;
};

module.exports = { CostTracker: CostTracker };
