'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useSubscription } from '@/components/SubscriptionModal';
import Header from '@/components/dashboard/Header';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import { Wallet, Calendar, CreditCard, Edit, LogOut, User, Phone, BadgeCheck, Save, Copy, Check, PhoneCall, Users, Trash2 } from 'lucide-react';

export default function ProfilePage() {
    const { user, logout, getAuthHeader } = useAuth();
    const { daysRemaining: contextDaysRemaining, setShowModal: setShowSubscriptionModal } = useSubscription();
    const { students: cachedStudents, updateStudent: updateStudentInCache } = useData();
    const [saving, setSaving] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEditStudentModal, setShowEditStudentModal] = useState(false);
    const [showDeleteStudentModal, setShowDeleteStudentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'success' });
    const [daysRemaining, setDaysRemaining] = useState(contextDaysRemaining);
    const [topUpAmount, setTopUpAmount] = useState(10000);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [studentFormData, setStudentFormData] = useState({
        name: ''
    });

    useEffect(() => {
        fetchUserData();
        fetchPaymentInfo();
    }, []);

    // Update local daysRemaining when context changes
    useEffect(() => {
        setDaysRemaining(contextDaysRemaining);
    }, [contextDaysRemaining]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showTopUpModal) {
            // Save current scroll position
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scroll position
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
        };
    }, [showTopUpModal]);

    const fetchUserData = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success && data.user) {
                // Update local daysRemaining state
                if (data.user.daysRemaining !== undefined) {
                    setDaysRemaining(data.user.daysRemaining);
                    // Also update the subscription context
                    window.dispatchEvent(new CustomEvent('subscription-updated', { 
                        detail: { daysRemaining: data.user.daysRemaining } 
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const fetchPaymentInfo = async () => {
        try {
            const res = await fetch('/api/settings', {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                setPaymentInfo({
                    adminPhone: data.adminPhone,
                    cardNumber: data.cardNumber,
                    cardHolder: data.cardHolder
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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Yangi parollar mos kelmaydi',
                type: 'danger'
            });
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    name: formData.name,
                    currentPassword: formData.currentPassword || undefined,
                    newPassword: formData.newPassword || undefined
                })
            });
            const data = await res.json();

            if (data.success) {
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: 'Profil yangilandi',
                    type: 'success'
                });
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
                setShowEditModal(false);
                // Update localStorage
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                storedUser.name = formData.name;
                localStorage.setItem('user', JSON.stringify(storedUser));
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'Profilni yangilashda xatolik',
                    type: 'danger'
                });
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Profilni yangilashda xatolik',
                type: 'danger'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setStudentFormData({ name: student.name });
        setShowEditStudentModal(true);
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        if (!selectedStudent) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/students/${selectedStudent._id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ name: studentFormData.name })
            });
            const data = await res.json();

            if (data.success) {
                // Update in global cache
                updateStudentInCache(selectedStudent._id, { name: studentFormData.name });
                
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: 'O\'quvchi ma\'lumotlari yangilandi',
                    type: 'success'
                });
                setShowEditStudentModal(false);
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'O\'quvchini yangilashda xatolik',
                    type: 'danger'
                });
            }
        } catch (error) {
            console.error('Failed to update student:', error);
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'O\'quvchini yangilashda xatolik',
                type: 'danger'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStudent = async () => {
        if (!selectedStudent) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/students/${selectedStudent._id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            const data = await res.json();

            if (data.success) {
                // Remove from global cache
                updateStudentInCache(selectedStudent._id, { isActive: false });
                
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: 'O\'quvchi o\'chirildi',
                    type: 'success'
                });
                setShowDeleteStudentModal(false);
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'O\'quvchini o\'chirishda xatolik',
                    type: 'danger'
                });
            }
        } catch (error) {
            console.error('Failed to delete student:', error);
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'O\'quvchini o\'chirishda xatolik',
                type: 'danger'
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePaymePayment = async () => {
        if (topUpAmount < 1000) {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Minimal to\'lov summasi 1000 so\'m',
                type: 'danger'
            });
            return;
        }

        setPaymentLoading(true);
        try {
            const res = await fetch('/api/payme/create-payment', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ amount: topUpAmount })
            });
            const data = await res.json();

            if (data.success) {
                // Redirect to Payme
                window.location.href = data.paymeUrl;
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'To\'lov yaratishda xatolik',
                    type: 'danger'
                });
            }
        } catch (error) {
            console.error('Payment error:', error);
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'To\'lov yaratishda xatolik',
                type: 'danger'
            });
        } finally {
            setPaymentLoading(false);
        }
    };

    const quickAmounts = [5000, 10000, 20000, 50000, 100000];

    return (
        <div className="page-content" style={{ backgroundColor: '#f8f9fa' }}>
            <Header title="Profil" />

            <main className="p-3 pb-5">
                {/* Modern Profile Header Card */}
                <div className="card border-0 rounded-4 shadow-sm mb-3 overflow-hidden">
                    <div 
                        className="position-relative"
                        style={{
                            background: 'linear-gradient(135deg, #2b8cee 0%, #1e40af 100%)',
                            padding: '32px 24px 90px'
                        }}
                    >
                        {/* Decorative Elements */}
                        <div 
                            className="position-absolute rounded-circle"
                            style={{
                                width: '150px',
                                height: '150px',
                                background: 'rgba(255,255,255,0.1)',
                                top: '-50px',
                                right: '-30px'
                            }}
                        />
                        <div 
                            className="position-absolute rounded-circle"
                            style={{
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255,255,255,0.08)',
                                bottom: '20px',
                                left: '-20px'
                            }}
                        />

                        {/* Avatar & Info */}
                        <div className="text-center text-white position-relative" style={{ zIndex: 1 }}>
                            <div
                                className="rounded-circle border border-4 border-white mx-auto mb-3 shadow-lg position-relative"
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2b8cee&color=fff&size=160&bold=true')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div 
                                    className="position-absolute bottom-0 end-0 rounded-circle border border-3 border-white"
                                    style={{ 
                                        width: '20px', 
                                        height: '20px',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    }}
                                />
                            </div>
                            <h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>{user?.name}</h5>
                            <p className="mb-0 opacity-90" style={{ fontSize: '0.8rem' }}>
                                <Phone size={12} className="me-1" style={{ marginTop: '-2px' }} />
                                {user?.phone}
                            </p>
                            <div className="mt-2">
                                <span 
                                    className="badge rounded-pill px-3 py-1"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        fontSize: '0.7rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    <BadgeCheck size={12} className="me-1" style={{ marginTop: '-2px' }} />
                                    {user?.role === 'admin' ? 'Administrator' : 'O\'qituvchi'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards - Modern Overlapping Design */}
                    <div 
                        className="px-3"
                        style={{ marginTop: '-70px', position: 'relative', zIndex: 2 }}
                    >
                        <div className="row g-3 mb-3">
                            {/* Subscription Card */}
                            <div className="col-12">
                                <div 
                                    className="card border-0 shadow-lg rounded-4 h-100 position-relative overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div className="card-body p-2">
                                        {/* Horizontal Layout */}
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div 
                                                    className="rounded-2 d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        backgroundColor: 'rgba(217,119,6,0.15)',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    <Calendar size={16} strokeWidth={2.5} style={{ color: '#d97706' }} />
                                                </div>
                                                <div className="d-flex align-items-baseline gap-1 flex-wrap">
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#92400e' }}>Obuna:</span>
                                                    <span className="fw-bold" style={{ fontSize: '1.3rem', color: '#d97706' }}>{daysRemaining}</span>
                                                    <span style={{ fontSize: '0.85rem', color: '#92400e' }}>kun</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowSubscriptionModal(true)}
                                                className="btn border-0 d-flex align-items-center justify-content-center"
                                                style={{
                                                    backgroundColor: '#d97706',
                                                    color: '#fff',
                                                    borderRadius: '8px',
                                                    padding: '6px 12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 4px rgba(217,119,6,0.2)',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                To'ldirish
                                            </button>
                                        </div>
                                    </div>
                                    <div 
                                        className="position-absolute rounded-circle"
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            background: 'rgba(255,255,255,0.3)',
                                            bottom: '-20px',
                                            right: '-15px'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="d-flex gap-2 mb-3">
                    <button
                        onClick={() => {
                            setFormData({
                                name: user?.name || '',
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                            });
                            setShowEditModal(true);
                        }}
                        className="btn btn-light border-0 shadow-sm rounded-3 flex-fill d-flex align-items-center justify-content-center gap-2"
                        style={{
                            padding: '8px 12px',
                            transition: 'all 0.2s',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div 
                            className="rounded-2 d-flex align-items-center justify-content-center"
                            style={{
                                width: '24px',
                                height: '24px',
                                background: '#E0F2FE'
                            }}
                        >
                            <Edit size={13} style={{ color: '#2b8cee' }} strokeWidth={2.5} />
                        </div>
                        <span>Tahrirlash</span>
                    </button>
                    
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="btn btn-light border-0 shadow-sm rounded-3 flex-fill d-flex align-items-center justify-content-center gap-2"
                        style={{
                            padding: '8px 12px',
                            transition: 'all 0.2s',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div 
                            className="rounded-2 d-flex align-items-center justify-content-center"
                            style={{
                                width: '24px',
                                height: '24px',
                                background: '#FCE7F3'
                            }}
                        >
                            <LogOut size={13} style={{ color: '#dc2626' }} strokeWidth={2.5} />
                        </div>
                        <span>Chiqish</span>
                    </button>
                </div>

                {/* Students Section */}
                <div className="card border-0 shadow-sm rounded-4 mb-3" style={{ backgroundColor: '#fff' }}>
                    <div className="card-body p-3">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <div 
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        background: '#F3E8FF'
                                    }}
                                >
                                    <Users size={18} style={{ color: '#9333ea' }} strokeWidth={2.5} />
                                </div>
                                <h6 className="fw-bold mb-0">O'quvchilar</h6>
                            </div>
                            <span 
                                className="badge rounded-pill px-3 py-2"
                                style={{
                                    background: 'linear-gradient(135deg, #2b8cee 0%, #1e40af 100%)',
                                    fontSize: '0.75rem',
                                    fontWeight: '700'
                                }}
                            >
                                {cachedStudents.length}
                            </span>
                        </div>

                        {cachedStudents.length === 0 ? (
                            <div className="text-center py-5">
                                <div 
                                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundColor: '#f1f5f9'
                                    }}
                                >
                                    <Users size={36} className="text-muted" />
                                </div>
                                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>O'quvchilar yo'q</p>
                                <small className="text-muted">O'quvchi qo'shish uchun "O'quvchilar" bo'limiga o'ting</small>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {cachedStudents.map((student, index) => (
                                    <div
                                        key={student._id}
                                        className="d-flex align-items-center gap-3 p-3 rounded-3 border-0"
                                        style={{
                                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#fff',
                                            transition: 'all 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#E0F2FE';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : '#fff';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <div
                                            className="rounded-circle flex-shrink-0"
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=2b8cee&color=fff&size=96&bold=true')`,
                                                backgroundSize: 'cover',
                                                border: '3px solid #fff',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <div className="flex-grow-1 min-width-0">
                                            <p className="fw-bold mb-0" style={{ fontSize: '0.85rem' }}>{student.name}</p>
                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                    {student.age} yosh
                                                </span>
                                                <span className="text-muted">•</span>
                                                <span 
                                                    className="d-inline-flex align-items-center gap-1"
                                                    style={{ fontSize: '0.7rem', color: '#FFC107', fontWeight: '600' }}
                                                >
                                                    ⭐ {student.stars || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleEditStudent(student)}
                                                className="btn btn-sm btn-light rounded-3 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    padding: 0,
                                                    border: 'none',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: '#f1f5f9'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#E0F2FE';
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                <Edit size={16} style={{ color: '#2b8cee' }} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setShowDeleteStudentModal(true);
                                                }}
                                                className="btn btn-sm btn-light rounded-3 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    padding: 0,
                                                    border: 'none',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: '#f1f5f9'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#FCE7F3';
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                <Trash2 size={16} style={{ color: '#dc2626' }} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10000 }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <Edit size={20} className="text-primary" />
                                    Profilni tahrirlash
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Ism</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 border"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <hr className="my-3" />

                                    <h6 className="fw-bold mb-3 small">Parolni o'zgartirish</h6>

                                    <div className="mb-3">
                                        <label className="form-label small">Joriy parol</label>
                                        <input
                                            type="password"
                                            className="form-control rounded-3 border"
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            placeholder="Parolni o'zgartirish uchun kiriting"
                                        />
                                    </div>

                                    <div className="row g-3 mb-4">
                                        <div className="col-6">
                                            <label className="form-label small">Yangi parol</label>
                                            <input
                                                type="password"
                                                className="form-control rounded-3 border"
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small">Tasdiqlash</label>
                                            <input
                                                type="password"
                                                className="form-control rounded-3 border"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary rounded-3 w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        Saqlash
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Student Modal */}
            {showEditStudentModal && selectedStudent && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10000 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <Edit size={20} className="text-primary" />
                                    O'quvchini tahrirlash
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditStudentModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdateStudent}>
                                    <div className="mb-4">
                                        <label className="form-label small fw-semibold">Ism va familiya</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 border"
                                            value={studentFormData.name}
                                            onChange={(e) => setStudentFormData({ name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary rounded-3 w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        Saqlash
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Up Modal - Professional Design */}
            {showTopUpModal && (
                <div 
                    className="modal show d-block" 
                    style={{ 
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        zIndex: 10000,
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflow: 'hidden',
                        overflowY: 'hidden'
                    }}
                    onClick={() => setShowTopUpModal(false)}
                >
                    <div 
                        className="modal-dialog modal-dialog-centered"
                        style={{ maxWidth: '420px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                            {/* Header with Dark Green Gradient */}
                            <div 
                                className="position-relative text-white p-2"
                                style={{
                                    background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn-close btn-close-white position-absolute top-0 end-0 m-2"
                                    onClick={() => setShowTopUpModal(false)}
                                    style={{ opacity: 0.8, fontSize: '0.8rem' }}
                                ></button>
                                
                                <div className="text-center pt-1 pb-1">
                                    <div 
                                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-1"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        <Wallet size={20} strokeWidth={2.5} />
                                    </div>
                                    <h6 className="fw-bold mb-0" style={{ fontSize: '0.95rem' }}>Obunani to'ldirish</h6>
                                    <p className="mb-0 opacity-90" style={{ fontSize: '0.7rem' }}>Xavfsiz va tezkor to'lov</p>
                                </div>
                            </div>

                            <div className="modal-body p-3">
                                {/* Amount Input */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold mb-2" style={{ color: '#166534', fontSize: '0.95rem' }}>
                                        💰 To'ldirish summasi
                                    </label>
                                    <div className="position-relative">
                                        <input
                                            type="number"
                                            className="form-control border-2 shadow-sm text-center fw-bold"
                                            placeholder="Summani kiriting"
                                            style={{
                                                borderRadius: '16px',
                                                fontSize: '2rem',
                                                padding: '20px 60px 20px 20px',
                                                backgroundColor: '#ffffff',
                                                color: '#15803d',
                                                borderColor: '#15803d',
                                                outline: 'none',
                                                boxShadow: '0 4px 16px rgba(21,128,61,0.15)'
                                            }}
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(Math.max(1000, parseInt(e.target.value) || 1000))}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#16a34a';
                                                e.target.style.boxShadow = '0 6px 20px rgba(22,163,74,0.25)';
                                                e.target.select();
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#15803d';
                                                e.target.style.boxShadow = '0 4px 16px rgba(21,128,61,0.15)';
                                            }}
                                            min={1000}
                                            step={1000}
                                        />
                                        <span 
                                            className="position-absolute fw-bold"
                                            style={{
                                                right: '20px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#15803d',
                                                fontSize: '1.2rem'
                                            }}
                                        >
                                            so'm
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                                        <div 
                                            className="px-3 py-1 rounded-pill"
                                            style={{
                                                backgroundColor: '#dcfce7',
                                                border: '1px solid #bbf7d0'
                                            }}
                                        >
                                            <small className="fw-semibold" style={{ fontSize: '0.75rem', color: '#166534' }}>
                                                ✓ Minimal: 1,000 so'm
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Amount Buttons */}
                                <div className="mb-2">
                                    <p className="fw-semibold mb-1" style={{ color: '#0d141b', fontSize: '0.75rem' }}>
                                        Tezkor tanlash
                                    </p>
                                    <div className="d-flex flex-wrap gap-2">
                                        {quickAmounts.map(amount => (
                                            <button
                                                key={amount}
                                                onClick={() => setTopUpAmount(amount)}
                                                className={`btn flex-fill`}
                                                style={{
                                                    borderRadius: '10px',
                                                    padding: '6px 10px',
                                                    border: 'none',
                                                    fontWeight: '600',
                                                    fontSize: '0.7rem',
                                                    background: topUpAmount === amount 
                                                        ? 'linear-gradient(135deg, #166534 0%, #15803d 100%)'
                                                        : '#f1f5f9',
                                                    color: topUpAmount === amount ? '#fff' : '#475569',
                                                    transition: 'all 0.2s ease',
                                                    transform: topUpAmount === amount ? 'scale(1.05)' : 'scale(1)',
                                                    boxShadow: topUpAmount === amount 
                                                        ? '0 4px 12px rgba(21,128,61,0.3)' 
                                                        : 'none'
                                                }}
                                            >
                                                {(amount / 1000).toLocaleString()}k
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Payme Payment Button */}
                                <button
                                    onClick={handlePaymePayment}
                                    disabled={paymentLoading}
                                    className="btn w-100 text-white border-0 shadow-sm"
                                    style={{
                                        borderRadius: '12px',
                                        padding: '10px',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        background: paymentLoading 
                                            ? '#cbd5e0' 
                                            : 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {paymentLoading ? (
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <span className="spinner-border spinner-border-sm"></span>
                                            <span>Yuklanmoqda...</span>
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <CreditCard size={18} strokeWidth={2.5} />
                                            <span>Payme orqali to'lash</span>
                                        </div>
                                    )}
                                </button>

                                {/* Security Badge */}
                                <div className="text-center mt-2">
                                    <div className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ backgroundColor: '#166534', opacity: 0.15 }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                            <path d="M9 12l2 2 4-4"/>
                                        </svg>
                                        <span className="fw-semibold" style={{ color: '#15803d', fontSize: '0.65rem' }}>
                                            Xavfsiz to'lov
                                        </span>
                                    </div>
                                </div>

                                {/* Contact Support */}
                                <div className="mt-4">
                                    <p className="text-muted small mb-2 text-center" style={{ fontSize: '0.75rem' }}>
                                        Muammo bo'lsa Telegramdan bog'laning
                                    </p>
                                    <a
                                        href="https://t.me/namozjon_cdo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn w-100 rounded-3 py-2 d-flex align-items-center justify-content-center gap-2 mb-2"
                                        style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '0.85rem', fontWeight: '600' }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                                        <span>@namozjon_cdo</span>
                                    </a>
                                    {paymentInfo?.adminPhone && (
                                        <a
                                            href={`tel:${paymentInfo.adminPhone}`}
                                            className="btn w-100 rounded-3 py-2 d-flex align-items-center justify-content-center gap-2"
                                            style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}
                                        >
                                            <Phone size={14} />
                                            <span>{paymentInfo.adminPhone}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                show={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={logout}
                title="Tizimdan chiqish"
                message="Haqiqatan ham tizimdan chiqmoqchimisiz?"
                confirmText="Chiqish"
                type="danger"
            />

            <ConfirmModal
                show={showDeleteStudentModal}
                onClose={() => setShowDeleteStudentModal(false)}
                onConfirm={handleDeleteStudent}
                title="O'quvchini o'chirish"
                message={`${selectedStudent?.name} o'quvchisini o'chirmoqchimisiz? Bu amal qaytarilmaydi.`}
                confirmText="O'chirish"
                type="danger"
            />

            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
