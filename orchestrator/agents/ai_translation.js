/**
 * AI Translation Agent: translates headline, subheadline, and CTA fields across
 * target languages using a pluggable LLM. Respects per-language character limits.
 * Optionally generates back-translations for quality verification.
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
var TRANSLATION_CONFIG_PATH = path.join(REPO_ROOT, 'config/ai/translation.json');
var BRAND_CONFIG_PATH = path.join(REPO_ROOT, 'config/ai/brand_style_guide.json');
var DISCLAIMER_LIBRARY_PATH = path.join(REPO_ROOT, 'config/compliance/disclaimer_library.json');

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
 * Find a disclaimer for a given market from the disclaimer library.
 */
function findDisclaimerForMarket(disclaimerLib, market) {
  var keys = Object.keys(disclaimerLib);
  for (var i = 0; i < keys.length; i++) {
    var d = disclaimerLib[keys[i]];
    if (d.markets && d.markets.indexOf(market) !== -1) {
      return keys[i];
    }
  }
  return null;
}

/**
 * Map language code to a market code (simple mapping).
 */
var LANG_TO_MARKET = { de: 'DE', fr: 'FR', es: 'ES', it: 'IT', pt: 'PT', nl: 'NL', ja: 'JP', zh: 'CN', ko: 'KR', en: 'US' };

/**
 * @param {Object} payload - { records, targetLanguages? }
 * @param {Object} context - { runId, app, config, aiTargetLangs?, aiProvider?, aiBudgetLimit? }
 * @returns {Promise<Object>} Standard AgentResult
 */
async function run(payload, context) {
  context = context || {};
  var reasoningLog = [];
  var errors = [];
  var records = payload.records || [];
  var transConfig = loadJSON(TRANSLATION_CONFIG_PATH);
  var brandConfig = loadJSON(BRAND_CONFIG_PATH);
  var limits = loadJSON(LIMITS_PATH);
  var disclaimerLib = loadJSON(DISCLAIMER_LIBRARY_PATH);

  if (!transConfig.enabled) {
    reasoningLog.push('AI translation is disabled in config.');
    return { success: true, approvalState: 'pass', reasoningLog: reasoningLog, errors: [], outputPayload: { records: records } };
  }

  var targetLanguages = payload.targetLanguages || context.aiTargetLangs || [];
  if (typeof targetLanguages === 'string') targetLanguages = targetLanguages.split(',').map(function (s) { return s.trim(); });
  if (targetLanguages.length === 0) {
    reasoningLog.push('No target languages specified. Skipping translation.');
    return { success: true, approvalState: 'pass', reasoningLog: reasoningLog, errors: [], outputPayload: { records: records } };
  }

  var supported = transConfig.supportedLanguages || ['en', 'de', 'fr', 'es'];
  var validLangs = targetLanguages.filter(function (l) { return supported.indexOf(l) !== -1; });
  if (validLangs.length === 0) {
    reasoningLog.push('No supported target languages found. Supported: ' + supported.join(', '));
    return { success: true, approvalState: 'pass', reasoningLog: reasoningLog, errors: [], outputPayload: { records: records } };
  }

  var runId = context.runId || ('aitrans_' + Date.now());
  var budgetLimit = (context.aiBudgetLimit != null) ? context.aiBudgetLimit : (transConfig.budgetLimitPerRunUsd || 3);
  var costTracker = new CostTracker(budgetLimit, runId);
  var providerName = context.aiProvider || transConfig.provider || 'google_gemini';
  var client = new AIClient(providerName);
  var fields = transConfig.fields || ['headline', 'subheadline', 'cta'];

  if (client.isDryRun()) {
    reasoningLog.push('DRY RUN: No API key set for ' + providerName + '. Using mock responses.');
  }

  var translatedVariants = [];

  for (var ri = 0; ri < records.length; ri++) {
    var record = records[ri];
    var sourceLang = (record.language || 'en').toLowerCase();

    for (var li = 0; li < validLangs.length; li++) {
      var targetLang = validLangs[li];
      if (targetLang === sourceLang) continue; // skip same language

      var targetMarket = LANG_TO_MARKET[targetLang] || targetLang.toUpperCase();
      var newVariantId = record.variant_id + '_' + targetLang;

      // Build new record by copying parent
      var newRecord = {};
      var keys = Object.keys(record);
      for (var ki = 0; ki < keys.length; ki++) newRecord[keys[ki]] = record[keys[ki]];

      newRecord.variant_id = newVariantId;
      newRecord.parent_variant_id = record.variant_id;
      newRecord.market = targetMarket;
      newRecord.language = targetLang;
      newRecord.ai_translated = true;
      newRecord.ai_model = transConfig.model;
      newRecord.ai_provider = providerName;
      newRecord.source_language = sourceLang;
      newRecord.ai_generation_run_id = runId;
      newRecord.approved = false;

      // Find disclaimer for target market
      var targetDisclaimer = findDisclaimerForMarket(disclaimerLib, targetMarket);
      if (targetDisclaimer) newRecord.legal_disclaimer_id = targetDisclaimer;

      var marketNotes = '';
      if (transConfig.marketTerminology && transConfig.marketTerminology[targetMarket]) {
        var terms = transConfig.marketTerminology[targetMarket];
        var termKeys = Object.keys(terms);
        marketNotes = termKeys.map(function (k) { return k + ' = ' + terms[k]; }).join('; ');
      }

      var totalCost = 0;
      var fieldResults = [];

      for (var fi = 0; fi < fields.length; fi++) {
        var field = fields[fi];
        var originalText = record[field];
        if (!originalText) continue;

        var maxChars = getLimit(limits, field, targetLang);
        var promptVars = {
          field: field,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          market: targetMarket,
          originalText: originalText,
          channel: record.channel || 'general',
          brandName: brandConfig.brandName || 'Brand',
          maxChars: maxChars || 60,
          marketNotes: marketNotes || 'none'
        };

        var prompt = buildPrompt(transConfig.promptTemplate || '', promptVars);

        try {
          costTracker.checkBudget();
          var response = await client.generateText({
            prompt: prompt,
            model: transConfig.model,
            temperature: transConfig.temperatureTranslation || 0.3,
            maxTokens: transConfig.maxTokensPerRequest || 1000,
            responseFormat: 'json',
            costEstimate: transConfig.costPerRequestUsd || 0.0005
          });

          costTracker.record('ai_translation', record.variant_id, response.cost, transConfig.model, 'translate_' + field + '_' + targetLang);
          totalCost += response.cost;

          var parsed = parseJsonResponse(response.text);
          var translatedText = parsed.text || parsed.translation || '';

          if (maxChars && translatedText.length > maxChars) {
            fieldResults.push(field + ': translation exceeds limit (' + translatedText.length + '/' + maxChars + ')');
            // Use it anyway but flag
          }

          newRecord[field] = translatedText;
          if (parsed.back_translation) {
            fieldResults.push(field + ': "' + translatedText + '" (back: "' + parsed.back_translation + '")');
          } else {
            fieldResults.push(field + ': "' + translatedText + '"');
          }
        } catch (err) {
          errors.push('[' + record.variant_id + '->' + targetLang + '] ' + field + ': ' + err.message);
          fieldResults.push(field + ': FAILED - ' + err.message);
        }
      }

      newRecord.ai_cost_usd = totalCost;
      translatedVariants.push(newRecord);
      reasoningLog.push(record.variant_id + ' -> ' + targetLang + ': ' + fieldResults.join('; '));
    }
  }

  // Write approval queue
  var approvalDir = path.join(REPO_ROOT, 'data/approval/ai_review');
  if (!fs.existsSync(approvalDir)) fs.mkdirSync(approvalDir, { recursive: true });
  var approvalFile = path.join(approvalDir, runId + '_translations.json');
  fs.writeFileSync(approvalFile, JSON.stringify({
    runId: runId,
    agentId: 'ai_translation',
    generatedAt: new Date().toISOString(),
    status: 'pending_review',
    targetLanguages: validLangs,
    itemCount: translatedVariants.length,
    items: translatedVariants
  }, null, 2), 'utf8');

  // Write cost report
  var aiOutputDir = path.join(REPO_ROOT, 'output/ai');
  costTracker.writeReport(aiOutputDir);

  var allRecords = records.concat(translatedVariants);

  reasoningLog.push('Total: ' + translatedVariants.length + ' translated variants for languages [' + validLangs.join(', ') + ']. Cost: $' + costTracker.getTotal().toFixed(4));
  reasoningLog.push('Approval queue: ' + approvalFile);

  return {
    success: true,
    approvalState: 'warning',
    reasoningLog: reasoningLog,
    errors: errors,
    outputPayload: {
      records: allRecords,
      translatedVariants: translatedVariants,
      approvalFile: approvalFile,
      aiTotalCostUsd: costTracker.getTotal()
    }
  };
}

module.exports = { run: run };
