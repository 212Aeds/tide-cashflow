import { seed } from './plan.js'

const isPlan = value => value && Array.isArray(value.invoices) && Array.isArray(value.weeklyIncome) && Array.isArray(value.weeklyBills)

export function readPlanCache(storage, uid) {
  try {
    const saved = JSON.parse(storage.getItem(`tide-plan-${uid}`))
    if (isPlan(saved?.plan)) return { plan: saved.plan, dirty: saved.dirty === true }
    if (isPlan(saved)) return { plan: saved, dirty: false }
  } catch { /* invalid or unavailable browser storage */ }
  return null
}

export function writePlanCache(storage, uid, plan, dirty) {
  try {
    storage.setItem(`tide-plan-${uid}`, JSON.stringify({ plan, dirty }))
    return true
  } catch { return false }
}

export function selectPlan(remotePlan, cached) {
  if (cached?.dirty) return { plan: cached.plan, shouldSave: true }
  if (isPlan(remotePlan)) return { plan: remotePlan, shouldSave: false }
  if (cached) return { plan: cached.plan, shouldSave: true }
  return { plan: seed, shouldSave: false }
}
