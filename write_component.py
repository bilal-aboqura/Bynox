# -*- coding: utf-8 -*-
tsx = (
    "'use client'\n\n"
    "import { useState, useRef, useEffect, useCallback } from 'react'\n"
    "import { MessageCircle, Mic, MicOff, X, Send, Volume2, VolumeX, Loader2, Bot } from 'lucide-react'\n"
    "import type { Locale } from '@/i18n/config'\n\n"
    "type VoiceConciergeProps = {\n"
    "  locale: Locale\n"
    "}\n\n"
    "type Message = {\n"
    "  role: 'user' | 'assistant'\n"
    "  content: string\n"
    "}\n\n"
    "type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error'\n\n"
    "const labels = {\n"
    "  en: {\n"
    "    greeting: \"Hi! I'm Bynox's concierge. How can I help you today?\",\n"
    "    placeholder: 'Ask me anything...',\n"
    "    send: 'Send',\n"
    "    startVoice: 'Start voice chat',\n"
    "    stopVoice: 'Stop voice chat',\n"
    "    voiceConnecting: 'Connecting...',\n"
    "    voiceListening: 'Listening...',\n"
    "    voiceSpeaking: 'Speaking...',\n"
    "    voiceError: 'Microphone access denied.',\n"
    "    open: 'Open concierge',\n"
    "    close: 'Close',\n"
    "    switchToText: 'Switch to text',\n"
    "    mute: 'Mute',\n"
    "    unmute: 'Unmute',\n"
    "  },\n"
    "  ar: {\n"
    "    greeting: '\u0623\u0647\u0644\u064b\u0627! \u0623\u0646\u0627 \u0645\u0633\u0627\u0639\u062f \u0628\u064a\u0646\u0648\u0643\u0633. \u0643\u064a\u0641 \u0623\u0642\u062f\u0631 \u0623\u0633\u0627\u0639\u062f\u0643 \u0627\u0644\u0646\u0647\u0627\u0631\u062f\u0647\u061f',\n"
    "    placeholder: '\u0627\u0633\u0623\u0644\u0646\u064a \u0623\u064a \u062d\u0627\u062c\u0629...',\n"
    "    send: '\u0625\u0631\u0633\u0627\u0644',\n"
    "    startVoice: '\u0627\u0628\u062f\u0623 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629 \u0627\u0644\u0635\u0648\u062a\u064a\u0629',\n"
    "    stopVoice: '\u0623\u0648\u0642\u0641 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629 \u0627\u0644\u0635\u0648\u062a\u064a\u0629',\n"
    "    voiceConnecting: '\u062c\u0627\u0631\u0633 \u0627\u0644\u0627\u062a\u0635\u0627\u0644...',\n"
    "    voiceListening: '\u0628\u0633\u0645\u0639\u0643...',\n"
    "    voiceSpeaking: '\u0628\u062a\u0643\u0644\u0645...',\n"
    "    voiceError: '\u062a\u0645 \u0631\u0641\u0636 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0644\u0645\u064a\u0643\u0631\u0648\u0641\u0648\u0646.',\n"
    "    open: '\u0627\u0641\u062a\u062d \u0627\u0644\u0645\u0633\u0627\u0639\u062f',\n"
    "    close: '\u0625\u063a\u0644\u0627\u0642',\n"
    "    switchToText: '\u062a\u062d\u062f\u062b \u0628\u0627\u0644\u0646\u0635',\n"
    "    mute: '\u0643\u062a\u0645',\n"
    "    unmute: '\u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u062a',\n"
    "  },\n"
    "}\n"
)

rest = r"""
export function VoiceConcierge({ locale }: VoiceConciergeProps) {
  const t = labels[locale]
  const isRtl = locale === 'ar'

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t.greeting },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [isMuted, setIsMuted] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      stopVoice()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopVoice = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null
    }
    setVoiceState('idle')
  }, [])

  function handleClose() {
    setIsOpen(false)
    stopVoice()
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || isSending) return

    const userMessage: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsSending(true)

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, messages: updatedMessages }),
      })

      const data = await response.json()
      const reply = data.reply || (locale === 'ar' ? 'Something went wrong.' : 'Something went wrong.')
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Connection failed. Please try again.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function startVoice() {
    setVoiceState('connecting')

    try {
      const tokenResponse = await fetch('/api/realtime/session', { method: 'POST' })
      const { clientSecret } = await tokenResponse.json()

      if (!clientSecret) throw new Error('No client secret returned')

      const pc = new RTCPeerConnection()
      pcRef.current = pc

      const audio = new Audio()
      audio.autoplay = true
      audioRef.current = audio

      pc.ontrack = (event) => {
        audio.srcObject = event.streams[0]
        setVoiceState('speaking')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      const dc = pc.createDataChannel('oai-events')
      dc.onopen = () => setVoiceState('listening')

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const sdpResponse = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        },
      )

      if (!sdpResponse.ok) throw new Error('SDP exchange failed')

      const answerSdp = await sdpResponse.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
      setVoiceState('listening')
    } catch (err) {
      console.error('Voice concierge error', err)
      setVoiceState('error')
      stopVoice()
    }
  }

  function handleToggleMute() {
    if (!localStreamRef.current) return
    const nextMuted = !isMuted
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted
    })
    setIsMuted(nextMuted)
  }

  const isVoiceActive =
    voiceState === 'connecting' || voiceState === 'listening' || voiceState === 'speaking'

  const voiceLabel =
    voiceState === 'connecting'
      ? t.voiceConnecting
      : voiceState === 'listening'
        ? t.voiceListening
        : voiceState === 'speaking'
          ? t.voiceSpeaking
          : voiceState === 'error'
            ? t.voiceError
            : ''

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
                {locale === 'ar' ? 'Bynox' : 'Bynox Concierge'}
              </p>
              <p className="text-xs text-primary-foreground/60">
                {isVoiceActive ? voiceLabel : 'Here to help'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label={isVoiceActive ? t.stopVoice : t.startVoice}
                onClick={isVoiceActive ? stopVoice : startVoice}
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
                    <MicOff className="size-5 text-primary-foreground" aria-hidden="true" />
                  ) : (
                    <Mic className="size-5 text-primary-foreground" aria-hidden="true" />
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
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === 'user'
                    ? isRtl
                      ? 'justify-start'
                      : 'justify-end'
                    : isRtl
                      ? 'justify-end'
                      : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className={`flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
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
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  disabled={isSending}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                />
                <button
                  aria-label={t.send}
                  onClick={handleSend}
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
"""

with open('f:/CodingProjects/Bynox/components/voice-concierge.tsx', 'w', encoding='utf-8') as f:
    f.write(tsx + rest)
print('Done')