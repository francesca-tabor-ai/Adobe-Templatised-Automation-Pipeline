/**
 * AI Copy Generation Agent: generates headline, subheadline, and CTA variations
 * using a pluggable LLM. Respects character limits. Scores and ranks variations.
 * Follows standard CGVIP agent contract.
 */

var path = require('path');
var fs = require('fs');
var { AIClient } = require('./common/ai_client');
var { CostTracker } = require('./common/ai_cost_tracker');
var { buildPrompt } = require('./common/ai_prompt_builder');
var { parseJsonResponse } = require('./common/ai_response_parser');

var REPO_ROOT = path.resolve(__dirname, '../..');
var LIMITS_PATH = path.join(REPO_ROOT, 'config/template_limits.json');
var COPY_CONFIG_PATH = path.join(REPO_ROOT, 'config/ai/copy_generation.json');
var BRAND_CONFIG_PATH = path.join(REPO_ROOT, 'config/ai/brand_style_guide.json');

function loadJSON(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { return {}; }
}

function getLimit(limits, field, language) {
  var fieldLimits = limits[field];
  if (!fieldLimits || typeof fieldLimits !== 'object') return null;
  var lang = (language || 'en').toLowerCase();
  return fieldLimits[lang] != null ? fieldLimits[lang] : fieldLimits.en;
}

/**
 * @param {Object} payload - { records, brief?, variationsPerSeed? }
 * @param {Object} context - { runId, app, config }
 * @returns {Promise<Object>} Standard AgentResult
 */
async function run(payload, context) {
  context = context || {};
  var reasoningLog = [];
  var errors = [];
  var records = payload.records || [];
  var copyConfig = loadJSON(COPY_CONFIG_PATH);
  var brandConfig = loadJSON(BRAND_CONFIG_PATH);
  var limits = loadJSON(LIMITS_PATH);

  if (!copyConfig.enabled) {
    reasoningLog.push('AI copy generation is disabled in config.');
    return { success: true, approvalState: 'pass', reasoningLog: reasoningLog, errors: [], outputPayload: { records: records } };
  }

  var runId = context.runId || ('aicopy_' + Date.now());
  var budgetLimit = (context.aiBudgetLimit != null) ? context.aiBudgetLimit : (copyConfig.budgetLimitPerRunUsd || 5);
  var costTracker = new CostTracker(budgetLimit, runId);
  var providerName = context.aiProvider || copyConfig.provider || 'google_gemini';
  var client = new AIClient(providerName);
  var variationsPerSeed = payload.variationsPerSeed || copyConfig.variationsPerSeed || 5;
  var brief = payload.brief || {};
  var fields = copyConfig.fields || ['headline', 'subheadline', 'cta'];

  if (client.isDryRun()) {
    reasoningLog.push('DRY RUN: No API key set for ' + providerName + '. Using mock responses.');
  }

  var generatedVariants = [];

  for (var ri = 0; ri < records.length; ri++) {
    var record = records[ri];
    for (var fi = 0; fi < fields.length; fi++) {
      var field = fields[fi];
      var originalText = record[field];
      if (!originalText) continue;

      var maxChars = getLimit(limits, field, record.language);
      var promptVars = {
        brandName: brandConfig.brandName || 'Brand',
        channel: record.channel || 'general',
        field: field,
        originalText: originalText,
        brandVoice: brief.brand_voice || (brandConfig.styleKeywords || []).join(', '),
        tone: brief.tone || 'professional',
        audience: brief.audience || 'general',
        keyBenefits: brief.key_benefits || [],
        avoidTerms: brief.avoid_terms || [],
        language: record.language || 'en',
        maxChars: maxChars || 60,
        variationsPerSeed: variationsPerSeed
      };

      var prompt = buildPrompt(copyConfig.promptTemplate || '', promptVars);

      try {
        costTracker.checkBudget();
        var response = await client.generateText({
          prompt: prompt,
          model: copyConfig.model,
          temperature: (copyConfig.temperatureByField && copyConfig.temperatureByField[field]) || 0.7,
          maxTokens: copyConfig.maxTokensPerRequest || 2000,
          responseFormat: 'json',
          costEstimate: copyConfig.costPerRequestUsd || 0.001
        });

        costTracker.record('ai_copy_generation', record.variant_id, response.cost, copyConfig.model, 'generate_' + field);

        var variations = parseJsonResponse(response.text);
        if (!Array.isArray(variations)) variations = [variations];

        // Filter by character limit and sort by score
        var valid = variations
          .filter(function (v) { return v && v.text && (!maxChars || v.text.length <= maxChars); })
          .sort(function (a, b) { return (b.score || 0) - (a.score || 0); });

        for (var vi = 0; vi < valid.length; vi++) {
          var v = valid[vi];
          var newVariantId = record.variant_id + '_ai_' + field + '_' + (vi + 1);
          var newRecord = {};
          // Copy all fields from parent
          var keys = Object.keys(record);
          for (var ki = 0; ki < keys.length; ki++) newRecord[keys[ki]] = record[keys[ki]];
          // Override with AI-generated values
          newRecord.variant_id = newVariantId;
          newRecord.parent_variant_id = record.variant_id;
          newRecord[field] = v.text;
          newRecord.hypothesis_id = (copyConfig.hypothesisPrefix || 'H_ai_') + field + '_' + (vi + 1);
          newRecord.variable_changed = (copyConfig.variableChangedMap && copyConfig.variableChangedMap[field]) || (field + '_ai_variation');
          newRecord.ai_generated = true;
          newRecord.ai_model = copyConfig.model;
          newRecord.ai_provider = providerName;
          newRecord.ai_score = v.score || null;
          newRecord.ai_ranking = vi + 1;
          newRecord.ai_cost_usd = response.cost / Math.max(valid.length, 1);
          newRecord.ai_generation_run_id = runId;
          newRecord.approved = false;

          generatedVariants.push(newRecord);
        }

        var filtered = variations.length - valid.length;
        reasoningLog.push(record.variant_id + '.' + field + ': generated ' + valid.length + ' variations' + (filtered > 0 ? ' (' + filtered + ' filtered by char limit)' : ''));
      } catch (err) {
        errors.push('[' + record.variant_id + '] ' + field + ': ' + err.message);
        reasoningLog.push(record.variant_id + '.' + field + ': generation failed - ' + err.message);
      }
    }
  }

  // Write approval queue
  var approvalDir = path.join(REPO_ROOT, 'data/approval/ai_review');
  if (!fs.existsSync(approvalDir)) fs.mkdirSync(approvalDir, { recursive: true });
  var approvalFile = path.join(approvalDir, runId + '_copy.json');
  fs.writeFileSync(approvalFile, JSON.stringify({
    runId: runId,
    agentId: 'ai_copy_generation',
    generatedAt: new Date().toISOString(),
    status: 'pending_review',
    itemCount: generatedVariants.length,
    items: generatedVariants
  }, null, 2), 'utf8');

  // Write cost report
  var aiOutputDir = path.join(REPO_ROOT, 'output/ai');
  costTracker.writeReport(aiOutputDir);

  var allRecords = records.concat(generatedVariants);

  reasoningLog.push('Total: ' + generatedVariants.length + ' AI copy variations generated. Cost: $' + costTracker.getTotal().toFixed(4));
  reasoningLog.push('Approval queue: ' + approvalFile);

  return {
    success: true,
    approvalState: 'warning', // Always warning for AI content
    reasoningLog: reasoningLog,
    errors: errors,
    outputPayload: {
      records: allRecords,
      generatedVariants: generatedVariants,
      approvalFile: approvalFile,
      aiTotalCostUsd: costTracker.getTotal()
    }
  };
}

module.exports = { run: run };
