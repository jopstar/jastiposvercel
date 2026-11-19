'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CustomRequestModal from '@/components/CustomRequestModal';
import { useStore } from '@/lib/store';
import { OrderStatus } from '@/types';
import { 
  Search, 
  Package, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Plane, 
  Truck, 
  ShoppingBag, 
  AlertCircle, 
  Copy, 
  Check, 
  MessageCircle, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  LucideIcon
} from 'lucide-react';

function TrackContent() {
  const { getOrderByCode, fetchOrderByCode, orders, settings, formatIDR, formatCNY } = useStore();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') || '';

  const [inputCode, setInputCode] = useState(codeParam);
  const [activeCode, setActiveCode] = useState(codeParam.trim().toUpperCase());
  const [copiedResi, setCopiedResi] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (activeCode) {
      fetchOrderByCode(activeCode);
    }
  }, [activeCode, fetchOrderByCode]);

  const currentOrder = activeCode ? getOrderByCode(activeCode) || null : null;
  const hasSearched = Boolean(activeCode);

  const handleSearchCode = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    setActiveCode(trimmed);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchCode(inputCode);
  };

  const copyText = (text: string, type: 'resi' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'resi') {
      setCopiedResi(true);
      setTimeout(() => setCopiedResi(false), 1500);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    }
  };

  // Timeline Step Definitions
  const timelineSteps: { status: OrderStatus; label: string; sub: string; icon: LucideIcon }[] = [
    {
      status: 'MENUNGGU_KONFIRMASI',
      label: 'Menunggu Konfirmasi',
      sub: 'Verifikasi DP & slot',
      icon: Clock,
    },
    {
      status: 'BARANG_DIBELIKAN',
      label: 'Barang Dibelikan',
      sub: 'Di store fisik Yangzhou',
      icon: ShoppingBag,
    },
    {
      status: 'DALAM_PERJALANAN',
      label: 'Kargo Internasional',
      sub: 'Air cargo China -> CGK',
      icon: Plane,
    },
    {
      status: 'TIBA_DI_INDO',
      label: 'Tiba di Gudang Jakarta',
      sub: 'Quality check & packing',
      icon: Package,
    },
    {
      status: 'DIKIRIM_KE_PEMBELI',
      label: 'Dikirim ke Pembeli',
      sub: 'Resi kurir lokal aktif',
      icon: Truck,
    },
  ];

  const getStepState = (stepStatus: OrderStatus, currentOrderStatus: OrderStatus) => {
    const orderIndexMap: Record<OrderStatus, number> = {
      MENUNGGU_KONFIRMASI: 0,
      BARANG_DIBELIKAN: 1,
      DALAM_PERJALANAN: 2,
      TIBA_DI_INDO: 3,
      DIKIRIM_KE_PEMBELI: 4,
      SELESAI: 5,
      DIBATALKAN: -1,
    };

    const currentIdx = orderIndexMap[currentOrderStatus] ?? 0;
    const stepIdx = orderIndexMap[stepStatus] ?? 0;

    if (currentOrderStatus === 'DIBATALKAN') return 'cancelled';
    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <Package className="w-3.5 h-3.5" />
          Live Tracking Jastip
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Lacak Status Barang Titipan Anda
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Masukkan Kode Booking unik (misal: <strong>JST-202611-1001</strong>) yang Anda dapatkan saat melakukan checkout pesanan.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleFormSubmit} className="relative">
          <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 sm:p-2.5 rounded-2xl border-2 border-slate-200 shadow-md focus-within:border-indigo-600 transition-all">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Masukkan Kode Booking (contoh: JST-202611-1001)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full pl-11 pr-4 py-3 text-sm sm:text-base font-mono font-bold tracking-wider rounded-xl uppercase focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Lacak Paket</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Sample Code Chips for Easy Testing */}
        <div className="mt-3.5 flex items-center justify-center flex-wrap gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Coba kode demo:</span>
          {orders.slice(0, 4).map((o) => (
            <button
              key={o.bookingCode}
              type="button"
              onClick={() => {
                setInputCode(o.bookingCode);
                handleSearchCode(o.bookingCode);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 font-mono text-[11px] font-semibold border border-slate-200 transition-colors"
            >
              {o.bookingCode}
            </button>
          ))}
        </div>
      </div>

      {/* RESULT SECTION */}
      {hasSearched && !currentOrder && (
        <div className="bg-white rounded-3xl border border-red-200 p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Kode Booking Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Kode <strong>{inputCode}</strong> tidak terdaftar di sistem kami. Pastikan format kode sudah benar atau hubungi Admin WhatsApp jika Anda baru saja mentransfer.
            </p>
          </div>
          <button
            onClick={() => handleSearchCode('JST-202611-1001')}
            className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100"
          >
            Lihat Contoh Booking: JST-202611-1001
          </button>
        </div>
      )}

      {currentOrder && (
        <div className="space-y-8 animate-fadeIn">
          {/* Status Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Kode Booking:
                  </span>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    <span className="font-mono font-black text-slate-900 text-sm sm:text-base">
                      {currentOrder.bookingCode}
                    </span>
                    <button
                      onClick={() => copyText(currentOrder.bookingCode, 'code')}
                      className="text-slate-400 hover:text-slate-700"
                      title="Salin"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Dibuat pada:{' '}
                  {new Date(currentOrder.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  WIB
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  Status: {currentOrder.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Stepper Timeline Visualizer */}
            <div className="pt-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                Progress Perjalanan Titipan
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                {timelineSteps.map((step, idx) => {
                  const state = getStepState(step.status, currentOrder.status);
                  const Icon = step.icon;

                  let cardBg = 'bg-slate-50 border-slate-200 text-slate-400';
                  let iconBg = 'bg-slate-200 text-slate-500';

                  if (state === 'completed') {
                    cardBg = 'bg-emerald-50/60 border-emerald-300 text-emerald-950';
                    iconBg = 'bg-emerald-600 text-white';
                  } else if (state === 'active') {
                    cardBg = 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-md ring-2 ring-indigo-500/20';
                    iconBg = 'bg-indigo-600 text-white animate-bounce';
                  }

                  return (
                    <div
                      key={step.status}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative ${cardBg}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                          {state === 'completed' ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">
                          0{idx + 1}
                        </span>
                      </div>

                      <div>
                        <h5 className="font-bold text-xs sm:text-sm leading-snug">
                          {step.label}
                        </h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {step.sub}
                        </p>
                      </div>

                      <div className="pt-1">
                        {state === 'completed' && (
                          <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Selesai
                          </span>
                        )}
                        {state === 'active' && (
                          <span className="text-[10px] font-extrabold text-indigo-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            Sedang Berjalan
                          </span>
                        )}
                        {state === 'pending' && (
                          <span className="text-[10px] font-medium text-slate-400">
                            Menunggu Tahap
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking / Resi Domestik Banner (If available) */}
            {currentOrder.trackingNumber && (
              <div className="mt-8 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      Nomor Resi Ekspedisi Indonesia ({currentOrder.courier})
                    </span>
                    <div className="font-mono text-base font-black text-slate-900">
                      {currentOrder.trackingNumber}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => copyText(currentOrder.trackingNumber!, 'resi')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {copiedResi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedResi ? 'Resi Tersalin!' : 'Salin Nomor Resi'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Details & Items Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 7 Cols: Detailed Status History Timeline & Ordered Items */}
            <div className="lg:col-span-7 space-y-6">
              {/* Detailed Activity Logs */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Log Aktivitas & Riwayat Status
                </h4>

                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 before:top-3 before:bottom-3">
                  {currentOrder.statusHistory.map((hist, idx) => (
                    <div key={idx} className="relative pl-8 space-y-1">
                      <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-xs" />
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono font-medium">{hist.timestamp}</span>
                        {hist.location && (
                          <span className="flex items-center gap-1 text-slate-500 font-semibold">
                            <MapPin className="w-3 h-3 text-red-500" /> {hist.location}
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-slate-800">{hist.title}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">{hist.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items in Order */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  Barang yang Dipesan ({currentOrder.items.length} Macam)
                </h4>

                <div className="space-y-3">
                  {currentOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                            {item.category}
                          </span>
                          {item.isCustom && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                              Custom Titip
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-sm text-slate-900">{item.name}</h5>
                        {item.refLink && (
                          <a
                            href={item.refLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Link Referensi Toko
                          </a>
                        )}
                        {item.notes && (
                          <p className="text-[11px] text-slate-500 italic">
                            Catatan: {item.notes}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-800 font-mono block">
                          {formatIDR(item.calculatedPriceIDR * item.qty)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {item.qty} pcs ({formatCNY(item.priceCNY)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Customer, Shipping, & Payment Info */}
            <div className="lg:col-span-5 space-y-6">
              {/* Customer & Shipping Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Alamat Pengiriman
                </h4>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-400">Penerima:</span>
                    <span className="font-bold text-slate-800">{currentOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-400">WhatsApp:</span>
                    <span className="font-mono font-semibold text-slate-800">{currentOrder.whatsapp}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-400">Kota Tujuan:</span>
                    <span className="font-semibold text-slate-800">{currentOrder.city}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-400">Kurir:</span>
                    <span className="font-bold text-indigo-700">{currentOrder.courier}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 block mb-1">Alamat Lengkap:</span>
                    <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                      {currentOrder.address} {currentOrder.postalCode ? `(${currentOrder.postalCode})` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Summary Card */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Status Keuangan & Pembayaran
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Skema Pembayaran:</span>
                    <span className="font-bold text-amber-400">
                      {currentOrder.paymentType === 'DP_50' ? 'DP 50% (Uang Muka)' : 'Lunas 100%'}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal Barang:</span>
                    <span className="font-mono">{formatIDR(currentOrder.subtotalItemsIDR)}</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Total Fee Jastip:</span>
                    <span className="font-mono text-amber-300">+ {formatIDR(currentOrder.totalFeeIDR)}</span>
                  </div>

                  <div className="pt-2 border-t border-white/15 flex justify-between items-baseline font-bold">
                    <span className="text-sm">Total Nilai Pesanan:</span>
                    <span className="text-lg font-black font-mono text-white">
                      {formatIDR(currentOrder.grandTotalIDR)}
                    </span>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl space-y-1 mt-2">
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Sudah Dibayar ({currentOrder.paymentType === 'DP_50' ? 'DP' : 'Lunas'}):</span>
                      <span className="font-mono">{formatIDR(currentOrder.dpAmountIDR)}</span>
                    </div>
                    {currentOrder.paymentType === 'DP_50' && (
                      <div className="flex justify-between text-slate-300 text-[11px]">
                        <span>Sisa Pelunasan Nanti:</span>
                        <span className="font-mono font-bold text-amber-300">
                          {formatIDR(currentOrder.remainingAmountIDR)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* WhatsApp Help CTA */}
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${settings.adminWhatsapp}?text=Halo%20Admin,%20mau%20tanya%20update%20pesanan%20saya%20dengan%20Kode%20Booking:%20${currentOrder.bookingCode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Tanya Admin via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-slate-500">Memuat data pelacakan...</div>}>
          <TrackContent />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <CustomRequestModal />
    </div>
  );
}
