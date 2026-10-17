import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, ChevronDown, ChevronRight, CircleDollarSign, Clock3, CreditCard,
  FileText, HelpCircle, LayoutDashboard, Menu, Plus, RotateCcw, Send,
  Settings2, ShieldCheck, Sparkles, TrendingUp, WalletCards, X,
} from 'lucide-react'

const weeks = ['Oct 19', 'Oct 26', 'Nov 2', 'Nov 9', 'Nov 16', 'Nov 23']
const seed = {
  opening: 8000,
  weeklyIncome: [2500, 2500, 2500, 2500, 2500, 2500],
  weeklyBills: [3600, 10500, 4100, 6400, 3900, 4100],
  invoices: [
    { id: 1, client: 'Northstar Studio', number: 'INV-1042', amount: 4800, week: 0, status: 'expected' },
    { id: 2, client: 'Atlas Commerce', number: 'INV-1043', amount: 6200, week: 1, status: 'expected' },
    { id: 3, client: 'Fieldnotes Co.', number: 'INV-1044', amount: 3400, week: 2, status: 'expected' },
    { id: 4, client: 'Good Form', number: 'INV-1045', amount: 2900, week: 4, status: 'expected' },
  ],
}

const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const compact = n => n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : `$${n}`

function loadPlan() {
  try {
    const saved = JSON.parse(localStorage.getItem('tide-demo-plan'))
    if (saved && Array.isArray(saved.invoices) && Array.isArray(saved.weeklyBills)) return saved
  } catch { /* use sample plan */ }
  return seed
}

function forecast(plan) {
  let balance = Number(plan.opening) || 0
  return weeks.map((label, index) => {
    const invoiceIncome = plan.invoices.reduce((sum, invoice) => {
      const arrival = invoice.status === 'paid' ? 0 : invoice.status === 'late' ? Math.min(invoice.week + 2, 5) : invoice.week
      return sum + (arrival === index ? Number(invoice.amount) : 0)
    }, 0)
    const income = (Number(plan.weeklyIncome[index]) || 0) + invoiceIncome
    const bills = Number(plan.weeklyBills[index]) || 0
    balance += income - bills
    return { label, income, bills, balance, invoiceIncome }
  })
}

function App() {
  const [plan, setPlan] = useState(loadPlan)
  const [page, setPage] = useState('Overview')
  const [showAdd, setShowAdd] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [form, setForm] = useState({ client: '', amount: '', week: 1 })
  const [loanAmount, setLoanAmount] = useState(5000)
  const [loanRate, setLoanRate] = useState(14)
  const [loanMonths, setLoanMonths] = useState(6)
  const [toast, setToast] = useState('')
  const points = useMemo(() => forecast(plan), [plan])
  const lowest = Math.min(...points.map(p => p.balance))
  const shortfall = Math.max(0, -lowest)
  const buffer = 5000
  const bufferGap = Math.max(0, buffer - lowest)
  const firstGap = points.find(p => p.balance < buffer)
  const outstanding = plan.invoices.filter(i => i.status !== 'paid').reduce((n, i) => n + Number(i.amount), 0)
  const lateCount = plan.invoices.filter(i => i.status === 'late').length
  const rate = loanRate / 100 / 12
  const monthlyPayment = rate ? loanAmount * rate / (1 - Math.pow(1 + rate, -loanMonths)) : loanAmount / loanMonths
  const trueCost = monthlyPayment * loanMonths - loanAmount

  useEffect(() => { localStorage.setItem('tide-demo-plan', JSON.stringify(plan)) }, [plan])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(timer)
  }, [toast])

  const changeStatus = (id, status) => {
    setPlan(prev => ({ ...prev, invoices: prev.invoices.map(i => i.id === id ? { ...i, status } : i) }))
    setToast(status === 'late' ? 'Payment delayed. Your forecast and funding view have updated.' : 'Payment recorded. Your forecast and funding view have updated.')
  }

  const addInvoice = e => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.client.trim() || !(amount > 0)) return
    const next = { id: Date.now(), client: form.client.trim(), number: `INV-${1042 + plan.invoices.length}`, amount, week: Number(form.week), status: 'expected' }
    setPlan(prev => ({ ...prev, invoices: [...prev.invoices, next] }))
    setForm({ client: '', amount: '', week: 1 })
    setShowAdd(false)
    setToast('Invoice added to your income forecast.')
  }

  const navigation = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Invoices', icon: FileText, count: lateCount || null },
    { name: 'Cash forecast', icon: Activity },
    { name: 'True cost', icon: CircleDollarSign },
  ]

  const navigate = name => { setPage(name); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><span /></div><span>tide<span className="brand-period">.</span></span></div>
      <div className="workspace-switch"><div className="workspace-avatar">S</div><div><strong>Studio North</strong><small>Demo workspace</small></div><ChevronDown size={15} /></div>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Main navigation">
        {navigation.map(item => <button key={item.name} className={`nav-item ${page === item.name ? 'active' : ''}`} onClick={() => navigate(item.name)}><item.icon size={19} strokeWidth={1.9} /><span>{item.name}</span>{item.count && <b>{item.count}</b>}</button>)}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-help"><div className="help-symbol"><Sparkles size={19}/></div><strong>Every number has a story.</strong><p>See how one late payment changes what comes next.</p><button onClick={() => navigate('Cash forecast')}>Explore the flow <ArrowRight size={15}/></button></div>
      <button className="sidebar-bottom" onClick={() => setShowPlan(true)}><Settings2 size={18} /> Edit plan</button>
      <div className="profile"><div className="profile-avatar">AM</div><div><strong>Alex Morgan</strong><small>Workspace owner</small></div><ChevronDown size={15}/></div>
    </aside>

    <div className="main-column">
      <header className="topbar"><button className="mobile-menu" aria-label="Open menu" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={22}/></button><div className="crumb">Workspace <ChevronRight size={14}/> <strong>{page}</strong></div><div className="top-actions"><span className="demo-badge"><span/> LIVE DEMO</span><button className="icon-button" aria-label="Reset demo" title="Reset demo" onClick={() => { setPlan(seed); setToast('Demo data reset.') }}><RotateCcw size={17}/></button><button className="icon-button" aria-label="Notifications" onClick={() => setToast(lateCount ? `${lateCount} invoice${lateCount > 1 ? 's' : ''} marked late.` : 'No new notifications.')}><Bell size={18}/>{lateCount > 0 && <i/>}</button></div></header>

      <main className="content">
        {page === 'Overview' && <>
          <div className="page-heading"><div><div className="eyebrow">SATURDAY, OCTOBER 17, 2026</div><h1>Good morning, Alex <span className="wave">✳</span></h1><p>Here’s how your cash is moving over the next six weeks.</p></div><button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={17}/> Add invoice</button></div>
          <div className="overview-grid">
            <div className="overview-left">
              <div className="hero-card"><div className="hero-copy"><div className="hero-eyebrow"><span/> YOUR FINANCIAL OUTLOOK</div><h2>Know what’s coming.<br/><em>Move with confidence.</em></h2><p>Your income, bills, and client payments come together in one clear picture.</p><button onClick={() => navigate('Cash forecast')}>View your forecast <ArrowUpRight size={16}/></button></div><div className="hero-art" aria-hidden="true"><div className="art-circle circle-one"/><div className="art-circle circle-two"/><div className="art-circle circle-three"/><div className="art-line"/></div></div>
              <div className="metric-grid"><Metric icon={WalletCards} title="Current balance" value={money(plan.opening)} detail="Starting cash" tone="blue"/><Metric icon={ArrowDownLeft} title="Expected income" value={money(points.reduce((n,p)=>n+p.income,0))} detail="Next 6 weeks" tone="mint"/><Metric icon={ArrowUpRight} title="Upcoming bills" value={money(points.reduce((n,p)=>n+p.bills,0))} detail="Next 6 weeks" tone="peach"/></div>
              <div className="card forecast-card"><div className="card-header"><div><div className="section-kicker">THE BIG PICTURE</div><h3>Cash flow forecast</h3><p>Every invoice and bill shapes this view.</p></div><button className="text-button" onClick={() => navigate('Cash forecast')}>Explore forecast <ArrowRight size={16}/></button></div><ForecastChart points={points} buffer={buffer}/><div className="chart-footer"><div><span className="legend-dot blue"/> Projected cash balance</div><div><span className="legend-line"/> Comfortable buffer</div><span className="chart-update"><Clock3 size={14}/> Updates as payments change</span></div></div>
            </div>
            <div className="overview-right"><div className={`status-card ${bufferGap ? 'warning' : ''}`}><div className="status-top"><div className="status-icon">{bufferGap ? <Activity size={22}/> : <ShieldCheck size={22}/>}</div><span>YOUR CASH HEALTH</span></div><h3>{bufferGap ? 'A tighter week is ahead.' : 'You’re on steady ground.'}</h3><p>{bufferGap ? `Your balance may dip below your ${money(buffer)} comfort buffer in the week of ${firstGap?.label}.` : `Your projected balance stays above your ${money(buffer)} comfort buffer.`}</p><button onClick={() => navigate('True cost')}>{bufferGap ? 'See your options' : 'Review funding options'} <ArrowRight size={16}/></button><div className="status-bottom"><span>Lowest projected balance</span><strong>{money(lowest)}</strong></div></div>
              <div className="card invoice-card"><div className="card-header tight"><div><div className="section-kicker">KEEP THINGS MOVING</div><h3>Invoices to watch</h3></div><button className="subtle-arrow" aria-label="View all invoices" onClick={() => navigate('Invoices')}><ArrowUpRight size={18}/></button></div><div className="invoice-list">{plan.invoices.filter(i=>i.status!=='paid').slice(0,3).map(i=><div className="invoice-mini" key={i.id}><div className="client-avatar">{i.client.split(' ').map(s=>s[0]).slice(0,2).join('')}</div><div><strong>{i.client}</strong><small>{i.status === 'late' ? 'Payment delayed' : `Expected ${weeks[i.week]}`}</small></div><div className="invoice-mini-right"><b>{money(i.amount)}</b><span className={i.status === 'late' ? 'late' : ''}>{i.status === 'late' ? 'Late' : 'On track'}</span></div></div>)}</div><button className="all-link" onClick={() => navigate('Invoices')}>View all invoices <ArrowRight size={15}/></button></div>
            </div>
          </div>
          <FlowStrip navigate={navigate}/>
        </>}

        {page === 'Invoices' && <><PageTitle kicker="STAGE 01 / MONEY IN" title="Invoice chaser" desc="Track what clients owe. A late payment shifts the forecast and the funding decision automatically." action={<button className="primary-button" onClick={()=>setShowAdd(true)}><Plus size={17}/> Add invoice</button>}/><div className="insight-banner"><div className="insight-icon"><Send size={21}/></div><div><strong>{lateCount ? `${lateCount} delayed payment${lateCount > 1 ? 's' : ''} reflected in your plan` : 'Keep your forecast honest'}</strong><p>Use “Mark late” when a client gives you a new timeline. Tide moves that cash two weeks later in your forecast.</p></div><span>{money(outstanding)} outstanding</span></div><div className="card table-card"><div className="card-header"><div><div className="section-kicker">CLIENT PAYMENTS</div><h3>All invoices</h3></div><span className="count-pill">{plan.invoices.length} invoices</span></div><div className="table-wrap"><table><thead><tr><th>CLIENT / INVOICE</th><th>EXPECTED</th><th>AMOUNT</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{plan.invoices.map(i=><tr key={i.id}><td><div className="table-client"><div className="client-avatar">{i.client.split(' ').map(s=>s[0]).slice(0,2).join('')}</div><div><strong>{i.client}</strong><small>{i.number}</small></div></div></td><td>{i.status==='paid' ? 'Received now' : weeks[i.status==='late' ? Math.min(i.week+2,5) : i.week]}</td><td className="amount-cell">{money(i.amount)}</td><td><span className={`status-pill ${i.status}`}>{i.status==='expected'?'Expected':i.status==='late'?'Delayed':'Paid'}</span></td><td><div className="row-actions">{i.status!=='paid' && <><button onClick={()=>changeStatus(i.id,'paid')}>Mark paid</button>{i.status!=='late' && <button onClick={()=>changeStatus(i.id,'late')}>Mark late</button>}</>}{i.status!=='expected' && <button onClick={()=>changeStatus(i.id,'expected')}>Reset</button>}</div></td></tr>)}</tbody></table></div></div><div className="below-grid"><StepCard number="02" title="Forecast changes instantly" text="When expected payment dates move, your future cash balance moves with them." action="See updated forecast" onClick={()=>navigate('Cash forecast')}/><StepCard number="03" title="Funding stays in context" text="Your lowest cash point informs whether borrowing is useful at all." action="Check true cost" onClick={()=>navigate('True cost')}/></div></>}

        {page === 'Cash forecast' && <><PageTitle kicker="STAGE 02 / WHAT’S NEXT" title="Cash forecast" desc="A week-by-week view built from your starting cash, regular income, bills, and client invoices." action={<button className="outline-button" onClick={()=>setShowPlan(true)}><Settings2 size={17}/> Edit assumptions</button>}/><div className="forecast-summary"><div><span>Starting cash</span><strong>{money(plan.opening)}</strong></div><ArrowRight size={19}/><div><span>Lowest point</span><strong className={lowest<buffer?'amber-text':''}>{money(lowest)}</strong></div><ArrowRight size={19}/><div><span>End of period</span><strong>{money(points.at(-1).balance)}</strong></div></div><div className="card large-chart"><div className="card-header"><div><div className="section-kicker">SIX WEEK OUTLOOK</div><h3>Where your balance is headed</h3></div><span className="small-badge"><span className="legend-dot blue"/> Live forecast</span></div><ForecastChart points={points} buffer={buffer} large/><div className="chart-footer"><div><span className="legend-dot blue"/> Projected cash balance</div><div><span className="legend-line"/> {money(buffer)} comfort buffer</div></div></div><div className="card breakdown"><div className="card-header"><div><div className="section-kicker">THE NUMBERS BEHIND IT</div><h3>Weekly breakdown</h3></div></div><div className="breakdown-table"><div className="breakdown-row header"><span>WEEK OF</span><span>INCOME</span><span>BILLS</span><span>ENDING CASH</span></div>{points.map(p=><div className="breakdown-row" key={p.label}><strong>{p.label}</strong><span className="positive">+{money(p.income)}</span><span className="negative">−{money(p.bills)}</span><strong className={p.balance<buffer?'amber-text':''}>{money(p.balance)}</strong></div>)}</div></div><div className="bottom-callout"><div className="callout-icon"><CircleDollarSign size={22}/></div><div><strong>{bufferGap ? `A ${money(bufferGap)} cushion would protect your buffer.` : 'Your current plan covers every bill.'}</strong><p>See whether borrowing would help, and what it would really cost.</p></div><button onClick={()=>navigate('True cost')}>Explore true cost <ArrowRight size={16}/></button></div></>}

        {page === 'True cost' && <><PageTitle kicker="STAGE 03 / THE DECISION" title="The true cost of borrowing" desc="Make a funding decision using the shortfall from your live cash forecast, not a guess."/><div className="decision-grid"><div className="decision-left"><div className={`decision-hero ${bufferGap?'needs-buffer':''}`}><div className="section-kicker">BASED ON YOUR LIVE FORECAST</div><div className="decision-icon">{shortfall ? <Activity size={28}/> : <ShieldCheck size={28}/>}</div><h2>{shortfall ? `You may need ${money(shortfall)} to cover bills.` : bufferGap ? `You can cover bills, but your buffer dips.` : 'You may not need a loan.'}</h2><p>{shortfall ? `Your forecast falls below $0 during the week of ${firstGap?.label}.` : bufferGap ? `Your lowest balance is ${money(lowest)}. To preserve a ${money(buffer)} comfort buffer, the gap is ${money(bufferGap)}.` : `Your lowest projected balance is ${money(lowest)}, above your ${money(buffer)} comfort buffer.`}</p><div className="decision-stat"><div><span>Forecast low</span><strong>{money(lowest)}</strong></div><div><span>Cash shortfall</span><strong>{money(shortfall)}</strong></div><div><span>Buffer gap</span><strong>{money(bufferGap)}</strong></div></div></div><div className="card loan-card"><div className="section-kicker">EXPLORE A SCENARIO</div><h3>What would a loan really cost?</h3><p>Adjust these estimates to see the full repayment amount.</p><label>Loan amount <strong>{money(loanAmount)}</strong></label><input type="range" min="1000" max="20000" step="500" value={loanAmount} onChange={e=>setLoanAmount(Number(e.target.value))}/><div className="range-ends"><span>$1,000</span><span>$20,000</span></div><div className="loan-fields"><label>APR estimate<div className="input-suffix"><input type="number" min="0" max="100" value={loanRate} onChange={e=>setLoanRate(Math.max(0, Number(e.target.value)))} /><span>%</span></div></label><label>Term<div className="input-suffix"><select value={loanMonths} onChange={e=>setLoanMonths(Number(e.target.value))}><option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option><option value="24">24 months</option></select></div></label></div></div></div><div className="decision-right"><div className="card cost-card"><div className="section-kicker">YOUR ESTIMATED REPAYMENT</div><div className="cost-total"><span>Total borrowing cost</span><strong>{money(trueCost)}</strong><small>Interest beyond the {money(loanAmount)} borrowed</small></div><div className="cost-divider"/><div className="cost-row"><span>Estimated monthly payment</span><strong>{money(monthlyPayment)}</strong></div><div className="cost-row"><span>Total repaid</span><strong>{money(monthlyPayment * loanMonths)}</strong></div><div className="cost-row"><span>Cash gap in your forecast</span><strong>{money(bufferGap)}</strong></div><div className="cost-note"><HelpCircle size={18}/><span>{bufferGap===0 ? 'Your forecast shows no funding gap. Borrowing would add cost without solving a projected need.' : loanAmount>bufferGap ? `This scenario borrows ${money(loanAmount-bufferGap)} more than the amount needed to protect your buffer.` : loanAmount<bufferGap ? `This scenario still leaves a ${money(bufferGap-loanAmount)} gap to your buffer.` : 'This amount matches the gap to your comfort buffer.'}</span></div></div><div className="transparent-note"><ShieldCheck size={20}/><p>Illustrative estimate only. Actual rates and terms depend on a lender; this demo does not offer credit.</p></div></div></div><div className="bottom-callout"><div className="callout-icon"><Activity size={22}/></div><div><strong>See where this recommendation came from</strong><p>Your funding view uses the lowest balance in your connected forecast.</p></div><button onClick={()=>navigate('Cash forecast')}>Review forecast <ArrowRight size={16}/></button></div></>}
      </main>
    </div>

    {showAdd && <div className="modal-backdrop" onMouseDown={()=>setShowAdd(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={()=>setShowAdd(false)}><X size={20}/></button><div className="section-kicker">MONEY IN</div><h2 id="add-title">Add an invoice</h2><p>It will appear in your forecast for the week you expect payment.</p><form onSubmit={addInvoice}><label>Client name<input autoFocus value={form.client} onChange={e=>setForm({...form,client:e.target.value})} placeholder="e.g. Acme Studio" required/></label><label>Amount ($)<input type="number" min="1" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="4,500" required/></label><label>Expected payment week<select value={form.week} onChange={e=>setForm({...form,week:e.target.value})}>{weeks.map((w,i)=><option key={w} value={i}>Week of {w}</option>)}</select></label><button className="primary-button" type="submit"><Plus size={17}/> Add to forecast</button></form></div></div>}

    {showPlan && <div className="modal-backdrop" onMouseDown={()=>setShowPlan(false)}><div className="modal plan-modal" role="dialog" aria-modal="true" aria-labelledby="plan-title" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={()=>setShowPlan(false)}><X size={20}/></button><div className="section-kicker">YOUR ASSUMPTIONS</div><h2 id="plan-title">Edit your cash plan</h2><p>These values feed the forecast and funding view immediately.</p><label className="opening-field">Starting cash ($)<input type="number" value={plan.opening} onChange={e=>setPlan({...plan,opening:Number(e.target.value)})}/></label><div className="plan-grid"><strong>Week of</strong><strong>Regular income</strong><strong>Bills</strong>{weeks.map((w,i)=><div className="plan-row" key={w}><span>{w}</span><input aria-label={`Income week of ${w}`} type="number" value={plan.weeklyIncome[i]} onChange={e=>setPlan({...plan,weeklyIncome:plan.weeklyIncome.map((n,j)=>j===i?Number(e.target.value):n)})}/><input aria-label={`Bills week of ${w}`} type="number" value={plan.weeklyBills[i]} onChange={e=>setPlan({...plan,weeklyBills:plan.weeklyBills.map((n,j)=>j===i?Number(e.target.value):n)})}/></div>)}</div><button className="primary-button" onClick={()=>{setShowPlan(false);setToast('Plan updated across your workspace.')}}><Check size={17}/> Done</button></div></div>}
    {toast && <div className="toast"><Check size={17}/>{toast}</div>}
  </div>
}

function Metric({icon:Icon,title,value,detail,tone}) { return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={20}/></div><span>{title}</span><strong>{value}</strong><small>{detail}</small></div> }
function PageTitle({kicker,title,desc,action}) { return <div className="page-heading section-heading"><div><div className="eyebrow">{kicker}</div><h1>{title}</h1><p>{desc}</p></div>{action}</div> }
function StepCard({number,title,text,action,onClick}) { return <div className="step-card"><span>{number}</span><h3>{title}</h3><p>{text}</p><button onClick={onClick}>{action} <ArrowRight size={16}/></button></div> }
function FlowStrip({navigate}) { return <div className="flow-strip"><div className="flow-intro"><span className="section-kicker">CONNECTED BY DESIGN</span><h3>One change. A clearer next move.</h3><p>Each stage uses the answer from the one before it.</p></div><button onClick={()=>navigate('Invoices')}><span>01</span><FileText size={18}/><strong>Invoices</strong><small>What’s coming in</small></button><ChevronRight className="flow-chevron" size={19}/><button onClick={()=>navigate('Cash forecast')}><span>02</span><TrendingUp size={18}/><strong>Forecast</strong><small>When it arrives</small></button><ChevronRight className="flow-chevron" size={19}/><button onClick={()=>navigate('True cost')}><span>03</span><CreditCard size={18}/><strong>True cost</strong><small>What you actually need</small></button></div> }

function ForecastChart({points,buffer,large=false}) {
  const width=760, height=large?270:208, left=52, right=20, top=22, bottom=35
  const values=points.map(p=>p.balance)
  const min=Math.min(0,buffer,...values)-1500, max=Math.max(buffer,...values)+2200
  const x=i=>left+i*(width-left-right)/(points.length-1)
  const y=v=>top+(max-v)*(height-top-bottom)/(max-min)
  const path=points.map((p,i)=>`${i?'L':'M'} ${x(i)} ${y(p.balance)}`).join(' ')
  const area=`${path} L ${x(points.length-1)} ${height-bottom} L ${x(0)} ${height-bottom} Z`
  const grid=[0,1,2,3].map(i=>min+(max-min)*i/3)
  return <div className={`chart ${large?'chart-large':''}`}><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Projected cash balance from ${money(points[0].balance)} to ${money(points.at(-1).balance)} over six weeks`} preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4767e8" stopOpacity=".17"/><stop offset="100%" stopColor="#4767e8" stopOpacity=".005"/></linearGradient></defs>{grid.map((v,i)=><g key={i}><line x1={left} x2={width-right} y1={y(v)} y2={y(v)} stroke="#e9ecef" strokeDasharray="4 5"/><text x="0" y={y(v)+4} fill="#98a2ae" fontSize="11">{compact(Math.max(0,Math.round(v/1000)*1000))}</text></g>)}<line x1={left} x2={width-right} y1={y(buffer)} y2={y(buffer)} stroke="#b3c0dc" strokeWidth="1.5" strokeDasharray="5 6"/><path d={area} fill="url(#chartFill)"/><path d={path} fill="none" stroke="#4767e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{points.map((p,i)=><g key={i}><circle cx={x(i)} cy={y(p.balance)} r="5" fill="#fff" stroke="#4767e8" strokeWidth="3"/><text x={x(i)} y={height-8} textAnchor="middle" fill="#97a0aa" fontSize="11">{p.label}</text></g>)}</svg></div>
}

export default App
