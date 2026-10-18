import { describe, expect, it } from 'vitest'
import { blankPlan, calculateLoan, forecast, getPlanSummary, isBlankPlan, isSamplePlan, removeInvoice, seed, setInvoiceStatus, upcomingWeekStart, weeks, weeksForPlan } from './plan.js'

describe('six-week money plan', () => {
  it('starts new plans on the upcoming Monday and preserves old plan dates', () => {
    expect(upcomingWeekStart(new Date(2026, 9, 17))).toBe('2026-10-19')
    expect(upcomingWeekStart(new Date(2026, 9, 19))).toBe('2026-10-19')
    expect(weeksForPlan({ startDate: '2026-12-28' })).toEqual(['Dec 28', 'Jan 4', 'Jan 11', 'Jan 18', 'Jan 25', 'Feb 1'])
    expect(weeksForPlan({})).toEqual(['Oct 19', 'Oct 26', 'Nov 2', 'Nov 9', 'Nov 16', 'Nov 23'])
  })

  it('changes week labels without changing the amounts or balances', () => {
    const shifted = { ...seed, startDate: '2027-01-04' }
    expect(forecast(shifted)[0].label).toBe('Jan 4')
    expect(forecast(shifted).map(point => point.balance)).toEqual(forecast(seed).map(point => point.balance))
  })
  it('starts the sample with bills covered every week', () => {
    const points = forecast(seed)
    expect(points.map(point => point.balance)).toEqual([11700, 9900, 11700, 7800, 9300, 7700])
    expect(getPlanSummary(seed, points)).toMatchObject({ lowest: 7700, shortfall: 0, bufferGap: 0 })
  })

  it('moves a delayed invoice into the new week and updates the safety gap', () => {
    const plan = structuredClone(seed)
    plan.invoices[1] = { ...plan.invoices[1], status: 'late', lateWeek: 3 }
    const points = forecast(plan)
    expect(points[1].invoiceIncome).toBe(0)
    expect(points[3].invoiceIncome).toBe(6200)
    expect(getPlanSummary(plan, points)).toMatchObject({ lowest: 3700, shortfall: 0, bufferGap: 1300, firstGap: weeks[1] })
    expect(setInvoiceStatus(plan, 2, 'expected').invoices[1]).not.toHaveProperty('lateWeek')
  })

  it('adds a named bill in its due week and passes the larger gap to borrowing', () => {
    const plan = { ...seed, extraBills: [{ id: 'rent', name: 'Rent', amount: 5000, week: 1 }] }
    const points = forecast(plan)
    expect(points[1].bills).toBe(15500)
    expect(getPlanSummary(plan, points)).toMatchObject({ lowest: 2700, shortfall: 0, bufferGap: 2300 })
  })

  it('separates a real bill shortfall from a chosen safety amount', () => {
    const plan = { ...seed, opening: 0, buffer: 5000 }
    const summary = getPlanSummary(plan, forecast(plan))
    expect(summary.shortfall).toBe(300)
    expect(summary.bufferGap).toBe(5300)
  })

  it('respects a changed safety amount without changing cash balances', () => {
    const plan = { ...seed, buffer: 10000 }
    expect(forecast(plan).map(point => point.balance)).toEqual(forecast(seed).map(point => point.balance))
    expect(getPlanSummary(plan, forecast(plan)).bufferGap).toBe(2300)
  })

  it('moves a received invoice into cash now and removes it from future income', () => {
    const paid = setInvoiceStatus(seed, 2, 'paid')
    const points = forecast(paid)
    expect(paid.opening).toBe(14200)
    expect(points[0].balance).toBe(17900)
    expect(points[1].invoiceIncome).toBe(0)
    expect(setInvoiceStatus(paid, 2, 'expected').opening).toBe(8000)
  })

  it('removes a paid invoice from starting cash as well as the list', () => {
    const paid = setInvoiceStatus(seed, 2, 'paid')
    const removed = removeInvoice(paid, 2)
    expect(removed.opening).toBe(seed.opening)
    expect(removed.invoices.find(item => item.id === 2)).toBeUndefined()
    expect(removeInvoice(seed, 1).opening).toBe(seed.opening)
  })

  it('offers a genuinely empty plan when replacing the sample', () => {
    expect(isBlankPlan(blankPlan)).toBe(true)
    expect(isBlankPlan(seed)).toBe(false)
    expect(isSamplePlan(seed)).toBe(true)
    expect(isSamplePlan(setInvoiceStatus(seed, 2, 'late'))).toBe(true)
    expect(isSamplePlan({ ...seed, opening: 9000 })).toBe(false)
    expect(forecast(blankPlan).every(point => point.balance === 0)).toBe(true)
  })
})

describe('borrowing cost', () => {
  it('calculates an amortized example at 14% APR over six months', () => {
    const quote = calculateLoan(1300, 14, 6)
    expect(quote.monthlyPayment).toBeCloseTo(225.60, 2)
    expect(quote.totalRepayment).toBeGreaterThan(1300)
    expect(quote.interest).toBeCloseTo(quote.totalRepayment - 1300, 6)
  })

  it('does not add interest to a zero-rate example', () => {
    expect(calculateLoan(1200, 0, 6)).toEqual({ monthlyPayment: 200, totalRepayment: 1200, interest: 0 })
  })
})
