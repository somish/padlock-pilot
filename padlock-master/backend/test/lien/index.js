/* eslint-disable import/no-extraneous-dependencies */
const test = require('ava')
const { generateLienPdf } = require('../../router/lien')

test('generated lien pdf', (t) => {
  t.notThrows(async () => {
    await generateLienPdf({
      signature: '0x3c95dd22821f36ea8a50dca588c7562ea5d57adaf3e573bb7f24298016aed9c3',
      gcName: 'Commence Logistics, LLC & Wisdom 2 Wealth, LLC',
      gcAddress: '1234 Some Street Goes Here',
      scName: 'Commence Logistics, LLC & Wisdom 2 Wealth, LLC',
      scAddress: '5678903 Some Road As well',
      projectTitle: 'Lot 25 – Marion Oaks',
      taskTitle: 'Sec: 11 TWP:11 RGE: 21 Unit: 7 Blk: 1123 Lot:25 Plat Book: 0 Page: 140 Marion Oaks',
      cost: '10000',
      address: '13253 SW 29th Circle – Ocala, FL 34473',
      day: '10',
      month: '08',
      year: '2020',
    })
  })
})
