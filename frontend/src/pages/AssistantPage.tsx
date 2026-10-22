import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { isAxiosError } from 'axios'
import { useParams } from 'react-router'
import { useChat } from '../hooks/useChat'
import type { ChatMessage } from '../types/ai'

const MAX_LENGTH = 2000

const suggestions = [
  '¿Qué labores tengo planificadas para esta semana?',
  '¿Qué insumos tengo con poco stock o por vencer?',
  '¿Qué maquinaria necesita mantenimiento pronto?',
  '¿Conviene pulverizar en los próximos días según el clima?',
  '¿Qué vacunaciones tengo vencidas o por vencer en la hacienda?',
  '¿Qué vacas están por parir en el próximo mes?',
]

function errorMessageFor(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status

    if (status === 429) {
      return 'Llegaste al límite de consultas por hora. Probá de nuevo más tarde.'
    }
    if (status === 503) {
      return 'El asistente no está disponible en este momento. Si recién lo configuraste, revisá que la API key esté cargada en el servidor.'
    }
    if (status === 403) {
      return 'No tenés acceso a este establecimiento.'
    }
  }
  return 'No se pudo obtener una respuesta. Intentá de nuevo.'
}

function AssistantPage() {
  const { farmId = '' } = useParams()
  const chat = useChat(farmId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chat.isPending])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || chat.isPending) return

    const next: ChatMessage[] = [...messages, { role: 'USER', content }]
    setMessages(next)
    setDraft('')
    setError(null)

    try {
      const response = await chat.mutateAsync(next)
      setMessages([...next, { role: 'ASSISTANT', content: response.reply }])
    } catch (err) {
      setError(errorMessageFor(err))
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void send(draft)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send(draft)
    }
  }

  return (
    <div className="flex max-w-3xl flex-col">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asistente</h1>
          <p className="mt-1 text-sm text-gray-600">
            Responde con los datos actuales de este establecimiento. Es una ayuda: verificá
            la información importante antes de decidir.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMessages([])
              setError(null)
            }}
            className="shrink-0 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Nueva conversación
          </button>
        )}
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {messages.length === 0 && (
          <div>
            <p className="text-sm text-gray-600">Probá preguntando, por ejemplo:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  disabled={chat.isPending}
                  className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-left text-sm text-green-800 hover:bg-green-100 disabled:opacity-60"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={message.role === 'USER' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-2 text-sm ${
                message.role === 'USER'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {chat.isPending && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-500">
              Pensando...
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-3">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_LENGTH}
          rows={2}
          placeholder="Escribí tu consulta. Enter para enviar, Shift + Enter para salto de línea."
          aria-label="Tu consulta"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={chat.isPending || draft.trim() === ''}
          className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}

export default AssistantPage
