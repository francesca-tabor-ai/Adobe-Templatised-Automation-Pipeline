import { KnowledgeEntry, MatchResult } from './types'
import { knowledgeBase, fallbackResponse } from './knowledgeBase'

const PHRASE_WEIGHT = 10
const KEYWORD_WEIGHT = 3
const PARTIAL_WEIGHT = 1
const MATCH_THRESHOLD = 5

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreEntry(input: string, entry: KnowledgeEntry): number {
  const normalized = normalize(input)
  let score = 0

  // Exact phrase matches (highest priority)
  for (const phrase of entry.phrases) {
    if (normalized.includes(normalize(phrase))) {
      score += PHRASE_WEIGHT
    }
  }

  // Individual keyword matches
  const inputWords = normalized.split(' ')
  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalize(keyword)
    if (inputWords.includes(normalizedKeyword)) {
      score += KEYWORD_WEIGHT
    } else if (normalized.includes(normalizedKeyword)) {
      score += PARTIAL_WEIGHT
    }
  }

  return score
}

export function matchIntent(
  input: string
): { response: string; quickActions?: string[]; link?: { label: string; href: string } } {
  const results: MatchResult[] = knowledgeBase.map((entry) => ({
    entry,
    score: scoreEntry(input, entry),
  }))

  results.sort((a, b) => b.score - a.score)

  const best = results[0]

  if (best && best.score >= MATCH_THRESHOLD) {
    return {
      response: best.entry.response,
      quickActions: best.entry.quickActions,
      link: best.entry.link,
    }
  }

  return {
    response: fallbackResponse.response,
    quickActions: fallbackResponse.quickActions,
  }
}
