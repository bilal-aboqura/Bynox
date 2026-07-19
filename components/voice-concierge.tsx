'use client'

import { useEffect, useRef, useState } from 'react'
import { GoogleGenAI, type LiveServerMessage } from '@google/genai'
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
import type { Locale } from '@/i18n/config'
import {
  bookingFields,
  websiteSections,
  type BookingField,
  type WebsiteSection,
} from '@/lib/website-control'

type VoiceConciergeProps = {
  locale: Locale
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error'

const liveModel = 'gemini-3.1-flash-live-preview'

const labels = {
  greeting: 'أهلاً، أنا مساعد The Lobby. قول لي تحب إيه.',
  placeholder: 'اسأل عن الغرف أو المنيو أو الحجز...',
  send: 'إرسال',
  startVoice: 'ابدأ الصوت',
  stopVoice: 'اقفل الصوت',
  voiceConnecting: 'بوصّل...',
  voiceListening: 'بسمعك...',
  voiceSpeaking: 'برد عليك...',
  voiceError: 'في مشكلة في الصوت دلوقتي.',
  open: 'اسأل The Lobby',
  close: 'إغلاق',
  switchToText: 'كمّل كتابة',
  mute: 'كتم',
  unmute: 'فتح الصوت',
  idle: 'اتكلم براحتك',
} as const

function appendTranscript(current: string, next: string) {
  const value = next.trim()

  if (!value) {
    return current
  }

  if (!current) {
    return value
  }

  if (value.startsWith(current)) {
    return value
  }

  if (current.endsWith(value)) {
    return current
  }

  return `${current} ${value}`
}

function base64ToInt16(data: string) {
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new Int16Array(bytes.buffer)
}

function downsampleTo16k(input: Float32Array, sampleRate: number) {
  if (sampleRate === 16000) {
    return input
  }

  const ratio = sampleRate / 16000
  const outputLength = Math.round(input.length / ratio)
  const output = new Float32Array(outputLength)

  for (let index = 0; index < outputLength; index += 1) {
    const start = Math.floor(index * ratio)
    const end = Math.min(Math.floor((index + 1) * ratio), input.length)
    let total = 0

    for (let sourceIndex = start; sourceIndex < end; sourceIndex += 1) {
      total += input[sourceIndex]
    }

    output[index] = total / Math.max(1, end - start)
  }

  return output
}

function float32ToBase64(input: Float32Array) {
  const pcm = new Int16Array(input.length)

  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index]))
    pcm[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
  }

  const bytes = new Uint8Array(pcm.buffer)
  let binary = ''

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index])
  }

  return btoa(binary)
}

type LiveClientHandlers = {
  onInputTranscript: (text: string) => void
  onOutputTranscript: (text: string) => void
  onTurnComplete: () => void
  onSpeaking: () => void
  onListening: () => void
  onWebsiteControl: (message: string) => void
  onError: (error: unknown) => void
}

class GeminiLiveClient {
  private session: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null = null
  private audioContext: AudioContext | null = null
  private microphoneStream: MediaStream | null = null
  private microphoneSource: MediaStreamAudioSourceNode | null = null
  private microphoneProcessor: ScriptProcessorNode | null = null
  private muteOutput = false
  private playbackTime = 0
  private playbackSources = new Set<AudioBufferSourceNode>()

  constructor(private readonly handlers: LiveClientHandlers) {}

  async connect(token: string, model: string) {
    this.audioContext = new AudioContext()
    await this.audioContext.resume()

    const client = new GoogleGenAI({
      apiKey: token,
      httpOptions: { apiVersion: 'v1alpha' },
    })

    this.session = await client.live.connect({
      model,
      callbacks: {
        onmessage: (message) => this.handleMessage(message),
        onerror: (event) => this.handlers.onError(event.error || event.message),
        onclose: () => this.handlers.onListening(),
      },
    })

    this.microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    this.microphoneSource = this.audioContext.createMediaStreamSource(
      this.microphoneStream,
    )
    this.microphoneProcessor = this.audioContext.createScriptProcessor(4096, 1, 1)
    this.microphoneProcessor.onaudioprocess = (event) => {
      const audio = downsampleTo16k(
        event.inputBuffer.getChannelData(0),
        this.audioContext?.sampleRate || 48000,
      )

      this.session?.sendRealtimeInput({
        audio: {
          data: float32ToBase64(audio),
          mimeType: 'audio/pcm;rate=16000',
        },
      })
    }

    const silentGain = this.audioContext.createGain()
    silentGain.gain.value = 0
    this.microphoneSource.connect(this.microphoneProcessor)
    this.microphoneProcessor.connect(silentGain)
    silentGain.connect(this.audioContext.destination)
  }

  private handleMessage(message: LiveServerMessage) {
    const content = message.serverContent

    if (!content) {
      return
    }

    if (content.interrupted) {
      this.stopPlayback()
      this.handlers.onListening()
    }

    if (content.inputTranscription?.text) {
      this.handlers.onInputTranscript(content.inputTranscription.text)
    }

    if (content.outputTranscription?.text) {
      this.handlers.onOutputTranscript(content.outputTranscription.text)
    }

    for (const part of content.modelTurn?.parts || []) {
      if (part.inlineData?.data) {
        this.handlers.onSpeaking()
        this.enqueuePlayback(part.inlineData.data)
      }

      // This is a fallback for configurations where output transcription is
      // not returned alongside native audio.
      if (part.text && !content.outputTranscription?.text) {
        this.handlers.onOutputTranscript(part.text)
      }
    }

    if (message.toolCall?.functionCalls?.length) {
      void this.handleToolCalls(message.toolCall.functionCalls)
    }

    if (content.turnComplete) {
      this.handlers.onTurnComplete()
    }
  }

  private async handleToolCalls(
    functionCalls: Array<{
      id?: string
      name?: string
      args?: Record<string, unknown>
    }>,
  ) {
    const functionResponses = await Promise.all(
      functionCalls.map(async (functionCall) => {
        if (
          functionCall.name === 'scroll_to_section' ||
          functionCall.name === 'focus_booking_field'
        ) {
          const result = this.controlWebsite(
            functionCall.name,
            functionCall.args || {},
          )
          this.handlers.onWebsiteControl(result)

          return {
            id: functionCall.id,
            name: functionCall.name,
            response: result.startsWith('Done')
              ? { output: result }
              : { error: result },
          }
        }

        if (functionCall.name !== 'create_booking_request') {
          return {
            id: functionCall.id,
            name: functionCall.name,
            response: { error: 'Unknown function.' },
          }
        }

        try {
          const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              locale: 'ar',
              ...(functionCall.args || {}),
              source: 'ai-assistant',
            }),
          })
          const data = await response.json()

          return {
            id: functionCall.id,
            name: functionCall.name,
            response: response.ok
              ? { output: data }
              : { error: data.error || 'Booking failed.' },
          }
        } catch (error) {
          return {
            id: functionCall.id,
            name: functionCall.name,
            response: {
              error:
                error instanceof Error ? error.message : 'Booking failed.',
            },
          }
        }
      }),
    )

    this.session?.sendToolResponse({ functionResponses })
  }

  private controlWebsite(
    name: string | undefined,
    args: Record<string, unknown>,
  ) {
    if (name === 'scroll_to_section') {
      const section = String(args.section || '') as WebsiteSection

      if (!websiteSections.includes(section)) {
        return 'I could not find that website section.'
      }

      const element = document.getElementById(section)

      if (!element) {
        return 'That website section is not available on this page.'
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return `Done. I scrolled to the ${section} section.`
    }

    const field = String(args.field || '') as BookingField

    if (!bookingFields.includes(field)) {
      return 'I could not find that booking field.'
    }

    const bookingSection = document.getElementById('booking')
    const fieldElement = document.getElementById(field) as HTMLInputElement | null

    if (!bookingSection || !fieldElement) {
      return 'The booking form is not available on this page.'
    }

    bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    fieldElement.focus({ preventScroll: true })
    fieldElement.dataset.agentFocused = 'true'
    window.setTimeout(() => {
      delete fieldElement.dataset.agentFocused
    }, 1400)

    return `Done. I focused the ${field} booking field.`
  }

  private enqueuePlayback(data: string) {
    if (!this.audioContext || this.muteOutput) {
      return
    }

    const samples = base64ToInt16(data)
    const audioBuffer = this.audioContext.createBuffer(
      1,
      samples.length,
      24000,
    )
    const channel = audioBuffer.getChannelData(0)

    for (let index = 0; index < samples.length; index += 1) {
      channel[index] = samples[index] / 0x8000
    }

    const source = this.audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.audioContext.destination)
    this.playbackSources.add(source)

    const startAt = Math.max(this.audioContext.currentTime, this.playbackTime)
    source.start(startAt)
    this.playbackTime = startAt + audioBuffer.duration
    source.onended = () => this.playbackSources.delete(source)
  }

  private stopPlayback() {
    for (const source of this.playbackSources) {
      try {
        source.stop()
      } catch {
        // A source may already have finished between the interruption event
        // and this cleanup loop.
      }
    }

    this.playbackSources.clear()
    this.playbackTime = 0
  }

  sendText(text: string) {
    this.session?.sendRealtimeInput({ text })
  }

  setMuted(nextMuted: boolean) {
    this.muteOutput = nextMuted

    if (nextMuted) {
      this.stopPlayback()
    }
  }

  close() {
    this.stopPlayback()
    this.microphoneProcessor?.disconnect()
    this.microphoneSource?.disconnect()
    this.microphoneStream?.getTracks().forEach((track) => track.stop())
    this.session?.close()
    void this.audioContext?.close()
    this.microphoneProcessor = null
    this.microphoneSource = null
    this.microphoneStream = null
    this.session = null
    this.audioContext = null
  }
}

function localizeVoiceError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '')
  const normalized = message.toLowerCase()

  if (normalized.includes('missing gemini_api_key')) {
    return 'مفتاح Gemini مش متضبط على السيرفر.'
  }

  if (normalized.includes('permission') || normalized.includes('microphone')) {
    return 'اسمح للمتصفح باستخدام الميكروفون عشان الصوت يشتغل.'
  }

  return labels.voiceError
}

function localizeWebsiteControlStatus(message: string) {
  if (message.startsWith('Done. I scrolled')) {
    return 'وصلت للقسم المطلوب.'
  }

  if (message.startsWith('Done. I focused')) {
    return 'جهزت خانة الحجز.'
  }

  return 'مش قادر أوصل للمكان ده دلوقتي.'
}

export function VoiceConcierge({ locale: _locale }: VoiceConciergeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: labels.greeting },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [websiteControlStatus, setWebsiteControlStatus] = useState<string | null>(
    null,
  )
  const [liveInput, setLiveInput] = useState('')
  const [liveOutput, setLiveOutput] = useState('')

  const clientRef = useRef<GeminiLiveClient | null>(null)
  const inputTranscriptRef = useRef('')
  const outputTranscriptRef = useRef('')
  const outputTranscriptionTimerRef = useRef<number | null>(null)
  const websiteControlTimerRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, liveInput, liveOutput])

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (outputTranscriptionTimerRef.current) {
        window.clearTimeout(outputTranscriptionTimerRef.current)
      }
      if (websiteControlTimerRef.current) {
        window.clearTimeout(websiteControlTimerRef.current)
      }
      clientRef.current?.close()
    }
  }, [])

  function commitLiveTranscripts() {
    const userText = inputTranscriptRef.current.trim()
    const assistantText = outputTranscriptRef.current.trim()

    if (userText || assistantText) {
      setMessages((current) => [
        ...current,
        ...(userText
          ? [{ id: crypto.randomUUID(), role: 'user' as const, content: userText }]
          : []),
        ...(assistantText
          ? [
              {
                id: crypto.randomUUID(),
                role: 'assistant' as const,
                content: assistantText,
              },
            ]
          : []),
      ])
    }

    inputTranscriptRef.current = ''
    outputTranscriptRef.current = ''
    setLiveInput('')
    setLiveOutput('')
  }

  async function startVoice() {
    let nextClient: GeminiLiveClient | null = null

    try {
      setVoiceState('connecting')
      setError(null)

      const response = await fetch('/api/realtime/session', { method: 'POST' })
      const data = await response.json()

      if (!response.ok || !data.token) {
        throw new Error(data.error || 'Failed to create a Gemini Live token.')
      }

      nextClient = new GeminiLiveClient({
        onInputTranscript: (text) => {
          inputTranscriptRef.current = appendTranscript(
            inputTranscriptRef.current,
            text,
          )
          setLiveInput(inputTranscriptRef.current)
          setVoiceState('listening')
        },
        onOutputTranscript: (text) => {
          outputTranscriptRef.current = appendTranscript(
            outputTranscriptRef.current,
            text,
          )
          setLiveOutput(outputTranscriptRef.current)
          setVoiceState('speaking')
        },
        onTurnComplete: () => {
          if (outputTranscriptionTimerRef.current) {
            window.clearTimeout(outputTranscriptionTimerRef.current)
          }
          outputTranscriptionTimerRef.current = window.setTimeout(() => {
            commitLiveTranscripts()
            setVoiceState('listening')
          }, 250)
        },
        onSpeaking: () => setVoiceState('speaking'),
        onListening: () => setVoiceState('listening'),
        onWebsiteControl: (message) => {
          setWebsiteControlStatus(localizeWebsiteControlStatus(message))
          if (websiteControlTimerRef.current) {
            window.clearTimeout(websiteControlTimerRef.current)
          }
          websiteControlTimerRef.current = window.setTimeout(() => {
            setWebsiteControlStatus(null)
          }, 2200)
        },
        onError: (voiceError) => {
          setError(localizeVoiceError(voiceError))
          setVoiceState('error')
        },
      })

      await nextClient.connect(data.token, data.model || liveModel)
      clientRef.current = nextClient
      setIsMuted(false)
      setVoiceState('listening')
    } catch (caughtError) {
      nextClient?.close()
      clientRef.current?.close()
      clientRef.current = null
      setError(localizeVoiceError(caughtError))
      setVoiceState('error')
    }
  }

  function stopVoice() {
    if (outputTranscriptionTimerRef.current) {
      window.clearTimeout(outputTranscriptionTimerRef.current)
      outputTranscriptionTimerRef.current = null
    }
    if (websiteControlTimerRef.current) {
      window.clearTimeout(websiteControlTimerRef.current)
      websiteControlTimerRef.current = null
    }
    clientRef.current?.close()
    clientRef.current = null
    commitLiveTranscripts()
    setIsMuted(false)
    setWebsiteControlStatus(null)
    setVoiceState('idle')
  }

  function handleClose() {
    setIsOpen(false)
    stopVoice()
  }

  async function sendTextToServer(nextMessages: Message[]) {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale: 'ar',
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
      }),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Assistant request failed.')
    }

    return data.reply as string
  }

  async function handleSend() {
    const text = input.trim()

    if (!text || isSending) {
      return
    }

    setInput('')
    setError(null)

    if (clientRef.current && voiceState !== 'idle' && voiceState !== 'error') {
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'user', content: text },
      ])
      clientRef.current.sendText(text)
      return
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }

    setIsSending(true)

    try {
      const nextMessages = [...messages, userMessage]
      setMessages(nextMessages)
      const reply = await sendTextToServer(nextMessages)
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', content: reply },
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
    if (!clientRef.current) {
      return
    }

    const nextMuted = !isMuted
    clientRef.current.setMuted(nextMuted)
    setIsMuted(nextMuted)
  }

  const isVoiceActive =
    voiceState === 'connecting' ||
    voiceState === 'listening' ||
    voiceState === 'speaking'
  const isVoiceLive = voiceState === 'listening' || voiceState === 'speaking'

  const voiceLabel =
    error ||
    (voiceState === 'connecting'
      ? labels.voiceConnecting
      : voiceState === 'listening'
        ? labels.voiceListening
        : voiceState === 'speaking'
          ? labels.voiceSpeaking
          : voiceState === 'error'
            ? labels.voiceError
            : labels.idle)

  return (
    <>
      {!isOpen && (
        <button
          id="voice-concierge-trigger"
          aria-label={labels.open}
          title={labels.open}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 sm:bottom-6 sm:right-6"
          style={{ direction: 'ltr' }}
        >
          <Bot className="size-6 text-primary-foreground" aria-hidden="true" />
          <span className="pointer-events-none absolute size-14 animate-ping rounded-full bg-primary/30 motion-reduce:animate-none" />
        </button>
      )}

      {isOpen && (
        <div
          id="voice-concierge-panel"
          role="dialog"
          aria-label={labels.open}
          aria-modal="false"
          dir="rtl"
          className="fixed inset-x-4 bottom-4 z-50 flex max-h-[min(42rem,calc(100dvh-2rem))] w-auto flex-col overflow-hidden rounded-2xl bg-card shadow-2xl shadow-black/20 ring-1 ring-border sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96"
        >
          <div className="flex items-center gap-3 border-b border-border bg-foreground px-4 py-3.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary">
              <Bot className="size-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-primary-foreground">The Lobby</p>
                {isVoiceLive && (
                  <span className="flex items-center gap-1 rounded-full bg-mint/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-mint">
                    <span className="size-1.5 rounded-full bg-mint" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-primary-foreground/60">
                <span
                  className={`size-1.5 rounded-full ${
                    isVoiceLive
                      ? 'bg-mint shadow-[0_0_0_3px_rgba(185,227,198,0.16)]'
                      : voiceState === 'error'
                        ? 'bg-destructive'
                        : 'bg-primary-foreground/40'
                  }`}
                />
                <p className="truncate">{voiceLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={isVoiceActive ? labels.stopVoice : labels.startVoice}
                aria-busy={voiceState === 'connecting'}
                onClick={isVoiceActive ? stopVoice : () => void startVoice()}
                className={`flex size-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-foreground ${
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
                  type="button"
                  aria-label={isMuted ? labels.unmute : labels.mute}
                  aria-pressed={isMuted}
                  onClick={handleToggleMute}
                  className="flex size-9 items-center justify-center rounded-full text-primary-foreground/60 transition-colors hover:bg-white/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-foreground"
                >
                  {isMuted ? (
                    <VolumeX className="size-4" aria-hidden="true" />
                  ) : (
                    <Volume2 className="size-4" aria-hidden="true" />
                  )}
                </button>
              )}
              <button
                type="button"
                aria-label={labels.close}
                onClick={handleClose}
                className="flex size-9 items-center justify-center rounded-full text-primary-foreground/60 transition-colors hover:bg-white/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {isVoiceActive && (
            <div className="flex flex-col items-center gap-4 bg-foreground/[0.03] px-4 py-7">
              <div
                className="relative flex size-20 items-center justify-center"
                aria-label={voiceLabel}
                role="img"
              >
                <span
                  className={`absolute size-20 rounded-full bg-primary/20 ${
                    voiceState === 'listening' ? 'animate-ping motion-reduce:animate-none' : ''
                  }`}
                />
                <span
                  className={`absolute size-14 rounded-full bg-primary/30 ${
                    voiceState === 'speaking' ? 'animate-pulse motion-reduce:animate-none' : ''
                  }`}
                />
                <span className="relative flex size-10 items-center justify-center rounded-full bg-primary">
                  {isMuted ? (
                    <MicOff className="size-5 text-primary-foreground" aria-hidden="true" />
                  ) : (
                    <Mic className="size-5 text-primary-foreground" aria-hidden="true" />
                  )}
                </span>
              </div>
              <div className="flex h-7 items-end gap-1" aria-hidden="true">
                {[3, 5, 7, 4, 6, 3].map((height, index) => (
                  <span
                    key={index}
                    className={`voice-meter-bar w-1 rounded-full bg-primary/70 ${
                      voiceState === 'speaking' ? 'voice-meter-bar-active' : ''
                    }`}
                    style={{ height: `${height * 3}px` }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-foreground">{voiceLabel}</p>
              {websiteControlStatus && (
                <p
                  aria-live="polite"
                  className="rounded-full bg-primary/10 px-3 py-1 text-center text-xs font-medium text-primary"
                >
                  {websiteControlStatus}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={stopVoice}
                  className="flex min-h-11 items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MessageCircle className="size-3.5" aria-hidden="true" />
                  {labels.switchToText}
                </button>
                <button
                  type="button"
                  onClick={stopVoice}
                  className="min-h-11 rounded-full bg-destructive px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                >
                  {labels.stopVoice}
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

            {liveInput && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl bg-primary/60 px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground">
                  {liveInput}
                </div>
              </div>
            )}

            {liveOutput && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-muted px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
                  {liveOutput}
                </div>
              </div>
            )}

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
                  placeholder={labels.placeholder}
                  disabled={isSending}
                  dir="rtl"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  aria-label={labels.send}
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || isSending}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-40"
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
