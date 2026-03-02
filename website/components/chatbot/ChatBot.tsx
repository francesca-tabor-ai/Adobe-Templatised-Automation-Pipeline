'use client'

import { useState, useCallback, useEffect } from 'react'
import { Message } from '@/lib/chatbot/types'
import { matchIntent } from '@/lib/chatbot/intentEngine'
import { welcomeMessage } from '@/lib/chatbot/knowledgeBase'
import ChatButton from './ChatButton'
import ChatWindow from './ChatWindow'

let idCounter = 0
function nextId() {
  return `msg-${++idCounter}-${Date.now()}`
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [lastBotLink, setLastBotLink] = useState<{ label: string; href: string } | undefined>()
  const [lastBotQuickActions, setLastBotQuickActions] = useState<string[] | undefined>(
    welcomeMessage.quickActions
  )
  const [initialized, setInitialized] = useState(false)

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && !initialized) {
      setMessages([
        {
          id: nextId(),
          role: 'bot',
          text: welcomeMessage.response,
          timestamp: Date.now(),
          quickActions: welcomeMessage.quickActions,
        },
      ])
      setLastBotQuickActions(welcomeMessage.quickActions)
      setInitialized(true)
    }
  }, [isOpen, initialized])

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  const handleSend = useCallback(
    (text: string) => {
      // Add user message
      const userMsg: Message = {
        id: nextId(),
        role: 'user',
        text,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsTyping(true)
      setLastBotQuickActions(undefined)
      setLastBotLink(undefined)

      // Simulate thinking delay
      const delay = 400 + Math.random() * 400
      setTimeout(() => {
        const result = matchIntent(text)
        const botMsg: Message = {
          id: nextId(),
          role: 'bot',
          text: result.response,
          timestamp: Date.now(),
          quickActions: result.quickActions,
        }
        setMessages((prev) => [...prev, botMsg])
        setLastBotQuickActions(result.quickActions)
        setLastBotLink(result.link)
        setIsTyping(false)
      }, delay)
    },
    []
  )

  const handleQuickAction = useCallback(
    (action: string) => {
      handleSend(action)
    },
    [handleSend]
  )

  return (
    <>
      {isOpen && (
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          onSend={handleSend}
          onQuickAction={handleQuickAction}
          onClose={() => setIsOpen(false)}
          lastBotLink={lastBotLink}
          lastBotQuickActions={lastBotQuickActions}
        />
      )}
      <ChatButton isOpen={isOpen} onClick={() => setIsOpen((prev) => !prev)} />
    </>
  )
}
