import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function NotificationTester() {
  const [permission, setPermission] = useState(Notification.permission)
  const [subscribed, setSubscribed] = useState(false)

  async function requestPermission() {
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  async function subscribe() {
    if (!("serviceWorker" in navigator)) return alert("SW not supported")
    const reg = await navigator.serviceWorker.ready

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY
      ),
    })

    const { error } = await supabase.from("subscriptions").insert({
      endpoint: sub.endpoint,
      keys: sub.toJSON().keys,
    })

    if (error) console.error(error)
    else setSubscribed(true)
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-80 text-center">
      <h1 className="text-xl font-bold mb-4">Notification Tester</h1>
      <p>Permission: {permission}</p>
      {permission !== "granted" && (
        <button
          onClick={requestPermission}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Enable Notifications
        </button>
      )}
      {permission === "granted" && !subscribed && (
        <button
          onClick={subscribe}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Subscribe to Push
        </button>
      )}
      {subscribed && (
        <p className="text-green-600 mt-3">✅ Subscribed successfully!</p>
      )}
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/")

  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}