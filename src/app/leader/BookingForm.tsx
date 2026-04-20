'use client'

import { useRef, useState } from 'react'
import { createBooking } from './actions'

export default function BookingForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      await createBooking(formData)
      setSuccess(true)
      formRef.current?.reset()
    } catch (e) {
      setError((e as Error).message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card shadow-glow-sm rounded-xl p-6 border border-border">
      <h2 className="text-xl font-bold font-display text-primary mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        Request New Meeting
      </h2>

      {success && (
        <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-md mb-4 text-sm">
          Booking requested successfully! Waiting for Director approval.
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/80">Meeting Type</label>
          <select 
            name="meetingType" 
            className="w-full p-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-all"
            required
          >
            <option value="">-- Select Duration --</option>
            <option value="15m">15 Minutes (Quick Sync / F1 Intro)</option>
            <option value="30m">30 Minutes (Standard Consultation)</option>
            <option value="60m">60 Minutes (VIP Closing Support)</option>
            <option value=">60m">&gt; 60 Minutes (Team Training)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/80">Preferred Time (Your Local Time)</label>
          <input 
            type="datetime-local" 
            name="preferredTime"
            className="w-full p-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-all [color-scheme:dark]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/80">Reason / Notes</label>
          <textarea 
            name="reason" 
            rows={4}
            className="w-full p-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-all"
            placeholder="E.g. VIP client wants to invest 50k$, need Director to close..."
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-primary hover:bg-primary-60 text-primary-foreground font-semibold px-6 py-2.5 rounded-md w-full sm:w-auto transition-all disabled:opacity-50 mt-4"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  )
}
