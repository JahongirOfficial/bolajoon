'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { LogOut, CreditCard, Phone, Copy, Check, Clock } from 'lucide-react';

export default function BlockedPage() {
    const { logout } = useAuth();
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchPaymentInfo();
    }, []);

    const fetchPaymentInfo = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success) {
                setPaymentInfo({
                    adminPhone: data.adminPhone,
                    cardNumber: data.cardNumber,
                    cardHolder: data.cardHolder,
                    dailyPrice: data.dailyPrice || 200
                });
            }
        } catch (error) {
            console.error('Failed to fetch payment info:', error);
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

    const packages = paymentInfo ? [
        { days: 15, total: paymentInfo.dailyPrice * 15 },
        { days: 20, total: paymentInfo.dailyPrice * 20 },
        { days: 30, total: paymentInfo.dailyPrice * 30 },
    ] : [];

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f6f7f8' }}>
            <header className="bg-white border-bottom py-3 px-4">
                <div className="d-flex align-items-center justify-content-between">
                    <Image src="/logo.png" alt="Bolajon.uz" width={120} height={40} style={{ objectFit: 'contain' }} />
                    <button onClick={logout} className="btn btn-outline-secondary btn-sm rounded-3 d-flex align-items-center gap-2">
                        <LogOut size={18} />
                        Chiqish
                    </button>
                </div>
            </header>

            <main className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
                <div className="text-center" style={{ maxWidth: '450px' }}>
                    <div
                        className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                        style={{
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                        }}
                    >
                        <Clock size={48} className="text-white" />
                    </div>

                    <h1 className="h3 fw-bold mb-2">Obuna muddati tugadi</h1>
                    <p className="text-muted mb-4">
                        Platformadan foydalanishni davom ettirish uchun obunani to'lang
                    </p>

                    {loading ? (
                        <div className="spinner-border text-primary"></div>
                    ) : paymentInfo && (
                        <>
                            <div className="card border-0 rounded-4 shadow-sm mb-4">
                                <div className="card-body p-4">
                                    <h6 className="fw-bold mb-3">Obuna paketlari</h6>
                                    <div className="d-flex flex-column gap-2">
                                        {packages.map(pkg => (
                                            <div key={pkg.days} className="d-flex align-items-center justify-content-between bg-light rounded-3 p-3">
                                                <span className="fw-semibold">{pkg.days} kunlik</span>
                                                <span className="fw-bold text-primary">{pkg.total.toLocaleString()} so'm</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="small text-muted mt-3 mb-0">Kunlik narx: {paymentInfo.dailyPrice?.toLocaleString()} so'm</p>
                                </div>
                            </div>

                            <div className="card border-0 rounded-4 shadow-sm mb-4">
                                <div className="card-body p-4">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                        <CreditCard size={20} className="text-primary" />
                                        To'lov ma'lumotlari
                                    </h6>
                                    <div className="bg-light rounded-3 p-3 mb-3">
                                        <p className="small text-muted mb-1">Karta raqami</p>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <p className="fw-bold font-monospace mb-0 fs-5">{paymentInfo.cardNumber}</p>
                                            <button onClick={copyCardNumber} className="btn btn-sm btn-outline-primary rounded-2">
                                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-light rounded-3 p-3">
                                        <p className="small text-muted mb-1">Karta egasi</p>
                                        <p className="fw-semibold mb-0">{paymentInfo.cardHolder}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <p className="text-muted small mb-3">Muammo bo'lsa Telegramdan bog'laning</p>
                                    <a href="https://t.me/namozjon_cdo" target="_blank" rel="noopener noreferrer" className="btn btn-primary w-100 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                                        <span className="fw-bold">@namozjon_cdo</span>
                                    </a>
                                    <a href={`tel:${paymentInfo.adminPhone}`} className="btn btn-outline-success w-100 rounded-3 py-2 d-flex align-items-center justify-content-center gap-2 mt-2">
                                        <Phone size={18} />
                                        <span>{paymentInfo.adminPhone}</span>
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <footer className="text-center py-3 text-muted small">
                <p className="mb-0">7 kunlik bepul sinov muddati tugadi</p>
            </footer>
        </div>
    );
}
