const hummus = require('hummus');
const path = require('path');

const UPLOAD_PATH = 'uploads';
const OUTPUT_PATH = 'outputs';
const HummusRecipe = require('hummus-recipe');

module.exports = {
  encrypt: function (data) {
    console.log(`${UPLOAD_PATH}/${data.name}`)
    const pdfDoc = new HummusRecipe(`${UPLOAD_PATH}/${data.name}`, `${OUTPUT_PATH}/encrypted_${data.name}`);
    console.log(data.name)
    pdfDoc
      .encrypt({
        userPassword: data.password,
        ownerPassword: data.password,
        userProtectionFlag: 4
      })
      .endPDF();
    
    

    return `${OUTPUT_PATH}/encrypted_${data.name}`;
  },
  split: function (prefix, data) {
    const pdfDoc = new HummusRecipe(`${UPLOAD_PATH}/${data.name}`);
    prefix = data.name;
    const outputDir = OUTPUT_PATH;
    prefix = prefix || pdfDoc.filename;
    for (let i = 0; i < pdfDoc.metadata.pages; i++) {
        const newPdf = path.join(outputDir, `${prefix}-${i+1}.pdf`);
        const pdfWriter = hummus.createWriter(newPdf);
        pdfWriter.createPDFCopyingContext(pdfDoc.pdfReader).appendPDFPageFromPDF(i);
        pdfWriter.end();
    }
    return this;
  }
}