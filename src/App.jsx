import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarDays,
  Check, ChevronRight, CircleDollarSign, Clock3, CreditCard,
  FileText, HelpCircle, LayoutDashboard, Menu, Plus, RotateCcw, Send,
  Settings2, ShieldCheck, Sparkles, TrendingUp, WalletCards, X, LogOut,
} from 'lucide-react'

const weeks = ['Oct 19', 'Oct 26', 'Nov 2', 'Nov 9', 'Nov 16', 'Nov 23']
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

const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const compact = n => n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : `$${n}`

function forecast(plan) {
  let balance = Number(plan.opening) || 0
  return weeks.map((label, index) => {
    const invoiceIncome = plan.invoices.reduce((sum, invoice) => {
      const arrival = invoice.status === 'paid' ? 0 : invoice.status === 'late' ? (invoice.lateWeek ?? Math.min(invoice.week + 2, 5)) : invoice.week
      return sum + (arrival === index ? Number(invoice.amount) : 0)
    }, 0)
    const income = (Number(plan.weeklyIncome[index]) || 0) + invoiceIncome
    const bills = (Number(plan.weeklyBills[index]) || 0) + (plan.extraBills || []).reduce((sum, bill) => sum + (bill.week === index ? Number(bill.amount) : 0), 0)
    balance += income - bills
    return { label, income, bills, balance, invoiceIncome }
  })
}

function App({ plan, setPlan, user, onSignOut, saveState }) {
  const [page, setPage] = useState('Overview')
  const [showAdd, setShowAdd] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [showBill, setShowBill] = useState(false)
  const [reminderInvoice, setReminderInvoice] = useState(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [form, setForm] = useState({ client: '', number: '', amount: '', week: 1 })
  const [billForm, setBillForm] = useState({ name: '', amount: '', week: 1 })
  const [loanAmount, setLoanAmount] = useState(5000)
  const [loanRate, setLoanRate] = useState(14)
  const [loanMonths, setLoanMonths] = useState(6)
  const [toast, setToast] = useState('')
  const points = useMemo(() => forecast(plan), [plan])
  const lowest = Math.min(...points.map(p => p.balance))
  const shortfall = Math.max(0, -lowest)
  const buffer = Math.max(0, Number(plan.buffer ?? 5000) || 0)
  const bufferGap = Math.max(0, buffer - lowest)
  const firstGap = points.find(p => p.balance < buffer)
  const firstNegative = points.find(p => p.balance < 0)
  const outstanding = plan.invoices.filter(i => i.status !== 'paid').reduce((n, i) => n + Number(i.amount), 0)
  const lateCount = plan.invoices.filter(i => i.status === 'late').length
  const rate = loanRate / 100 / 12
  const monthlyPayment = rate ? loanAmount * rate / (1 - Math.pow(1 + rate, -loanMonths)) : loanAmount / loanMonths
  const trueCost = monthlyPayment * loanMonths - loanAmount

  useEffect(() => { setLoanAmount(bufferGap ? Math.max(100, Math.ceil(bufferGap / 100) * 100) : 5000) }, [bufferGap])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(timer)
  }, [toast])

  const changeStatus = (id, status) => {
    setPlan(prev => ({ ...prev, invoices: prev.invoices.map(i => i.id === id ? { ...i, status, lateWeek: status === 'late' ? Math.min(i.week + 2, 5) : undefined } : i) }))
    setToast(status === 'late' ? 'Payment moved later. Your money plan and borrowing check have updated.' : 'Payment updated. Your money plan and borrowing check have updated.')
  }

  const moveLatePayment = (id, week) => {
    setPlan(prev => ({ ...prev, invoices: prev.invoices.map(i => i.id === id ? { ...i, lateWeek: Number(week) } : i) }))
    setToast('New payment week saved. The forecast and borrowing check have updated.')
  }

  const addInvoice = e => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.client.trim() || !(amount > 0)) return
    const next = { id: crypto.randomUUID(), client: form.client.trim(), number: form.number.trim() || `INV-${Date.now().toString().slice(-6)}`, amount, week: Number(form.week), status: 'expected' }
    setPlan(prev => ({ ...prev, invoices: [...prev.invoices, next] }))
    setForm({ client: '', number: '', amount: '', week: 1 })
    setShowAdd(false)
    setToast('Client payment added to your money plan.')
  }

  const addBill = e => {
    e.preventDefault()
    if (!billForm.name.trim() || !(Number(billForm.amount) > 0)) return
    setPlan(prev => ({ ...prev, extraBills: [...(prev.extraBills || []), { id: Date.now(), name: billForm.name.trim(), amount: Number(billForm.amount), week: Number(billForm.week) }] }))
    setBillForm({ name: '', amount: '', week: 1 })
    setShowBill(false)
    setToast('Bill added. Your money plan and borrowing check have updated.')
  }

  const navigation = [
    { name: 'Overview', label: 'Home', icon: LayoutDashboard },
    { name: 'Invoices', label: 'Client payments', icon: FileText, count: lateCount || null },
    { name: 'Cash forecast', label: 'Money plan', icon: Activity },
    { name: 'True cost', label: 'Borrowing check', icon: CircleDollarSign },
  ]

  const navigate = name => { setPage(name); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><span /></div><span>tide<span className="brand-period">.</span></span></div>
      <div className="workspace-switch"><div className="workspace-avatar">S</div><div><strong>My money plan</strong><small>Private to this account</small></div></div>
      <div className="nav-label">YOUR MONEY, MADE CLEAR</div>
      <nav aria-label="Main navigation">
        {navigation.map(item => <button key={item.name} className={`nav-item ${page === item.name ? 'active' : ''}`} onClick={() => navigate(item.name)}><item.icon size={19} strokeWidth={1.9} /><span>{item.label}</span>{item.count && <b>{item.count}</b>}</button>)}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-help"><div className="help-symbol"><Sparkles size={19}/></div><strong>New to money planning?</strong><p>Start with what comes in and what needs paying. We’ll show what’s left.</p><button onClick={() => navigate('Cash forecast')}>See the money plan <ArrowRight size={15}/></button></div>
      <button className="sidebar-bottom" onClick={() => setShowPlan(true)}><Settings2 size={18} /> Edit my numbers</button>
      <div className="profile"><div className="profile-avatar">{(user.email || 'U')[0].toUpperCase()}</div><div><strong>Signed in</strong><small title={user.email}>{user.email}</small></div></div>
      <button className="sidebar-bottom signout" onClick={onSignOut}><LogOut size={17}/> Sign out</button>
    </aside>

    <div className="main-column">
      <header className="topbar"><button className="mobile-menu" aria-label="Open menu" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={22}/></button><div className="crumb">Tide <ChevronRight size={14}/> <strong>{navigation.find(item => item.name === page)?.label}</strong></div><div className="top-actions"><span className="save-state" role="status">{saveState}</span><button className="icon-button" aria-label="Start sample over" title="Start sample over" onClick={() => { if (window.confirm('Replace your plan with the sample numbers? This cannot be undone.')) { setPlan(seed); setToast('Sample plan restored.') } }}><RotateCcw size={17}/></button></div></header>

      <main className="content">
        {page === 'Overview' && <>
          <div className="page-heading"><div><div className="eyebrow">A CASH CHECK FOR FREELANCERS AND SMALL TEAMS</div><h1>Will you have enough for your bills?</h1><p>See money coming in, bills going out, and what changes if a client pays late.</p></div><button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={17}/> Add client payment</button></div>
          <div className="scenario-banner"><div><span>TRY THE SAMPLE STORY</span><strong>What if Atlas Commerce pays its $6,200 invoice late?</strong><p>Move the payment and watch the money left after bills change.</p></div><button onClick={() => changeStatus(2, plan.invoices.find(i => i.id === 2)?.status === 'late' ? 'expected' : 'late')}>{plan.invoices.find(i => i.id === 2)?.status === 'late' ? 'Put payment back' : 'Try a late payment'} <ArrowRight size={17}/></button></div>
          <div className="overview-grid">
            <div className="overview-left">
              <div className="metric-grid"><Metric icon={WalletCards} title="Cash available now" value={money(plan.opening)} detail="Where this plan starts" tone="blue"/><Metric icon={ArrowDownLeft} title="Money expected in" value={money(points.reduce((n,p)=>n+p.income,0))} detail="Over the next 6 weeks" tone="mint"/><Metric icon={ArrowUpRight} title="Bills coming up" value={money(points.reduce((n,p)=>n+p.bills,0))} detail="Over the next 6 weeks" tone="peach"/></div>
              <div className="card forecast-card"><div className="card-header"><div><div className="section-kicker">HOW MUCH IS LEFT?</div><h3>Your next six weeks</h3><p>Each point shows estimated cash left after that week’s bills.</p></div><button className="text-button" onClick={() => navigate('Cash forecast')}>See weekly details <ArrowRight size={16}/></button></div><ForecastChart points={points} buffer={buffer}/><div className="chart-footer"><div><span className="legend-dot blue"/> Estimated cash left</div><div><span className="legend-line"/> Your safety amount</div><span className="chart-update"><Clock3 size={14}/> Updates as payments change</span></div></div>
            </div>
            <div className="overview-right"><div className={`status-card ${bufferGap ? 'warning' : ''}`}><div className="status-top"><div className="status-icon">{bufferGap ? <Activity size={22}/> : <ShieldCheck size={22}/>}</div><span>YOUR ANSWER</span></div><h3>{shortfall ? 'You may be short for bills.' : bufferGap ? 'Bills are covered, but money gets tight.' : 'Yes, your bills are covered.'}</h3><p>{shortfall ? `Your plan may be ${money(shortfall)} short in the week of ${firstNegative?.label}.` : bufferGap ? `You may have ${money(bufferGap)} less than your ${money(buffer)} safety amount in the week of ${firstGap?.label}.` : `Your lowest expected balance stays above the ${money(buffer)} safety amount in your plan.`}</p><div className="safety-note">Safety amount means cash you want left after paying bills. Your plan uses {money(buffer)}.</div><button onClick={() => navigate('True cost')}>{bufferGap ? 'See if borrowing helps' : 'Check if borrowing is needed'} <ArrowRight size={16}/></button><div className="status-bottom"><span>Lowest cash after bills</span><strong>{money(lowest)}</strong></div></div>
              <div className="card invoice-card"><div className="card-header tight"><div><div className="section-kicker">CLIENT MONEY COMING IN</div><h3>Payments to watch</h3></div><button className="subtle-arrow" aria-label="See all client payments" onClick={() => navigate('Invoices')}><ArrowUpRight size={18}/></button></div><div className="invoice-list">{plan.invoices.filter(i=>i.status!=='paid').slice(0,3).map(i=><div className="invoice-mini" key={i.id}><div className="client-avatar">{i.client.split(' ').map(s=>s[0]).slice(0,2).join('')}</div><div><strong>{i.client}</strong><small>{i.status === 'late' ? 'Payment delayed' : `Expected ${weeks[i.week]}`}</small></div><div className="invoice-mini-right"><b>{money(i.amount)}</b><span className={i.status === 'late' ? 'late' : ''}>{i.status === 'late' ? 'Late' : 'On track'}</span></div></div>)}</div><button className="all-link" onClick={() => navigate('Invoices')}>See all client payments <ArrowRight size={15}/></button></div>
            </div>
          </div>
          <FlowStrip navigate={navigate}/>
        </>}

        {page === 'Invoices' && <><PageTitle kicker="CLIENT MONEY COMING IN" title="Client payments" desc="See what clients owe you. If a payment is delayed, change its expected week and the rest of your plan updates." action={<button className="primary-button" onClick={()=>setShowAdd(true)}><Plus size={17}/> Add client payment</button>}/><div className="insight-banner"><div className="insight-icon"><Send size={21}/></div><div><strong>{lateCount ? `${lateCount} delayed payment${lateCount > 1 ? 's' : ''} reflected in your plan` : 'Waiting on a client?'}</strong><p>Choose “Payment delayed,” then set the new week you expect it. We’ll update how much cash may be left for bills.</p></div><span>{money(outstanding)} still expected</span></div><div className="card table-card"><div className="card-header"><div><div className="section-kicker">MONEY CLIENTS OWE YOU</div><h3>Payments you are tracking</h3></div><span className="count-pill">{plan.invoices.length} payments</span></div><div className="table-wrap"><table><thead><tr><th>CLIENT / PAYMENT</th><th>WHEN MONEY ARRIVES</th><th>AMOUNT</th><th>STATUS</th><th>WHAT TO DO</th></tr></thead><tbody>{plan.invoices.map(i=><tr key={i.id}><td><div className="table-client"><div className="client-avatar">{i.client.split(' ').map(s=>s[0]).slice(0,2).join('')}</div><div><strong>{i.client}</strong><small>{i.number}</small></div></div></td><td>{i.status==='paid' ? 'Received this week' : i.status==='late' ? <label className="late-week-label">New expected week<select value={i.lateWeek ?? Math.min(i.week+2,5)} onChange={e=>moveLatePayment(i.id,e.target.value)}>{weeks.map((week,index)=><option value={index} key={week}>Week of {week}</option>)}</select></label> : `Week of ${weeks[i.week]}`}</td><td className="amount-cell">{money(i.amount)}</td><td><span className={`status-pill ${i.status}`}>{i.status==='expected'?'Expected':i.status==='late'?'Delayed':'Paid'}</span></td><td><div className="row-actions">{i.status!=='paid' && <><button onClick={()=>changeStatus(i.id,'paid')}>Payment received</button><button onClick={()=>setReminderInvoice(i)}>Write reminder</button>{i.status!=='late' && <button onClick={()=>changeStatus(i.id,'late')}>Payment delayed</button>}</>}{i.status!=='expected' && <button onClick={()=>changeStatus(i.id,'expected')}>Undo change</button>}<button onClick={()=>{if(window.confirm(`Remove ${i.client}'s payment from your plan?`)){setPlan(prev=>({...prev,invoices:prev.invoices.filter(item=>item.id!==i.id)}));setToast('Payment removed from your plan.')}}}>Remove</button></div></td></tr>)}</tbody></table></div></div><div className="below-grid"><StepCard number="02" title="Your money plan changes instantly" text="When a payment date moves, you see what may be left after bills." action="See my money plan" onClick={()=>navigate('Cash forecast')}/><StepCard number="03" title="Check before you borrow" text="See whether you have a gap before considering a loan." action="Check borrowing" onClick={()=>navigate('True cost')}/></div></>}

        {page === 'Cash forecast' && <><PageTitle kicker="MONEY IN AND BILLS OUT" title="Your money plan" desc="See how much cash may be left after each week’s bills. Update your numbers as plans change." action={<div className="heading-actions"><button className="outline-button" onClick={()=>setShowPlan(true)}><Settings2 size={17}/> Edit my numbers</button><button className="primary-button" onClick={()=>setShowBill(true)}><Plus size={17}/> Add a bill</button></div>}/><div className="forecast-summary"><div><span>Cash available now</span><strong>{money(plan.opening)}</strong></div><ArrowRight size={19}/><div><span>Lowest amount left</span><strong className={lowest<buffer?'amber-text':''}>{money(lowest)}</strong></div><ArrowRight size={19}/><div><span>After six weeks</span><strong>{money(points.at(-1).balance)}</strong></div></div><div className="card large-chart"><div className="card-header"><div><div className="section-kicker">YOUR SIX-WEEK VIEW</div><h3>How much could be left?</h3></div><span className="small-badge"><span className="legend-dot blue"/> Updates with your changes</span></div><ForecastChart points={points} buffer={buffer} large/><div className="chart-footer"><div><span className="legend-dot blue"/> Estimated cash left</div><div><span className="legend-line"/> {money(buffer)} safety amount</div></div></div><div className="card breakdown"><div className="card-header"><div><div className="section-kicker">SEE EACH WEEK</div><h3>Money in and bills out</h3></div></div><div className="breakdown-table"><div className="breakdown-row header"><span>WEEK OF</span><span>MONEY IN</span><span>BILLS OUT</span><span>LEFT AFTER BILLS</span></div>{points.map(p=><div className="breakdown-row" key={p.label}><strong>{p.label}</strong><span className="positive">+{money(p.income)}</span><span className="negative">−{money(p.bills)}</span><strong className={p.balance<buffer?'amber-text':''}>{money(p.balance)}</strong></div>)}</div></div><div className="card extra-bills"><div className="card-header"><div><h3>Bills you added</h3><p>This sample starts with weekly bill totals. Add named bills here to see their effect.</p></div><button className="text-button" onClick={()=>setShowBill(true)}>Add a bill <Plus size={16}/></button></div>{(plan.extraBills||[]).length ? <div className="extra-bills-list">{plan.extraBills.map(bill=><div className="extra-bill-row" key={bill.id}><div><strong>{bill.name}</strong><small>Week of {weeks[bill.week]}</small></div><strong>{money(bill.amount)}</strong><button aria-label={`Remove ${bill.name}`} onClick={()=>{setPlan(prev=>({...prev,extraBills:prev.extraBills.filter(item=>item.id!==bill.id)}));setToast(`${bill.name} removed from the plan.`)}}><X size={17}/></button></div>)}</div> : <p className="extra-bills-empty">No extra bills yet. Add a real expense such as rent, a contractor payment, or a software renewal.</p>}</div><div className="bottom-callout"><div className="callout-icon"><CircleDollarSign size={22}/></div><div><strong>{bufferGap ? `You may need ${money(bufferGap)} to keep your safety amount.` : 'Your plan covers every bill.'}</strong><p>See whether a loan is needed and what it could cost.</p></div><button onClick={()=>navigate('True cost')}>Check borrowing <ArrowRight size={16}/></button></div></>}

        {page === 'True cost' && <><PageTitle kicker="THE DECISION" title="Do you need to borrow?" desc="Start with your money plan. Then see the full cost of an example loan before deciding."/><div className="decision-grid"><div className="decision-left"><div className={`decision-hero ${bufferGap?'needs-buffer':''}`}><div className="section-kicker">BASED ON YOUR MONEY PLAN</div><div className="decision-icon">{shortfall ? <Activity size={28}/> : <ShieldCheck size={28}/>}</div><h2>{shortfall ? `You may be ${money(shortfall)} short for bills.` : bufferGap ? `You can cover bills, but your safety amount dips.` : 'You do not appear to need a loan for bills.'}</h2><p>{shortfall ? `Your plan may fall below $0 in the week of ${firstNegative?.label}.` : bufferGap ? `Your lowest balance is ${money(lowest)}. To keep the ${money(buffer)} safety amount, the gap is ${money(bufferGap)}.` : `Your lowest projected balance is ${money(lowest)}, above your ${money(buffer)} safety amount.`}</p><div className="decision-stat"><div><span>Lowest amount left</span><strong>{money(lowest)}</strong></div><div><span>Bills shortfall</span><strong>{money(shortfall)}</strong></div><div><span>Safety amount gap</span><strong>{money(bufferGap)}</strong></div></div></div><div className="card loan-card"><div className="section-kicker">TRY AN EXAMPLE</div><h3>What could a loan cost?</h3><p>Change the amount, rate, or time to repay to compare the full cost.</p><label>Amount to borrow <strong>{money(loanAmount)}</strong></label><input type="range" min="100" max={Math.max(20000, Math.ceil(bufferGap / 1000) * 1000)} step="100" value={loanAmount} onChange={e=>setLoanAmount(Number(e.target.value))}/><div className="range-ends"><span>$100</span><span>{money(Math.max(20000, Math.ceil(bufferGap / 1000) * 1000))}</span></div><p className="apr-help">The amount starts at the gap from your money plan. APR means yearly interest rate.</p><div className="loan-fields"><label>Yearly interest rate (APR)<div className="input-suffix"><input type="number" min="0" max="100" value={loanRate} onChange={e=>setLoanRate(Math.max(0, Number(e.target.value)))} /><span>%</span></div></label><label>Time to repay<div className="input-suffix"><select value={loanMonths} onChange={e=>setLoanMonths(Number(e.target.value))}><option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option><option value="24">24 months</option></select></div></label></div></div></div><div className="decision-right"><div className="card cost-card"><div className="section-kicker">EXAMPLE REPAYMENT</div><div className="cost-total"><span>Extra paid in interest</span><strong>{money(trueCost)}</strong><small>Interest beyond the {money(loanAmount)} borrowed</small></div><div className="cost-divider"/><div className="cost-row"><span>Payment each month</span><strong>{money(monthlyPayment)}</strong></div><div className="cost-row"><span>Total you would repay</span><strong>{money(monthlyPayment * loanMonths)}</strong></div><div className="cost-row"><span>Gap to your safety amount</span><strong>{money(bufferGap)}</strong></div><div className="cost-note"><HelpCircle size={18}/><span>{bufferGap===0 ? 'Your plan shows no gap. A loan would add cost without covering a projected need.' : loanAmount>bufferGap ? `This is ${money(loanAmount-bufferGap)} more than the gap in your plan.` : loanAmount<bufferGap ? `This would still leave ${money(bufferGap-loanAmount)} of your gap uncovered.` : 'This amount matches the gap to your safety amount.'}</span></div></div><div className="transparent-note"><ShieldCheck size={20}/><p>Example calculation only. A lender may use different rates, fees, and terms. Tide does not offer loans.</p></div></div></div><div className="bottom-callout"><div className="callout-icon"><Activity size={22}/></div><div><strong>See where these numbers came from</strong><p>This check uses the lowest amount left in your money plan.</p></div><button onClick={()=>navigate('Cash forecast')}>See my money plan <ArrowRight size={16}/></button></div></>}
      </main>
    </div>

    {showAdd && <div className="modal-backdrop" onMouseDown={()=>setShowAdd(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={()=>setShowAdd(false)}><X size={20}/></button><div className="section-kicker">MONEY IN</div><h2 id="add-title">Add an invoice</h2><p>It will appear in your forecast for the week you expect payment.</p><form onSubmit={addInvoice}><label>Client name<input autoFocus value={form.client} onChange={e=>setForm({...form,client:e.target.value})} placeholder="e.g. Acme Studio" required/></label><label>Invoice number (optional)<input value={form.number} onChange={e=>setForm({...form,number:e.target.value})} placeholder="e.g. INV-1084"/></label><label>Amount ($)<input type="number" min="1" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="4,500" required/></label><label>Expected payment week<select value={form.week} onChange={e=>setForm({...form,week:e.target.value})}>{weeks.map((w,i)=><option key={w} value={i}>Week of {w}</option>)}</select></label><button className="primary-button" type="submit"><Plus size={17}/> Add to forecast</button></form></div></div>}

    {showPlan && <div className="modal-backdrop" onMouseDown={()=>setShowPlan(false)}><div className="modal plan-modal" role="dialog" aria-modal="true" aria-labelledby="plan-title" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={()=>setShowPlan(false)}><X size={20}/></button><div className="section-kicker">YOUR STARTING NUMBERS</div><h2 id="plan-title">Edit your money plan</h2><p>These amounts update every part of your plan right away.</p><label className="opening-field">Cash available now ($)<input type="number" min="0" value={plan.opening} onChange={e=>setPlan({...plan,opening:Number(e.target.value)})}/></label><label className="opening-field">Safety amount to keep aside ($)<input type="number" min="0" value={plan.buffer ?? 5000} onChange={e=>setPlan({...plan,buffer:Math.max(0,Number(e.target.value))})}/></label><div className="plan-grid"><strong>Week of</strong><strong>Other income</strong><strong>Bills</strong>{weeks.map((w,i)=><div className="plan-row" key={w}><span>{w}</span><input aria-label={`Income week of ${w}`} type="number" value={plan.weeklyIncome[i]} onChange={e=>setPlan({...plan,weeklyIncome:plan.weeklyIncome.map((n,j)=>j===i?Number(e.target.value):n)})}/><input aria-label={`Bills week of ${w}`} type="number" value={plan.weeklyBills[i]} onChange={e=>setPlan({...plan,weeklyBills:plan.weeklyBills.map((n,j)=>j===i?Number(e.target.value):n)})}/></div>)}</div><button className="primary-button" onClick={()=>{setShowPlan(false);setToast('Plan updated across your workspace.')}}><Check size={17}/> Done</button></div></div>}
    {showBill && <div className="modal-backdrop" onMouseDown={()=>setShowBill(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="bill-title" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={()=>setShowBill(false)}><X size={20}/></button><h2 id="bill-title">Add a bill to your plan</h2><p>We’ll count this expense in the week it is due.</p><form onSubmit={addBill}><label>What is this bill for?<input autoFocus required placeholder="e.g. Studio rent" value={billForm.name} onChange={e=>setBillForm({...billForm,name:e.target.value})}/></label><label>Amount to pay ($)<input type="number" min="1" required placeholder="e.g. 1200" value={billForm.amount} onChange={e=>setBillForm({...billForm,amount:e.target.value})}/></label><label>When is it due?<select value={billForm.week} onChange={e=>setBillForm({...billForm,week:e.target.value})}>{weeks.map((week,index)=><option value={index} key={week}>Week of {week}</option>)}</select></label><button className="primary-button" type="submit"><Plus size={16}/> Add bill</button></form></div></div>}
    {reminderInvoice && <div className="modal-backdrop" onMouseDown={()=>setReminderInvoice(null)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="reminder-title" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={()=>setReminderInvoice(null)}><X size={20}/></button><h2 id="reminder-title">A friendly payment reminder</h2><p>Review this note, then copy it into your own email. Tide does not contact your client.</p><textarea className="reminder-text" aria-label="Payment reminder" readOnly rows="9" value={`Subject: Quick check-in on ${reminderInvoice.number}\n\nHi ${reminderInvoice.client},\n\nI hope you’re well. I’m checking in on invoice ${reminderInvoice.number} for ${money(reminderInvoice.amount)}. Could you let me know when we can expect payment?\n\nThanks,\n`}/><button className="primary-button reminder-copy" onClick={async()=>{try{await navigator.clipboard.writeText(`Subject: Quick check-in on ${reminderInvoice.number}\n\nHi ${reminderInvoice.client},\n\nI hope you’re well. I’m checking in on invoice ${reminderInvoice.number} for ${money(reminderInvoice.amount)}. Could you let me know when we can expect payment?\n\nThanks,\n`);setToast('Reminder copied. Paste it into your email to send.');setReminderInvoice(null)}catch{setToast('Copy was unavailable. Select the note to copy it manually.')}}}>Copy reminder</button></div></div>}
    {toast && <div className="toast"><Check size={17}/>{toast}</div>}
  </div>
}

function Metric({icon:Icon,title,value,detail,tone}) { return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={20}/></div><span>{title}</span><strong>{value}</strong><small>{detail}</small></div> }
function PageTitle({kicker,title,desc,action}) { return <div className="page-heading section-heading"><div><div className="eyebrow">{kicker}</div><h1>{title}</h1><p>{desc}</p></div>{action}</div> }
function StepCard({number,title,text,action,onClick}) { return <div className="step-card"><span>{number}</span><h3>{title}</h3><p>{text}</p><button onClick={onClick}>{action} <ArrowRight size={16}/></button></div> }
function FlowStrip({navigate}) { return <div className="flow-strip"><div className="flow-intro"><span className="section-kicker">ONE SIMPLE PATH</span><h3>Follow your money from start to decision.</h3><p>When a client pays late, the money plan and borrowing check update together.</p></div><button onClick={()=>navigate('Invoices')}><span>01</span><FileText size={18}/><strong>Invoices</strong><small>Track what clients owe</small></button><ChevronRight className="flow-chevron" size={19}/><button onClick={()=>navigate('Cash forecast')}><span>02</span><TrendingUp size={18}/><strong>Forecast</strong><small>See what is left</small></button><ChevronRight className="flow-chevron" size={19}/><button onClick={()=>navigate('True cost')}><span>03</span><CreditCard size={18}/><strong>True cost</strong><small>Know if a loan helps</small></button></div> }

function ForecastChart({points,buffer,large=false}) {
  const width=760, height=large?270:208, left=52, right=20, top=22, bottom=35
  const values=points.map(p=>p.balance)
  const min=Math.min(0,buffer,...values)-1500, max=Math.max(buffer,...values)+2200
  const x=i=>left+i*(width-left-right)/(points.length-1)
  const y=v=>top+(max-v)*(height-top-bottom)/(max-min)
  const path=points.map((p,i)=>`${i?'L':'M'} ${x(i)} ${y(p.balance)}`).join(' ')
  const area=`${path} L ${x(points.length-1)} ${height-bottom} L ${x(0)} ${height-bottom} Z`
  const grid=[0,1,2,3].map(i=>min+(max-min)*i/3)
  return <div className={`chart ${large?'chart-large':''}`}><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Estimated cash left from ${money(points[0].balance)} to ${money(points.at(-1).balance)} over six weeks`} preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b8734d" stopOpacity=".23"/><stop offset="100%" stopColor="#b8734d" stopOpacity=".005"/></linearGradient></defs>{grid.map((v,i)=><g key={i}><line x1={left} x2={width-right} y1={y(v)} y2={y(v)} stroke="#e5d6c2" strokeDasharray="4 5"/><text x="0" y={y(v)+4} fill="#806a56" fontSize="11">{compact(Math.max(0,Math.round(v/1000)*1000))}</text></g>)}<line x1={left} x2={width-right} y1={y(buffer)} y2={y(buffer)} stroke="#b39370" strokeWidth="1.5" strokeDasharray="5 6"/><path d={area} fill="url(#chartFill)"/><path d={path} fill="none" stroke="#a65f3e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{points.map((p,i)=><g key={i}><circle cx={x(i)} cy={y(p.balance)} r="5" fill="#fff8ec" stroke="#a65f3e" strokeWidth="3"/><text x={x(i)} y={height-8} textAnchor="middle" fill="#806a56" fontSize="11">{p.label}</text></g>)}</svg></div>
}

export default App
