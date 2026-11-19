'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppSettings, CartItem, Order, OrderStatus, Product } from '@/types';
import { DEFAULT_SETTINGS, INITIAL_ORDERS, INITIAL_PRODUCTS } from './constants';

interface StoreContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => void;

  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetProducts: () => void;

  orders: Order[];
  createOrder: (orderData: Omit<Order, 'bookingCode' | 'createdAt' | 'status' | 'statusHistory'>) => Promise<Order>;
  updateOrderStatus: (bookingCode: string, newStatus: OrderStatus, note?: string) => Promise<void>;
  updateOrderTracking: (bookingCode: string, trackingNumber: string) => Promise<void>;
  getOrderByCode: (code: string) => Order | undefined;
  fetchOrderByCode: (code: string) => Promise<Order | null>;
  resetOrders: () => void;
  refreshData: () => Promise<void>;

  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  updateCartQty: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartGrandTotalIDR: number;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCustomModalOpen: boolean;
  setIsCustomModalOpen: (open: boolean) => void;

  calculatePrice: (priceCNY: number) => {
    rawIDR: number;
    feeIDR: number;
    finalPriceIDR: number;
  };
  formatIDR: (val: number) => string;
  formatCNY: (val: number) => string;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  SETTINGS: 'jastipos_settings_v1',
  PRODUCTS: 'jastipos_products_v1',
  ORDERS: 'jastipos_orders_v1',
  CART: 'jastipos_cart_v1',
};

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          usedLuggageQuotaKg: DEFAULT_SETTINGS.usedLuggageQuotaKg,
          totalLuggageQuotaKg: DEFAULT_SETTINGS.totalLuggageQuotaKg,
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === 'undefined') return INITIAL_ORDERS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CART);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Fetch initial data from Supabase via API
  const refreshData = useCallback(async () => {
    try {
      const [resProd, resSettings, resOrders] = await Promise.allSettled([
        fetch('/api/products').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/settings').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/orders').then((r) => (r.ok ? r.json() : null)),
      ]);

      if (resProd.status === 'fulfilled' && resProd.value && Array.isArray(resProd.value)) {
        setProducts(resProd.value);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(resProd.value));
      }

      if (resSettings.status === 'fulfilled' && resSettings.value) {
        setSettings(resSettings.value);
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(resSettings.value));
      }

      if (resOrders.status === 'fulfilled' && resOrders.value && Array.isArray(resOrders.value)) {
        setOrders(resOrders.value);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(resOrders.value));
      }
    } catch (err) {
      console.warn('API sync warning, falling back to local cache:', err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [resProd, resSettings, resOrders] = await Promise.allSettled([
          fetch('/api/products').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/settings').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/orders').then((r) => (r.ok ? r.json() : null)),
        ]);

        if (ignore) return;

        if (resProd.status === 'fulfilled' && resProd.value && Array.isArray(resProd.value)) {
          setProducts(resProd.value);
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(resProd.value));
        }

        if (resSettings.status === 'fulfilled' && resSettings.value) {
          setSettings(resSettings.value);
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(resSettings.value));
        }

        if (resOrders.status === 'fulfilled' && resOrders.value && Array.isArray(resOrders.value)) {
          setOrders(resOrders.value);
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(resOrders.value));
        }
      } catch (err) {
        console.warn('API sync warning, falling back to local cache:', err);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Price calculation helper
  const calculatePrice = (priceCNY: number) => {
    const rawIDR = Math.round(priceCNY * settings.exchangeRateCNY);
    const calculatedFee = Math.round((priceCNY * settings.exchangeRateCNY * settings.feePercentage) / 100);
    const feeIDR = Math.max(calculatedFee, settings.minFeeIDR);
    const finalPriceIDR = rawIDR + feeIDR;
    return { rawIDR, feeIDR, finalPriceIDR };
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatCNY = (val: number) => {
    return `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;
  };

  // Settings
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to sync settings with server:', err);
    }
  };

  const resetSettings = () => {
    updateSettings(DEFAULT_SETTINGS);
  };

  // Products
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        const created = await res.json();
        setProducts((prev) => [created, ...prev]);
        return;
      }
    } catch (err) {
      console.error('Failed to save product to server:', err);
    }

    // Fallback local
    const fallbackProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setProducts((prev) => [fallbackProduct, ...prev]);
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));

    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to update product on server:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete product on server:', err);
    }
  };

  const resetProducts = () => {
    setProducts(INITIAL_PRODUCTS);
  };

  // Orders
  const createOrder = async (orderData: Omit<Order, 'bookingCode' | 'createdAt' | 'status' | 'statusHistory'>): Promise<Order> => {
    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7).replace('-', '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `JST-${yearMonth}-${randomSuffix}`;

    const timestampStr =
      now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';

    const newOrder: Order = {
      ...orderData,
      bookingCode,
      status: 'MENUNGGU_KONFIRMASI',
      createdAt: now.toISOString(),
      statusHistory: [
        {
          status: 'MENUNGGU_KONFIRMASI',
          timestamp: timestampStr,
          title: 'Pesanan Berhasil Dibuat',
          description: `Pesanan telah masuk ke sistem. Mohon konfirmasi bukti transfer ${orderData.paymentType === 'DP_50' ? 'DP 50%' : 'Pelunasan'
            } via WhatsApp.`,
          location: 'Jakarta',
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch (err) {
      console.error('Failed to save order to server:', err);
    }

    return newOrder;
  };

  const updateOrderStatus = async (bookingCode: string, newStatus: OrderStatus, note?: string) => {
    const now = new Date();
    const timestampStr =
      now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';

    const statusTitleMap: Record<OrderStatus, { title: string; defaultDesc: string; location: string }> = {
      MENUNGGU_KONFIRMASI: {
        title: 'Menunggu Konfirmasi Pembayaran',
        defaultDesc: 'Menunggu verifikasi bukti transfer dari pembeli.',
        location: 'Jakarta',
      },
      BARANG_DIBELIKAN: {
        title: 'Barang Sedang Dibelanjakan di China',
        defaultDesc: 'Tim shopper sedang membeli dan menginspeksi barang langsung di Yangzhou/Taobao.',
        location: 'Yangzhou, China',
      },
      DALAM_PERJALANAN: {
        title: 'Dalam Penerbangan Cargo ke Indonesia',
        defaultDesc: 'Paket telah masuk kargo internasional dalam perjalanan menuju bandara CGK Jakarta.',
        location: 'Air Cargo Transit (China -> Indonesia)',
      },
      TIBA_DI_INDO: {
        title: 'Tiba di Gudang Jakarta & Quality Check',
        defaultDesc: 'Paket tiba dengan aman, lolos bea cukai dan selesai disortir.',
        location: 'Warehouse Jakarta Barat',
      },
      DIKIRIM_KE_PEMBELI: {
        title: 'Dikirim ke Alamat Pembeli',
        defaultDesc: 'Paket diserahkan ke ekspedisi lokal untuk diantar ke alamat Anda.',
        location: 'Ekspedisi Domestik',
      },
      SELESAI: {
        title: 'Pesanan Selesai Diterima',
        defaultDesc: 'Paket telah sampai dan diterima oleh pembeli dengan baik.',
        location: 'Alamat Pembeli',
      },
      DIBATALKAN: {
        title: 'Pesanan Dibatalkan',
        defaultDesc: 'Pesanan dibatalkan atau stok barang di China habis.',
        location: 'System',
      },
    };

    const targetOrder = orders.find((o) => o.bookingCode === bookingCode);
    const currentHistory = targetOrder ? targetOrder.statusHistory : [];
    const info = statusTitleMap[newStatus];
    const newHistory = [
      ...currentHistory,
      {
        status: newStatus,
        timestamp: timestampStr,
        title: info.title,
        description: note || info.defaultDesc,
        location: info.location,
      },
    ];

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.bookingCode !== bookingCode) return ord;
        return {
          ...ord,
          status: newStatus,
          statusHistory: newHistory,
        };
      })
    );

    try {
      await fetch(`/api/orders/${bookingCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          statusHistory: newHistory,
        }),
      });
    } catch (err) {
      console.error('Failed to update order status on server:', err);
    }
  };

  const updateOrderTracking = async (bookingCode: string, trackingNumber: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.bookingCode === bookingCode ? { ...ord, trackingNumber } : ord))
    );

    try {
      await fetch(`/api/orders/${bookingCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      });
    } catch (err) {
      console.error('Failed to update tracking on server:', err);
    }
  };

  const getOrderByCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    return orders.find((o) => o.bookingCode.toUpperCase() === cleanCode);
  };

  const fetchOrderByCode = async (code: string): Promise<Order | null> => {
    const cleanCode = code.trim().toUpperCase();
    const existing = getOrderByCode(cleanCode);
    if (existing) return existing;

    try {
      const res = await fetch(`/api/orders/${cleanCode}`);
      if (res.ok) {
        const order = await res.json();
        setOrders((prev) => {
          if (prev.some((o) => o.bookingCode === order.bookingCode)) return prev;
          return [order, ...prev];
        });
        return order;
      }
    } catch (err) {
      console.error('Failed to fetch order by code:', err);
    }
    return null;
  };

  const resetOrders = () => {
    setOrders(INITIAL_ORDERS);
  };

  // Cart
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCart((prev) => {
      if (!item.isCustom && item.productId) {
        const existingIndex = prev.findIndex((i) => i.productId === item.productId);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].qty += item.qty;
          return updated;
        }
      }
      const newItem: CartItem = {
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      return [...prev, newItem];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalCount = cart.reduce((acc, curr) => acc + curr.qty, 0);
  const cartGrandTotalIDR = cart.reduce((acc, curr) => acc + curr.calculatedPriceIDR * curr.qty, 0);

  return (
    <StoreContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProducts,
        orders,
        createOrder,
        updateOrderStatus,
        updateOrderTracking,
        getOrderByCode,
        fetchOrderByCode,
        resetOrders,
        refreshData,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartTotalCount,
        cartGrandTotalIDR,
        isCartOpen,
        setIsCartOpen,
        isCustomModalOpen,
        setIsCustomModalOpen,
        calculatePrice,
        formatIDR,
        formatCNY,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
