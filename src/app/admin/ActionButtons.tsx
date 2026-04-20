'use client'

import { useState } from 'react'
import { approveBooking, rejectBooking } from './actions'

export default function ActionButtons({ id }: { id: string }) {
  const [modal, setModal] = useState<'NONE' | 'APPROVE' | 'REJECT'>('NONE')
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    if (!inputVal) return alert('Zoom link required')
    setLoading(true)
    await approveBooking(id, inputVal)
    setModal('NONE')
    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)
    await rejectBooking(id, inputVal || 'Declined')
    setModal('NONE')
    setLoading(false)
  }

  return (
    <div>
      <div className="flex gap-2">
        <button onClick={() => setModal('APPROVE')} className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-md text-xs font-semibold hover:bg-primary hover:text-black transition-colors">
          Approve
        </button>
        <button onClick={() => setModal('REJECT')} className="bg-destructive/20 text-destructive border border-destructive/30 px-3 py-1 rounded-md text-xs font-semibold hover:bg-destructive hover:text-white transition-colors">
          Cancel
        </button>
      </div>

      {modal !== 'NONE' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-sm p-6 rounded-xl border border-border shadow-glow-sm">
            <h3 className="text-lg font-bold mb-4 font-display text-foreground">
              {modal === 'APPROVE' ? 'Provide Zoom Link' : 'Cancellation Note'}
            </h3>
            <input 
              type="text" 
              className="w-full p-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-all mb-4"
              placeholder={modal === 'APPROVE' ? 'e.g. https://zoom.us/j/1234...' : 'e.g. Please reschedule...'}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal('NONE')} className="px-4 py-2 border border-border text-foreground rounded-md text-sm hover:bg-muted transition-colors">
                Close
              </button>
              <button 
                onClick={modal === 'APPROVE' ? handleApprove : handleReject}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 ${
                  modal === 'APPROVE' ? 'bg-primary text-black hover:bg-primary-60' : 'bg-destructive text-white hover:bg-red-600'
                }`}
              >
                {loading ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
