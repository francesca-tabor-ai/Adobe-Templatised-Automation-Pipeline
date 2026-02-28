/**
 * Preflight checks for InDesign: overset text, embedded fonts, disclaimer presence, bleed.
 * Returns { ok: boolean, errors: string[] }.
 * @param {Document} doc - InDesign document
 * @param {Object} [options] - { checkOverset, checkFonts, checkDisclaimer, disclaimerFrameName }
 */
function runPreflightCheck(doc, options) {
  var opts = options || {};
  var checkOverset = opts.checkOverset !== false;
  var checkFonts = opts.checkFonts !== false;
  var checkDisclaimer = opts.checkDisclaimer !== false;
  var disclaimerName = opts.disclaimerFrameName || 'disclaimer';
  var errors = [];

  if (!doc || !doc.isValid) {
    return { ok: false, errors: ['Invalid or no document'] };
  }

  try {
    // Overset text: any text frame with overset
    if (checkOverset) {
      var overset = getOversetFrames(doc);
      for (var i = 0; i < overset.length; i++) {
        errors.push('Overset text: ' + (overset[i].name || 'unnamed frame'));
      }
    }

    // Missing / non-embedded fonts (simplified: check for missing font condition)
    if (checkFonts) {
      var missingFonts = getMissingFonts(doc);
      for (var j = 0; j < missingFonts.length; j++) {
        errors.push('Missing font: ' + missingFonts[j]);
      }
    }

    // Disclaimer: look for text frame named like disclaimer or containing "disclaimer"
    if (checkDisclaimer) {
      var found = findDisclaimerFrame(doc, disclaimerName);
      if (!found) {
        errors.push('Disclaimer frame not found or empty (expected name containing "' + disclaimerName + '")');
      }
    }

    // Bleed: optional check that document has bleed set
    if (opts.checkBleed && doc.documentPreferences.documentBleedBottom === 0 &&
        doc.documentPreferences.documentBleedTop === 0) {
      errors.push('Document bleed is zero');
    }
  } catch (e) {
    errors.push('Preflight exception: ' + e.message);
  }

  return { ok: errors.length === 0, errors: errors };
}

function getOversetFrames(doc) {
  var out = [];
  try {
    var stories = doc.stories;
    for (var i = 0; i < stories.length; i++) {
      var story = stories[i];
      if (story.overflows) {
        var tf = story.textContainers[0];
        if (tf) out.push(tf);
      }
    }
  } catch (e) {}
  return out;
}

function getMissingFonts(doc) {
  var out = [];
  try {
    var fonts = doc.fonts;
    for (var i = 0; i < fonts.length; i++) {
      var f = fonts[i];
      if (f.status === FontStatus.MISSING) {
        out.push(f.name);
      }
    }
  } catch (e) {}
  return out;
}

function findDisclaimerFrame(doc, namePart) {
  namePart = (namePart || 'disclaimer').toLowerCase();
  try {
    var pages = doc.pages;
    for (var p = 0; p < pages.length; p++) {
      var page = pages[p];
      var frames = page.textFrames;
      for (var i = 0; i < frames.length; i++) {
        var tf = frames[i];
        var frameName = (tf.name || '').toLowerCase();
        var contents = (tf.contents || '').toLowerCase();
        if (frameName.indexOf(namePart) >= 0 || contents.indexOf(namePart) >= 0) {
          if (tf.contents && tf.contents.length > 0) return true;
        }
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}
