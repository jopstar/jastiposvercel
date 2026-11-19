'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Send, 
  ArrowLeft, 
  ExternalLink,
  Copy,
  CheckCircle,
  Package,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQty, 
    removeFromCart, 
    clearCart, 
    cartGrandTotalIDR,
    createOrder,
    settings,
    formatIDR,
    formatCNY
  } = useStore();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'form' | 'success'>('cart');
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [courier, setCourier] = useState('JNE Reguler');
  const [paymentType, setPaymentType] = useState<'DP_50' | 'LUNAS'>('DP_50');
  const [notes, setNotes] = useState('');

  // Success state
  const [createdOrderCode, setCreatedOrderCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isCartOpen) return null;

  const totalItemsCount = cart.reduce((acc, curr) => acc + curr.qty, 0);
  const totalSubtotalItemsIDR = cart.reduce((acc, curr) => {
    const rawPerItem = Math.round(curr.priceCNY * settings.exchangeRateCNY);
    return acc + rawPerItem * curr.qty;
  }, 0);
  const totalFeeIDR = cartGrandTotalIDR - totalSubtotalItemsIDR;

  const dpAmount = Math.round(cartGrandTotalIDR / 2);
  const amountToPay = paymentType === 'DP_50' ? dpAmount : cartGrandTotalIDR;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !whatsapp.trim() || !address.trim() || !city.trim()) {
      alert('Mohon lengkapi nama, no WhatsApp, alamat, dan kota pengiriman.');
      return;
    }

    // 1. Create order in store
    const newOrder = await createOrder({
      customerName: customerName.trim(),
      whatsapp: whatsapp.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      courier,
      paymentType,
      items: [...cart],
      subtotalItemsIDR: totalSubtotalItemsIDR,
      totalFeeIDR,
      grandTotalIDR: cartGrandTotalIDR,
      dpAmountIDR: dpAmount,
      remainingAmountIDR: paymentType === 'DP_50' ? dpAmount : 0,
      notes: notes.trim(),
    });

    setCreatedOrderCode(newOrder.bookingCode);

    // 2. Format WhatsApp Message
    const itemsListText = cart
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.name}* [${it.qty}x]\n   - Asli: ${formatCNY(it.priceCNY)} / Total: ${formatIDR(
            it.calculatedPriceIDR * it.qty
          )}${it.refLink ? `\n   - Link: ${it.refLink}` : ''}${it.notes ? `\n   - Catatan: ${it.notes}` : ''}`
      )
      .join('\n\n');

    const paymentLabel = paymentType === 'DP_50' ? `DP 50% (${formatIDR(dpAmount)})` : `Lunas 100% (${formatIDR(cartGrandTotalIDR)})`;

    const waMessage = `Halo Admin JastipOS! Saya mau pesan jastip untuk *${settings.poTitle}*:

📋 *KODE BOOKING: ${newOrder.bookingCode}*
----------------------------------------
👤 *Data Pembeli:*
- Nama: ${customerName.trim()}
- No. WhatsApp: ${whatsapp.trim()}
- Alamat: ${address.trim()}, ${city.trim()} ${postalCode.trim() ? `(${postalCode.trim()})` : ''}
- Kurir: ${courier}

🛒 *Rincian Barang Titipan:*
${itemsListText}

💰 *Ringkasan Biaya:*
- Total Barang + Fee: *${formatIDR(cartGrandTotalIDR)}*
- Pilihan Pembayaran: *${paymentLabel}*
${paymentType === 'DP_50' ? `- Sisa Pelunasan (saat tiba di Indo): ${formatIDR(dpAmount)}` : ''}
${notes.trim() ? `\n📝 Catatan Tambahan: ${notes.trim()}` : ''}
----------------------------------------
Mohon konfirmasi ketersediaan slot dan nomor rekening untuk transfer ya. Terima kasih! 🙏`;

    // 3. Open WhatsApp in new tab
    const encoded = encodeURIComponent(waMessage);
    const waUrl = `https://wa.me/${settings.adminWhatsapp}?text=${encoded}`;
    window.open(waUrl, '_blank');

    // 4. Clear cart and switch to success view
    clearCart();
    setCheckoutStep('success');
  };

  const copyBookingCode = () => {
    navigator.clipboard.writeText(createdOrderCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  const handleClose = () => {
    setIsCartOpen(false);
    // Reset steps after delay
    setTimeout(() => {
      setCheckoutStep('cart');
      setCreatedOrderCode('');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {checkoutStep === 'form' && (
              <button
                onClick={() => setCheckoutStep('cart')}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white mr-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {checkoutStep === 'cart' && `Keranjang Titipan (${totalItemsCount})`}
                {checkoutStep === 'form' && 'Formulir Data Pembeli'}
                {checkoutStep === 'success' && 'Pesanan Terkirim! 🎉'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {checkoutStep === 'cart' && 'Gabungkan pesanan katalog & request custom'}
                {checkoutStep === 'form' && 'Lengkapi data pengiriman & opsi pembayaran'}
                {checkoutStep === 'success' && 'Simpan Kode Booking untuk lacak status'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* STEP 1: CART ITEMS */}
          {checkoutStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Keranjang Masih Kosong</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      Pilih produk dari katalog PO Yangzhou atau gunakan tombol Request Titip Custom untuk barang dari Taobao/1688.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Mulai Belanja PO
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-600">Daftar Item Titipan</span>
                    <button
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Kosongkan
                    </button>
                  </div>

                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                                {item.category}
                              </span>
                              {item.isCustom && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                                  Custom Titip
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {item.name}
                            </h4>
                            {item.refLink && (
                              <a
                                href={item.refLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" /> Link Referensi
                              </a>
                            )}
                            {item.notes && (
                              <p className="text-[11px] text-slate-500 italic">
                                Note: {item.notes}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            title="Hapus item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price & Quantity Adjuster */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">
                              {formatIDR(item.calculatedPriceIDR * item.qty)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              ({formatCNY(item.priceCNY)}/pcs)
                            </span>
                          </div>

                          <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-2xs">
                            <button
                              onClick={() => updateCartQty(item.id, -1)}
                              className="p-1.5 text-slate-600 hover:text-slate-900"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-bold text-xs font-mono">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.id, 1)}
                              className="p-1.5 text-slate-600 hover:text-slate-900"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT FORM */}
          {checkoutStep === 'form' && (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Setelah data diisi, sistem akan membuat <strong>Kode Booking unik</strong> dan menyiapkan format pesanan rapi untuk dikirimkan ke WhatsApp Admin.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap Pemesan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Anisa Rahmawati"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kota / Kabupaten <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jakarta Selatan"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kode Pos (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 12190"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Alamat Lengkap Pengiriman <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Nama jalan, nomor rumah/unit, RT/RW, kelurahan, kecamatan"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pilihan Ekspedisi
                  </label>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="JNE Reguler">JNE Reguler</option>
                    <option value="JNE YES (Next Day)">JNE YES (Next Day)</option>
                    <option value="SiCepat BEST">SiCepat BEST</option>
                    <option value="J&T Express">J&T Express</option>
                    <option value="Paxel Sameday">Paxel Sameday</option>
                    <option value="Ambil Sendiri di Jakarta">Ambil Sendiri di Jakarta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Skema Pembayaran
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as 'DP_50' | 'LUNAS')}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-indigo-700"
                  >
                    <option value="DP_50">DP 50% (Uang Muka)</option>
                    <option value="LUNAS">Lunas 100%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Catatan Tambahan untuk Admin (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Harap packing bubble tebal / titip struk fisik"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Payment Summary Preview */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Total Nilai Pesanan:</span>
                  <span className="font-mono">{formatIDR(cartGrandTotalIDR)}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-300 pt-1 border-t border-white/10 text-sm">
                  <span>
                    Jumlah Ditransfer Sekarang ({paymentType === 'DP_50' ? 'DP 50%' : 'LUNAS'}):
                  </span>
                  <span className="font-mono">{formatIDR(amountToPay)}</span>
                </div>
                {paymentType === 'DP_50' && (
                  <p className="text-[11px] text-slate-400">
                    *Sisa {formatIDR(dpAmount)} dilunasi setelah barang mendarat di Jakarta sebelum dikirim ke kurir.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pesanan via WhatsApp</span>
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {checkoutStep === 'success' && (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Pesanan Berhasil Dicatat!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                  Format WhatsApp telah terbuka di tab baru. Silakan kirim pesan tersebut ke Admin untuk verifikasi pembayaran.
                </p>
              </div>

              {/* Booking Code Card */}
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-amber-50 rounded-2xl border-2 border-indigo-200 space-y-3">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest block">
                  Kode Booking Anda:
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-black font-mono tracking-wider text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-300 shadow-2xs">
                    {createdOrderCode}
                  </span>
                  <button
                    onClick={copyBookingCode}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white transition-colors cursor-pointer"
                    title="Salin Kode Booking"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copiedCode && (
                  <p className="text-xs font-bold text-emerald-600">Kode berhasil disalin!</p>
                )}
                <p className="text-[11px] text-slate-500">
                  Gunakan kode ini kapan saja untuk memantau perjalanan barang belanjaan Anda di halaman Lacak Status.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href={`/track?code=${createdOrderCode}`}
                  onClick={handleClose}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Package className="w-4 h-4" />
                  <span>Lihat Timeline Pelacakan Pesanan Ini</span>
                </Link>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer (for Step 1) */}
        {checkoutStep === 'cart' && cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal Barang (IDR):</span>
                <span className="font-mono">{formatIDR(totalSubtotalItemsIDR)}</span>
              </div>
              <div className="flex justify-between text-indigo-700">
                <span>Estimasi Fee Jastip:</span>
                <span className="font-mono font-medium">+ {formatIDR(totalFeeIDR)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-900">
                <span className="text-sm">Total Pembayaran:</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {formatIDR(cartGrandTotalIDR)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-700 font-semibold">
                <span>Tersedia Pembayaran DP 50%:</span>
                <span className="font-mono">{formatIDR(dpAmount)}</span>
              </div>
            </div>

            <button
              onClick={() => setCheckoutStep('form')}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <span>Lanjut ke Formulir Checkout</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
