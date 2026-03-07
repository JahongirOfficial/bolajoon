'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import PhoneInput from '@/components/PhoneInput';
import { Lock, ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        phone: '+',
        password: ''
    });

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, user, router]);

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

        const result = await login(phone, formData.password);
        if (result.success) {
            const role = result.user?.role;
            router.push(role === 'admin' ? '/admin' : '/dashboard');
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #FFF0F7 0%, #FFF5F0 50%, #FFF8F0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative blobs */}
            <div style={{
                position: 'absolute', top: '-80px', right: '-80px',
                width: '320px', height: '320px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,126,179,0.18) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '-100px', left: '-80px',
                width: '380px', height: '380px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,158,125,0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', top: '40%', left: '10%',
                width: '120px', height: '120px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,126,179,0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            {/* Back link */}
            <Link href="/" style={{
                position: 'absolute', top: '1.5rem', left: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '6px',
                color: '#94a3b8', textDecoration: 'none', fontSize: '14px',
                fontWeight: '500', transition: 'color 0.2s'
            }}>
                <ArrowLeft size={16} />
                Bosh sahifa
            </Link>

            {/* Main card */}
            <div style={{
                width: '100%',
                maxWidth: '440px',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '28px',
                boxShadow: '0 8px 40px rgba(255,126,179,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid rgba(255,126,179,0.12)',
                padding: '2.5rem 2.25rem',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Image
                        src="/logo.png"
                        alt="Bolajon.uz"
                        width={160}
                        height={52}
                        style={{ objectFit: 'contain' }}
                    />
                </div>

                {/* Heading */}
                <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'linear-gradient(135deg, rgba(255,126,179,0.12), rgba(255,158,125,0.12))',
                        borderRadius: '20px', padding: '4px 12px',
                        marginBottom: '12px'
                    }}>
                        <Sparkles size={14} style={{ color: '#FF7EB3' }} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#FF7EB3' }}>Xush kelibsiz!</span>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', margin: '0 0 6px' }}>
                        Hisobga kirish
                    </h1>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                        Hisobingiz yo'qmi?{' '}
                        <Link href="/register" style={{
                            color: '#FF7EB3', fontWeight: '600', textDecoration: 'none'
                        }}>
                            Ro'yxatdan o'ting
                        </Link>
                    </p>
                </div>

                {/* Error */}
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
                    {/* Phone */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block', fontSize: '13px', fontWeight: '600',
                            color: '#374151', marginBottom: '6px'
                        }}>
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

                    {/* Password */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block', fontSize: '13px', fontWeight: '600',
                            color: '#374151', marginBottom: '6px'
                        }}>
                            Parol
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{
                                position: 'absolute', left: '14px', top: '50%',
                                transform: 'translateY(-50%)', color: '#94a3b8'
                            }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-control py-3"
                                style={{
                                    paddingLeft: '42px', paddingRight: '42px',
                                    borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '15px'
                                }}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%',
                                    transform: 'translateY(-50%)', background: 'none',
                                    border: 'none', padding: '4px', cursor: 'pointer',
                                    color: '#94a3b8'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
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
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm" role="status" />
                        ) : 'Kirish'}
                    </button>
                </form>
            </div>
        </div>
    );
}
