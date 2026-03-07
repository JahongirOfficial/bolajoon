'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus, BookOpen, PlayCircle, TrendingUp, Gamepad2, Trophy,
  BarChart3, Rocket, LogIn, CheckCircle, Star, MapPin, Heart,
  ChevronDown, Zap, Shield, Globe, MessageCircle, ArrowRight, Menu, X
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route anchor click
  const handleNavClick = () => setMobileMenuOpen(false);

  const stats = [
    { value: '500+', label: "Faol o'quvchilar" },
    { value: '50+', label: 'Video darslar' },
    { value: '7 kun', label: 'Bepul sinov' },
    { value: '5–9', label: 'Yosh oralig\'i' },
  ];

  const features = [
    {
      icon: PlayCircle, title: 'Video darslar',
      desc: "Native speaker o'qituvchilar tomonidan tayyorlangan qiziqarli darslar. Bolangiz tomosha qilib, takrorlab o'rganadi.",
      iconBg: 'linear-gradient(135deg, #FF7EB3, #FF9E7D)', tag: 'Eng mashhur'
    },
    {
      icon: Gamepad2, title: "Interaktiv o'yinlar",
      desc: "So'zlarni juftlash, tarjima qilish, tinglash — barchasi o'yin formatida. O'rganish quvonchga aylanadi.",
      iconBg: 'linear-gradient(135deg, #22c55e, #16a34a)', tag: null
    },
    {
      icon: Trophy, title: 'Mukofotlar tizimi',
      desc: "Har bir dars uchun yulduzlar va sovg'alar. Bolangiz motivatsiyasi doim yuqori bo'ladi.",
      iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)', tag: null
    },
    {
      icon: BarChart3, title: 'Ota-ona nazorati',
      desc: "Haftalik hisobot, o'zlashtirish darajasi va faollik statistikasi — hammasini bir joyda kuzating.",
      iconBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', tag: null
    },
    {
      icon: Zap, title: 'Tezkor natija',
      desc: "Hafta ichida bolangiz birinchi ingliz so'zlarini ayta boshlaydi. Ilmiy asoslangan metodika.",
      iconBg: 'linear-gradient(135deg, #ec4899, #db2777)', tag: null
    },
    {
      icon: Globe, title: "Istalgan joydan",
      desc: "Telefon, planshet yoki kompyuterdan kiring. Internet bo'lsa — dars bor.",
      iconBg: 'linear-gradient(135deg, #0ea5e9, #0284c7)', tag: null
    },
  ];

  const steps = [
    { num: '01', title: "Bepul hisob yarating", desc: "Telefon raqamingiz bilan 30 soniyada ro'yxatdan o'ting. Karta talab etilmaydi.", icon: UserPlus },
    { num: '02', title: "Farzandingizni qo'shing", desc: "Ismini kiriting, yoshini tanlang — platforma unga mos darslarni taklif qiladi.", icon: BookOpen },
    { num: '03', title: "O'qishni boshlang", desc: "Videoni tomosha qiling, o'yinlarni o'ynang va yulduzlar yig'ing!", icon: PlayCircle },
    { num: '04', title: "Natijani kuzating", desc: "Har kuni 10-15 daqiqa — va bir oyda sezilarli natija ko'rasiz.", icon: TrendingUp },
  ];

  const testimonials = [
    { name: 'Malika S.', role: '2 farzand onasi', text: "Bolam 1 oyda 50+ so'z o'rgandi! O'yinlar tufayli o'zi so'rab o'tiradi. Juda mamnunmiz.", stars: 5 },
    { name: 'Jasur T.', role: '5 yoshli Amir otasi', text: "Boshqa platformalarni sinab ko'rdim, lekin Bolajoon.uz eng tushunarli va qiziqarlisi. Tavsiya qilaman!", stars: 5 },
    { name: 'Dilnoza K.', role: '3 farzand onasi', text: "Hamma bola uchun mos. Kattasi ham, kichigi ham bir xil qiziqib o'rganadi. Narxi ham adolatli.", stars: 5 },
  ];

  const faqs = [
    { q: "Necha yoshdan boshlab foydalanish mumkin?", a: "Platform 5–9 yoshli bolalar uchun mo'ljallangan. Ammo 4 yoshdan ham boshlash mumkin — darslar vizual va ovozli bo'lgani uchun harf bilmasa ham o'rganadi." },
    { q: "Inglizcha bilmasam ham bolam o'rgana oladimi?", a: "Ha, albatta. Barcha darslar o'zbek tilida tushuntiriladi. Faqat ingliz so'zlari inglizcha aytiladi — shu orqali quloq o'rganib boradi." },
    { q: "7 kunlik sinov tugagach nima bo'ladi?", a: "Sinov tugagach to'lov tariff yoqiladi. Oldindan ogohlantirish yuboramiz. Istalgan vaqt bekor qilish mumkin." },
    { q: "Bir hisobda nechta bola bo'lishi mumkin?", a: "Istalgancha. Har bir farzandingiz uchun alohida profil yarating va har birining natijasini alohida kuzating." },
  ];

  const navLinks = [['#features', 'Imkoniyatlar'], ['#steps', 'Qanday ishlaydi'], ['#faq', 'Savol-javob']];

  return (
    <div style={{ backgroundColor: '#FAFAFA', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 575px) {
          .hero-section { padding: 2.75rem 1.25rem 2.5rem !important; }
          .hero-badge-tl, .hero-badge-br { display: none !important; }
          .section-pad { padding: 3.5rem 1.25rem !important; }
          .cta-inner { padding: 3rem 1.25rem !important; }
          .features-section { padding: 3.5rem 1.25rem !important; }
          .footer-pad { padding: 2.5rem 1.25rem 1.5rem !important; }
        }
        @media (min-width: 576px) and (max-width: 767px) {
          .hero-section { padding: 3.5rem 1.5rem 3rem !important; }
          .hero-badge-tl { top: -10px !important; left: -10px !important; }
          .hero-badge-br { bottom: -10px !important; right: -10px !important; }
        }
        .mobile-menu {
          position: fixed; inset: 0; background: rgba(15,23,42,0.5);
          z-index: 200; display: flex; align-items: flex-start; justify-content: flex-end;
        }
        .mobile-menu-panel {
          background: #fff; width: 260px; height: 100%;
          padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;
          box-shadow: -4px 0 24px rgba(0,0,0,0.12);
        }
        .hero-trust-badge { white-space: nowrap; }
        @media (max-width: 359px) {
          .hero-cta-wrap { flex-direction: column; }
          .hero-cta-wrap a { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid #f1e4ec' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(255,126,179,0.1)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 1.25rem'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Image src="/logo.png" alt="Bolajoon.uz" width={130} height={42} style={{ objectFit: 'contain', flexShrink: 0 }} />

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="d-none d-md-flex">
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} style={{ color: '#475569', textDecoration: 'none', fontWeight: 500, fontSize: '14px', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#FF7EB3'}
                onMouseLeave={e => e.target.style.color = '#475569'}>
                {label}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" style={{
              padding: '7px 16px', borderRadius: '10px', fontSize: '14px',
              fontWeight: 600, color: '#FF7EB3', border: '1.5px solid rgba(255,126,179,0.35)',
              textDecoration: 'none', background: 'rgba(255,126,179,0.06)', whiteSpace: 'nowrap'
            }}>
              Kirish
            </Link>
            <Link href="/register" style={{
              padding: '7px 16px', borderRadius: '10px', fontSize: '14px',
              fontWeight: 700, color: '#fff', textDecoration: 'none',
              background: 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
              boxShadow: '0 3px 14px rgba(255,126,179,0.4)', whiteSpace: 'nowrap'
            }}>
              <span className="d-none d-sm-inline">Bepul boshlash</span>
              <span className="d-sm-none">Boshlash</span>
            </Link>
            {/* Mobile hamburger */}
            <button
              className="d-md-none"
              onClick={() => setMobileMenuOpen(true)}
              style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: '#475569', flexShrink: 0 }}
              aria-label="Menyuni ochish"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu overlay ── */}
      {mobileMenuOpen && (
        <div className="mobile-menu" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <Image src="/logo.png" alt="Bolajoon.uz" width={110} height={36} style={{ objectFit: 'contain' }} />
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={22} color="#64748b" />
              </button>
            </div>
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} onClick={handleNavClick} style={{
                display: 'block', padding: '12px 16px', borderRadius: 10,
                color: '#374151', textDecoration: 'none', fontWeight: 500, fontSize: '15px',
                background: '#f8fafc'
              }}>
                {label}
              </a>
            ))}
            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/login" onClick={handleNavClick} style={{
                display: 'block', textAlign: 'center', padding: '11px', borderRadius: 10,
                fontWeight: 600, color: '#FF7EB3', border: '1.5px solid rgba(255,126,179,0.35)',
                textDecoration: 'none', background: 'rgba(255,126,179,0.06)'
              }}>Kirish</Link>
              <Link href="/register" onClick={handleNavClick} style={{
                display: 'block', textAlign: 'center', padding: '11px', borderRadius: 10,
                fontWeight: 700, color: '#fff', textDecoration: 'none',
                background: 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
              }}>7 kun bepul boshlash</Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="hero-section" style={{
        background: 'linear-gradient(160deg, #fff 0%, #FFF0F7 55%, #FFF8F0 100%)',
        padding: '5rem 1.5rem 4rem',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,126,179,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,158,125,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-12 col-lg-6 text-center text-lg-start">
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, rgba(255,126,179,0.12), rgba(255,158,125,0.12))',
                border: '1px solid rgba(255,126,179,0.3)',
                borderRadius: 100, padding: '6px 16px', marginBottom: '1.25rem'
              }}>
                <span style={{ fontSize: 16 }}>🇺🇿</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FF7EB3' }}>O'zbekiston №1 bolalar ingliz tili platformasi</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(1.85rem, 5vw, 3rem)', fontWeight: 900,
                lineHeight: 1.12, color: '#0f172a', marginBottom: '1.1rem',
                letterSpacing: '-0.5px'
              }}>
                Farzandingiz{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>ingliz tilini</span>
                {' '}sevib o'rgansin
              </h1>

              <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', color: '#64748b', lineHeight: 1.75, marginBottom: '1.75rem', maxWidth: 480 }} className="mx-auto mx-lg-0">
                5–9 yoshli bolalar uchun video darslar, interaktiv o'yinlar va mukofotlar tizimi. Haftada 3 marta, 15 daqiqa — va natija ko'rasiz.
              </p>

              <div className="hero-cta-wrap" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }} >
                <div className="justify-content-lg-start" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                  <Link href="/register" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '13px 26px', borderRadius: '14px', fontSize: '15px',
                    fontWeight: 700, color: '#fff', textDecoration: 'none',
                    background: 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
                    boxShadow: '0 8px 28px rgba(255,126,179,0.45)'
                  }}>
                    <Rocket size={18} />
                    7 kun bepul boshlash
                  </Link>
                  <Link href="/login" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '13px 24px', borderRadius: '14px', fontSize: '15px',
                    fontWeight: 600, color: '#374151', textDecoration: 'none',
                    background: '#fff', border: '1.5px solid #e2e8f0',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                  }}>
                    <LogIn size={18} style={{ color: '#FF7EB3' }} />
                    Kirish
                  </Link>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }} className="justify-content-lg-start">
                {[
                  { icon: CheckCircle, text: 'Karta talab etilmaydi', color: '#059669', bg: '#D1FAE5', border: '#6EE7B7' },
                  { icon: Shield, text: 'Xavfsiz va bolalarga mos', color: '#7c3aed', bg: '#EDE9FE', border: '#C4B5FD' },
                ].map(({ icon: Icon, text, color, bg, border }) => (
                  <div key={text} className="hero-trust-badge" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '7px 12px', borderRadius: 10, background: bg, border: `1px solid ${border}`
                  }}>
                    <Icon size={14} style={{ color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="col-12 col-lg-6 d-flex justify-content-center">
              <div style={{ position: 'relative', width: '100%', maxWidth: 460, padding: '20px 20px' }}>
                {/* Glow */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,126,179,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />
                {/* Main card */}
                <div style={{
                  position: 'relative', borderRadius: 24,
                  background: 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
                  padding: 3, boxShadow: '0 24px 64px rgba(255,126,179,0.3)'
                }}>
                  <div style={{ borderRadius: 22, overflow: 'hidden', aspectRatio: '4/3', background: '#fff' }}>
                    <div style={{
                      width: '100%', height: '100%',
                      backgroundImage: 'url("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800")',
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }} />
                  </div>
                </div>
                {/* Floating badge — top left */}
                <div className="hero-badge-tl" style={{
                  position: 'absolute', top: 4, left: 4, zIndex: 2,
                  background: '#fff', borderRadius: 14, padding: '9px 14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Trophy size={17} style={{ color: '#d97706' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Bugungi ball</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>+150 ⭐</p>
                  </div>
                </div>
                {/* Floating badge — bottom right */}
                <div className="hero-badge-br" style={{
                  position: 'absolute', bottom: 4, right: 4, zIndex: 2,
                  background: '#fff', borderRadius: 14, padding: '9px 14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TrendingUp size={17} style={{ color: '#059669' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Daraja</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>Level 5 🚀</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem' }}>
          <div className="row g-3 text-center">
            {stats.map(({ value, label }) => (
              <div key={label} className="col-6 col-md-3">
                <p style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: '#FF7EB3', margin: 0, lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '6px 0 0', fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="features-section" style={{ padding: '5rem 1.5rem', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,126,179,0.1)', borderRadius: 100,
              padding: '5px 16px', marginBottom: '0.875rem'
            }}>
              <Zap size={13} style={{ color: '#FF7EB3' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#FF7EB3', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Imkoniyatlar</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Nima uchun Bolajoon.uz?</h2>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: 520, margin: '0 auto' }}>
              Bolalaringiz ingliz tilini sevib o'rganishlari uchun zarur bo'lgan hamma narsa bir platformada
            </p>
          </div>

          <div className="row g-3 g-md-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="col-12 col-sm-6 col-lg-4">
                  <div style={{
                    background: '#fff', borderRadius: 20, padding: '1.5rem',
                    height: '100%', border: '1px solid #f1f5f9',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
                  >
                    {f.tag && (
                      <span style={{
                        position: 'absolute', top: 14, right: 14,
                        background: 'linear-gradient(135deg, #FF7EB3, #FF9E7D)',
                        color: '#fff', fontSize: '11px', fontWeight: 700,
                        padding: '3px 10px', borderRadius: 100
                      }}>{f.tag}</span>
                    )}
                    <div style={{
                      width: 50, height: 50, borderRadius: 14,
                      background: f.iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
                    }}>
                      <Icon size={24} color="#fff" strokeWidth={2} />
                    </div>
                    <h4 style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: 8 }}>{f.title}</h4>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="steps" className="section-pad" style={{ padding: '5rem 1.5rem', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,126,179,0.1)', borderRadius: 100,
              padding: '5px 16px', marginBottom: '0.875rem'
            }}>
              <ArrowRight size={13} style={{ color: '#FF7EB3' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#FF7EB3', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Qanday ishlaydi</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>4 qadamda boshlang</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Hech qanday murakkab sozlash talab etilmaydi</p>
          </div>

          <div className="row g-3 g-md-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="col-12 col-sm-6 col-lg-3">
                  <div style={{
                    background: '#FAFAFA', borderRadius: 20, padding: '1.75rem 1.5rem',
                    height: '100%', border: '1px solid #f1f5f9', textAlign: 'center', position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute', top: 14, right: 16,
                      fontSize: '1.75rem', fontWeight: 900, color: 'rgba(255,126,179,0.12)', lineHeight: 1
                    }}>{step.num}</div>
                    <div style={{
                      width: 58, height: 58, borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(255,126,179,0.15), rgba(255,158,125,0.15))',
                      border: '2px solid rgba(255,126,179,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.1rem'
                    }}>
                      <Icon size={24} style={{ color: '#FF7EB3' }} strokeWidth={2} />
                    </div>
                    <h4 style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: 8 }}>{step.title}</h4>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.65 }}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-pad" style={{ padding: '5rem 1.5rem', background: 'linear-gradient(135deg, #FFF0F7 0%, #FFF8F0 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,126,179,0.1)', borderRadius: 100,
              padding: '5px 16px', marginBottom: '0.875rem'
            }}>
              <MessageCircle size={13} style={{ color: '#FF7EB3' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#FF7EB3', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Ota-onalar fikri</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#0f172a' }}>500+ oila bizga ishonadi</h2>
          </div>

          <div className="row g-3 g-md-4">
            {testimonials.map((t, i) => (
              <div key={i} className="col-12 col-md-4">
                <div style={{
                  background: '#fff', borderRadius: 20, padding: '1.5rem',
                  height: '100%', boxShadow: '0 4px 20px rgba(255,126,179,0.08)',
                  border: '1px solid rgba(255,126,179,0.1)'
                }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: '0.875rem' }}>
                    {Array(t.stars).fill(0).map((_, j) => (
                      <Star key={j} size={15} style={{ color: '#f59e0b' }} fill="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, marginBottom: '1.1rem', fontStyle: 'italic' }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #FF7EB3, #FF9E7D)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: '14px'
                    }}>{t.name[0]}</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{t.name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="section-pad" style={{ padding: '5rem 1.5rem', background: '#fff' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Tez-tez beriladigan savollar</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Javob topa olmadingizmi? Biz bilan bog'laning.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                border: '1.5px solid', borderColor: openFaq === i ? 'rgba(255,126,179,0.4)' : '#f1f5f9',
                borderRadius: 16, overflow: 'hidden',
                background: openFaq === i ? 'rgba(255,126,179,0.03)' : '#fff',
                transition: 'all 0.2s ease'
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 'clamp(13px, 2vw, 15px)', color: '#1e293b', paddingRight: 12, lineHeight: 1.4 }}>{faq.q}</span>
                  <ChevronDown size={18} style={{ color: '#FF7EB3', flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 1.25rem 1.1rem' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.7 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 1.25rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="cta-inner" style={{
            borderRadius: 24, overflow: 'hidden', padding: '4rem 2rem', textAlign: 'center',
            background: 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
            boxShadow: '0 16px 48px rgba(255,126,179,0.35)', position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
            <p style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '0 0 0.5rem', lineHeight: 1 }}>🚀</p>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', color: '#fff', marginBottom: 12, position: 'relative' }}>
              Bugun boshlang — bepul!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', maxWidth: 440, margin: '0 auto 2rem', position: 'relative', lineHeight: 1.65 }}>
              7 kunlik bepul sinov. Karta talab etilmaydi. Istalgan vaqt bekor qilish mumkin.
            </p>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 36px', borderRadius: '14px', fontSize: '15px',
              fontWeight: 800, color: '#FF7EB3', background: '#fff',
              textDecoration: 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
              position: 'relative'
            }}>
              <Rocket size={19} />
              Bepul ro'yxatdan o'tish
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer-pad" style={{ background: '#0f172a', padding: '3.5rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="row g-4" style={{ paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="col-12 col-md-5">
              <Image src="/logo.png" alt="Bolajoon.uz" width={110} height={36} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85 }} />
              <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: '13px', lineHeight: 1.75, maxWidth: 300 }}>
                Bolajoon.uz — O'zbekistondagi bolalar uchun ingliz tili o'rgatish platformasi. O'yinlar va interaktiv darslar orqali bolangiz quvonib o'rganadi.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                <MapPin size={13} style={{ color: '#FF7EB3' }} />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>O'zbekiston</span>
              </div>
            </div>
            <div className="col-6 col-sm-4 col-md-3">
              <h6 style={{ fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Sahifalar</h6>
              <ul className="list-unstyled mb-0">
                {[['/', 'Bosh sahifa'], ['#features', 'Imkoniyatlar'], ['#steps', 'Qanday ishlaydi'], ['#faq', 'Savol-javob'], ['/login', 'Kirish'], ['/register', "Ro'yxatdan o'tish"]].map(([href, label]) => (
                  <li key={label} style={{ marginBottom: 9 }}>
                    <a href={href} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '13px' }}
                      onMouseEnter={e => e.target.style.color = '#FF7EB3'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-6 col-sm-4 col-md-4">
              <h6 style={{ fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Hoziroq boshlang</h6>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: 1.65, marginBottom: '1.1rem' }}>
                7 kunlik bepul sinov. Karta talab etilmaydi.
              </p>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', borderRadius: 10, fontSize: '13px',
                fontWeight: 700, color: '#fff', textDecoration: 'none',
                background: 'linear-gradient(135deg, #FF7EB3 0%, #FF9E7D 100%)',
                boxShadow: '0 4px 16px rgba(255,126,179,0.3)'
              }}>
                <Rocket size={14} /> Bepul boshlash
              </Link>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: '1.25rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: 0 }}>© 2026 Bolajoon.uz. Barcha huquqlar himoyalangan.</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Heart size={11} style={{ color: '#FF7EB3' }} fill="#FF7EB3" /> O'zbekistonda ishlab chiqilgan
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
