'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Phone, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminProfilePage() {
    const { user, getAuthHeader, logout } = useAuth();
    const [nameForm, setNameForm] = useState({ name: user?.name || '' });
    const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [nameStatus, setNameStatus] = useState(null); // null | 'success' | 'error'
    const [passStatus, setPassStatus] = useState(null);
    const [nameMsg, setNameMsg] = useState('');
    const [passMsg, setPassMsg] = useState('');
    const [savingName, setSavingName] = useState(false);
    const [savingPass, setSavingPass] = useState(false);

    const handleNameSave = async (e) => {
        e.preventDefault();
        if (!nameForm.name.trim()) return;
        setSavingName(true);
        setNameStatus(null);
        try {
            const res = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ name: nameForm.name.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setNameStatus('success');
                setNameMsg('Ism muvaffaqiyatli yangilandi');
                // Update localStorage
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...stored, name: nameForm.name.trim() }));
            } else {
                setNameStatus('error');
                setNameMsg(data.error || 'Xatolik yuz berdi');
            }
        } catch {
            setNameStatus('error');
            setNameMsg('Serverga ulanishda xatolik');
        } finally {
            setSavingName(false);
        }
    };

    const handlePassSave = async (e) => {
        e.preventDefault();
        if (passForm.newPassword !== passForm.confirmPassword) {
            setPassStatus('error');
            setPassMsg('Yangi parollar mos kelmaydi');
            return;
        }
        if (passForm.newPassword.length < 6) {
            setPassStatus('error');
            setPassMsg("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
            return;
        }
        setSavingPass(true);
        setPassStatus(null);
        try {
            const res = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    currentPassword: passForm.currentPassword,
                    newPassword: passForm.newPassword
                })
            });
            const data = await res.json();
            if (data.success) {
                setPassStatus('success');
                setPassMsg('Parol muvaffaqiyatli yangilandi');
                setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPassStatus('error');
                setPassMsg(data.error || 'Xatolik yuz berdi');
            }
        } catch {
            setPassStatus('error');
            setPassMsg('Serverga ulanishda xatolik');
        } finally {
            setSavingPass(false);
        }
    };

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Profil</h1>
                <p className="text-muted mb-0">Admin ma'lumotlari</p>
            </div>

            <div className="row g-4">
                {/* Profile Info */}
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-sm text-center p-4">
                        <div
                            className="rounded-circle mx-auto mb-3"
                            style={{
                                width: 80, height: 80,
                                backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=2b8cee&color=fff&size=80')`,
                                backgroundSize: 'cover'
                            }}
                        />
                        <h5 className="fw-bold mb-1">{user?.name}</h5>
                        <p className="text-muted small mb-2">{user?.phone}</p>
                        <span className="badge bg-primary rounded-pill px-3">Admin</span>
                        <hr className="my-3" />
                        <div className="text-start">
                            <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
                                <User size={15} />
                                <span>{user?.name}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2 text-muted small">
                                <Phone size={15} />
                                <span>{user?.phone}</span>
                            </div>
                        </div>
                        <hr className="my-3" />
                        <button onClick={logout} className="btn btn-outline-danger w-100 rounded-3">
                            Chiqish
                        </button>
                    </div>
                </div>

                <div className="col-lg-8">
                    {/* Update Name */}
                    <div className="card border-0 rounded-4 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <User size={20} className="text-primary" />
                                <h5 className="fw-bold mb-0">Ismni o'zgartirish</h5>
                            </div>

                            {nameStatus && (
                                <div className={`d-flex align-items-center gap-2 rounded-3 p-3 mb-3 ${nameStatus === 'success' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                    {nameStatus === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    <span className="small">{nameMsg}</span>
                                </div>
                            )}

                            <form onSubmit={handleNameSave}>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">To'liq ism</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3 border-0 bg-light"
                                        value={nameForm.name}
                                        onChange={e => setNameForm({ name: e.target.value })}
                                        placeholder="Ismingizni kiriting"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary rounded-3 d-flex align-items-center gap-2"
                                    disabled={savingName}
                                >
                                    {savingName ? <span className="spinner-border spinner-border-sm" /> : <Save size={16} />}
                                    Saqlash
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="card border-0 rounded-4 shadow-sm">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <Lock size={20} className="text-warning" />
                                <h5 className="fw-bold mb-0">Parol o'zgartirish</h5>
                            </div>

                            {passStatus && (
                                <div className={`d-flex align-items-center gap-2 rounded-3 p-3 mb-3 ${passStatus === 'success' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                    {passStatus === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    <span className="small">{passMsg}</span>
                                </div>
                            )}

                            <form onSubmit={handlePassSave}>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Joriy parol</label>
                                    <input
                                        type="password"
                                        className="form-control rounded-3 border-0 bg-light"
                                        value={passForm.currentPassword}
                                        onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Yangi parol</label>
                                    <input
                                        type="password"
                                        className="form-control rounded-3 border-0 bg-light"
                                        value={passForm.newPassword}
                                        onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                                        placeholder="Kamida 6 ta belgi"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">Yangi parolni tasdiqlang</label>
                                    <input
                                        type="password"
                                        className="form-control rounded-3 border-0 bg-light"
                                        value={passForm.confirmPassword}
                                        onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-warning rounded-3 d-flex align-items-center gap-2"
                                    disabled={savingPass}
                                >
                                    {savingPass ? <span className="spinner-border spinner-border-sm" /> : <Lock size={16} />}
                                    Parolni yangilash
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
