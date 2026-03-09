"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-16">
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/football-tech.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover saturate-[0.3] brightness-[0.35]"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-background/60" />
      </div>

      {/* Background gradient orbs (sobre a imagem) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00D66C]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0066FF]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B5CF6]/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="CoachLab"
            width={160}
            height={160}
            className="rounded-full glow-green mx-auto"
          />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00D66C]/10 border border-[#00D66C]/30 text-[#00D66C] text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-[#00D66C] animate-pulse" />
            Platform for Football Coaches
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          The ultimate{" "}
          <br className="hidden sm:block" />
          <span className="text-gradient-brand">platform for football coaches</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
        >
          Manage your squad, plan training sessions, analyse matches, scout players, manage the medical department, and more — all in one application.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link href="/dashboard/plantel">
            <Button
              size="lg"
              className="h-12 px-8 text-base font-semibold bg-[#00D66C] hover:bg-[#00D66C]/90 text-black gap-2"
            >
              Explore PRO Dashboard
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/board">
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base font-semibold border-[#0066FF]/40 text-[#0066FF] hover:bg-[#0066FF]/10 gap-2"
            >
              <Play className="w-4 h-4" />
              Tactical Board (Free)
            </Button>
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
