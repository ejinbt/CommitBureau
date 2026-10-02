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
    optionNotes: choices.map((c) => c.why),
    explanation: scenario.answer.why,
    hint: scenario.hint,
    command: scenario.answer.command,
  }
}

export const level5 = [pickCommand]
