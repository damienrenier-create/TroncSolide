
"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface PushSettingsToggleProps {
  user: {
    id: string
    pushReminderEnabled: boolean
  }
}

export function PushSettingsToggle({ user }: PushSettingsToggleProps) {
  const [enabled, setEnabled] = useState(user.pushReminderEnabled)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const togglePush = async () => {
    setLoading(true)
    try {
      if (!enabled) {
        // ACTIVATE
        if (!('serviceWorker' in navigator)) {
          alert("Les notifications ne sont pas supportées par ton navigateur.")
          return
        }

        const registration = await navigator.serviceWorker.register('/sw.js')
        const permission = await Notification.requestPermission()
        
        if (permission !== 'granted') {
          alert("Tu as bloqué les notifications. Change les réglages de ton navigateur pour les autoriser.")
          return
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidPublicKey) {
          console.error("VAPID Public Key missing")
          return
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        })

        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription })
        })

        if (response.ok) {
          setEnabled(true)
          router.refresh()
        }
      } else {
        // DEACTIVATE
        const registration = await navigator.serviceWorker.getRegistration()
        const subscription = await registration?.pushManager.getSubscription()
        
        if (subscription) {
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint })
          })
          await subscription.unsubscribe()
        } else {
          // Fallback if no subscription found locally but enabled in DB
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ })
          })
        }
        
        setEnabled(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Toggle error:", error)
      alert("Une erreur est survenue lors de la modification des réglages.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-800 text-zinc-500'}`}>
          {enabled ? <Bell size={20} /> : <BellOff size={20} />}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Rappels quotidiens (18h)</h4>
          <p className="text-xs text-zinc-500">Notife si ton objectif n'est pas atteint</p>
        </div>
      </div>

      <button
        onClick={togglePush}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-orange-500' : 'bg-zinc-700'}`}
      >
        <span className="sr-only">Activer les notifications</span>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-white translate-x-3.5" />
        ) : (
          <span
            className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        )}
      </button>
    </div>
  )
}
