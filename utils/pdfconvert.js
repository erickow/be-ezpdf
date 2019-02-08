const hummus = require('hummus');
const path = require('path');

const UPLOAD_PATH = './uploads';
const OUTPUT_PATH = '../outputs';
const HummusRecipe = require('hummus-recipe');

module.exports = {
  encrypt: function (data) {
    const pdfDoc = new HummusRecipe(`${UPLOAD_PATH}/${data.name}`, `${OUTPUT_PATH}/${data.name}_encrypted`);

    pdfDoc
      .encrypt({
        userPassword: data.password,
        ownerPassword: data.password,
        userProtectionFlag: 4
      })
      .endPDF();

    return `${OUTPUT_PATH}/${data.name}_encrypted`;
  },
  split: function (outputDir = '', prefix, data) {
    prefix = prefix || this.filename;
    for (let i = 0; i < this.metadata.pages; i++) {
        const newPdf = path.join(outputDir, `${prefix}-${i+1}.pdf`);
        const pdfWriter = hummus.createWriter(newPdf);
        pdfWriter.createPDFCopyingContext(this.pdfReader).appendPDFPageFromPDF(i);
        pdfWriter.end();
    }
    return this;
  }
}