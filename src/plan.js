const legacyStartDate = '2026-10-19'

export function upcomingWeekStart(date = new Date()) {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  day.setUTCDate(day.getUTCDate() + (8 - day.getUTCDay()) % 7)
  return day.toISOString().slice(0, 10)
}

export function weeksForPlan(plan) {
  const raw = plan.startDate || legacyStartDate
  const start = new Date(`${raw}T00:00:00Z`)
  const safeStart = !Number.isNaN(start.getTime()) && start.toISOString().slice(0, 10) === raw
    ? start : new Date(`${legacyStartDate}T00:00:00Z`)
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(safeStart)
    date.setUTCDate(date.getUTCDate() + index * 7)
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date)
  })
}

export const seed = {
  startDate: upcomingWeekStart(),
  opening: 8000,
  buffer: 5000,
  weeklyIncome: [2500, 2500, 2500, 2500, 2500, 2500],
  weeklyBills: [3600, 10500, 4100, 6400, 3900, 4100],
  extraBills: [],
  invoices: [
    { id: 1, client: 'Northstar Studio', number: 'INV-1042', amount: 4800, week: 0, status: 'expected' },
    { id: 2, client: 'Atlas Commerce', number: 'INV-1043', amount: 6200, week: 1, status: 'expected' },
    { id: 3, client: 'Fieldnotes Co.', number: 'INV-1044', amount: 3400, week: 2, status: 'expected' },
    { id: 4, client: 'Good Form', number: 'INV-1045', amount: 2900, week: 4, status: 'expected' },
  ],
}

export const blankPlan = {
  startDate: upcomingWeekStart(),
  opening: 0,
  buffer: 5000,
  weeklyIncome: [0, 0, 0, 0, 0, 0],
  weeklyBills: [0, 0, 0, 0, 0, 0],
  extraBills: [],
  invoices: [],
}

export const weeks = weeksForPlan(seed)

export function isBlankPlan(plan) {
  return Number(plan.opening) === 0 && plan.invoices.length === 0 &&
    plan.weeklyIncome.every(value => Number(value) === 0) &&
    plan.weeklyBills.every(value => Number(value) === 0) &&
    (plan.extraBills || []).length === 0
}

export function isSamplePlan(plan) {
  return plan.invoices.length === seed.invoices.length &&
    plan.invoices.every((invoice, index) => invoice.id === seed.invoices[index].id && invoice.amount === seed.invoices[index].amount) &&
    Number(plan.opening) === seed.opening && Number(plan.buffer) === seed.buffer &&
    plan.weeklyIncome.every((value, index) => Number(value) === seed.weeklyIncome[index]) &&
    plan.weeklyBills.every((value, index) => Number(value) === seed.weeklyBills[index]) &&
    (plan.extraBills || []).length === 0
}

export function forecast(plan) {
  let balance = Number(plan.opening) || 0
  return weeksForPlan(plan).map((label, index) => {
    const invoiceIncome = plan.invoices.reduce((sum, invoice) => {
      const arrival = invoice.status === 'paid' ? -1 : invoice.status === 'late' ? (invoice.lateWeek ?? Math.min(invoice.week + 2, 5)) : invoice.week
      return sum + (arrival === index ? Number(invoice.amount) : 0)
    }, 0)
    const income = (Number(plan.weeklyIncome[index]) || 0) + invoiceIncome
    const bills = (Number(plan.weeklyBills[index]) || 0) + (plan.extraBills || []).reduce((sum, bill) => sum + (bill.week === index ? Number(bill.amount) : 0), 0)
    balance += income - bills
    return { label, income, bills, balance, invoiceIncome }
  })
}

export function setInvoiceStatus(plan, id, status) {
  const invoice = plan.invoices.find(item => item.id === id)
  if (!invoice || invoice.status === status) return plan
  const amount = Number(invoice.amount) || 0
  const openingChange = status === 'paid' ? amount : invoice.status === 'paid' ? -amount : 0
  return {
    ...plan,
    opening: (Number(plan.opening) || 0) + openingChange,
    invoices: plan.invoices.map(item => {
      if (item.id !== id) return item
      const { lateWeek, ...rest } = item
      return status === 'late' ? { ...rest, status, lateWeek: Math.min(item.week + 2, 5) } : { ...rest, status }
    }),
  }
}

export function removeInvoice(plan, id) {
  const invoice = plan.invoices.find(item => item.id === id)
  if (!invoice) return plan
  return {
    ...plan,
    opening: invoice.status === 'paid' ? Number(plan.opening) - Number(invoice.amount) : plan.opening,
    invoices: plan.invoices.filter(item => item.id !== id),
  }
}

export function getPlanSummary(plan, points = forecast(plan)) {
  const lowest = Math.min(...points.map(point => point.balance))
  const buffer = Math.max(0, Number(plan.buffer ?? 5000) || 0)
  return {
    lowest,
    buffer,
    shortfall: Math.max(0, -lowest),
    bufferGap: Math.max(0, buffer - lowest),
    firstGap: points.find(point => point.balance < buffer)?.label ?? null,
    firstNegative: points.find(point => point.balance < 0)?.label ?? null,
  }
}

export function calculateLoan(amount, apr, months) {
  const monthlyRate = apr / 100 / 12
  const monthlyPayment = monthlyRate ? amount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)) : amount / months
  const totalRepayment = monthlyPayment * months
  return { monthlyPayment, totalRepayment, interest: totalRepayment - amount }
}
