// @vitest-environment jsdom
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Landing from './Landing.jsx'

afterEach(cleanup)

describe('public welcome page', () => {
  it('explains the connected money workflow and opens account creation', async () => {
    const onGetStarted = vi.fn()
    render(<Landing onGetStarted={onGetStarted} onSignIn={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /Know if you can cover your bills/i })).toBeTruthy()
    expect(screen.getByText('Handle late invoices')).toBeTruthy()
    expect(screen.getByText('Decide whether to borrow')).toBeTruthy()
    expect(screen.getByRole('list').querySelectorAll('li')).toHaveLength(4)
    await userEvent.click(screen.getByRole('button', { name: /Get started free/i }))
    expect(onGetStarted).toHaveBeenCalledOnce()
  })

  it('offers returning users a sign-in route', async () => {
    const onSignIn = vi.fn()
    render(<Landing onGetStarted={vi.fn()} onSignIn={onSignIn} />)
    await userEvent.click(screen.getByRole('button', { name: /^Sign in/i }))
    expect(onSignIn).toHaveBeenCalledOnce()
  })
})
