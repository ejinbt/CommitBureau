// Game engine public API. The UI only talks to the engine through these functions.
// See docs/CONTRACT.md for the round shape and error rules.
// Owner: engine (ejinbt)

/**
 * Build a 5-round game from a real repo.
 * @param {{ owner: string, repo: string }} repo
 * @param {number} level 1-5
 * @returns {Promise<object[]>} rounds
 */
export async function buildGame(repo, level) {
  throw new Error('buildGame is not implemented yet')
}

/**
 * Apply one answer to the game state.
 * @returns {object} new state
 */
export function scoreAnswer(state, round, pickedIndex, usedHint) {
  throw new Error('scoreAnswer is not implemented yet')
}

/**
 * Summarise a finished game.
 * @returns {{ score: number, percent: number, rank: string, unlocked: boolean, skills: object }}
 */
export function finalReport(state) {
  throw new Error('finalReport is not implemented yet')
}

/**
 * List a user's public repos for "My archive" mode.
 * @param {string} username
 * @returns {Promise<object[]>}
 */
export async function getUserRepos(username) {
  throw new Error('getUserRepos is not implemented yet')
}
