'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import PhoneInput from '@/components/PhoneInput';
import { Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (isAuthenticated) router.push('/dashboard');
    }, [isAuthenticated, router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const phone = formData.phone.replace(/\s/g, '');
        if (phone.length < 10) {
            setError('Telefon raqamni to\'liq kiriting');
            setLoading(false);
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Parollar mos kelmaydi');
            setLoading(false);
            return;
        }
        if (formData.password.length < 6) {
            setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
            setLoading(false);
            return;
        }

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('Ism va familiyani kiriting');
            setLoading(false);
            return;
        }

        const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
        const result = await register(fullName, phone, formData.password);
        if (!result.success) {
            setError(result.error);
            setLoading(false);
        }
    };

    const perks = [
        "7 kunlik bepul sinov muddati",
        "Video darslar va interaktiv o'yinlar",
        "O'quvchilar natijasini kuzatish",
        "Yulduz va mukofot tizimi",
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #FFF0F7 0%, #FFF5F0 100%)',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Blobs */}
            <div style={{
                position: 'absolute', top: '-100px', right: '-100px',
                width: '400px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,126,179,0.15) 0%, transparent 65%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '-80px', left: '-80px',
                width: '340px', height: '340px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,158,125,0.12) 0%, transparent 65%)',
                pointerEvents: 'none'
            }} />

            {/* Back */}
            <Link href="/" style={{
                position: 'absolute', top: '1.5rem', left: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '6px',
                color: '#94a3b8', textDecoration: 'none', fontSize: '14px',
                fontWeight: '500', zIndex: 10
            }}>
                <ArrowLeft size={16} />
                Bosh sahifa
            </Link>

            {/* Left branding panel — desktop only */}
            <div className="d-none d-lg-flex flex-column justify-content-center p-5" style={{
                width: '42%',
                background: 'linear-gradient(160deg, #FF7EB3 0%, #FF9E7D 100%)',
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Pattern circles */}
                <div style={{
                    position: 'absolute', top: '-60px', right: '-60px',
                    width: '250px', height: '250px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)', pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', bottom: '10%', left: '-40px',
                    width: '180px', height: '180px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)', pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', top: '30%', right: '-20px',
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)', pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Image
                        src="/logo.png"
                        alt="Bolajon.uz"
                        width={180}
                        height={58}
                        style={{
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.6))',
                            marginBottom: '2rem'
                        }}
                    />

                    <h1 style={{
                        fontSize: '2rem', fontWeight: '800', color: '#fff',
                        lineHeight: 1.2, marginBottom: '1rem'
                    }}>
                        Bolalar uchun<br />ingliz tili platformasi
                    </h1>

                    <p style={{
                        color: 'rgba(255,255,255,0.8)', fontSize: '15px',
                        marginBottom: '2rem', lineHeight: 1.6
                    }}>
                        5–9 yoshli bolalarga o'yinlar va interaktiv video darslar orqali ingliz tilini o'rgating.
                    </p>

                    {/* Perks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {perks.map((perk, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                                <div style={{
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <CheckCircle size={14} color="white" />
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>
                                    {perk}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'flex', gap: '2rem', marginTop: '2.5rem',
                        paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        {[['500+', "O'quvchilar"], ['50+', 'Video darslar'], ['100+', "O'qituvchilar"]].map(([num, label]) => (
                            <div key={label}>
                                <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', margin: 0 }}>{num}</p>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: form */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '5rem 1.5rem 2rem'
            }}>
                <div style={{ width: '100%', maxWidth: '440px' }}>

                    {/* Mobile logo */}
                    <div className="d-lg-none" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <Image src="/logo.png" alt="Bolajon.uz" width={150} height={48} style={{ objectFit: 'contain' }} />
                    </div>

                    {/* Heading */}
                    <div style={{ marginBottom: '1.75rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', margin: '0 0 6px' }}>
                            Ro'yxatdan o'tish
                        </h1>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                            Hisobingiz bormi?{' '}
                            <Link href="/login" style={{ color: '#FF7EB3', fontWeight: '600', textDecoration: 'none' }}>
                                Kirish
                            </Link>
                        </p>
                    </div>

                    {/* Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        boxShadow: '0 8px 40px rgba(255,126,179,0.1), 0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(255,126,179,0.1)',
                        padding: '2rem'
                    }}>
                        {error && (
                            <div style={{
                                background: '#fef2f2', border: '1px solid #fecaca',
                                borderRadius: '12px', padding: '12px 16px',
                                color: '#dc2626', fontSize: '13px', marginBottom: '1.25rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} method="POST" action="#">
                            {/* Name fields */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                        Ism
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            name="firstName"
                                            className="form-control py-3"
                                            style={{ paddingLeft: '36px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px' }}
                                            placeholder="Ism"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                        Familiya
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            name="lastName"
                                            className="form-control py-3"
                                            style={{ paddingLeft: '36px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px' }}
                                            placeholder="Familiya"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Telefon raqam
                                </label>
                                <PhoneInput
                                    name="phone"
                                    className="form-control py-3"
                                    style={{ borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '15px' }}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Passwords */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                        Parol
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            className="form-control py-3"
                                            style={{ paddingLeft: '36px', paddingRight: '36px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px' }}
                                            placeholder="••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#94a3b8' }}>
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                        Tasdiqlang
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            className="form-control py-3"
                                            style={{ paddingLeft: '36px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px' }}
                                            placeholder="••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    background: loading
                                        ? '#f1a8c8'
                                        : 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
                                    border: 'none', borderRadius: '14px',
                                    padding: '14px', color: '#fff',
                                    fontWeight: '700', fontSize: '16px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: loading ? 'none' : '0 4px 20px rgba(255,126,179,0.35)',
                                    transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {loading
                                    ? <span className="spinner-border spinner-border-sm" role="status" />
                                    : "Ro'yxatdan o'tish"}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '1.5rem' }}>
                        Ro'yxatdan o'tib, siz platformaning foydalanish shartlariga rozilik bildirasiz
                    </p>
                </div>
            </div>
        </div>
    );
}
