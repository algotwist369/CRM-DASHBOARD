// Export JSON data to CSV and PDF. Uses json2csv and pdfkit.
// Note: for large exports consider streaming to avoid memory issues.

const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

// Export JSON array to CSV file 
const exportToCSV = async (data, fields, destPath) => {
    await fs.ensureDir(path.dirname(destPath));

    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(data);

    await fs.writeFile(destPath, csv, 'utf8');
    return destPath;
}

// Export JSON array to simple PDF table
const exportToPDF = async (data, columns, destPath, options = {}) => {
    await fs.ensureDir(path.dirname(destPath));
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const stream = fs.createWriteStream(destPath);
        doc.pipe(stream);

        // Title
        doc.fontSize(18).text(options.title || 'Report', { align: 'center' });
        doc.moveDown();

        // Header row
        doc.fontSize(10);
        const colSpacing = Math.floor((doc.page.width - doc.options.margins.left - doc.options.margins.right) / columns.length);

        // draw headers
        columns.forEach((col, i) => {
            doc.text(String(col).toUpperCase(), doc.options.margins.left + i * colSpacing, doc.y, { width: colSpacing, continued: i !== columns.length - 1 });
        });
        doc.moveDown(0.5);

        // rows
        data.forEach((row) => {
            columns.forEach((col, i) => {
                let text = row[col] == null ? '' : String(row[col]);
                doc.text(text, doc.options.margins.left + i * colSpacing, doc.y, { width: colSpacing, continued: i !== columns.length - 1 });
            });
            doc.moveDown(0.5);
        });

        doc.end();

        stream.on('finish', () => resolve(destPath));
        stream.on('error', (err) => reject(err));
    });
}

module.exports = {
    exportToCSV,
    exportToPDF,
};
