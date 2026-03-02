export interface Message {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: number
  quickActions?: string[]
}

export interface KnowledgeEntry {
  id: string
  topic: string
  phrases: string[]
  keywords: string[]
  response: string
  quickActions?: string[]
  link?: { label: string; href: string }
}

export interface MatchResult {
  entry: KnowledgeEntry
  score: number
}
