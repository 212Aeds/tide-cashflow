export const weeks = ['Oct 19', 'Oct 26', 'Nov 2', 'Nov 9', 'Nov 16', 'Nov 23']

export const seed = {
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

export function forecast(plan) {
  let balance = Number(plan.opening) || 0
  return weeks.map((label, index) => {
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
