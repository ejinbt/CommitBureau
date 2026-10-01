// Level 5 (Chief): choosing the right command. Scenarios are hardcoded in src/data/level5.js, so no API calls.

import { scenarios } from '../../data/level5.js'
import { pickRandom, shuffle } from '../utils.js'

export async function pickCommand(ctx) {
  const unused = scenarios.filter((s) => !ctx.usedScenarios.has(s))
  if (!unused.length) return null
  const scenario = pickRandom(unused)
  ctx.usedScenarios.add(scenario)

  const choices = shuffle([scenario.answer, ...scenario.wrong])
  return {
    level: 5,
    type: scenario.type,
    prompt: scenario.prompt.replaceAll('{repo}', ctx.repo || 'your project'),
    evidence: { diff: null, author: null, date: null, file: null },
    options: choices.map((c) => c.command),
    answer: choices.indexOf(scenario.answer),
    // One note per option, same order: what that command would have done. Lets the UI explain a wrong pick.
    optionNotes: choices.map((c) => c.why),
    explanation: scenario.answer.why,
    hint: scenario.hint,
    command: scenario.answer.command,
  }
}

export const level5 = [pickCommand]
