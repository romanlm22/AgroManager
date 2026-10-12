import { useMutation } from '@tanstack/react-query'
import { sendChat } from '../services/aiService'
import type { ChatMessage } from '../types/ai'

export function useChat(farmId: string) {
  return useMutation({
    mutationFn: (messages: ChatMessage[]) => sendChat(farmId, { messages }),
  })
}
