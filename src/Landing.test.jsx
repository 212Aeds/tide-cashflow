// @vitest-environment jsdom
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Landing from './Landing.jsx'

afterEach(cleanup)

describe('public welcome page', () => {
  it('explains the connected money workflow and opens the live demo', async () => {
    const onTryDemo = vi.fn()
    render(<Landing onGetStarted={vi.fn()} onSignIn={vi.fn()} onTryDemo={onTryDemo} />)
    expect(screen.getByRole('heading', { name: /Know if you can cover your bills/i })).toBeTruthy()
    expect(screen.getByText('Track payments')).toBeTruthy()
    expect(screen.getByText('Compare loan costs')).toBeTruthy()
    expect(screen.getByRole('list').querySelectorAll('li')).toHaveLength(4)
    await userEvent.click(screen.getAllByRole('button', { name: /Try Tide/i })[0])
    expect(onTryDemo).toHaveBeenCalledOnce()
  })

  it('offers account creation and returning-user sign-in', async () => {
    const onSignIn = vi.fn()
    const onGetStarted = vi.fn()
    render(<Landing onGetStarted={onGetStarted} onSignIn={onSignIn} onTryDemo={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /Create my account/i }))
    expect(onGetStarted).toHaveBeenCalledOnce()
    await userEvent.click(screen.getByRole('button', { name: /^Sign in/i }))
    expect(onSignIn).toHaveBeenCalledOnce()
  })
})
