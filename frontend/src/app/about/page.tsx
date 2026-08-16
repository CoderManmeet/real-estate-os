'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, MapPin, Users, ShieldCheck, Handshake, Home } from 'lucide-react';

// ── Replace these with your real values ──────────────────────────────
const CALL_NUMBER = '+917888548215';
const WHATSAPP_NUMBER = '918264757806'; // no + or spaces, wa.me format
const SALES_NUMBER = '+918264757806';
const SITE_VISIT_NUMBER = '+919814014708';

const SOCIAL_LINKS = {
  instagram: '#', // TODO: paste your Instagram URL
  facebook: '#', // TODO: paste your Facebook URL
  youtube: '#', // TODO: paste your YouTube URL
  linkedin: '#', // TODO: paste your LinkedIn URL
  googleBusiness: '#', // TODO: paste your Google Business URL
};

const FOUNDERS = [
  { name: 'Manmeet Singh', role: 'Founder & Real Estate Consultant' },
  { name: 'Armeet Singh', role: 'Founder & Real Estate Consultant' },
  { name: 'Viraj Singh', role: 'Founder & Real Estate Consultant' },
  { name: 'Vansh', role: 'Co-Founder & Property Consultant' }, // TODO: add real name
];
// ───────────────────────────────────────────────────────────────────

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Signature <span className="text-[#D4AF72]">Estates</span>
          </Link>
          
           <a href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            <MessageCircle size={15} /> WhatsApp Us
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-stone-300/30 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              About Signature Estates
            </span>
          </Reveal>
          <Reveal>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl">
              More Than Property.
              <br />
              We Build Relationships.
            </h1>
          </Reveal>
          <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-3">
            
             <a href={`tel:${CALL_NUMBER}`}
              className="flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 shadow-sm transition-colors hover:border-amber-500 hover:text-amber-700"
            >
              <Phone size={15} /> {CALL_NUMBER}
            </a>
            
             <a href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
            >
              <MessageCircle size={15} /> Chat on WhatsApp
            </a>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-2 sm:items-center">
          <Reveal>
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              Our Story
            </span>
            <p className="text-lg leading-relaxed text-stone-700">
              Our journey began by helping people in our local market make better property
              decisions. By combining local market knowledge with a personal approach, we've
              built our business around understanding each client's requirements — not just
              presenting them with listings.
            </p>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
              <Home className="mb-4 text-amber-600" size={28} />
              <p className="text-sm leading-relaxed text-stone-600">
                Every client relationship starts with listening — to what you actually need,
                not what's easiest to sell. That's the difference between a transaction and a
                relationship.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { icon: MapPin, label: 'Local Market Expertise' },
            { icon: Handshake, label: 'Personal Assistance' },
            { icon: Users, label: 'End-to-End Support' },
            { icon: ShieldCheck, label: 'Verified Property Information' },
          ].map((item) => (
            <Reveal key={item.label}>
              <div className="flex flex-col items-center gap-3 rounded-xl border border-stone-200 bg-white p-6 text-center transition-shadow hover:shadow-md">
                <item.icon className="text-amber-600" size={24} />
                <p className="text-sm font-medium text-stone-800">{item.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-10 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              Who We Are
            </span>
            <h2 className="text-2xl font-semibold text-stone-900 sm:text-3xl">Meet the Founders</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {FOUNDERS.map((founder) => (
              <Reveal key={founder.name}>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-stone-200 text-lg font-semibold text-stone-700">
                    {founder.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <p className="text-sm font-semibold text-stone-900">{founder.name}</p>
                  <p className="mt-0.5 text-xs text-stone-500">{founder.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-10 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              Talk to Us
            </span>
            <h2 className="text-2xl font-semibold text-stone-900 sm:text-3xl">
              Reach the Right Team, Directly
            </h2>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            <Reveal>
              <ContactCard label="Sales & Enquiries" number={SALES_NUMBER} whatsapp={SALES_NUMBER.replace('+', '')} />
            </Reveal>
            <Reveal>
              <ContactCard label="Site Visits & Assistance" number={SITE_VISIT_NUMBER} whatsapp={SITE_VISIT_NUMBER.replace('+', '')} />
            </Reveal>
          </div>

          <Reveal className="mt-12 flex justify-center gap-5">
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition-colors hover:border-amber-500 hover:text-amber-700">
              <InstagramIcon />
            </a>
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition-colors hover:border-amber-500 hover:text-amber-700">
              <FacebookIcon />
            </a>
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition-colors hover:border-amber-500 hover:text-amber-700">
              <YoutubeIcon />
            </a>
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition-colors hover:border-amber-500 hover:text-amber-700">
              <LinkedinIcon />
            </a>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white px-6 py-8 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} Signature Estates. More than property — we build relationships.
      </footer>
    </div>
  );
}

function ContactCard({ label, number, whatsapp }: { label: string; number: string; whatsapp: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-600">{label}</p>
      <p className="mb-4 text-lg font-semibold text-stone-900">{number}</p>
      <div className="flex gap-2">
        <a href={`tel:${number}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-300 py-2 text-xs font-medium text-stone-700 transition-colors hover:border-amber-500 hover:text-amber-700">
          <Phone size={13} /> Call
        </a>
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-600 py-2 text-xs font-medium text-white transition-colors hover:bg-amber-700">
          <MessageCircle size={13} /> WhatsApp
        </a>
      </div>
    </div>
  );
}
