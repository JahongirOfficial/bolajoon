'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Code } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-dark text-white px-3 py-4 mt-auto">
            <div className="container-fluid">
                <div className="row g-4 mb-3">
                    {/* About */}
                    <div className="col-12 col-md-6">
                        <Image src="/logo.png" alt="Bolajon.uz" width={100} height={32} style={{ objectFit: 'contain' }} />
                        <p className="text-white-50 mt-2 small mb-0">
                            Bolalar uchun ingliz tili o'rgatish platformasi. Interaktiv darslar va qiziqarli o'yinlar.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="col-12 col-md-3">
                        <h6 className="fw-bold mb-3" style={{ fontSize: '1rem' }}>Sahifalar</h6>
                        <ul className="list-unstyled mb-0">
                            <li className="mb-2"><Link href="/dashboard" className="text-white-50 text-decoration-none" style={{ fontSize: '0.9rem' }}>Bosh sahifa</Link></li>
                            <li className="mb-2"><Link href="/dashboard/lessons" className="text-white-50 text-decoration-none" style={{ fontSize: '0.9rem' }}>Darslar</Link></li>
                            <li className="mb-2"><Link href="/dashboard/leaderboard" className="text-white-50 text-decoration-none" style={{ fontSize: '0.9rem' }}>Reyting</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-top border-secondary pt-3">
                    <p className="text-white-50 small mb-0 text-center">
                        © 2026 Bolajon.uz • O'zbekistonda ishlab chiqilgan ❤️
                    </p>
                </div>
            </div>
        </footer>
    );
}
