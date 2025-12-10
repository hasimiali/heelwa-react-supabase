'use client'

import { useState } from 'react'
import heroVideo from '../assets/videos/hero.mp4' // ✅ import video

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        src={heroVideo} // ✅ use imported video
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
