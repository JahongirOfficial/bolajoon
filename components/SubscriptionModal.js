'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, Copy, Check, Phone } from 'lucide-react';

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
    const { user, getAuthHeader } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [isSubscriptionValid, setIsSubscriptionValid] = useState(true);
    const [daysRemaining, setDaysRemaining] = useState(999);
    const [subscriptionChecked, setSubscriptionChecked] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            checkSubscription();
        } else if (user && user.role === 'admin') {
            setSubscriptionChecked(true);
        }
    }, [user]);

    // Listen for subscription updates
    useEffect(() => {
        const handleSubscriptionUpdate = (event) => {
            if (event.detail && event.detail.daysRemaining !== undefined) {
                setDaysRemaining(event.detail.daysRemaining);
                setIsSubscriptionValid(event.detail.daysRemaining > 0);
            }
        };

        window.addEventListener('subscription-updated', handleSubscriptionUpdate);
        return () => {
            window.removeEventListener('subscription-updated', handleSubscriptionUpdate);
        };
    }, []);

    const checkSubscription = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: getAuthHeader()
            });
            const data = await res.json();

            if (data.success && data.user) {
                const days = data.user.daysRemaining || 0;
                setDaysRemaining(days);
                setIsSubscriptionValid(days > 0);
                setSubscriptionChecked(true);
            } else {
                setIsSubscriptionValid(true);
                setSubscriptionChecked(true);
            }
        } catch (error) {
            console.error('Failed to check subscription:', error);
            setIsSubscriptionValid(true);
            setSubscriptionChecked(true);
        }
    };

    const requireSubscription = (callback) => {
        if (user?.role === 'admin' || isSubscriptionValid) {
            callback();
        } else {
            setShowModal(true);
        }
    };

    return (
        <SubscriptionContext.Provider value={{
            showModal,
            setShowModal,
            isSubscriptionValid,
            daysRemaining,
            requireSubscription,
            checkSubscription,
            subscriptionChecked
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within SubscriptionProvider');
    }
    return context;
}

const TELEGRAM_ADMIN = 'namozjon_cdo';

export default function SubscriptionModal() {
    const { user } = useAuth();
    const { showModal, setShowModal, daysRemaining } = useSubscription();
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success) {
                setPaymentInfo({
                    adminPhone: data.adminPhone,
                    cardNumber: data.cardNumber,
                    cardHolder: data.cardHolder,
                    dailyPrice: data.dailyPrice || 500
                });
            }
        } catch (e) {
            console.error('Failed to fetch settings:', e);
        } finally {
            setLoading(false);
        }
    };

    const copyCardNumber = () => {
        if (paymentInfo?.cardNumber) {
            navigator.clipboard.writeText(paymentInfo.cardNumber.replace(/\s/g, ''));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const totalAmount = paymentInfo ? paymentInfo.dailyPrice * days : 0;

    const telegramLink = `https://t.me/${TELEGRAM_ADMIN}`;

    if (loading || !user || user.role === 'admin') return null;
    if (!showModal || !paymentInfo) return null;

    const isExpired = daysRemaining <= 0;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10000 }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content rounded-4 border-0 shadow-lg">

                    {/* Header */}
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                            <CreditCard size={20} className="text-primary" />
                            {isExpired ? 'Obuna muddati tugadi' : 'Obunani uzaytirish'}
                        </h5>
                        <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                    </div>

                    <div className="modal-body pt-3">

                        {/* Status badge */}
                        <div
                            className="rounded-3 p-3 mb-4 text-center"
                            style={{ backgroundColor: isExpired ? '#fee2e2' : '#e0f2fe' }}
                        >
                            <p className="small fw-semibold mb-1" style={{ color: isExpired ? '#dc2626' : '#0284c7' }}>
                                Qolgan muddat
                            </p>
                            <h2 className="h3 fw-bold mb-0" style={{ color: isExpired ? '#dc2626' : '#0284c7' }}>
                                {daysRemaining} kun
                            </h2>
                        </div>

                        {/* Days input + price */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold small mb-2">Necha kun olmoqchisiz?</label>
                            <div className="input-group mb-2">
                                <input
                                    type="number"
                                    className="form-control rounded-start-3 fw-bold text-center"
                                    style={{ fontSize: '1.1rem' }}
                                    min="1"
                                    max="365"
                                    value={days}
                                    onChange={(e) => setDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
                                />
                                <span className="input-group-text bg-light">kun</span>
                            </div>

                            {/* Quick select */}
                            <div className="d-flex gap-2 mb-3">
                                {[1, 7, 30].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDays(d)}
                                        className={`btn btn-sm flex-fill rounded-3 ${days === d ? 'btn-primary' : 'btn-light'}`}
                                        style={{ fontWeight: '600', fontSize: '0.8rem' }}
                                    >
                                        {d === 1 ? '1 kun' : d === 7 ? '1 hafta' : '1 oy'}
                                    </button>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="d-flex align-items-center justify-content-between rounded-3 p-3 bg-light">
                                <span className="text-muted small">
                                    {paymentInfo.dailyPrice.toLocaleString()} so'm × {days} kun
                                </span>
                                <span className="fw-bold text-primary fs-5">
                                    {totalAmount.toLocaleString()} so'm
                                </span>
                            </div>
                        </div>

                        {/* Card info */}
                        <div className="bg-light rounded-3 p-3 mb-2">
                            <p className="small text-muted mb-1">Karta raqami</p>
                            <div className="d-flex align-items-center justify-content-between">
                                <span className="fw-bold font-monospace fs-5">{paymentInfo.cardNumber}</span>
                                <button onClick={copyCardNumber} className="btn btn-sm btn-outline-primary rounded-2">
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="row g-2 mb-4">
                            <div className="col-6">
                                <div className="bg-light rounded-3 p-3">
                                    <p className="small text-muted mb-1">Karta egasi</p>
                                    <p className="fw-semibold mb-0 small">{paymentInfo.cardHolder}</p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="bg-light rounded-3 p-3">
                                    <p className="small text-muted mb-1">To'lov summasi</p>
                                    <p className="fw-bold text-primary mb-0">{totalAmount.toLocaleString()} so'm</p>
                                </div>
                            </div>
                        </div>

                        {/* Telegram button */}
                        <p className="text-muted small text-center mb-2">
                            To'lovdan so'ng chekni Telegramga yuboring
                        </p>
                        <a
                            href={telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary w-100 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2 mb-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                            <span className="fw-bold">Chekni @{TELEGRAM_ADMIN} ga yuboring</span>
                        </a>

                        {paymentInfo.adminPhone && (
                            <a
                                href={`tel:${paymentInfo.adminPhone}`}
                                className="btn btn-outline-secondary w-100 rounded-3 py-2 d-flex align-items-center justify-content-center gap-2"
                            >
                                <Phone size={16} />
                                <span>{paymentInfo.adminPhone}</span>
                            </a>
                        )}
                    </div>

                    {!isExpired && (
                        <div className="modal-footer border-0 pt-0">
                            <button
                                type="button"
                                className="btn btn-light rounded-3 w-100"
                                onClick={() => setShowModal(false)}
                            >
                                Yopish
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
