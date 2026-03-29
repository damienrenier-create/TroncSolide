
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface PushReminderPopupProps {
  user: {
    id: string
    nickname: string
    currentStreak: number
    pushReminderEnabled: boolean
  }
}

export function PushReminderPopup({ user }: PushReminderPopupProps) {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Show only if streak is broken (0) AND rewards not enabled
    if (user.currentStreak === 0 && !user.pushReminderEnabled) {
      // Check if user already dismissed this session
      const dismissed = sessionStorage.getItem("push_nudge_dismissed")
      if (!dismissed) {
        setShow(true)
      }
    }
  }, [user])

  const subscribeToPush = async () => {
    setLoading(true)
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Workers not supported')
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        throw new Error('Permission not granted')
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID Public Key missing')
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      })

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscription })
      })

      if (response.ok) {
        setShow(false)
        router.refresh()
      } else {
        throw new Error('Failed to subscribe on server')
      }
    } catch (error) {
      console.error('Failed to subscribe:', error)
      alert("Impossible d'activer les notifications. Vérifie les réglages de ton navigateur.")
    } finally {
      setLoading(false)
    }
  }

  const dismiss = () => {
    setShow(false)
    sessionStorage.setItem("push_nudge_dismissed", "true")
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center">
            <span className="text-3xl">🎯</span>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Oops, streak à zéro !</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Il est difficile de rester constant. Veux-tu un petit rappel à 18h si tu n'as pas encore validé tes efforts ?
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 pt-2">
            <button
              onClick={subscribeToPush}
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {loading ? "Activation..." : "Activer le rappel (18h)"}
            </button>
            <button
              onClick={dismiss}
              className="w-full text-zinc-500 font-medium py-2 text-sm hover:text-zinc-300 transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
