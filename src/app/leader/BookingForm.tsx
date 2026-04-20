'use client'

import { useRef, useState } from 'react'
import { createBooking } from './actions'
import { useLanguage } from '@/providers/LanguageProvider'

export default function BookingForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

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
        {t('leader.form_title')}
      </h2>

      {success && (
        <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-md mb-4 text-sm">
          {t('leader.success')}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/80">{t('leader.meeting_type')}</label>
          <select 
            name="meetingType" 
            className="w-full p-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-all"
            required
          >
            <option value="">{t('leader.select_duration')}</option>
            <option value="15m">{t('leader.15m')}</option>
            <option value="30m">{t('leader.30m')}</option>
            <option value="60m">{t('leader.60m')}</option>
            <option value=">60m">{t('leader.60m_plus')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/80">{t('leader.preferred_time')}</label>
          <input 
            type="datetime-local" 
            name="preferredTime"
            className="w-full p-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-all [color-scheme:dark]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/80">{t('leader.reason')}</label>
          <textarea 
            name="reason" 
            rows={4}
            className="w-full p-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-all"
            placeholder={t('leader.reason_placeholder')}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-primary hover:bg-primary-60 text-primary-foreground font-semibold px-6 py-2.5 rounded-md w-full sm:w-auto transition-all disabled:opacity-50 mt-4"
        >
          {loading ? t('leader.submitting') : t('leader.submit')}
        </button>
      </form>
    </div>
  )
}
