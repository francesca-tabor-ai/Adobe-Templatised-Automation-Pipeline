/**
 * Safe JSON extraction from LLM responses.
 * Handles markdown code fences, explanatory text, and partial JSON.
 */

/**
 * Parse a JSON value from an LLM response string.
 * Tries: direct parse, markdown fence extraction, first JSON object/array.
 * @param {string} responseText - Raw LLM response
 * @returns {Object|Array} Parsed JSON value
 * @throws {Error} If no valid JSON can be extracted
 */
function parseJsonResponse(responseText) {
  if (!responseText || typeof responseText !== 'string') {
    throw new Error('Empty or non-string AI response');
  }

  var text = responseText.trim();

  // Try direct parse
  try { return JSON.parse(text); } catch (e) { /* continue */ }

  // Try extracting from markdown code fence
  var fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch (e) { /* continue */ }
  }

  // Try finding first JSON array
  var arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try { return JSON.parse(arrayMatch[0]); } catch (e) { /* continue */ }
  }

  // Try finding first JSON object
  var objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch (e) { /* continue */ }
  }

  throw new Error('Could not parse JSON from AI response: ' + text.substring(0, 200));
}

module.exports = { parseJsonResponse };
