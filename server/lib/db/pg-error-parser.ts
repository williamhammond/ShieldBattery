import { SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION } from './pg-error-codes'

export default function parseError(query: string, error: any): Error {
  if (
    error.code &&
    error.code.substring(0, 2) === SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION.substring(0, 2) &&
    error.position
  ) {
    return parseSyntaxError(query, error)
  }
  return new Error(`${error.message} in query ${query}`)
}

function parseSyntaxError(queryText: string, error: any): Error {
  let queryLines = queryText.split('\n')

  let cursor = 0
  let lineNumber = 0
  let relativePosition = 0
  let foundPosition = false
  for (let i = 0; i < queryLines.length && !foundPosition; i++) {
    lineNumber += 1
    // We need to count the new line character
    cursor += 1
    const line = queryLines[i]
    for (let j = 0; j < line.length; j++) {
      if (cursor === parseInt(error.position)) {
        foundPosition = true
        relativePosition = j
        break
      }
      cursor += 1
    }
  }

  const caretLine = '^'.padStart(relativePosition + 1)
  queryLines.splice(lineNumber, 0, caretLine)

  return new Error(
    `${error.message} at position ${error.position} in query ${queryLines.join('\n')}`,
  )
}
