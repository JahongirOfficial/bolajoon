'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, BookOpen, PlayCircle, TrendingUp, Gamepad2, Trophy, BarChart3, Menu, Hand, Rocket, LogIn, CheckCircle, Star, MapPin, Heart } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const steps = [
    { icon: UserPlus, title: "1. Bepul a'zo bo'ling", desc: "Ota-ona yoki o'qituvchi hisobini soniyalar ichida yarating.", color: '#FFE4F0', iconColor: '#FF7EB3' },
    { icon: BookOpen, title: '2. Darajani tanlang', desc: "Bolaning yoshi va qobiliyatiga qarab darslarni tanlang.", color: '#FEF3C7', iconColor: '#d97706' },
    { icon: PlayCircle, title: "3. O'qishni boshlang", desc: "Interaktiv videolarni tomosha qiling va qiziqarli o'yinlar o'ynang.", color: '#DCFCE7', iconColor: '#16a34a' },
    { icon: TrendingUp, title: '4. Natijani kuzating', desc: "O'zlashtirish darajasini real vaqtda kuzatib boring!", color: '#F3E8FF', iconColor: '#9333ea' },
  ];

  const features = [
    { icon: PlayCircle, title: 'Video darslar', desc: "Professional o'qituvchilar tomonidan tayyorlangan", color: '#FFE4F0', iconColor: '#FF7EB3' },
    { icon: Gamepad2, title: "Interaktiv o'yinlar", desc: "O'yin orqali o'rganish metodikasi", color: '#DCFCE7', iconColor: '#16a34a' },
    { icon: Trophy, title: 'Mukofotlar', desc: "Yulduzlar va sovg'alar tizimi", color: '#FEF3C7', iconColor: '#d97706' },
    { icon: BarChart3, title: 'Statistika', desc: "Bolaning rivojlanishini kuzating", color: '#F3E8FF', iconColor: '#9333ea' },
  ];

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#FAFAFA' }}>

      {/* ── Header ── */}
      <header className="sticky-top py-3 px-3 px-lg-5" style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1e4ec',
        boxShadow: '0 1px 12px rgba(255,126,179,0.08)'
      }}>
        <div className="d-flex align-items-center justify-content-between landing-container">
          <Image src="/logo.png" alt="Bolajon.uz" width={140} height={45} style={{ objectFit: 'contain' }} />

          {/* Desktop Nav */}
          <div className="d-none d-md-flex align-items-center gap-4">
            <Link href="#features" style={{ color: '#475569', textDecoration: 'none', fontWeight: 500, fontSize: '15px' }}>Imkoniyatlar</Link>
            <Link href="#how-it-works" style={{ color: '#475569', textDecoration: 'none', fontWeight: 500, fontSize: '15px' }}>Qanday ishlaydi</Link>
            <Link href="/login" style={{
              padding: '8px 22px', borderRadius: '22px', fontSize: '14px',
              fontWeight: 600, color: '#FF7EB3', border: '2px solid #FF7EB3',
              textDecoration: 'none', transition: 'all 0.2s'
            }}>Kirish</Link>
            <Link href="/register" style={{
              padding: '8px 22px', borderRadius: '22px', fontSize: '14px',
              fontWeight: 600, color: '#fff', textDecoration: 'none',
              background: 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
              boxShadow: '0 3px 14px rgba(255,126,179,0.4)'
            }}>Ro'yxatdan o'tish</Link>
          </div>

          {/* Mobile Nav */}
          <div className="d-flex d-md-none align-items-center gap-2">
            <button className="btn btn-light rounded-circle p-2" style={{ width: 40, height: 40 }}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="px-3 px-lg-5 pt-5 pb-5 position-relative overflow-hidden" style={{
        background: 'linear-gradient(160deg, #fff 0%, #FFF0F7 60%, #FFF5EC 100%)'
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,126,179,0.12) 0%, transparent 65%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '0', left: '-60px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,158,125,0.1) 0%, transparent 65%)',
          pointerEvents: 'none'
        }} />

        <div className="landing-container position-relative">
          <div className="row align-items-center g-4 g-lg-5">
            {/* Content */}
            <div className="col-12 col-lg-6 text-center text-lg-start">
              {/* Badge */}
              <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4" style={{
                background: 'linear-gradient(135deg, rgba(255,126,179,0.15), rgba(255,158,125,0.15))',
                border: '1px solid rgba(255,126,179,0.25)'
              }}>
                <Hand size={18} style={{ color: '#FF7EB3' }} />
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#FF7EB3' }}>Xush kelibsiz!</span>
              </div>

              <h1 style={{ fontSize: 'clamp(2rem,5vw,2.75rem)', fontWeight: 800, lineHeight: 1.15, color: '#1e293b', marginBottom: '1.1rem' }}>
                Bolalar uchun{' '}
                <br className="d-none d-lg-block" />
                <span style={{
                  background: 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Ingliz tili platformasi</span>
              </h1>

              <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '480px' }}
                className="mx-auto mx-lg-0">
                5–9 yoshli bolalarga ingliz tilini o'yinlar, qo'shiqlar va interaktiv video darslar orqali o'rgatamiz.
              </p>

              {/* CTA Buttons */}
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start mb-4">
                <Link href="/register" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '13px 28px', borderRadius: '14px', fontSize: '15px',
                  fontWeight: 700, color: '#fff', textDecoration: 'none',
                  background: 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
                  boxShadow: '0 6px 24px rgba(255,126,179,0.45)'
                }}>
                  <Rocket size={19} />
                  Bepul boshlash
                </Link>
                <Link href="/login" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '13px 28px', borderRadius: '14px', fontSize: '15px',
                  fontWeight: 600, color: '#374151', textDecoration: 'none',
                  background: '#fff', border: '1.5px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
                }}>
                  <LogIn size={19} style={{ color: '#FF7EB3' }} />
                  Kirish
                </Link>
              </div>

              {/* Trust badges */}
              <div className="d-flex align-items-center gap-3 justify-content-center justify-content-lg-start">
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '8px 14px', borderRadius: '10px',
                  background: '#D1FAE5', border: '1px solid #6EE7B7'
                }}>
                  <CheckCircle size={17} style={{ color: '#059669' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#065f46' }}>7 kun bepul</span>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '8px 14px', borderRadius: '10px',
                  background: '#FEF3C7', border: '1px solid #FCD34D'
                }}>
                  <Star size={17} style={{ color: '#D97706' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>500+ o'quvchi</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="col-12 col-lg-6 d-flex justify-content-center">
              <div style={{ position: 'relative', maxWidth: '480px', width: '100%' }}>
                {/* Decorative ring */}
                <div style={{
                  position: 'absolute', inset: '-12px',
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, rgba(255,126,179,0.3) 0%, rgba(255,158,125,0.2) 100%)',
                  zIndex: 0
                }} />
                <div style={{
                  position: 'relative', zIndex: 1,
                  borderRadius: '22px', overflow: 'hidden',
                  aspectRatio: '4/3',
                  boxShadow: '0 20px 60px rgba(255,126,179,0.2), 0 4px 16px rgba(0,0,0,0.08)',
                  backgroundImage: 'url("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-3 px-lg-5 py-5 bg-white">
        <div className="landing-container">
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Platformamiz imkoniyatlari</h2>
            <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Bolalaringiz uchun eng yaxshi ta'lim tajribasi</p>
          </div>

          <div className="row g-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="col-6 col-lg-3">
                  <div className="h-100 text-center p-4 rounded-4" style={{ backgroundColor: feature.color }}>
                    <div className="rounded-4 p-3 bg-white shadow-sm mx-auto mb-3" style={{ width: 'fit-content' }}>
                      <IconComponent size={30} style={{ color: feature.iconColor }} />
                    </div>
                    <h4 style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '6px' }}>{feature.title}</h4>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="px-3 px-lg-5 py-5" style={{ background: '#FAFAFA' }}>
        <div className="landing-container">
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Qanday ishlaydi?</h2>
            <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>4 oddiy qadamda boshlang</p>
          </div>

          <div className="row g-4">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="col-12 col-md-6">
                  <div className="d-flex align-items-start gap-3 p-4 rounded-4 h-100 position-relative"
                    style={{ backgroundColor: step.color }}>
                    <div className="rounded-4 p-2 bg-white shadow-sm flex-shrink-0">
                      <IconComponent size={26} style={{ color: step.iconColor }} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>{step.title}</h4>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{step.desc}</p>
                    </div>
                    <span className="position-absolute fw-bold opacity-25"
                      style={{ top: '1rem', right: '1rem', fontSize: '2.5rem', color: step.iconColor }}>
                      {index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-3 px-lg-5 py-5">
        <div className="landing-container">
          <div className="rounded-5 overflow-hidden text-white text-center p-5" style={{
            background: 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
            boxShadow: '0 12px 40px rgba(255,126,179,0.35)'
          }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.9rem', marginBottom: '10px' }}>Hoziroq boshlang!</h2>
            <p style={{ opacity: 0.85, marginBottom: '1.75rem', fontSize: '15px' }}>
              Bolangizning ingliz tilini o'rganish sayohatini bugun boshlang
            </p>
            <Link href="/register" style={{
              display: 'inline-block', padding: '13px 40px',
              background: '#fff', borderRadius: '14px',
              fontWeight: 700, fontSize: '15px', color: '#FF7EB3',
              textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
            }}>
              Bepul ro'yxatdan o'tish
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-3 px-lg-5 pt-5 pb-4" style={{ background: '#1e293b' }}>
        <div className="landing-container">
          <div className="row g-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

            {/* About */}
            <div className="col-12 col-md-5">
              <Image src="/logo.png" alt="Bolajon.uz" width={120} height={40} style={{ objectFit: 'contain' }} />
              <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: '14px', fontSize: '13.5px', lineHeight: 1.75, maxWidth: '320px' }}>
                Bolajon.uz — O'zbekistondagi bolalar uchun ingliz tili o'rgatish platformasi. O'yinlar va interaktiv darslar orqali bolangiz quvonib o'rganadi.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px' }}>
                <MapPin size={14} style={{ color: '#FF7EB3' }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>O'zbekiston</span>
              </div>
            </div>

            {/* Sahifalar */}
            <div className="col-6 col-md-3">
              <h6 style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '1rem', letterSpacing: '0.3px' }}>Sahifalar</h6>
              <ul className="list-unstyled mb-0">
                {[['/', 'Bosh sahifa'], ['#features', 'Imkoniyatlar'], ['#how-it-works', 'Qanday ishlaydi'], ['/login', 'Kirish'], ['/register', "Ro'yxatdan o'tish"]].map(([href, label]) => (
                  <li key={label} style={{ marginBottom: '10px' }}>
                    <Link href={href} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="col-6 col-md-4">
              <h6 style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '1rem', letterSpacing: '0.3px' }}>Hoziroq boshlang</h6>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                7 kunlik bepul sinov. Karta talab etilmaydi.
              </p>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '10px 20px', borderRadius: '10px', fontSize: '13px',
                fontWeight: 700, color: '#fff', textDecoration: 'none',
                background: 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
                boxShadow: '0 4px 16px rgba(255,126,179,0.3)'
              }}>
                <Rocket size={15} />
                Bepul boshlash
              </Link>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 pt-4">
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>
              © 2026 Bolajon.uz. Barcha huquqlar himoyalangan.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Heart size={12} style={{ color: '#FF7EB3' }} />
              O'zbekistonda ishlab chiqilgan
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
