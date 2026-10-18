import { describe, expect, it } from 'vitest'
import { readPlanCache, selectPlan, writePlanCache } from './planStorage.js'
import { seed } from './plan.js'

function storage() {
  const entries = new Map()
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  }
}

describe('account plan recovery', () => {
  it('keeps unsynced edits when the cloud has an older copy', () => {
    const local = { ...seed, opening: 12000 }
    expect(selectPlan(seed, { plan: local, dirty: true })).toEqual({ plan: local, shouldSave: true })
  })

  it('uses the cloud copy when the local copy has already synced', () => {
    const remote = { ...seed, opening: 9000 }
    expect(selectPlan(remote, { plan: seed, dirty: false })).toEqual({ plan: remote, shouldSave: false })
  })

  it('restores local edits when the cloud document is missing', () => {
    const local = { ...seed, opening: 10500 }
    expect(selectPlan(null, { plan: local, dirty: false })).toEqual({ plan: local, shouldSave: true })
  })

  it('keeps each account cache separate and reads the older cache format', () => {
    const browserStorage = storage()
    writePlanCache(browserStorage, 'user-a', seed, true)
    expect(readPlanCache(browserStorage, 'user-a')).toEqual({ plan: seed, dirty: true })
    expect(readPlanCache(browserStorage, 'user-b')).toBeNull()
    browserStorage.setItem('tide-plan-user-b', JSON.stringify(seed))
    expect(readPlanCache(browserStorage, 'user-b')).toEqual({ plan: seed, dirty: false })
  })
})
