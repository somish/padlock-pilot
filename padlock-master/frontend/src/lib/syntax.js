//http://techslides.com/convert-csv-to-json-in-javascript
export let parseCSV = (data) => {
  let lines = data.split('\n')
  let result = []
  let headers = lines[0].trim().split(',')
  for (let i = 1; i < lines.length; i++) {
    let row = {}
    let current = lines[i].trim().split(',')
    for (let j = 0; j < headers.length; j++) {
      if (current[j] !== '') {
        if (j == 2) {
          row[headers[j]] = parseInt(current[j].replace(/[^0-9]+/g, ''))
        } else {
          row[headers[j]] = current[j]
        }
      } else {
        row[headers[j]] = 'null'
      }
    }
    result.push(row)
  }
  return result
}

//@param data the parsed csv being checked
//@param maxPhase the number of phases allowed
export let checkSyntax = (data, maxPhase, subcontractors) => {
  let scNames = Object.keys(subcontractors)
  let errors = []
  for (let row = 0; row < data.length; row++) {
    for (let col in data[row]) {
      // console.log(`Row ${row}: Columm ${col}: ${data[row][col]}`)
      let err = makeError(data[row][col], row, col, maxPhase, scNames)
      if (err) errors.push(err)
    }
  }
  return errors
}

//@dev no check for max phase
let makeError = (entry, row, col, maxPhase, scNames) => {
  let field = col.toLowerCase()
  switch (field) {
    case 'title':
      if (emptyCheck(entry)) return { at: row, col: 'title', msg: 'No title provided', error: true }
      else break
    case 'phase':
      if (emptyCheck(entry)) return { at: row, col: 'phase', msg: 'No phase provided', error: true }
      else if (numericCheck(entry)) return { at: row, col: 'phase', msg: 'Phase must be a number', error: true }
      else if (phaseBoundaryCheck(entry, maxPhase))
        return { at: row, col: 'phase', msg: 'Cannot set phase outside of project specs' }
      else break
    case 'cost':
      if (emptyCheck(entry)) return { at: row, col: 'cost', msg: 'No cost provided', error: true }
      else if (numericCheck(entry)) return { at: row, col: 'cost', msg: 'Cost must be a number', error: true }
      else break
    case 'comments':
      if (emptyCheck(entry)) return { at: row, col: 'description', msg: 'Task description not provided', error: false }
      else break
    case 'subcontractor':
      if (subcontractorCheck(entry, scNames))
        return { at: row, col: 'subcontractor', msg: 'No vendor in your network with this name', error: true }
      else if (emptyCheck(entry))
        return { at: row, col: 'subcontractor', msg: 'No subcontractor provided', error: false }
      else break
  }
}

let emptyCheck = (entry) => {
  if (entry === 'null' || entry === '') {
    return true
  }
  return false
}

let numericCheck = (entry) => {
  let value = parseInt(entry)
  return Number.isNaN(value)
}

let phaseBoundaryCheck = (entry, max) => {
  return entry > max
}

let subcontractorCheck = (entry, scNames) => {
  return !scNames.includes(entry)
}
