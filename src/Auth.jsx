import React, { useEffect, useRef, useState } from 'react'
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import App, { seed } from './App.jsx'
import { auth, configured, db } from './firebase.js'

function messageFor(error) {
  const code = error?.code || ''
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(code)) return 'That email and password did not match. Please try again.'
  if (code === 'auth/email-already-in-use') return 'An account with this email already exists. Choose Sign in.'
  if (code === 'auth/weak-password') return 'Choose a password with at least 6 characters.'
  if (code === 'auth/invalid-email') return 'Please enter a valid email address.'
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a little and try again.'
  if (code === 'auth/unauthorized-domain') return 'This website needs to be added to Firebase Authentication’s authorized domains.'
  if (code === 'auth/operation-not-allowed') return 'This sign-in method needs to be enabled in Firebase Authentication.'
  if (code === 'auth/popup-blocked') return 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.'
  if (code === 'auth/popup-closed-by-user') return 'Google sign-in was closed. You can try again.'
  if (code === 'auth/account-exists-with-different-credential') return 'An account with this email already uses another sign-in method. Sign in with that method first.'
  if (code === 'permission-denied' || error?.message?.includes('Cloud Firestore API')) return 'Online saving is not ready yet.'
  return error?.message || 'Something went wrong. Please try again.'
}

function SignIn() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setNotice('')
    try {
      if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email.trim())
        setNotice('If this email has an account, a reset link is on its way. Check your inbox.')
      } else if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email.trim(), password)
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      }
    } catch (error) {
      setNotice(messageFor(error))
    } finally {
      setBusy(false)
    }
  }

  async function googleSignIn() {
    setBusy(true)
    setNotice('')
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (error) {
      setNotice(messageFor(error))
    } finally {
      setBusy(false)
    }
  }

  return <div className="auth-page"><div className="auth-card">
    <div className="auth-brand"><div className="brand-mark"><span /></div><span>tide<span className="brand-period">.</span></span></div>
    <div className="auth-icon"><LockKeyhole size={23}/></div>
    <div className="section-kicker">YOUR MONEY, MADE CLEAR</div>
    <h1>{mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back'}</h1>
    <p>{mode === 'signup' ? 'Save your money plan and return to it any time.' : mode === 'reset' ? 'Enter your email and we’ll send you a reset link.' : 'Sign in to see your client payments, bills, and cash forecast.'}</p>
    <form onSubmit={submit}>
      <label>Email address<div className="auth-input"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="you@business.com" required/></div></label>
      {mode !== 'reset' && <label>Password<div className="auth-input"><LockKeyhole size={17}/><input type="password" minLength={mode === 'signup' ? 6 : undefined} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder="Your password" required/></div></label>}
      {notice && <div className="auth-notice" role="status">{notice}</div>}
      <button className="primary-button auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'} <ArrowRight size={17}/></button>
    </form>
    {mode !== 'reset' && <><div className="auth-divider"><span>or</span></div><button type="button" className="google-button" onClick={googleSignIn} disabled={busy}><span className="google-g" aria-hidden="true">G</span> Continue with Google</button></>}
    <div className="auth-links">{mode !== 'reset' && <button type="button" onClick={()=>{setMode(mode === 'signup' ? 'signin' : 'signup');setNotice('')}}>{mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>}<button type="button" onClick={()=>{setMode(mode === 'reset' ? 'signin' : 'reset');setNotice('')}}>{mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}</button></div>
    <div className="auth-foot"><ShieldCheck size={16}/> Changes to your plan save automatically.</div>
  </div></div>
}

export default function AuthGate() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [plan, setPlan] = useState(null)
  const [saveState, setSaveState] = useState('Saved')
  const [loadError, setLoadError] = useState('')
  const [revision, setRevision] = useState(0)
  const planRef = useRef(null)
  const saveTimer = useRef(null)

  useEffect(() => {
    if (!configured) return
    return onAuthStateChanged(auth, nextUser => {
      clearTimeout(saveTimer.current)
      setUser(nextUser)
      setPlan(null)
      planRef.current = null
      setRevision(0)
      setAuthReady(true)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const cacheKey = `tide-plan-${user.uid}`
    getDoc(doc(db, 'users', user.uid)).then(snapshot => {
      if (cancelled) return
      const saved = snapshot.data()?.plan
      const nextPlan = saved && Array.isArray(saved.invoices) && Array.isArray(saved.weeklyBills) ? saved : seed
      planRef.current = nextPlan
      setPlan(nextPlan)
      setSaveState('Saved')
      setLoadError('')
      localStorage.setItem(cacheKey, JSON.stringify(nextPlan))
    }).catch(error => {
      if (cancelled) return
      let cached = null
      try { cached = JSON.parse(localStorage.getItem(cacheKey)) } catch { /* no local copy */ }
      if (cached && Array.isArray(cached.invoices) && Array.isArray(cached.weeklyBills)) {
        planRef.current = cached
        setPlan(cached)
        setLoadError(`${messageFor(error)} Changes will stay on this device until online saving works.`)
        setSaveState('Saved on this device')
      } else {
        planRef.current = seed
        setPlan(seed)
        setLoadError(`${messageFor(error)} You can use the sample plan here, but changes will stay on this device.`)
        setSaveState('Saved on this device')
      }
    })
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    if (!user || !plan || !revision) return
    clearTimeout(saveTimer.current)
    const cacheKey = `tide-plan-${user.uid}`
    localStorage.setItem(cacheKey, JSON.stringify(plan))
    setSaveState('Saving…')
    saveTimer.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), { plan: planRef.current, updatedAt: serverTimestamp() })
        setSaveState('Saved to your account')
        setLoadError('')
      } catch (error) {
        setSaveState('Saved on this device')
        setLoadError(`${messageFor(error)} Changes are saved on this device.`)
      }
    }, 500)
    return () => clearTimeout(saveTimer.current)
  }, [plan, revision, user])

  function updatePlan(updater) {
    const next = typeof updater === 'function' ? updater(planRef.current) : updater
    planRef.current = next
    setPlan(next)
    setRevision(value => value + 1)
  }

  async function handleSignOut() {
    clearTimeout(saveTimer.current)
    if (revision && planRef.current) {
      try { await setDoc(doc(db, 'users', user.uid), { plan: planRef.current, updatedAt: serverTimestamp() }) }
      catch { /* local copy remains under this account */ }
    }
    await signOut(auth)
  }

  if (!configured) return <div className="auth-page"><div className="auth-card"><div className="auth-brand"><div className="brand-mark"><span/></div><span>tide<span className="brand-period">.</span></span></div><h1>Account setup needed</h1><p>Firebase configuration is missing. Add the four VITE_FIREBASE values in .env.local and rebuild the website.</p></div></div>
  if (!authReady) return <div className="auth-page"><div className="auth-card"><h1>Opening Tide…</h1></div></div>
  if (!user) return <SignIn/>
  if (!plan) return <div className="auth-page"><div className="auth-card"><h1>Opening your money plan…</h1>{loadError && <div className="auth-notice" role="alert">{loadError}</div>}<button className="outline-button" onClick={handleSignOut}>Sign out</button></div></div>
  return <>{loadError && <div className="sync-banner" role="alert">{loadError}</div>}<App plan={plan} setPlan={updatePlan} user={user} onSignOut={handleSignOut} saveState={saveState}/></>
}
