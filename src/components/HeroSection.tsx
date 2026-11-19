'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Clock,
  Plane,
  MapPin,
  Calendar,
  Luggage,
  Calculator,
  ArrowRight,
  CheckCircle2,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  const { settings, setIsCustomModalOpen } = useStore();

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(settings.poCloseDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isEnded: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.poCloseDate]);

  const quotaPercent = Math.min(
    100,
    Math.round((settings.usedLuggageQuotaKg / settings.totalLuggageQuotaKg) * 100)
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-10 pb-16 lg:pt-14 lg:pb-24">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Heading, Context, and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>OPEN PRE-ORDER AKTIF</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/15 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{settings.poOrigin}</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-none">
              Jasa Titip Terpercaya <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-indigo-200 bg-clip-text text-transparent">
                Yangzhou China 🇨🇳 ✈️ 🇮🇩
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {settings.poSubtitle} Kami melayani titipan kosmetik viral, merchandise, fashion streetwear, cemilan khas, hingga custom link dari <strong>Taobao</strong> & <strong>1688</strong> dengan perhitungan kurs transparan!
            </p>

            {/* Key Value Props / Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-left">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-200">100% Produk Original</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-200">Fee Mulai Rp25rb / 10%</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-200">Garansi Refund Jika Kosong</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="#katalog"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Lihat Katalog Produk PO</span>
              </a>

              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm backdrop-blur-xs transition-all"
              >
                <Calculator className="w-4 h-4 text-amber-300" />
                <span>Kalkulator & Request Custom</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Schedule & Countdown Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
              {/* Highlight ribbon */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Jadwal Batch Berjalan
                  </span>
                </div>
                <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                  Batch #2
                </span>
              </div>

              {/* Countdown Component */}
              <div className="mt-5 text-center">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-3">
                  <Clock className="w-4 h-4 text-amber-400" />
                  PO Ditutup Dalam:
                </p>

                {timeLeft.isEnded ? (
                  <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-sm font-semibold">
                    PO Batch Ini Telah Ditutup! Hubungi admin untuk batch berikutnya.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3 text-center">
                      <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                        {String(timeLeft.days).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold">Hari</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3 text-center">
                      <span className="block text-2xl sm:text-3xl font-black text-white font-mono">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold">Jam</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3 text-center">
                      <span className="block text-2xl sm:text-3xl font-black text-white font-mono">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold">Menit</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3 text-center">
                      <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold">Detik</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule Timeline Information */}
              <div className="mt-6 space-y-3.5 bg-black/30 p-4 rounded-2xl border border-white/10 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Plane className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Estimasi Mendarat di RI:</span>
                  </div>
                  <span className="font-bold text-white text-right">{settings.estArrivalDate}</span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Mulai Kirim ke Alamat:</span>
                  </div>
                  <span className="font-bold text-emerald-400 text-right">{settings.estLocalShippingDate}</span>
                </div>

                {/* Quota Progress */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Luggage className="w-3.5 h-3.5 text-amber-400" />
                      Kuota Bagasi Terisi:
                    </span>
                    <span className="font-bold text-amber-300">
                      {settings.usedLuggageQuotaKg} kg / {settings.totalLuggageQuotaKg} kg ({quotaPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${quotaPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 text-right">
                    Tersisa <strong>{(settings.totalLuggageQuotaKg - settings.usedLuggageQuotaKg).toFixed(1)} kg</strong> lagi!
                  </p>
                </div>
              </div>

              {/* Direct Track Shortcut */}
              <div className="mt-5 flex items-center justify-between text-xs bg-indigo-950/60 p-3 rounded-xl border border-indigo-500/30">
                <span className="text-slate-300">Sudah punya Kode Booking?</span>
                <Link
                  href="/track"
                  className="inline-flex items-center gap-1 text-amber-400 font-bold hover:underline"
                >
                  Lacak di sini <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
