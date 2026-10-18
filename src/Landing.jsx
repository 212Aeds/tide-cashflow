import React from 'react'
import { ArrowRight, CalendarDays, CircleDollarSign, FileClock, TrendingUp } from 'lucide-react'

const steps = [
  { icon: CalendarDays, title: 'Add your numbers', description: 'Enter the money you have, what clients owe you, and your upcoming bills.' },
  { icon: FileClock, title: 'Track payments', description: 'Move a late payment and write a reminder for your client.' },
  { icon: TrendingUp, title: 'Check your cash', description: 'See how much money is left each week after your bills.' },
  { icon: CircleDollarSign, title: 'Compare loan costs', description: 'See whether you need to borrow and what an example loan would cost.' },
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
          <span className="landing-eyebrow">FOR FREELANCERS PAID BY CLIENTS</span>
          <h1 id="landing-title">Know if you can <em>cover your bills.</em></h1>
          <p>A client says they will pay next week. Your bills are due now. Tide shows what the delay does to your money and whether borrowing would help.</p>
          <div className="landing-actions">
            <button type="button" className="landing-primary" onClick={onTryDemo}>Try Tide <ArrowRight size={18} aria-hidden="true" /></button>
            <button type="button" className="landing-secondary landing-text-button" onClick={onGetStarted}>Create my account</button>
          </div>
          <span className="landing-note">No account needed. Try moving one sample invoice two weeks later.</span>
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
        <div className="landing-section-heading"><span className="landing-eyebrow">HOW IT WORKS</span><h2 id="landing-how-title">See what one late payment changes.</h2><p>Move a payment, see what happens to your bills, and choose your next step.</p></div>
        <ol className="landing-steps">{steps.map(({ icon: Icon, title, description }, index) => <li className="landing-step" key={title}><div className="landing-step-top"><span>{String(index + 1).padStart(2, '0')}</span><Icon size={22} aria-hidden="true" /></div><h3>{title}</h3><p>{description}</p></li>)}</ol>
        <div className="landing-bottom-cta"><div><strong>Try the $6,200 late payment.</strong><span>Watch the lowest cash after bills change from $7,700 to $3,700.</span></div><button type="button" className="landing-primary" onClick={onTryDemo}>Try Tide <ArrowRight size={18} aria-hidden="true" /></button></div>
      </section>
    </main>
    <footer className="landing-footer"><span>tide. · Aeden Gray and Stavya Palassery · TrojanHacks 2026</span><span>Estimates depend on the numbers you enter.</span></footer>
  </div>
}
