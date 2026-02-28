/**
 * InDesign Data Merge: open template, set CSV data source, merge all records to a new document.
 * Returns { mergedDoc, records } so caller can export per page and run preflight.
 * Uses shared utils (parseCSV, readFile) - ensure utils.jsx is loaded or in same scope.
 */

function runDataMergeAndGetMergedDoc(templatePath, csvPath) {
  var templateFile = templatePath instanceof File ? templatePath : new File(templatePath);
  var csvFile = csvPath instanceof File ? csvPath : new File(csvPath);
  if (!templateFile.exists) {
    throw new Error('Template not found: ' + templateFile.fsName);
  }
  if (!csvFile.exists) {
    throw new Error('CSV not found: ' + csvFile.fsName);
  }

  var csvText = readFile(csvFile);
  var records = parseCSV(csvText);
  if (records.length === 0) {
    throw new Error('CSV has no data rows');
  }

  var doc = app.open(templateFile);
  doc.dataMergeProperties.selectDataSource(csvFile);
  doc.dataMergeProperties.mergeRecords();
  // mergeRecords() creates a new document (merged) and typically makes it active
  var mergedDoc = app.activeDocument;
  if (mergedDoc === doc) {
    // Some versions may merge in place or return same doc; assume merged doc is the new one
    mergedDoc = app.documents[app.documents.length - 1];
  }
  doc.close(SaveOptions.NO);
  return { mergedDoc: mergedDoc, records: records };
}

/**
 * Export one page of the merged document to PDF.
 * @param {Document} mergedDoc
 * @param {number} pageIndex 0-based
 * @param {File|string} outputFile
 */
function exportPageToPDF(mergedDoc, pageIndex, outputFile) {
  var f = outputFile instanceof File ? outputFile : new File(outputFile);
  if (f.parent && !f.parent.exists) f.parent.create();
  var prefs = mergedDoc.pdfExportPreferences;
  prefs.pageRange = String(pageIndex + 1);
  mergedDoc.exportFile(ExportFormat.PDF_TYPE, f, false);
}
