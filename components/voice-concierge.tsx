'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'
import {
  OpenAIRealtimeWebRTC,
  RealtimeAgent,
  RealtimeSession,
  tool,
} from '@openai/agents/realtime'
import type { RealtimeItem } from '@openai/agents/realtime'
import {
  Bot,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { z } from 'zod'
import type { Locale } from '@/i18n/config'
import { buildAssistantInstructions } from '@/lib/cafe-knowledge'

type VoiceConciergeProps = {
  locale: Locale
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error'

const assistantLocale: Locale = 'ar'
const realtimeModel =
  process.env.NEXT_PUBLIC_OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1'

const labels = {
  ar: {
    greeting: 'أهلاً، أنا مساعد Benox. قول لي تحب إيه.',
    placeholder: 'اسأل عن الغرف أو المنيو أو الحجز...',
    send: 'إرسال',
    startVoice: 'ابدأ الصوت',
    stopVoice: 'اقفل الصوت',
    voiceConnecting: 'بوصّل...',
    voiceListening: 'بسمعك...',
    voiceSpeaking: 'برد عليك...',
    voiceError: 'في مشكلة في الصوت دلوقتي.',
    open: 'اسأل Benox',
    close: 'إغلاق',
    switchToText: 'كمّل كتابة',
    mute: 'كتم',
    unmute: 'فتح الصوت',
    idle: 'اتكلم براحتك',
  },
} as const

const realtimeBookingParameters = z.object({
  roomType: z.string(),
  date: z.string(),
  time: z.string(),
  duration: z.string(),
  players: z.number().int().min(1),
  extras: z.string().optional(),
  name: z.string(),
  phone: z.string(),
  notes: z.string().optional(),
})

function buildRealtimeMessages(history: RealtimeItem[]): Message[] {
  return history.flatMap((item) => {
    if (item.type !== 'message' || item.role === 'system') {
      return []
    }

    const content = item.content
      .map((part) => {
        if ('text' in part && typeof part.text === 'string') {
          return part.text
        }

        if ('transcript' in part && typeof part.transcript === 'string') {
          return part.transcript
        }

        return ''
      })
      .join(' ')
      .trim()

    if (!content) {
      return []
    }

    return [
      {
        id: item.itemId,
        role: item.role,
        content,
      },
    ]
  })
}

function localizeVoiceError(message: string) {
  const normalized = message.toLowerCase()

  if (
    normalized.includes('insufficient_quota') ||
    normalized.includes('exceeded your current quota')
  ) {
    return 'رصيد OpenAI أو الفوترة مش كفاية لتشغيل الصوت.'
  }

  if (normalized.includes('missing openai_api_key')) {
    return 'مفتاح OpenAI مش متضبط على السيرفر.'
  }

  if (normalized.includes('failed to establish a realtime call')) {
    return 'تعذّر تشغيل المكالمة الصوتية دلوقتي.'
  }

  return 'في مشكلة في الصوت دلوقتي.'
}

function createRealtimeBookingTool() {
  return tool({
    name: 'create_booking_request',
    description:
      'Create a room booking after the guest has confirmed all booking details.',
    parameters: realtimeBookingParameters,
    execute: async (input) => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale: assistantLocale,
          roomType: input.roomType,
          date: input.date,
          time: input.time,
          duration: input.duration,
          players: input.players,
          extras: input.extras,
          name: input.name,
          phone: input.phone,
          notes: input.notes,
          source: 'ai-assistant',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed.')
      }

      return [
        'تم تأكيد الحجز.',
        `الرقم: ${data.booking.id}`,
        `الغرفة: ${data.booking.roomLabel}`,
        `التاريخ: ${data.booking.date}`,
        `الوقت: ${data.booking.time}`,
        `المدة: ${data.booking.duration}`,
        `اللاعبين: ${data.booking.players}`,
      ].join('\n')
    },
  })
}

export function VoiceConcierge({ locale: _locale }: VoiceConciergeProps) {
  const t = labels.ar
  const isRtl = true

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: t.greeting },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<RealtimeSession | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const syncRealtimeHistory = useEffectEvent((history: RealtimeItem[]) => {
    const nextMessages = buildRealtimeMessages(history)
    setMessages(
      nextMessages.length > 0
        ? nextMessages
        : [{ id: 'welcome', role: 'assistant', content: t.greeting }],
    )
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!session) {
      return
    }

    const onHistoryUpdated = (history: RealtimeItem[]) => {
      syncRealtimeHistory(history)
      setError(null)
    }

    const onAudioStart = () => {
      setVoiceState('speaking')
    }

    const onAudioStopped = () => {
      setVoiceState('listening')
    }

    const onAudioInterrupted = () => {
      setVoiceState('listening')
    }

    const onTransportEvent = (event: { type?: string }) => {
      if (event.type === 'input_audio_buffer.speech_started') {
        setVoiceState('listening')
      }
    }

    const onError = (event: { error?: unknown }) => {
      const message =
        event.error instanceof Error
          ? event.error.message
          : typeof event.error === 'string'
            ? event.error
            : 'Voice error'

      setError(localizeVoiceError(message))
      setVoiceState('error')
    }

    session.on('history_updated', onHistoryUpdated)
    session.on('audio_start', onAudioStart)
    session.on('audio_stopped', onAudioStopped)
    session.on('audio_interrupted', onAudioInterrupted)
    session.on('transport_event', onTransportEvent)
    session.on('error', onError)

    return () => {
      session.off('history_updated', onHistoryUpdated)
      session.off('audio_start', onAudioStart)
      session.off('audio_stopped', onAudioStopped)
      session.off('audio_interrupted', onAudioInterrupted)
      session.off('transport_event', onTransportEvent)
      session.off('error', onError)
    }
  }, [session, syncRealtimeHistory, t.greeting])

  useEffect(() => {
    return () => {
      session?.close()
    }
  }, [session])

  async function sendTextToServer(nextMessages: Message[]) {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale: assistantLocale,
        messages: nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Assistant request failed.')
    }

    return data.reply as string
  }

  async function startVoice() {
    try {
      setVoiceState('connecting')
      setError(null)

      const preflightResponse = await fetch('/api/realtime/session', {
        method: 'POST',
      })
      const preflightData = await preflightResponse.json()

      if (!preflightResponse.ok) {
        throw new Error(preflightData.error || t.voiceError)
      }

      const agent = new RealtimeAgent({
        name: 'Benox Arabic Voice Concierge',
        voice: 'marin',
        instructions: buildAssistantInstructions(assistantLocale),
        tools: [createRealtimeBookingTool()],
      })

      const nextSession = new RealtimeSession(agent, {
        model: realtimeModel,
        transport: new OpenAIRealtimeWebRTC({
          baseUrl: `${window.location.origin}/api/realtime/call`,
        }),
        config: {
          reasoning: {
            effort: 'low',
          },
          audio: {
            input: {
              transcription: {
                model: 'gpt-4o-mini-transcribe',
                language: 'ar',
              },
              turnDetection: {
                type: 'semantic_vad',
                create_response: true,
                interrupt_response: true,
                eagerness: 'low',
              },
            },
            output: {
              speed: 1,
            },
          },
        },
      })

      await nextSession.connect({
        apiKey: 'ek_local_proxy',
        model: realtimeModel,
      })

      setSession(nextSession)
      setIsMuted(false)
      setVoiceState('listening')
    } catch (caughtError) {
      console.error('Voice concierge error', caughtError)
      const message =
        caughtError instanceof Error ? caughtError.message : t.voiceError
      setError(localizeVoiceError(message))
      setVoiceState('error')
    }
  }

  function stopVoice() {
    session?.close()
    setSession(null)
    setIsMuted(false)
    setVoiceState('idle')
  }

  function handleClose() {
    setIsOpen(false)
    stopVoice()
  }

  async function handleSend() {
    const text = input.trim()

    if (!text || isSending) {
      return
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }

    setInput('')
    setError(null)

    if (session && voiceState !== 'idle' && voiceState !== 'error') {
      setMessages((current) => [...current, userMessage])
      session.sendMessage(text)
      return
    }

    setIsSending(true)

    try {
      const nextMessages = [...messages, userMessage]
      setMessages(nextMessages)
      const reply = await sendTextToServer(nextMessages)

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
        },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'حصلت مشكلة في الرد. حاول تاني.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  function handleToggleMute() {
    if (!session) {
      return
    }

    const nextMuted = !isMuted
    session.mute(nextMuted)
    setIsMuted(nextMuted)
  }

  const isVoiceActive =
    voiceState === 'connecting' ||
    voiceState === 'listening' ||
    voiceState === 'speaking'

  const voiceLabel =
    error ||
    (voiceState === 'connecting'
      ? t.voiceConnecting
      : voiceState === 'listening'
        ? t.voiceListening
        : voiceState === 'speaking'
          ? t.voiceSpeaking
          : voiceState === 'error'
            ? t.voiceError
            : t.idle)

  return (
    <>
      {!isOpen && (
        <button
          id="voice-concierge-trigger"
          aria-label={t.open}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40 transition-all hover:scale-110 hover:shadow-xl hover:shadow-primary/50 active:scale-95"
          style={{ direction: 'ltr' }}
        >
          <Bot className="size-6 text-primary-foreground" aria-hidden="true" />
          <span className="absolute size-14 animate-ping rounded-full bg-primary/30" />
        </button>
      )}

      {isOpen && (
        <div
          id="voice-concierge-panel"
          role="dialog"
          aria-label={t.open}
          dir={isRtl ? 'rtl' : 'ltr'}
          className="fixed bottom-6 right-6 z-50 flex w-[22rem] flex-col overflow-hidden rounded-3xl bg-card shadow-2xl shadow-black/20 ring-1 ring-border sm:w-96"
        >
          <div className="flex items-center gap-3 border-b border-border bg-foreground px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary">
              <Bot className="size-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-primary-foreground">
                Benox
              </p>
              <p className="text-xs text-primary-foreground/60">{voiceLabel}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label={isVoiceActive ? t.stopVoice : t.startVoice}
                onClick={isVoiceActive ? stopVoice : () => void startVoice()}
                className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                  isVoiceActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-primary-foreground/60 hover:bg-white/10 hover:text-primary-foreground'
                }`}
              >
                {voiceState === 'connecting' ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Mic className="size-4" aria-hidden="true" />
                )}
              </button>
              {isVoiceActive && (
                <button
                  aria-label={isMuted ? t.unmute : t.mute}
                  onClick={handleToggleMute}
                  className="flex size-8 items-center justify-center rounded-full text-primary-foreground/60 transition-colors hover:bg-white/10 hover:text-primary-foreground"
                >
                  {isMuted ? (
                    <VolumeX className="size-4" aria-hidden="true" />
                  ) : (
                    <Volume2 className="size-4" aria-hidden="true" />
                  )}
                </button>
              )}
              <button
                aria-label={t.close}
                onClick={handleClose}
                className="flex size-8 items-center justify-center rounded-full text-primary-foreground/60 transition-colors hover:bg-white/10 hover:text-primary-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {isVoiceActive && (
            <div className="flex flex-col items-center gap-4 bg-foreground/5 px-4 py-6">
              <div className="relative flex size-20 items-center justify-center">
                <span
                  className={`absolute size-20 rounded-full bg-primary/20 ${
                    voiceState === 'listening' ? 'animate-ping' : ''
                  }`}
                />
                <span
                  className={`absolute size-14 rounded-full bg-primary/30 ${
                    voiceState === 'speaking' ? 'animate-pulse' : ''
                  }`}
                />
                <span className="relative flex size-10 items-center justify-center rounded-full bg-primary">
                  {isMuted ? (
                    <MicOff
                      className="size-5 text-primary-foreground"
                      aria-hidden="true"
                    />
                  ) : (
                    <Mic
                      className="size-5 text-primary-foreground"
                      aria-hidden="true"
                    />
                  )}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">{voiceLabel}</p>
              <div className="flex gap-2">
                <button
                  onClick={stopVoice}
                  className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
                >
                  <MessageCircle className="size-3.5" aria-hidden="true" />
                  {t.switchToText}
                </button>
                <button
                  onClick={stopVoice}
                  className="rounded-full bg-destructive px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80"
                >
                  {t.stopVoice}
                </button>
              </div>
            </div>
          )}

          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-end">
                <div className="flex items-center gap-1.5 rounded-2xl bg-muted px-3.5 py-2.5">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {!isVoiceActive && (
            <div className="border-t border-border px-3 py-3">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-3.5 py-2">
                <input
                  ref={inputRef}
                  id="voice-concierge-input"
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  disabled={isSending}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                />
                <button
                  aria-label={t.send}
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || isSending}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 disabled:opacity-40"
                >
                  {isSending ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="size-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
