import React from 'react'
import { ArrowRight, FileClock, RotateCcw } from 'lucide-react'
import { forecast, getPlanSummary, setInvoiceStatus } from './plan.js'

const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

export default function DemoImpact({ plan, invoice, onToggleDelay, onOpenBorrowing, onWriteReminder }) {
  const delayed = invoice.status === 'late'
  const onTimePlan = delayed ? setInvoiceStatus(plan, invoice.id, 'expected') : plan
  const latePlan = delayed ? plan : setInvoiceStatus(plan, invoice.id, 'late')
  const onTime = getPlanSummary(onTimePlan, forecast(onTimePlan))
  const late = getPlanSummary(latePlan, forecast(latePlan))

  return <section className={`demo-impact ${delayed ? 'demo-impact-active' : ''}`} aria-labelledby="demo-impact-title">
    <div className="demo-impact-heading">
      <div><span className="demo-impact-kicker"><span className="demo-live-dot" /> LIVE DEMO · SAMPLE DATA</span><h2 id="demo-impact-title">One late payment changes the answer.</h2><p>Atlas Commerce owes {money(invoice.amount)}. Move its payment two weeks later and watch Tide recalculate the cash you have after bills.</p></div>
      <span className="demo-impact-time">60-second story</span>
    </div>
    <div className="demo-impact-comparison" aria-live="polite">
      <div className="demo-impact-number"><span>IF PAID ON TIME</span><strong>{money(onTime.lowest)}</strong><small>Lowest cash after bills</small></div>
      <div className="demo-impact-arrow" aria-hidden="true"><ArrowRight size={22}/></div>
      <div className="demo-impact-number"><span>IF PAID LATE</span><strong className={delayed ? 'demo-impact-warn' : ''}>{delayed ? money(late.lowest) : '—'}</strong><small>{delayed ? 'Lowest cash after bills' : 'Click below to find out'}</small></div>
      <div className="demo-impact-number demo-impact-gap"><span>GAP TO YOUR SAFETY AMOUNT</span><strong className={delayed ? 'demo-impact-warn' : ''}>{delayed ? money(late.bufferGap) : '—'}</strong><small>{delayed ? `To keep ${money(late.buffer)} aside` : 'Calculated from the forecast'}</small></div>
    </div>
    {delayed && <p className="demo-impact-explanation" role="status">The lowest projected balance falls by {money(onTime.lowest - late.lowest)}. {late.shortfall ? `The plan is ${money(late.shortfall)} short for bills.` : late.bufferGap ? `Bills are covered, but the plan drops ${money(late.bufferGap)} below your safety amount.` : 'Bills and your safety amount remain covered.'} Open the borrowing check to see the decision and example cost.</p>}
    <div className="demo-impact-actions">
      <button type="button" className="demo-impact-primary" onClick={onToggleDelay}>{delayed ? <RotateCcw size={17}/> : <FileClock size={17}/>} {delayed ? 'Restore on-time payment' : 'Delay Atlas payment'} </button>
      {delayed && <><button type="button" className="demo-impact-secondary" onClick={onOpenBorrowing}>See borrowing decision <ArrowRight size={16}/></button><button type="button" className="demo-impact-secondary" onClick={onWriteReminder}>Draft reminder <ArrowRight size={16}/></button></>}
    </div>
  </section>
}
