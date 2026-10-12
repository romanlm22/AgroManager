import { api } from './api'
import type { ChatRequest, ChatResponse } from '../types/ai'

export async function sendChat(
  farmId: string,
  request: ChatRequest,
): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>(
    `/api/farms/${farmId}/ai/chat`,
    request,
  )
  return response.data
}
