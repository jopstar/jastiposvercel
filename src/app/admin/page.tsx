'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CustomRequestModal from '@/components/CustomRequestModal';
import { useStore } from '@/lib/store';
import { OrderStatus, ProductCategory } from '@/types';
import { 
  Settings, 
  DollarSign, 
  Package, 
  ListOrdered, 
  Plus, 
  Trash2, 
  Check, 
  RotateCcw, 
  ExternalLink,
  Save,
  Search
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { 
    settings, 
    updateSettings, 
    resetSettings, 
    products, 
    addProduct, 
    deleteProduct, 
    resetProducts, 
    orders, 
    updateOrderStatus, 
    updateOrderTracking, 
    resetOrders,
    formatIDR,
    formatCNY
  } = useStore();

  const [activeTab, setActiveTab] = useState<'settings' | 'orders' | 'products'>('orders');

  // Form State for Settings
  const [exchangeRate, setExchangeRate] = useState(settings.exchangeRateCNY);
  const [feePercentage, setFeePercentage] = useState(settings.feePercentage);
  const [minFee, setMinFee] = useState(settings.minFeeIDR);
  const [poTitle, setPoTitle] = useState(settings.poTitle);
  const [estArrival, setEstArrival] = useState(settings.estArrivalDate);
  const [estShipping, setEstShipping] = useState(settings.estLocalShippingDate);
  const [adminWA, setAdminWA] = useState(settings.adminWhatsapp);
  const [quotaUsed, setQuotaUsed] = useState(settings.usedLuggageQuotaKg);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Form State for New Product
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState<ProductCategory>('Skincare');
  const [newProdPriceCNY, setNewProdPriceCNY] = useState<number | ''>(50);
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdStore, setNewProdStore] = useState('');
  const [newProdPopular, setNewProdPopular] = useState(false);

  // Filter Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      exchangeRateCNY: Number(exchangeRate),
      feePercentage: Number(feePercentage),
      minFeeIDR: Number(minFee),
      poTitle,
      estArrivalDate: estArrival,
      estLocalShippingDate: estShipping,
      adminWhatsapp: adminWA,
      usedLuggageQuotaKg: Number(quotaUsed),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPriceCNY) {
      alert('Nama produk dan harga CNY wajib diisi.');
      return;
    }

    addProduct({
      name: newProdName.trim(),
      category: (newProdCat === 'Semua' ? 'Aksesoris' : newProdCat) as 'Skincare' | 'Fashion' | 'Snack' | 'Elektronik & Merch' | 'Aksesoris',
      priceCNY: Number(newProdPriceCNY),
      image: newProdImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      description: newProdDesc.trim() || 'Produk pilihan jastip resmi Yangzhou, China.',
      originStore: newProdStore.trim() || 'Mall Yangzhou',
      isPopular: newProdPopular,
      inStock: true,
    });

    // Reset Form
    setNewProdName('');
    setNewProdPriceCNY(50);
    setNewProdImage('');
    setNewProdDesc('');
    setNewProdStore('');
    setNewProdPopular(false);
    setShowAddProductModal(false);
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.bookingCode.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.whatsapp.includes(orderSearch);
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalOmset = orders.reduce((acc, curr) => acc + curr.grandTotalIDR, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Top Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-slate-900 text-white">
                <Settings className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Mini Admin Panel
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola kurs mata uang CNY/IDR, status Kode Booking pesanan, dan katalog produk PO.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Reset semua data (kurs, order, dan produk) ke data demo bawaan?')) {
                  resetSettings();
                  resetProducts();
                  resetOrders();
                  setExchangeRate(2300);
                  setFeePercentage(10);
                  setMinFee(25000);
                  alert('Data berhasil di-reset!');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-slate-300 hover:border-red-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Data Demo
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Lihat Web Publik
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Kurs CNY Aktif
            </span>
            <div className="text-xl sm:text-2xl font-black text-indigo-700 font-mono">
              1 CNY = {formatIDR(settings.exchangeRateCNY)}
            </div>
            <span className="text-[11px] text-slate-500">Fee: {settings.feePercentage}% / Min {formatIDR(settings.minFeeIDR)}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Pesanan Masuk
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {orders.length} Order
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">Tersimpan di LocalStorage</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Nilai Booking
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {formatIDR(totalOmset)}
            </div>
            <span className="text-[11px] text-slate-500">Akumulasi seluruh batch</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Katalog Produk PO
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
              {products.length} Barang
            </div>
            <span className="text-[11px] text-slate-500">Siap dipesan pembeli</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Manajemen Order & Status ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Pengaturan Kurs & PO</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'products'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Katalog Produk PO ({products.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 p-5 sm:p-6 space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari Kode Booking (misal: JST-202611-1001), Nama, atau No. WA..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500 font-semibold shrink-0">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="MENUNGGU_KONFIRMASI">Menunggu Konfirmasi</option>
                  <option value="BARANG_DIBELIKAN">Barang Dibelikan</option>
                  <option value="DALAM_PERJALANAN">Dalam Perjalanan (Kargo)</option>
                  <option value="TIBA_DI_INDO">Tiba di Gudang Jakarta</option>
                  <option value="DIKIRIM_KE_PEMBELI">Dikirim ke Pembeli</option>
                  <option value="SELESAI">Selesai</option>
                  <option value="DIBATALKAN">Dibatalkan</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3">Kode Booking</th>
                    <th className="p-3">Data Pembeli</th>
                    <th className="p-3">Barang Titipan</th>
                    <th className="p-3">Total & DP</th>
                    <th className="p-3">Update Status</th>
                    <th className="p-3">Resi Domestik</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada pesanan yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.bookingCode} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 align-top">
                          <span className="font-mono font-bold text-slate-900 block text-xs">
                            {ord.bookingCode}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(ord.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </td>

                        <td className="p-3 align-top space-y-0.5">
                          <strong className="text-slate-900 block">{ord.customerName}</strong>
                          <span className="font-mono text-[11px] text-slate-500 block">{ord.whatsapp}</span>
                          <span className="text-[11px] text-slate-500">{ord.city}</span>
                        </td>

                        <td className="p-3 align-top max-w-xs space-y-1">
                          <span className="font-bold text-indigo-700">
                            {ord.items.length} item ({ord.items.reduce((a, b) => a + b.qty, 0)} pcs)
                          </span>
                          <ul className="text-[11px] text-slate-600 list-disc pl-4 space-y-0.5 line-clamp-3">
                            {ord.items.map((it, idx) => (
                              <li key={idx}>
                                {it.qty}x {it.name}
                              </li>
                            ))}
                          </ul>
                        </td>

                        <td className="p-3 align-top space-y-1">
                          <strong className="font-mono text-slate-900 block">
                            {formatIDR(ord.grandTotalIDR)}
                          </strong>
                          <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            {ord.paymentType === 'DP_50' ? `DP: ${formatIDR(ord.dpAmountIDR)}` : 'Lunas 100%'}
                          </span>
                        </td>

                        <td className="p-3 align-top">
                          <select
                            value={ord.status}
                            onChange={(e) => {
                              const newSt = e.target.value as OrderStatus;
                              updateOrderStatus(ord.bookingCode, newSt);
                            }}
                            className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="MENUNGGU_KONFIRMASI">1. Menunggu Konfirmasi</option>
                            <option value="BARANG_DIBELIKAN">2. Barang Dibelikan di China</option>
                            <option value="DALAM_PERJALANAN">3. Dalam Kargo Penerbangan</option>
                            <option value="TIBA_DI_INDO">4. Tiba di Gudang Jakarta</option>
                            <option value="DIKIRIM_KE_PEMBELI">5. Dikirim ke Pembeli</option>
                            <option value="SELESAI">6. Selesai</option>
                            <option value="DIBATALKAN">X. Dibatalkan</option>
                          </select>
                        </td>

                        <td className="p-3 align-top">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="No. Resi JNE/SiCepat"
                              defaultValue={ord.trackingNumber || ''}
                              id={`resi-${ord.bookingCode}`}
                              className="w-32 px-2 py-1 text-xs font-mono rounded-lg border border-slate-300 focus:outline-hidden"
                            />
                            <button
                              onClick={() => {
                                const el = document.getElementById(`resi-${ord.bookingCode}`) as HTMLInputElement;
                                if (el) {
                                  updateOrderTracking(ord.bookingCode, el.value.trim());
                                  alert(`Resi untuk ${ord.bookingCode} berhasil disimpan!`);
                                }
                              }}
                              className="p-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold"
                              title="Simpan Resi"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="p-3 align-top text-right">
                          <Link
                            href={`/track?code=${ord.bookingCode}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                          >
                            <span>Lacak</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SETTINGS (KURS & INFO PO) */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 p-6 max-w-3xl">
            <form key={`${settings.exchangeRateCNY}-${settings.poTitle}`} onSubmit={handleSaveSettings} className="space-y-6">
              {settingsSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Pengaturan kurs dan jadwal PO berhasil disimpan! Semua halaman telah terupdate.
                </div>
              )}

              {/* Kurs & Fee Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Pengaturan Kurs & Skema Fee Jastip
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Kurs CNY ke IDR (Rupiah)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Misal: 2300 (Rp 2.300 / 1 Yuan)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Fee Jastip (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={feePercentage}
                        onChange={(e) => setFeePercentage(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Persentase fee dari nilai barang (cth: 10)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Minimum Fee Flat (IDR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={minFee}
                        onChange={(e) => setMinFee(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Fee minimum per pcs barang (cth: 25000)</span>
                  </div>
                </div>
              </div>

              {/* PO Schedule Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Package className="w-4 h-4 text-indigo-600" />
                  Informasi Jadwal Open PO Aktif
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Judul Batch PO
                    </label>
                    <input
                      type="text"
                      required
                      value={poTitle}
                      onChange={(e) => setPoTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Estimasi Tiba di Indonesia
                      </label>
                      <input
                        type="text"
                        required
                        value={estArrival}
                        onChange={(e) => setEstArrival(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                        placeholder="Contoh: 2 - 5 Desember 2026"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Estimasi Kirim ke Alamat Pembeli
                      </label>
                      <input
                        type="text"
                        required
                        value={estShipping}
                        onChange={(e) => setEstShipping(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                        placeholder="Contoh: 6 - 8 Desember 2026"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Nomor WhatsApp Admin (Format 62...)
                      </label>
                      <input
                        type="text"
                        required
                        value={adminWA}
                        onChange={(e) => setAdminWA(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Kuota Bagasi Terisi (kg)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={quotaUsed}
                        onChange={(e) => setQuotaUsed(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Pengaturan</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Katalog Produk Terdaftar</h3>
                <p className="text-xs text-slate-500">Produk yang muncul di halaman beranda toko jastip.</p>
              </div>

              <button
                onClick={() => setShowAddProductModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk PO Baru</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3">Foto</th>
                    <th className="p-3">Nama & Asal Store</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Harga Asli (CNY)</th>
                    <th className="p-3">Harga Jual (IDR)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => {
                    const priceCalc = p.priceCNY * settings.exchangeRateCNY;
                    const feeCalc = Math.max(
                      (priceCalc * settings.feePercentage) / 100,
                      settings.minFeeIDR
                    );
                    const finalIDR = Math.round(priceCalc + feeCalc);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                        </td>
                        <td className="p-3 font-semibold text-slate-900 max-w-xs">
                          <span className="block truncate">{p.name}</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Store: {p.originStore || '-'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-600">
                          {formatCNY(p.priceCNY)}
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {formatIDR(finalIDR)}
                        </td>
                        <td className="p-3">
                          {p.isPopular && (
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-[10px]">
                              POPULER
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Hapus produk "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add Product */}
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Tambah Produk PO Baru</h3>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Nama Barang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pop Mart Crybaby Crying Again Series"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Kategori
                    </label>
                    <select
                      value={newProdCat}
                      onChange={(e) => setNewProdCat(e.target.value as ProductCategory)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Skincare">Skincare</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Snack">Snack</option>
                      <option value="Elektronik & Merch">Elektronik & Merch</option>
                      <option value="Aksesoris">Aksesoris</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Harga Asli CNY (¥) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.1"
                      value={newProdPriceCNY}
                      onChange={(e) => setNewProdPriceCNY(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    URL Foto Gambar (Unsplash / CDN)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Store Asal di Yangzhou / China
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pop Mart Flagship / RT-Mart Yangzhou"
                    value={newProdStore}
                    onChange={(e) => setNewProdStore(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Keterangan singkat produk..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="popCheck"
                    checked={newProdPopular}
                    onChange={(e) => setNewProdPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <label htmlFor="popCheck" className="font-semibold text-slate-700 cursor-pointer">
                    Tandai sebagai Produk Populer (Badge Populer)
                  </label>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Simpan Produk
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
      <CartDrawer />
      <CustomRequestModal />
    </div>
  );
}
