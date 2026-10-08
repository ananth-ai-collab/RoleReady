import { useEffect, useState } from 'react'
import { Download, RefreshCw, WifiOff, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import './pwa.css'

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

declare global {
  interface WindowEventMap {
    beforeinstallprompt: InstallPromptEvent
  }
  interface Navigator {
    standalone?: boolean
  }
}

export function PWAStatus() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [showIos, setShowIos] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('roleready-install-dismissed') === 'true')
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    const handleBeforeInstall = (event: InstallPromptEvent) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    let interactions = 0
    const handleInteraction = () => {
      interactions += 1
      if (interactions >= 2 && !dismissed && !isStandalone) {
        if (deferredPrompt) setShowInstall(true)
        else if (isIos) setShowIos(true)
        window.removeEventListener('pointerdown', handleInteraction)
      }
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('pointerdown', handleInteraction)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('pointerdown', handleInteraction)
    }
  }, [deferredPrompt, dismissed, isIos, isStandalone])

  useEffect(() => {
    if (offlineReady) window.setTimeout(() => undefined, 0)
  }, [offlineReady])

  const dismiss = () => {
    localStorage.setItem('roleready-install-dismissed', 'true')
    setDismissed(true)
    setShowInstall(false)
    setShowIos(false)
  }
  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowInstall(false)
  }

  return <>
    {isOffline && <div className="pwa-network-banner"><WifiOff size={15} /> You are offline. Saved RoleReady content is still available.</div>}
    {!isOffline && offlineReady && <div className="pwa-network-banner pwa-online"><span /> RoleReady is ready to use offline.</div>}
    {needRefresh && <div className="pwa-update-banner"><span>New RoleReady version available.</span><button onClick={() => updateServiceWorker(true)}><RefreshCw size={14} /> Update now</button></div>}
    {showInstall && <div className="pwa-install-sheet"><div className="pwa-install-icon"><Download size={19} /></div><div><b>Install RoleReady</b><p>Get faster access to career roadmaps from your home screen.</p></div><button className="pwa-install-action" onClick={install}>Install</button><button className="pwa-dismiss" aria-label="Dismiss install prompt" onClick={dismiss}><X size={17} /></button></div>}
    {showIos && <div className="pwa-install-sheet ios-sheet"><div className="pwa-install-icon"><Download size={19} /></div><div><b>Install RoleReady on iPhone</b><p>Tap <strong>Share</strong>, choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</p></div><button className="pwa-dismiss" aria-label="Dismiss install instructions" onClick={dismiss}><X size={17} /></button></div>}
  </>
}
