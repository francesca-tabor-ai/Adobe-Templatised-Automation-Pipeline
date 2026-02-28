/**
 * Entry: InDesign Data Merge + per-record export + preflight. Run from InDesign.
 * Arguments: pass via script arguments (File or prompt), or a config path.
 * Expected: csvPath, templatePath, outputFolder [, approvedOnly ]
 */

(function () {
  #include '../lib/utils.jsx'
  #include 'preflight_check.jsx'
  #include 'data_merge_export.jsx'

  var csvPath, templatePath, outputFolder, approvedOnly;
  if (typeof $.fileName !== 'undefined') {
    var scriptFolder = new File($.fileName).parent;
    var repoRoot = scriptFolder.parent.parent;
    csvPath = repoRoot.fsName + '/data/sample/variants.csv';
    templatePath = repoRoot.fsName + '/templates/indesign/master.indd';
    outputFolder = repoRoot.fsName + '/output/indesign';
    approvedOnly = false;
  }

  // Allow override via dialog or arguments
  var args = [];
  if (typeof arguments !== 'undefined' && arguments.length >= 3) {
    args = [].slice.call(arguments);
  }
  if (args[0]) csvPath = args[0];
  if (args[1]) templatePath = args[1];
  if (args[2]) outputFolder = args[2];
  if (args[3] !== undefined) approvedOnly = !!args[3];

  var csvFile = new File(csvPath);
  if (!csvFile.exists) {
    alert('CSV not found: ' + csvPath + '\nUsing defaults. Create data/sample/variants.csv and templates/indesign/master.indd.');
  }

  var csvText = readFile(csvFile);
  var records = parseCSV(csvText);
  if (approvedOnly) {
    records = records.filter(function (r) { return parseBool(r.approved); });
  }
  if (records.length === 0) {
    alert('No records to merge (or none approved).');
    return;
  }

  var templateFile = new File(templatePath);
  if (!templateFile.exists) {
    alert('Template not found: ' + templatePath);
    return;
  }

  var outDir = new File(outputFolder);
  if (!outDir.exists) outDir.create();

  var csvPathToUse = csvPath;
  if (approvedOnly && records.length < parseCSV(readFile(csvFile)).length) {
    var tempCsv = new File(outputFolder + '/_merge_temp.csv');
    writeFile(tempCsv, recordsToCSV(records));
    csvPathToUse = tempCsv.fsName;
  } else {
    csvPathToUse = csvPath;
  }

  var manifest = [];
  var mergedDoc;
  var mergedRecords;

  try {
    var result = runDataMergeAndGetMergedDoc(templatePath, csvPathToUse);
    mergedDoc = result.mergedDoc;
    mergedRecords = result.records;
    for (var i = 0; i < mergedRecords.length; i++) {
      var rec = mergedRecords[i];
      var vid = (rec.variant_id || 'variant_' + (i + 1)).replace(/[^a-zA-Z0-9_-]/g, '_');
      var pageIdx = i;
      var pdfPath = outputFolder + '/' + vid + '.pdf';
      var errs = [];
      try {
        exportPageToPDF(mergedDoc, pageIdx, pdfPath);
        var spread = mergedDoc.pages.item(pageIdx).parent;
        var preflightResult = runPreflightCheck(mergedDoc, { checkDisclaimer: true });
        if (!preflightResult.ok) errs = preflightResult.errors;
        manifest.push({
          variant_id: rec.variant_id,
          status: errs.length ? 'warning' : 'ok',
          path: pdfPath,
          preflight_ok: errs.length === 0,
          errors: errs
        });
      } catch (e) {
        manifest.push({
          variant_id: rec.variant_id,
          status: 'fail',
          path: pdfPath,
          preflight_ok: false,
          errors: [e.message]
        });
      }
    }
  } catch (e) {
    manifest.push({ variant_id: 'run', status: 'fail', errors: [e.message] });
  } finally {
    if (mergedDoc && mergedDoc.isValid) {
      mergedDoc.close(SaveOptions.NO);
    }
  }

  var manifestPath = outputFolder + '/manifest.json';
  writeFile(manifestPath, stringifyJSON(manifest));
  if (typeof alert !== 'undefined') {
    alert('Done. Exported ' + manifest.length + ' record(s). Manifest: ' + manifestPath);
  }
})();
