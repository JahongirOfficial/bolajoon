'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Send, Users, Copy, Check, Filter, RefreshCw, Download } from 'lucide-react';

export default function SMSPage() {
    const { getAuthHeader } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [copiedMessage, setCopiedMessage] = useState(false);
    const [copiedPhones, setCopiedPhones] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // SMS shablonlari
    const templates = [
        {
            name: 'Xush kelibsiz',
            text: 'Assalomu alaykum! Bolajoon.uz platformasiga xush kelibsiz. Platformamizda o\'qish uchun darsliklar va interaktiv o\'yinlar mavjud.'
        },
        {
            name: 'Obuna tugadi',
            text: 'Hurmatli foydalanuvchi! Sizning obunangiz tugadi. Davom etish uchun obunani yangilang: bolajoon.uz'
        },
        {
            name: 'Yangi dars',
            text: 'Yangi dars qo\'shildi! Platformaga kirib, yangi darslarni o\'rganing. bolajoon.uz'
        },
        {
            name: 'Eslatma',
            text: 'Salom! Platformamizda yangi imkoniyatlar mavjud. Tizimga kirib ko\'ring: bolajoon.uz'
        }
    ];

    useEffect(() => {
        // Mobil qurilmani aniqlash
        const checkMobile = () => {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(mobile);
        };
        checkMobile();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', { headers: getAuthHeader() });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Foydalanuvchilarni yuklashda xato:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        if (filter === 'all') return true;
        if (filter === 'teachers') return user.role === 'teacher';
        if (filter === 'active') return user.subscriptionStatus === 'active';
        if (filter === 'trial') return user.subscriptionStatus === 'trial';
        if (filter === 'expired') return user.subscriptionStatus === 'expired';
        return true;
    });

    const toggleUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const selectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u._id));
        }
    };

    const handleSend = () => {
        if (!message.trim()) {
            alert('Iltimos, xabar kiriting');
            return;
        }
        if (selectedUsers.length === 0) {
            alert('Iltimos, kamida bitta foydalanuvchi tanlang');
            return;
        }

        const selectedPhones = users
            .filter(user => selectedUsers.includes(user._id))
            .map(user => user.phone?.replace(/[^0-9+]/g, ''))
            .filter(Boolean);

        if (selectedPhones.length === 0) {
            alert('Tanlangan foydalanuvchilarda telefon raqam topilmadi');
            return;
        }

        // Build multi-recipient SMS URI (works on Android & iOS)
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const encodedMessage = encodeURIComponent(message.trim());
        const phoneList = selectedPhones.join(';'); // semicolon works on both platforms
        const smsUrl = isIOS
            ? `sms:${phoneList}&body=${encodedMessage}`
            : `sms:${phoneList}?body=${encodedMessage}`;

        window.location.href = smsUrl;
    };

    const copyPhoneNumbers = () => {
        const selectedPhones = users
            .filter(user => selectedUsers.includes(user._id))
            .map(user => user.phone)
            .filter(phone => phone)
            .join('\n'); // Har bir raqam yangi qatorda

        if (!selectedPhones) {
            alert('Telefon raqamlar topilmadi');
            return;
        }

        navigator.clipboard.writeText(selectedPhones).then(() => {
            setCopiedPhones(true);
            setTimeout(() => setCopiedPhones(false), 2000);
        }).catch(() => {
            alert('Nusxalashda xatolik');
        });
    };

    const downloadPhoneNumbers = () => {
        const selectedPhones = users
            .filter(user => selectedUsers.includes(user._id))
            .map(user => `${user.name},${user.phone}`)
            .filter(line => line.includes(',+'));

        if (selectedPhones.length === 0) {
            alert('Telefon raqamlar topilmadi');
            return;
        }

        const csvContent = 'Ism,Telefon\n' + selectedPhones.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `telefon-raqamlar-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyMessage = () => {
        if (!message.trim()) {
            alert('Xabar bo\'sh');
            return;
        }

        navigator.clipboard.writeText(message.trim()).then(() => {
            setCopiedMessage(true);
            setTimeout(() => setCopiedMessage(false), 2000);
        }).catch(() => {
            alert('Nusxalashda xatolik');
        });
    };

    const getFilterCount = (filterType) => {
        if (filterType === 'all') return users.length;
        if (filterType === 'teachers') return users.filter(u => u.role === 'teacher').length;
        if (filterType === 'active') return users.filter(u => u.subscriptionStatus === 'active').length;
        if (filterType === 'trial') return users.filter(u => u.subscriptionStatus === 'trial').length;
        return 0;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Yuklanmoqda...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
                        <MessageSquare size={28} className="text-primary" />
                        SMS Yuborish
                    </h1>
                    <p className="text-muted mb-0">Foydalanuvchilarga SMS xabar yuboring</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="btn btn-outline-secondary rounded-3 d-flex align-items-center gap-2"
                    disabled={loading}
                >
                    <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    Yangilash
                </button>
            </div>

            {/* Info banner */}
            {!isMobile && (
                <div className="alert alert-info rounded-3 mb-4 d-flex align-items-center gap-3 py-2">
                    <MessageSquare size={18} className="flex-shrink-0" />
                    <span className="small">
                        SMS yuborish uchun <strong>mobil qurilmadan</strong> oching — SMS ilovasi avtomatik ochiladi va barcha raqamlar tayyor bo'ladi.
                    </span>
                </div>
            )}

            {/* Stats */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 rounded-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <div className="card-body p-3 text-white">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="small mb-1 opacity-75">Jami foydalanuvchilar</p>
                                    <h3 className="h4 fw-bold mb-0">{users.length}</h3>
                                </div>
                                <Users size={32} className="opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 rounded-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <div className="card-body p-3 text-white">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="small mb-1 opacity-75">Tanlangan</p>
                                    <h3 className="h4 fw-bold mb-0">{selectedUsers.length}</h3>
                                </div>
                                <Check size={32} className="opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 rounded-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <div className="card-body p-3 text-white">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="small mb-1 opacity-75">Xabar uzunligi</p>
                                    <h3 className="h4 fw-bold mb-0">{message.length}/500</h3>
                                </div>
                                <MessageSquare size={32} className="opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 rounded-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        <div className="card-body p-3 text-white">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="small mb-1 opacity-75">Faol filter</p>
                                    <h3 className="h4 fw-bold mb-0">{filteredUsers.length}</h3>
                                </div>
                                <Filter size={32} className="opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Xabar yozish */}
                <div className="col-lg-5">
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                                    <MessageSquare size={20} className="text-primary" />
                                </div>
                                <h5 className="fw-bold mb-0">Xabar yozish</h5>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-medium small">Xabar matni</label>
                                
                                {/* Shablonlar */}
                                <div className="mb-2">
                                    <div className="d-flex gap-2 flex-wrap">
                                        {templates.map((template, index) => (
                                            <button
                                                key={index}
                                                className="btn btn-sm btn-outline-secondary rounded-pill"
                                                onClick={() => setMessage(template.text)}
                                                type="button"
                                            >
                                                {template.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <textarea
                                    className="form-control rounded-3 border-2"
                                    rows="10"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="SMS xabaringizni shu yerga yozing yoki yuqoridagi shablonlardan birini tanlang..."
                                    maxLength={500}
                                    style={{ resize: 'none' }}
                                />
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <small className="text-muted">
                                        <span className={message.length > 450 ? 'text-warning fw-bold' : ''}>
                                            {message.length}/500 belgi
                                        </span>
                                    </small>
                                    {message.trim() && (
                                        <button
                                            className="btn btn-sm btn-outline-secondary rounded-2 d-flex align-items-center gap-1"
                                            onClick={copyMessage}
                                        >
                                            {copiedMessage ? <Check size={14} /> : <Copy size={14} />}
                                            <span>{copiedMessage ? 'Nusxalandi' : 'Nusxalash'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-light rounded-3 p-3 mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <p className="small text-muted mb-0">Tanlangan foydalanuvchilar</p>
                                        <p className="fw-bold mb-0 text-primary">{selectedUsers.length} ta</p>
                                    </div>
                                    {selectedUsers.length > 0 && (
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline-primary rounded-2 d-flex align-items-center gap-1"
                                                onClick={copyPhoneNumbers}
                                                title="Raqamlarni nusxalash"
                                            >
                                                {copiedPhones ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-success rounded-2 d-flex align-items-center gap-1"
                                                onClick={downloadPhoneNumbers}
                                                title="CSV faylga yuklash"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {selectedUsers.length > 0 && (
                                    <small className="text-muted">
                                        Raqamlarni nusxalash yoki CSV faylga yuklash mumkin
                                    </small>
                                )}
                            </div>

                            <button
                                className="btn btn-primary w-100 rounded-3 py-3 mb-2 d-flex align-items-center justify-content-center gap-2"
                                onClick={handleSend}
                                disabled={!message.trim() || selectedUsers.length === 0}
                            >
                                <Send size={20} />
                                <span className="fw-semibold">
                                    {selectedUsers.length === 0
                                        ? 'Foydalanuvchi tanlang'
                                        : `SMS ilovasida ochish (${selectedUsers.length} ta)`}
                                </span>
                            </button>

                            <div className="alert alert-success rounded-3 mb-0 small">
                                <div className="d-flex align-items-start gap-2">
                                    <MessageSquare size={16} className="flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="mb-1 fw-semibold">Qanday ishlaydi:</p>
                                        <ul className="mb-0 ps-3">
                                            <li>Mobilda: SMS ilovasi barcha raqamlar bilan ochiladi</li>
                                            <li>Xabar tayyor — faqat "Yuborish" bosasiz</li>
                                            <li>100% tekin (telefon balansidan)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Foydalanuvchilar ro'yxati */}
                <div className="col-lg-7">
                    <div className="card border-0 rounded-4 shadow-sm">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle bg-success bg-opacity-10 p-2">
                                        <Users size={20} className="text-success" />
                                    </div>
                                    <h5 className="fw-bold mb-0">Foydalanuvchilar</h5>
                                </div>
                                <button
                                    className="btn btn-sm btn-primary rounded-3"
                                    onClick={selectAll}
                                >
                                    {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? 'Bekor qilish' : 'Barchasini tanlash'}
                                </button>
                            </div>

                            {/* Filter */}
                            <div className="d-flex gap-2 mb-3 flex-wrap">
                                <button
                                    className={`btn btn-sm rounded-pill ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setFilter('all')}
                                >
                                    Barchasi <span className="badge bg-white text-primary ms-1">{getFilterCount('all')}</span>
                                </button>
                                <button
                                    className={`btn btn-sm rounded-pill ${filter === 'teachers' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setFilter('teachers')}
                                >
                                    O'qituvchilar <span className="badge bg-white text-primary ms-1">{getFilterCount('teachers')}</span>
                                </button>
                                <button
                                    className={`btn btn-sm rounded-pill ${filter === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                                    onClick={() => setFilter('active')}
                                >
                                    Faol <span className="badge bg-white text-success ms-1">{getFilterCount('active')}</span>
                                </button>
                                <button
                                    className={`btn btn-sm rounded-pill ${filter === 'trial' ? 'btn-info' : 'btn-outline-info'}`}
                                    onClick={() => setFilter('trial')}
                                >
                                    Trial <span className="badge bg-white text-info ms-1">{getFilterCount('trial')}</span>
                                </button>
                            </div>

                            {/* Users list */}
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }} className="pe-2">
                                {filteredUsers.length === 0 ? (
                                    <div className="text-center py-5">
                                        <Users size={48} className="text-muted mb-3" />
                                        <p className="text-muted">Foydalanuvchilar topilmadi</p>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {filteredUsers.map(user => (
                                            <label
                                                key={user._id}
                                                className={`d-flex align-items-center gap-3 p-3 rounded-3 border-2 ${
                                                    selectedUsers.includes(user._id) 
                                                        ? 'border-primary bg-primary bg-opacity-10' 
                                                        : 'border bg-white'
                                                }`}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input m-0"
                                                    style={{ width: '20px', height: '20px' }}
                                                    checked={selectedUsers.includes(user._id)}
                                                    onChange={() => toggleUser(user._id)}
                                                />
                                                <div className="flex-grow-1">
                                                    <div className="fw-semibold">{user.name}</div>
                                                    <small className="text-muted">{user.phone}</small>
                                                </div>
                                                <span className={`badge rounded-pill ${
                                                    user.subscriptionStatus === 'active' ? 'bg-success' :
                                                    user.subscriptionStatus === 'trial' ? 'bg-info' :
                                                    'bg-secondary'
                                                }`}>
                                                    {user.subscriptionStatus === 'active' ? 'Faol' :
                                                     user.subscriptionStatus === 'trial' ? 'Trial' : 'Tugagan'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
