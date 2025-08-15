'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Simple canvas-based particles background (no extra CSS needed)
function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; r: number; c: string }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    const colors = ['#FFD700', '#FF6F00', '#32CD32', '#556B2F', '#8B4513'];

    const init = () => {
      particlesRef.current = Array.from({ length: 60 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: 1.2 + Math.random() * 2.5,
        c: colors[Math.floor(Math.random() * colors.length)],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + 'AA';
        ctx.fill();
      }
      // connective lines (subtle)
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 120) {
            const alpha = Math.max(0, 1 - d / 120) * 0.15;
            ctx.strokeStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      init();
    });
    ro.observe(canvas);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 800;
    const from = display;
    const to = value;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

type Newsletter = {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  date?: string;
  imageUrl?: string;
};

type Stats = { total?: number; active?: number; unsubscribed?: number; pending?: number };

function getCategory(n: Newsletter): string {
  const text = `${n.title} ${n.description ?? ''} ${n.content ?? ''}`.toLowerCase();
  if (/ai|ml|gpt|neural|model/.test(text)) return 'AI';
  if (/cloud|serverless|kubernetes|aws|gcp|azure/.test(text)) return 'Cloud';
  if (/devops|ci\/?cd|pipeline|docker/.test(text)) return 'DevOps';
  if (/security|auth|jwt|encryption|privacy/.test(text)) return 'Security';
  return 'General';
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const pendingToken = searchParams.get('token');
  const [unsubState, setUnsubState] = useState<{ status: 'idle'|'ask'|'working'|'done'|'error'; msg?: string }>({ status: 'idle' });
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({});
  const [filter, setFilter] = useState<string>('All');
  const [dark, setDark] = useState<boolean>(false);
  const feedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [nRes, sRes] = await Promise.all([
          fetch(`${API_BASE}/api/newsletters`, { cache: 'no-store' }),
          fetch(`${API_BASE}/api/subscribers/stats`, { cache: 'no-store' }),
        ]);
        const n = await nRes.json();
        const s = await sRes.json();
        setNewsletters(Array.isArray(n) ? n : []);
        setStats(s || {});
      } catch (e) {
        setNewsletters([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categorized = useMemo(() =>
    newsletters.map(n => ({ ...n, _cat: getCategory(n) })), [newsletters]
  );

  const filtered = useMemo(() =>
    filter === 'All' ? categorized : categorized.filter(n => n._cat === filter), [categorized, filter]
  );

  const visible = filtered.slice(0, visibleCount);

  const scrollToFeed = () => feedRef.current?.scrollIntoView({ behavior: 'smooth' });

  const isNew = (n: Newsletter) => {
    if (!n.date) return false;
    const dt = new Date(n.date).getTime();
    return Date.now() - dt < 1000 * 60 * 60 * 24 * 7; // 7 days
  };

  const isTrending = (n: Newsletter) => /ai|ml|gpt|cloud|security/i.test(`${n.title} ${n.description}` || '');

  // Subscribe inline form
  const [subEmail, setSubEmail] = useState('');
  const [subMsg, setSubMsg] = useState<string | null>(null);
  const [subOk, setSubOk] = useState<boolean | null>(null);
  const submitSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubMsg(null);
    setSubOk(null);
    try {
      const res = await fetch(`${API_BASE}/api/subscribers/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Subscribe failed');
      setSubOk(true);
      setSubMsg('Subscribed! Welcome aboard.');
      setSubEmail('');
    } catch (err: any) {
      setSubOk(false);
      setSubMsg(err.message || 'Subscribe failed');
    }
  };

  // Scroll-triggered animations for cards
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0', 'rotate-0');
          }
        });
      },
      { threshold: 0.2 }
    );
    cardsRef.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, [visible]);

  const categories = ['All', 'AI', 'Cloud', 'DevOps', 'Security', 'General'];

  const confirmUnsubscribe = async () => {
    if (!pendingToken) return;
    const userConfirmed = window.confirm('Are you sure you want to unsubscribe?');
    if (!userConfirmed) return;
    try {
      setUnsubState({ status: 'working' });
      const res = await fetch(`${API_BASE}/api/subscribers/unsubscribe/${pendingToken}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to unsubscribe');
      setUnsubState({ status: 'done', msg: data.message || 'You have been unsubscribed.' });
    } catch (err: any) {
      setUnsubState({ status: 'error', msg: err.message || 'Unsubscribe failed' });
    }
  };

  return (
    <div className="bg-[#FFF8E1] text-black">
      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <ParticlesCanvas />
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/25 via-[#FF6F00]/25 to-[#32CD32]/25" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
              🚀<span className="block text-transparent bg-clip-text bg-black/80 ">
                 Explore the Future of Tech
              </span>
              <span className="block mt-2">with VisionTech!</span>
            </h1>
                      </div>

          <p className="mt-4 max-w-2xl text-lg md:text-xl opacity-90">
            Bright, energetic insights. Curated weekly. Join thousands of innovators.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={scrollToFeed}
              className="relative inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-black
                         bg-gradient-to-r from-[#FFD700] via-[#FF6F00] to-[#32CD32] hover:to-[#32CD32]
                         transition-transform duration-300 hover:-translate-y-0.5 shadow-lg"
            >
              Subscribe Now
            </button>
            <div className="text-sm opacity-80">
              <span className="font-semibold">Subscribers: </span>
              <AnimatedNumber value={Number(stats?.active || 0)} />
            </div>
          </div>

          {/* Inline Unsubscribe CTA if token present */}
          {pendingToken && (
            <div className="mt-4 p-3 rounded-xl bg-white/80 border border-[#8B4513]/30 max-w-xl">
              {unsubState.status === 'done' ? (
                <div className="text-green-700 text-sm font-medium">{unsubState.msg}</div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-sm">This link allows you to unsubscribe from our mailing list.</div>
                  <button
                    onClick={confirmUnsubscribe}
                    disabled={unsubState.status === 'working'}
                    className="px-4 py-2 rounded-full text-white bg-red-600 hover:bg-red-700 disabled:opacity-70"
                  >
                    {unsubState.status === 'working' ? 'Processing…' : 'Unsubscribe'}
                  </button>
                </div>
              )}
              {unsubState.status === 'error' && (
                <div className="text-red-600 text-sm mt-2">{unsubState.msg}</div>
              )}
            </div>
          )}

          {/* Inline Subscribe Form */}
          <form onSubmit={submitSubscribe} className="mt-6 flex max-w-xl gap-2 bg-white/80 backdrop-blur rounded-full p-1 pl-3 border border-[#8B4513]/30">
            <input
              type="email"
              required
              value={subEmail}
              onChange={(e) => setSubEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-transparent outline-none py-2 text-sm"
            />
            <button type="submit" className="px-5 py-2 rounded-full text-black bg-[#FF6F00] hover:bg-[#FF8F33]">
              Join
            </button>
            {subMsg && (
              <span className={subOk ? 'text-green-600 ml-3 self-center' : 'text-red-600 ml-3 self-center'}>{subMsg}</span>
            )}
          </form>

          {/* Scroll indicator */}
          <div className="mt-12 flex justify-center">
            <div onClick={scrollToFeed} className="cursor-pointer flex flex-col items-center opacity-90">
              <div className="w-1.5 h-8 rounded-full bg-white/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-white rounded-full animate-bounce" />
              </div>
              <span className="text-xs mt-2">scroll</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEED CONTROLS */}
      <section ref={feedRef} className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl md:text-3xl font-bold">Latest Newsletters</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setFilter(cat); setVisibleCount(9); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition shadow-sm ${
                  filter === cat
                    ? 'text-black bg-gradient-to-r from-[#FFD700] via-[#FF6F00] to-[#32CD32]'
                    : 'bg-white/80 backdrop-blur hover:bg-white text-gray-700 border border-[#8B4513]/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FEED GRID */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/60 backdrop-blur border border-white/50 shadow-sm p-4 animate-pulse">
              <div className="aspect-[16/9] rounded-xl bg-gray-200" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mt-4" />
              <div className="h-3 bg-gray-200 rounded w-5/6 mt-2" />
            </div>
          ))}

          {!loading && visible.map((n, idx) => (
            <div
              key={n._id}
              ref={el => (cardsRef.current[idx] = el)}
              className="opacity-0 translate-y-6 rotate-[0.5deg] transition-all duration-700"
            >
              <Link
                href={`/newsletter/${n._id}`}
                className="group block rounded-2xl overflow-hidden bg-white/70 backdrop-blur border border-white/50 shadow-sm hover:shadow-xl
                           transition-transform hover:-translate-y-1"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={n.imageUrl || '/next.svg'}
                    alt={n.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {isNew(n) && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-yellow-400 text-black shadow">
                        New
                      </span>
                    )}
                    {isTrending(n) && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-[#FF6F00] text-black shadow">
                    Trending
                    </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {getCategory(n)}
                    </span>
                    {n.date && (
                      <span className="text-[10px] text-gray-500">{new Date(n.date).toLocaleDateString()}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold">{n.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {n.description || (typeof n.content === 'string' ? `${n.content.replace(/<[^>]+>/g, '').slice(0, 140)}...` : '')}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* LOAD MORE */}
        {!loading && visible.length < filtered.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleCount(c => c + 9)}
              className="px-6 py-3 rounded-full font-semibold text-black bg-gradient-to-r from-[#FFD700] via-[#FF6F00] to-[#32CD32] hover:to-[#32CD32] shadow-lg"
            >
              Load more
            </button>
          </div>
        )}
      </section>

      {/* FEATURED HORIZONTAL SCROLLER (mobile friendly) */}
      {!loading && filtered.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <h3 className="text-xl font-bold mb-3">Featured</h3>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
            {filtered.slice(0, 8).map(n => (
              <Link
                key={n._id}
                href={`/newsletter/${n._id}`}
                className="snap-center min-w-[260px] rounded-2xl bg-white/70 backdrop-blur border border-white/50 shadow-sm hover:shadow-lg transition"
              >
                <div className="aspect-[16/9] overflow-hidden rounded-t-2xl">
                  <img src={n.imageUrl || '/next.svg'} alt={n.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 inline-block mb-1">
                    {getCategory(n)}
                  </div>
                  <div className="font-semibold truncate">{n.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
