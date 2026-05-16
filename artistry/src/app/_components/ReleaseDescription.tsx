'use client'

import { X } from 'lucide-react'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

import styles from './ReleaseDescription.module.css'

interface Props {
  title: string
  releaseType?: string | null
  description: string
  className?: string
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export default function ReleaseDescription({ title, releaseType, description, className }: Props) {
  const descRef = useRef<HTMLParagraphElement | null>(null)
  const [overflowing, setOverflowing] = useState(false)
  const [open, setOpen] = useState(false)

  useIsoLayoutEffect(() => {
    const el = descRef.current
    if (!el) return
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 1)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    window.addEventListener('resize', check)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', check)
    }
  }, [description])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={styles.descWrap}>
      <p ref={descRef} className={`${styles.desc}${className ? ` ${className}` : ''}`}>
        {description}
      </p>
      {overflowing && (
        <button type="button" className={styles.seeMore} onClick={() => setOpen(true)}>
          See more
        </button>
      )}

      {open && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} description`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className={styles.modal}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            {releaseType && <div className={styles.modalKicker}>{releaseType}</div>}
            <h3 className={styles.modalTitle}>{title}</h3>
            <p className={styles.modalBody}>{description}</p>
          </div>
        </div>
      )}
    </div>
  )
}
