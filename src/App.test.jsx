// @vitest-environment jsdom
import React, { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'
import { seed } from './plan.js'

function TestDashboard() {
  const [plan, setPlan] = useState(() => structuredClone(seed))
  return <App plan={plan} setPlan={setPlan} user={{ email: 'owner@example.com' }} onSignOut={() => {}} saveState="Saved" />
}

beforeEach(() => vi.stubGlobal('scrollTo', vi.fn()))
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('connected dashboard actions', () => {
  it('carries a delayed client payment through the forecast into borrowing', async () => {
    const user = userEvent.setup()
    render(<TestDashboard />)
    await user.click(screen.getByRole('button', { name: /Try a late payment/i }))
    expect(document.querySelector('.status-card').textContent).toContain('$1,300')
    await user.click(screen.getByRole('button', { name: 'Borrowing check' }))
    expect(document.querySelector('.decision-stat').textContent).toContain('$3,700')
    expect(document.querySelector('.decision-stat').textContent).toContain('$1,300')
    expect(document.querySelector('.loan-card').textContent).toContain('$1,300')
  })

  it('adds a received payment to current cash and removes its later forecast income', async () => {
    const user = userEvent.setup()
    render(<TestDashboard />)
    await user.click(screen.getByRole('button', { name: 'Client payments' }))
    const atlasRow = screen.getByText('Atlas Commerce').closest('tr')
    await user.click(within(atlasRow).getByRole('button', { name: 'Payment received' }))
    await user.click(screen.getByRole('button', { name: 'Home' }))
    const cashCard = screen.getByText('Cash available now').closest('.metric-card')
    expect(cashCard.textContent).toContain('$14,200')
  })

  it('adds a bill and increases the gap shown by the borrowing check', async () => {
    const user = userEvent.setup()
    render(<TestDashboard />)
    await user.click(screen.getByRole('button', { name: 'Money plan' }))
    await user.click(screen.getAllByRole('button', { name: 'Add a bill' })[0])
    await user.type(screen.getByLabelText('What is this bill for?'), 'Rent')
    await user.type(screen.getByLabelText('Amount to pay ($)'), '3000')
    await user.click(screen.getByRole('button', { name: 'Add bill' }))
    expect(screen.getByText('Rent')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Borrowing check' }))
    expect(document.querySelector('.decision-stat').textContent).toContain('$300')
  })

  it('uses the chosen safety amount in the borrowing recommendation', async () => {
    const user = userEvent.setup()
    render(<TestDashboard />)
    await user.click(screen.getByRole('button', { name: 'Edit my numbers' }))
    const safetyInput = screen.getByLabelText('Safety amount to keep aside ($)')
    await user.clear(safetyInput)
    await user.type(safetyInput, '10000')
    await user.click(screen.getByRole('button', { name: 'Done' }))
    await user.click(screen.getByRole('button', { name: 'Borrowing check' }))
    expect(document.querySelector('.decision-stat').textContent).toContain('$2,300')
  })
})
