/**
 * Prompt template builder: replaces {{variable}} placeholders with values.
 * Supports nested paths like {{colorPalette.primary}} and array joining.
 */

function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, obj);
}

/**
 * Build a prompt string from a template and a variables map.
 * @param {string} template - Template with {{variable}} placeholders
 * @param {Object} variables - Key-value map (supports nested paths)
 * @returns {string} Interpolated prompt
 */
function buildPrompt(template, variables) {
  if (!template || !variables) return template || '';
  return template.replace(/\{\{([^}]+)\}\}/g, function (match, key) {
    var value = getNestedValue(variables, key.trim());
    if (value == null) return match; // leave placeholder if missing
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  });
}

module.exports = { buildPrompt, getNestedValue };
