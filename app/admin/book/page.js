'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Upload, Eye, Download, AlertCircle, CheckCircle, FileText, Trash2, RefreshCw } from 'lucide-react';
import AlertModal from '@/components/AlertModal';

export default function AdminBookPage() {
    const { getAuthHeader } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [currentBook, setCurrentBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'success' });
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        checkCurrentBook();
    }, []);

    const checkCurrentBook = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/book/pdf', { method: 'HEAD' });
            if (response.ok) {
                const contentLength = response.headers.get('content-length');
                setCurrentBook({
                    name: 'bolajon-darslik.pdf',
                    url: '/api/book/pdf',
                    exists: true,
                    size: contentLength ? formatFileSize(parseInt(contentLength)) : 'Unknown'
                });
            } else {
                setCurrentBook(null);
            }
        } catch (error) {
            setCurrentBook(null);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
        e.target.value = '';
    };

    const handleFile = async (file) => {
        // Validate file type
        if (file.type !== 'application/pdf') {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Faqat PDF fayl yuklash mumkin',
                type: 'danger'
            });
            return;
        }

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Fayl hajmi 50MB dan oshmasligi kerak',
                type: 'danger'
            });
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            const res = await fetch('/api/upload/book', {
                method: 'POST',
                headers: getAuthHeader(),
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: 'Kitobcha muvaffaqiyatli yuklandi',
                    type: 'success'
                });
                checkCurrentBook();
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'Kitobchani yuklashda xatolik',
                    type: 'danger'
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Kitobchani yuklashda xatolik',
                type: 'danger'
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
                        <BookOpen size={28} className="text-primary" />
                        Kitobcha boshqaruvi
                    </h1>
                    <p className="text-muted mb-0">Bolajon darsligini yuklash va boshqarish</p>
                </div>
                <button
                    onClick={checkCurrentBook}
                    className="btn btn-outline-secondary rounded-3 d-flex align-items-center gap-2"
                    disabled={loading}
                >
                    <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    Yangilash
                </button>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                {/* Current Book Status */}
                <div className="col-lg-6">
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h3 className="h6 fw-bold mb-0">Joriy kitobcha</h3>
                                {currentBook && (
                                    <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2">
                                        <CheckCircle size={14} className="me-1" />
                                        Faol
                                    </span>
                                )}
                            </div>

                            {loading ? (
                                <div className="text-center py-3">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Yuklanmoqda...</span>
                                    </div>
                                </div>
                            ) : currentBook ? (
                                <div>
                                    <div className="bg-light rounded-3 p-3 mb-2">
                                        <div className="d-flex align-items-start gap-3">
                                            <div className="rounded-3 bg-primary bg-opacity-10 p-2">
                                                <FileText size={28} className="text-primary" />
                                            </div>
                                            <div className="flex-grow-1">
                                                <h4 className="small fw-bold mb-1">{currentBook.name}</h4>
                                                <div className="d-flex flex-wrap gap-2 text-muted" style={{ fontSize: '0.8rem' }}>
                                                    <span>📦 {currentBook.size}</span>
                                                    <span>📄 PDF</span>
                                                    <span>✅ Mavjud</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex flex-wrap gap-2">
                                        <a
                                            href={currentBook.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-primary rounded-3 d-flex align-items-center gap-2"
                                        >
                                            <Eye size={16} />
                                            Ko'rish
                                        </a>
                                        <a
                                            href={currentBook.url}
                                            download="bolajon-darslik.pdf"
                                            className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-2"
                                        >
                                            <Download size={16} />
                                            Yuklab olish
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-3">
                                    <div className="mb-2">
                                        <AlertCircle size={36} className="text-warning" />
                                    </div>
                                    <p className="small fw-bold mb-1">Kitobcha yuklanmagan</p>
                                    <p className="text-muted small mb-0">Yangi PDF fayl yuklang</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="col-lg-6">
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                        <div className="card-body p-3">
                            <h3 className="h6 fw-bold mb-3">Yangi yuklash</h3>
                            
                            {/* Drag & Drop Area */}
                            <div
                                className={`border-2 border-dashed rounded-3 p-3 text-center mb-2 ${
                                    dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                style={{ 
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Upload size={32} className={`mb-2 ${dragActive ? 'text-primary' : 'text-muted'}`} />
                                <p className="small fw-semibold mb-1">
                                    {dragActive ? 'Faylni bu yerga tashlang' : 'PDF faylni shu yerga torting'}
                                </p>
                                <p className="small text-muted mb-2">yoki</p>
                                
                                <label 
                                    htmlFor="pdf-upload" 
                                    className={`btn btn-sm btn-primary rounded-3 ${uploading ? 'disabled' : ''}`}
                                    style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
                                >
                                    {uploading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Yuklanmoqda...
                                        </>
                                    ) : (
                                        'Fayl tanlash'
                                    )}
                                </label>
                                <input
                                    id="pdf-upload"
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                    className="d-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="card border-0 rounded-4 shadow-sm">
                <div className="card-body p-4">
                    <h3 className="h5 fw-bold mb-4">📚 Qanday ishlaydi?</h3>
                    
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="d-flex flex-column align-items-center text-center">
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mb-3"
                                    style={{ width: '56px', height: '56px', fontSize: '24px', fontWeight: 'bold' }}>
                                    1
                                </div>
                                <h4 className="h6 fw-bold mb-2">PDF tayyorlang</h4>
                                <p className="small text-muted mb-0">Bolajon darsligini PDF formatda tayyorlang (max 50MB)</p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="d-flex flex-column align-items-center text-center">
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mb-3"
                                    style={{ width: '56px', height: '56px', fontSize: '24px', fontWeight: 'bold' }}>
                                    2
                                </div>
                                <h4 className="h6 fw-bold mb-2">Faylni yuklang</h4>
                                <p className="small text-muted mb-0">Faylni drag & drop qiling yoki "Fayl tanlash" tugmasini bosing</p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="d-flex flex-column align-items-center text-center">
                                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mb-3"
                                    style={{ width: '56px', height: '56px', fontSize: '24px', fontWeight: 'bold' }}>
                                    ✓
                                </div>
                                <h4 className="h6 fw-bold mb-2">Tayyor!</h4>
                                <p className="small text-muted mb-0">Barcha foydalanuvchilar yangi kitobchani ko'radi</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AlertModal
                show={alertModal.show}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
            />

            <style jsx>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
