'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ShoppingCart, Phone, Copy, Check } from 'lucide-react';
import SimpleFlipBook from '@/components/SimpleFlipBook';

const PDF_PATH = '/api/book/pdf';

export default function BookPage() {
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState('flipbook'); // 'flipbook' or 'iframe'

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
                    bookPrice: data.bookPrice || 50000
                });
            }
        } catch (error) {
            console.error('Failed to fetch payment info:', error);
        }
    };

    const copyCardNumber = () => {
        if (paymentInfo?.cardNumber) {
            navigator.clipboard.writeText(paymentInfo.cardNumber.replace(/\s/g, ''));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="page-content d-flex flex-column" style={{ height: '100vh', overflow: 'hidden' }}>
            {/* Buy Book Banner */}
            <div className="text-white py-2 px-2 px-md-3 d-flex align-items-center justify-content-between gap-2"
                style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}>
                <div className="d-flex align-items-center gap-2">
                    <BookOpen size={18} className="d-none d-md-block" />
                    <span className="small fw-semibold">Bosmaxona variantini xarid qiling!</span>
                </div>
                <button
                    onClick={() => setShowBuyModal(true)}
                    className="btn btn-light btn-sm rounded-pill px-2 px-md-3 py-1 fw-semibold d-flex align-items-center gap-1 gap-md-2"
                    style={{ fontSize: '0.85rem' }}
                >
                    <ShoppingCart size={14} />
                    <span className="d-none d-sm-inline">Sotib olish</span>
                    <span className="d-sm-none">Xarid</span>
                </button>
            </div>

            {/* Header */}
            <div className="bg-white border-bottom px-2 px-md-3 py-2">
                <div className="d-flex align-items-center justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <Link href="/dashboard" className="btn btn-light rounded-circle p-2" style={{ width: '36px', height: '36px' }}>
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="small fw-bold mb-0">Bolajon Darsligi</h1>
                        </div>
                    </div>

                    {/* Viewer toggle */}
                    <div className="btn-group btn-group-sm">
                        <button
                            className={`btn ${viewMode === 'flipbook' ? 'btn-primary' : 'btn-outline-primary'} rounded-start-pill px-2 px-md-3`}
                            onClick={() => setViewMode('flipbook')}
                            style={{ fontSize: '0.8rem' }}
                        >
                            <span className="d-none d-sm-inline">📖 Flipbook</span>
                            <span className="d-sm-none">📖</span>
                        </button>
                        <button
                            className={`btn ${viewMode === 'iframe' ? 'btn-primary' : 'btn-outline-primary'} rounded-end-pill px-2 px-md-3`}
                            onClick={() => setViewMode('iframe')}
                            style={{ fontSize: '0.8rem' }}
                        >
                            <span className="d-none d-sm-inline">📄 Oddiy</span>
                            <span className="d-sm-none">📄</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-grow-1 position-relative bg-light" style={{ minHeight: 0 }}>
                {viewMode === 'flipbook' ? (
                    <SimpleFlipBook pdfUrl={PDF_PATH} />
                ) : (
                    <iframe
                        src={`${PDF_PATH}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                        className="w-100 h-100 border-0"
                        title="Bolajon Darsligi"
                    />
                )}
            </div>

            {/* Buy Book Modal */}
            {showBuyModal && paymentInfo && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10000 }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable mx-2 mx-md-auto">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <BookOpen size={20} className="text-warning" />
                                    <span className="small">Kitobni sotib olish</span>
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowBuyModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body px-3 px-md-4">
                                <div className="bg-warning bg-opacity-10 rounded-4 p-3 p-md-4 mb-3 mb-md-4 text-center">
                                    <p className="text-warning small fw-semibold mb-1">Bosmaxona varianti narxi</p>
                                    <h2 className="h3 h-md-2 fw-bold text-warning mb-0">
                                        {paymentInfo.bookPrice?.toLocaleString()} <span className="fs-6 fs-md-5">so'm</span>
                                    </h2>
                                </div>

                                <div className="bg-light rounded-3 p-2 p-md-3 mb-3">
                                    <p className="small text-muted mb-1">Karta raqami</p>
                                    <div className="d-flex align-items-center justify-content-between gap-2">
                                        <p className="fw-bold font-monospace mb-0 fs-6 fs-md-5" style={{ fontSize: '0.9rem' }}>
                                            {paymentInfo.cardNumber}
                                        </p>
                                        <button onClick={copyCardNumber} className="btn btn-sm btn-outline-primary rounded-2 flex-shrink-0">
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="row g-2 g-md-3 mb-3 mb-md-4">
                                    <div className="col-12 col-sm-6">
                                        <div className="bg-light rounded-3 p-2 p-md-3">
                                            <p className="small text-muted mb-1">Karta egasi</p>
                                            <p className="fw-semibold mb-0 small">{paymentInfo.cardHolder}</p>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <div className="bg-light rounded-3 p-2 p-md-3">
                                            <p className="small text-muted mb-1">Summa</p>
                                            <p className="fw-semibold mb-0 small">{paymentInfo.bookPrice?.toLocaleString()} so'm</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-muted small mb-3 text-center">
                                    Muammo bo'lsa Telegramdan bog'laning
                                </p>
                                <a
                                    href="https://t.me/namozjon_cdo"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary w-100 rounded-3 py-2 py-md-3 d-flex align-items-center justify-content-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                                    <span className="fw-bold">@namozjon_cdo</span>
                                </a>
                                <a
                                    href={`tel:${paymentInfo.adminPhone}`}
                                    className="btn btn-outline-success w-100 rounded-3 py-2 d-flex align-items-center justify-content-center gap-2 mt-2"
                                >
                                    <Phone size={18} />
                                    <span>{paymentInfo.adminPhone}</span>
                                </a>
                            </div>
                            <div className="modal-footer border-0 pt-0 px-3 px-md-4">
                                <button
                                    type="button"
                                    className="btn btn-light rounded-3 w-100"
                                    onClick={() => setShowBuyModal(false)}
                                >
                                    Yopish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
