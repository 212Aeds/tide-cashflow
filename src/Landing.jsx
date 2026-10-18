import React from 'react'
import { ArrowRight, CalendarDays, CircleDollarSign, FileClock, TrendingUp } from 'lucide-react'

const steps = [
  { icon: CalendarDays, title: 'Plan what is coming', description: 'Add your expected client payments and upcoming bills in one simple plan.' },
  { icon: FileClock, title: 'Handle late invoices', description: 'Mark a payment late and prepare a friendly reminder to send to your client.' },
  { icon: TrendingUp, title: 'See the new forecast', description: 'Tide updates your cash outlook so you can spot a shortfall before a bill is due.' },
  { icon: CircleDollarSign, title: 'Decide whether to borrow', description: 'Compare the amount you may need with the full cost of a loan.' },
]

export default function Landing({ onGetStarted, onSignIn }) {
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
            <button type="button" className="landing-primary" onClick={onGetStarted}>Get started free <ArrowRight size={18} aria-hidden="true" /></button>
            <a href="#how-it-works" className="landing-secondary">See how it works</a>
          </div>
          <span className="landing-note">Start with a sample plan. Add your own numbers when you are ready.</span>
        </div>
        <div className="landing-preview" aria-label="Example cash flow plan">
          <div className="landing-preview-head"><span className="landing-preview-dot" /> YOUR MONEY PLAN <span>THIS MONTH</span></div>
          <div className="landing-preview-main"><span>Can I cover my bills?</span><strong>Yes, with a $540 cushion</strong><small>Based on the payments and bills in your plan</small></div>
          <div className="landing-preview-divider" />
          <div className="landing-preview-row"><span><i className="landing-income-dot" /> Client payments</span><strong>+$4,200</strong></div>
          <div className="landing-preview-row"><span><i className="landing-bill-dot" /> Upcoming bills</span><strong>−$3,660</strong></div>
          <div className="landing-preview-alert"><FileClock size={18} aria-hidden="true" /><span>If a client pays late, Tide updates this answer.</span></div>
          <span className="landing-preview-caption">Illustrative example</span>
        </div>
      </section>

      <section className="landing-how" id="how-it-works" aria-labelledby="landing-how-title">
        <div className="landing-section-heading"><span className="landing-eyebrow">ONE CONNECTED WORKFLOW</span><h2 id="landing-how-title">From a late payment to a clear next step.</h2><p>Each step uses what you entered before it, so your decision reflects your actual plan.</p></div>
        <div className="landing-steps">{steps.map(({ icon: Icon, title, description }, index) => <article className="landing-step" key={title}><div className="landing-step-top"><span>{String(index + 1).padStart(2, '0')}</span><Icon size={22} aria-hidden="true" /></div><h3>{title}</h3><p>{description}</p></article>)}</div>
        <div className="landing-bottom-cta"><div><strong>Ready to see your own numbers?</strong><span>Create an account to save your plan and return to it later.</span></div><button type="button" className="landing-primary" onClick={onGetStarted}>Create my plan <ArrowRight size={18} aria-hidden="true" /></button></div>
      </section>
    </main>
    <footer className="landing-footer"><span>tide. · A hackathon demo for clearer money decisions</span><span>Estimates depend on the numbers you enter.</span></footer>
  </div>
}
