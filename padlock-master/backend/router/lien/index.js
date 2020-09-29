const ejs = require('ejs')
const path = require('path')
const pdf = require('html-pdf')

const createPdfBuffer = (template) => {
  return new Promise((resolve, reject) => {
    pdf.create(template, { format: 'Letter' }).toBuffer((err, buffer) => {
      if (err) {
        reject(err)
      } else {
        resolve(buffer)
      }
    })
  })
}

const createPdfFile = (template, filePath) => {
  return new Promise((resolve, reject) => {
    pdf.create(template, { format: 'Letter' }).toFile(filePath, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

const generateLienPdf = async (data) => {
  const template = await ejs.renderFile(path.join(__dirname, 'template.ejs'), data)
  const buffer = await createPdfBuffer(template)
  return buffer
}

module.exports = { generateLienPdf }
