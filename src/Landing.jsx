import React from 'react'
import { ArrowRight, CalendarDays, CircleDollarSign, FileClock, TrendingUp } from 'lucide-react'

const steps = [
  { icon: CalendarDays, title: 'Plan what is coming', description: 'Add your expected client payments and upcoming bills in one simple plan.' },
  { icon: FileClock, title: 'Handle late invoices', description: 'Mark a payment late and prepare a friendly reminder to send to your client.' },
  { icon: TrendingUp, title: 'See the new forecast', description: 'Tide updates your cash outlook so you can spot a shortfall before a bill is due.' },
  { icon: CircleDollarSign, title: 'Decide whether to borrow', description: 'Compare the amount you may need with the full cost of a loan.' },
]

export default function Landing({ onGetStarted, onSignIn, onTryDemo }) {
  return <div className="landing-page">
    <header className="landing-header">
      <div className="landing-brand" aria-label="Tide home"><div className="brand-mark"><span /></div><span>tide<span className="brand-period">.</span></span></div>
      <button type="button" className="landing-signin" onClick={onSignIn}>Sign in <ArrowRight size={17} aria-hidden="true" /></button>
    </header>

    <main>
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">A CLEARER WAY TO MANAGE CASH FLOW</span>
          <h1 id="landing-title">Know if you can <em>cover your bills.</em></h1>
          <p>For freelancers and small teams paid by clients, Tide brings payments, bills, and borrowing decisions into one easy place.</p>
          <div className="landing-actions">
            <button type="button" className="landing-primary" onClick={onTryDemo}>Try the live demo <ArrowRight size={18} aria-hidden="true" /></button>
            <button type="button" className="landing-secondary landing-text-button" onClick={onGetStarted}>Create my account</button>
          </div>
          <span className="landing-note">No account needed for the demo. See a late payment change the forecast in one click.</span>
        </div>
        <div className="landing-preview" aria-label="Example cash flow plan">
          <div className="landing-preview-head"><span className="landing-preview-dot" /> SAMPLE MONEY PLAN <span>NEXT 6 WEEKS</span></div>
          <div className="landing-preview-main"><span>Can I cover my bills?</span><strong>Yes, with $2,700 to spare</strong><small>Above the safety amount in this sample plan</small></div>
          <div className="landing-preview-divider" />
          <div className="landing-preview-row"><span><i className="landing-income-dot" /> Lowest cash after bills</span><strong>$7,700</strong></div>
          <div className="landing-preview-row"><span><i className="landing-bill-dot" /> Safety amount to keep</span><strong>$5,000</strong></div>
          <div className="landing-preview-alert"><FileClock size={18} aria-hidden="true" /><span>Try one late invoice to see this answer change.</span></div>
          <span className="landing-preview-caption">Sample figures · no account needed</span>
        </div>
      </section>

      <section className="landing-how" id="how-it-works" aria-labelledby="landing-how-title">
        <div className="landing-section-heading"><span className="landing-eyebrow">ONE CONNECTED WORKFLOW</span><h2 id="landing-how-title">From a late payment to a clear next step.</h2><p>Each step uses what you entered before it, so your decision reflects your actual plan.</p></div>
        <ol className="landing-steps">{steps.map(({ icon: Icon, title, description }, index) => <li className="landing-step" key={title}><div className="landing-step-top"><span>{String(index + 1).padStart(2, '0')}</span><Icon size={22} aria-hidden="true" /></div><h3>{title}</h3><p>{description}</p></li>)}</ol>
        <div className="landing-bottom-cta"><div><strong>See the whole workflow in 60 seconds.</strong><span>Try a sample payment delay, then follow the forecast into a borrowing decision.</span></div><button type="button" className="landing-primary" onClick={onTryDemo}>Open live demo <ArrowRight size={18} aria-hidden="true" /></button></div>
      </section>
    </main>
    <footer className="landing-footer"><span>tide. · A hackathon demo for clearer money decisions</span><span>Estimates depend on the numbers you enter.</span></footer>
  </div>
}
