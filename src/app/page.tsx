'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Fake data ─────────────────────────────────────────────────────── */
const testimonialData = [
  {
    quote: "Un gain de temps énorme sur les réponses quotidiennes. Je valide et j'envoie.",
    name: "Claire Dupont",
    role: "Freelance marketing",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80",
    icon: "solar:chat-round-bold-duotone",
  },
  {
    quote: "L'IA comprend vraiment le contexte de la conversation. Les réponses sont pertinentes.",
    name: "Marc Lefèvre",
    role: "PDG, Startup SaaS",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80",
    icon: "solar:document-text-bold-duotone",
  },
  {
    quote: "Je gère enfin plusieurs boîtes email sans y passer des heures chaque jour.",
    name: "Sophie Martin",
    role: "Assistante de direction",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80",
    icon: "solar:star-bold-duotone",
  },
  {
    quote: "La confidentialité est au rendez-vous. Mes données restent sous mon contrôle.",
    name: "Thomas Bernard",
    role: "Avocat, Cabinet juridique",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80",
    icon: "solar:heart-bold-duotone",
  },
];

const kpiTargets = { us: 76, bd: 44 };

const clientListData = [
  { name: "Claire Dupont", location: "FR • EUR", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80", badge: "solar:star-bold-duotone", badgeColor: "text-amber-300" },
  { name: "Marc Lefèvre", location: "GB • GBP", avatar: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=80", badge: "solar:shield-check-bold-duotone", badgeColor: "text-emerald-300" },
  { name: "Sophie Martin", location: "DE • EUR", avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=80", badge: "solar:verified-check-bold-duotone", badgeColor: "text-sky-300" },
];

const toolGrid = [
  { icon: "solar:inbox-bold-duotone", label: "Boîte email" },
  { icon: "solar:chat-round-bold-duotone", label: "Chat" },
  { icon: "solar:calendar-bold-duotone", label: "Calendar" },
  { icon: "solar:bolt-bold-duotone", label: "Automation" },
];

const teamAvatars = [
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&auto=format&fit=crop",
];

const ruleCode = `quand email.received alors
  si urgent.vrai
    notifier('Slack', #urgent)
    affecter('support', round_robin)
fin`;

const logoImages = [
  "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/e5f2922d-4fb6-4f7c-8795-cd9ba63105a4_1600w.png",
  "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/92287bc0-bc70-4864-bf05-a89c1b99a218_1600w.png",
  "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/8284c62f-bfed-4d35-aaa2-956d0a8969b3_1600w.png",
  "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/3764a6eb-78e1-495f-9143-c85a648446c4_1600w.png",
  "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/dea31d52-7076-423f-bace-53eeec3014d3_1600w.png",
  "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/b16a9cf6-6be1-4d0d-bc63-07a471092998_1600w.png",
];

/* ── Testimonials carousel ────────────────────────────────────────── */
function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardsRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonialData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const apply = () => {
    const cards = cardsRef.current?.querySelectorAll('.testimonial-card');
    const dots = dotsRef.current?.querySelectorAll('.dot');
    cards?.forEach((el, i) => {
      el.classList.remove('active', 'next-1', 'next-2', 'hidden');
      const pos = ((i - activeIndex) % testimonialData.length + testimonialData.length) % testimonialData.length;
      if (pos === 0) el.classList.add('active');
      else if (pos === 1) el.classList.add('next-1');
      else if (pos === 2) el.classList.add('next-2');
      else el.classList.add('hidden');
    });
    dots?.forEach((dot, i) => {
      (dot as HTMLElement).style.width = i === activeIndex ? '24px' : '8px';
      (dot as HTMLElement).style.background = i === activeIndex ? '#fff' : 'rgba(255,255,255,0.3)';
    });
  };

  useEffect(() => { apply(); }, [activeIndex]);

  return (
    <div className="border-gradient before:rounded-3xl overflow-hidden aspect-[16/12] rounded-3xl pt-4 pr-4 pb-4 pl-4 relative [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0.05)]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-[280px] sm:max-w-[300px] h-[320px]" ref={cardsRef}>
          {testimonialData.map((t, i) => (
            <div key={i} className={`testimonial-card ${i === 0 ? 'active' : i === 1 ? 'next-1' : i === 2 ? 'next-2' : 'hidden'}`}>
              <div className="border-gradient before:rounded-2xl transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02] rounded-2xl shadow-2xl [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
                <div className="pt-4 pr-4 pb-4 pl-4">
                  <div className="inline-flex w-9 h-9 rounded-xl items-center justify-center [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
                    <span className="iconify text-base" data-icon={t.icon} style={{ color: '#60a5fa' }} />
                  </div>
                  <p className="mt-3 text-xs text-white/70 leading-relaxed">"{t.quote}"</p>
                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-white/10">
                    <img className="h-8 w-8 rounded-xl ring-2 ring-white/10 object-cover" src={t.avatar} alt={t.name} />
                    <div>
                      <div className="text-[11px] font-medium text-white tracking-tight">{t.name}</div>
                      <div className="text-[11px] text-white/60">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10" ref={dotsRef}>
        {testimonialData.map((_, i) => (
          <div key={i} className="dot rounded-full transition-all duration-300 bg-white/30" style={{ width: i === 0 ? '24px' : '8px', height: '8px' }} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background: 'radial-gradient(600px 280px at 60% 40%, rgba(255,255,255,0.07), transparent 60%)' }} />
    </div>
  );
}

/* ── KPI bars animation (IntersectionObserver) ───────────────────── */
function KpiCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const usBar = card.querySelector<HTMLElement>('#us-progress');
    const bdBar = card.querySelector<HTMLElement>('#bd-progress');
    const usPct = card.querySelector<HTMLElement>('#us-pct');
    const bdPct = card.querySelector<HTMLElement>('#bd-pct');
    if (!usBar || !bdBar || !usPct || !bdPct) return;

    const animated = { value: false };
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animated.value) {
        animated.value = true;
        const dur = 1000, start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          const ease = 1 - Math.pow(1 - t, 3);
          const usV = Math.round(kpiTargets.us * ease);
          const bdV = Math.round(kpiTargets.bd * ease);
          usBar.style.width = usV + '%';
          bdBar.style.width = bdV + '%';
          usPct.textContent = usV + '%';
          bdPct.textContent = bdV + '%';
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={cardRef} className="border-gradient before:rounded-3xl group overflow-hidden rounded-3xl pt-5 pr-5 pb-5 pl-5 relative [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0.05)]">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="-right-24 -top-24 bg-sky-500/10 w-72 h-72 rounded-full absolute blur-3xl" />
      <div className="border-gradient before:rounded-2xl rounded-2xl pt-4 pr-4 pb-4 pl-4 [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
        <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
          <span className="iconify h-4 w-4 text-sky-300" data-icon="solar:chart-bold-duotone" />
          <span className="font-medium">Suivi des performances</span>
        </div>
        <div className="space-y-3">
          <div className="border-gradient before:rounded-xl rounded-xl p-3 [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
            <div className="flex items-center gap-3">
              <img src="https://flagcdn.com/fr.svg" alt="FR" className="h-5 w-5 rounded-full ring-1 ring-white/20" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white/90">France</p>
                  <p className="text-xs text-white/60">892 réponses/mois</p>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div id="us-progress" className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500" style={{ width: '0%' }} />
                </div>
              </div>
              <span id="us-pct" className="text-xs text-white/70">0%</span>
            </div>
            <p className="mt-2 text-[11px] text-white/50">Email pro & SaaS</p>
          </div>
          <div className="border-gradient before:rounded-xl rounded-xl p-3 [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
            <div className="flex items-center gap-3">
              <img src="https://flagcdn.com/de.svg" alt="DE" className="h-5 w-5 rounded-full ring-1 ring-white/20" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white/90">Allemagne</p>
                  <p className="text-xs text-white/60">527 réponses/mois</p>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div id="bd-progress" className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: '0%' }} />
                </div>
              </div>
              <span id="bd-pct" className="text-xs text-white/70">0%</span>
            </div>
            <p className="mt-2 text-[11px] text-white/50">Conseil & services</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button className="border-gradient before:rounded-full inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-sky-200 hover:bg-sky-500/20 transition [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
            <span className="iconify h-4 w-4" data-icon="solar:radar-bold-duotone" />
            Analyse IA
          </button>
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <span className="iconify h-3.5 w-3.5 text-emerald-300" data-icon="solar:pulse-bold-duotone" />
            En direct
          </div>
        </div>
      </div>
      <h3 className="mt-5 text-xl md:text-2xl font-semibold tracking-tight">Réponses générées en temps réel</h3>
      <p className="mt-1.5 text-sm text-white/70">Emind rédige une proposition de réponse en moins de 3 secondes. Plus besoin de chercher les bonnes formules.</p>
    </section>
  );
}

/* ── Client list scroll ──────────────────────────────────────────── */
function ClientListCard() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.children);
    items.forEach(li => list.appendChild(li.cloneNode(true)));
    let y = 0;
    const speed = 0.25;
    const step = () => {
      y += speed;
      const totalH = items.reduce((h, el) => h + (el as HTMLElement).offsetHeight, 0);
      if (y >= totalH) y = 0;
      list.style.transform = `translateY(-${y}px)`;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  return (
    <section className="border-gradient before:rounded-3xl group relative overflow-hidden rounded-3xl p-5 md:p-6 [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0.05)]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="border-gradient before:rounded-2xl rounded-2xl p-4 [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <span className="iconify h-4 w-4 text-indigo-300" data-icon="solar:planet-bold-duotone" />
            <span className="font-medium">Clients internationaux</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/60">Cette semaine</span>
            <span className="iconify h-4 w-4 text-white/40" data-icon="solar:restart-bold-duotone" />
          </div>
        </div>
        <div className="overflow-hidden h-36 border-gradient before:rounded-xl rounded-xl mt-3">
          <ul ref={listRef}>
            {clientListData.map((c, i) => (
              <li key={i} className="flex pt-2 pr-3 pb-2 pl-3 items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={c.avatar} className="h-6 w-6 rounded-full ring-1 ring-white/20 object-cover" alt={c.name} />
                  <div>
                    <p className="text-sm text-white/90">{c.name}</p>
                    <p className="text-[11px] text-white/50">{c.location}</p>
                  </div>
                </div>
                <span className={`iconify h-4 w-4 ${c.badgeColor}`} data-icon={c.badge} />
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[11px] text-white/60">
          <span className="iconify h-3.5 w-3.5" data-icon="solar:translation-bold-duotone" />
          Support multilingue et multicurrency
        </div>
      </div>
      <h3 className="mt-5 text-xl md:text-2xl font-semibold tracking-tight">Multi-comptes email</h3>
      <p className="mt-1.5 text-sm text-white/70">Gérez plusieurs boîtes mail depuis une seule interface. Idéal pour les freelancers et les petites équipes.</p>
    </section>
  );
}

/* ── Collaborate card ─────────────────────────────────────────────── */
function CollaborateCard() {
  return (
    <section className="border-gradient before:rounded-3xl group relative overflow-hidden rounded-3xl p-5 md:p-6 [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0.05)]">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="border-gradient before:rounded-2xl rounded-2xl p-4 [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <span className="iconify h-4 w-4 text-emerald-300" data-icon="solar:widget-bold-duotone" />
          <span className="font-medium">Se connecte à vos outils</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {toolGrid.map(tool => (
            <div key={tool.label} className="border-gradient before:rounded-xl flex flex-col items-center gap-2 rounded-xl p-3 [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
              <span className="iconify h-5 w-5 text-white/80" data-icon={tool.icon} />
              <span className="text-xs text-white/70">{tool.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {teamAvatars.map((src, i) => (
              <img key={i} src={src} className="h-6 w-6 rounded-full ring-2 ring-[#0a0a0b] object-cover" alt="Membre équipe" />
            ))}
            <div className="h-6 w-6 rounded-full bg-white/10 ring-2 ring-[#0a0a0b] grid place-items-center text-[10px] text-white/70">+9</div>
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] text-white/60">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            En ligne
          </div>
        </div>
      </div>
      <h3 className="mt-5 text-xl md:text-2xl font-semibold tracking-tight">Analyse intelligente de votre boîte</h3>
      <p className="mt-1.5 text-sm text-white/70">Emind comprend le ton de vos échanges, identifie les conversations en attente et vous suggère les actions prioritaires.</p>
    </section>
  );
}

/* ── Automate / Rule Builder card ──────────────────────────────────── */
function AutomateCard() {
  return (
    <section className="border-gradient before:rounded-3xl group relative overflow-hidden rounded-3xl p-5 md:p-6 [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0.05)]">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="border-gradient before:rounded-2xl rounded-2xl p-4 relative overflow-hidden [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
        <div className="flex items-center justify-between text-white/80 text-sm">
          <div className="flex items-center gap-2">
            <span className="iconify h-4 w-4 text-amber-300" data-icon="solar:magic-stick-3-bold-duotone" />
            <span className="font-medium">Constructeur de règles</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="border-gradient before:rounded-full inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] text-white/80 hover:bg-white/10 transition [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
              <span className="iconify h-3.5 w-3.5" data-icon="solar:add-circle-bold-duotone" />
              Nouvelle règle
            </button>
            <button className="border-gradient before:rounded-full inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] text-emerald-200 hover:bg-emerald-500/20 transition [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
              <span className="iconify h-3.5 w-3.5" data-icon="solar:play-bold-duotone" />
              Lancer
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { icon: "solar:flag-bold-duotone", iconColor: "text-amber-300", label: "Déclencheur", value: "Email reçu" },
            { icon: "solar:sort-by-time-bold-duotone", iconColor: "text-white/70", label: "Condition", value: "Urgent = vrai" },
            { icon: "solar:plain-bold-duotone", iconColor: "text-emerald-300", label: "Action", value: "Notifier + Affecter" },
          ].map((col, i) => (
            <div key={i} className="border-gradient before:rounded-xl relative rounded-xl p-3 [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span className={`iconify h-4 w-4 ${col.iconColor}`} data-icon={col.icon} />
                {col.label}
              </div>
              <p className="mt-2 text-xs text-white/70">{col.value}</p>
            </div>
          ))}
        </div>
        <pre className="mt-4 text-[11px] leading-relaxed border-gradient before:rounded-xl rounded-xl p-3 text-white/80 overflow-x-auto whitespace-pre-wrap [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">{ruleCode}</pre>
      </div>
      <h3 className="mt-5 text-xl md:text-2xl font-semibold tracking-tight">Confidentialité garantie</h3>
      <p className="mt-1.5 text-sm text-white/70">Vos emails ne sont jamais stockés de façon permanente. Le traitement est transient, chiffré, et respectueux du RGPD.</p>
    </section>
  );
}

/* ── Marquee logos ────────────────────────────────────────────────── */
function LogoMarquee() {
  return (
    <section className="max-w-7xl mt-40 mr-auto ml-auto pt-16 pr-4 pb-6 pl-4 relative sm:px-6 lg:px-8 lg:mt-40">
      <div className="text-center">
        <p className="uppercase text-sm font-medium text-slate-400 tracking-wide">
          Adopté par des équipes de tous horizons
        </p>
      </div>
      <div className="overflow-hidden mt-6 relative">
        <div style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
          <div className="flex gap-6 will-change-transform animate-[marquee-left_30s_linear_infinite]">
            <div className="flex gap-6 shrink-0 sm:gap-x-6 lg:gap-x-20">
              {logoImages.map((src, i) => (
                <a key={i} href="#" className="inline-flex items-center justify-center bg-center mix-blend-screen w-[150px] h-[40px] bg-cover rounded-lg" style={{ backgroundImage: `url('${src}')` }} aria-label="Logo partenaire" />
              ))}
            </div>
            <div className="flex shrink-0 sm:gap-x-6 lg:gap-x-20">
              {logoImages.map((src, i) => (
                <a key={i} href="#" className="inline-flex items-center justify-center bg-center mix-blend-screen w-[150px] h-[40px] bg-cover rounded-lg" style={{ backgroundImage: `url('${src}')` }} aria-label="Logo partenaire" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────── */
function FAQ() {
  return (
    <section className="max-w-5xl mx-auto md:px-10 px-6 pt-16 md:pt-24">
      <div className="text-center">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Questions fréquentes</h2>
        <p className="mt-3 text-white/60">Tout ce que vous devez savoir.</p>
      </div>
      <div className="mt-8 space-y-3">
        {[
          {
            q: "Comment Emind protège-t-il mes données email ?",
            a: "Vos emails sont analysés en temps réel sans être stockés de façon permanente. Le traitement est transient, chiffré de bout en bout, et respecte pleinement le RGPD. Vous pouvez supprimer l'ensemble de vos données à tout moment.",
          },
          {
            q: "Puis-je annuler mon abonnement à tout moment ?",
            a: "Oui, sans engagement. Vous pouvez résilier votre abonnement depuis votre tableau de bord à n'importe quel moment. Votre plan reste actif jusqu'à la fin de la période payée, puis vous repassez automatiquement au plan gratuit.",
          },
          {
            q: "Comment le quota de messages est-il recalculé ?",
            a: "Votre quota mensuel se réinitialise automatiquement chaque mois à la date de votre inscription. Les messages non utilisés ne sont pas cumulés. Si vous atteignez votre limite, vous pouvez upgrader vers un plan supérieur ou attendre le renouvellement.",
          },
        ].map((item, i) => (
          <details key={i} className="border-gradient before:rounded-2xl group rounded-2xl p-4 [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0.05)]">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white/90">
              {item.q}
              <span className="border-gradient before:rounded-md ml-4 grid h-6 w-6 place-items-center rounded-md [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
                <span className="iconify h-4 w-4 transition-transform group-open:rotate-180" data-icon="solar:alt-arrow-down-bold-duotone" />
              </span>
            </summary>
            <p className="mt-3 text-sm text-white/70">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ── Final CTA ────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="max-w-4xl mx-auto md:px-10 px-6 pt-16 md:pt-24 pb-24">
      <div className="border-gradient before:rounded-3xl rounded-3xl p-6 md:p-10 relative overflow-hidden [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0.05)]">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Prêt à simplifier vos emails ?</h2>
        <p className="mt-3 text-white/70">Rejoignez des milliers d'utilisateurs qui gagnent du temps chaque jour avec Emind.</p>
        <form className="mt-6 flex flex-col sm:flex-row gap-3" aria-label="Rejoindre la liste d'attente">
          <label htmlFor="email-cta" className="sr-only">Email</label>
          <input
            id="email-cta"
            type="email"
            required
            placeholder="vous@exemple.com"
            className="border-gradient before:rounded-xl w-full rounded-xl placeholder-white/40 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/30 bg-white/[0.03] text-white [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]"
          />
          <button type="submit" className="border-gradient before:rounded-xl rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 px-5 py-3 text-sm font-medium transition whitespace-nowrap">
            Commencer
          </button>
        </form>
        <p className="mt-3 text-xs text-white/50">Sans spam. Désabonnement en un clic.</p>
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="max-w-6xl mx-auto md:px-10 px-6 pb-12">
      <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/50">© <span id="footer-year">2025</span> Emind — L'IA qui répond à vos emails</p>
        <nav className="flex items-center gap-4 text-xs text-white/60">
          <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
          <a href="#" className="hover:text-white transition-colors">CGU</a>
          <a href="#" className="hover:text-white transition-colors">Changelog</a>
        </nav>
      </div>
    </footer>
  );
}

/* ── NAVBAR ────────────────────────────────────────────────────────── */
function Navbar() {
  return (
    <header className="mx-auto max-w-7xl px-6 md:px-10 pt-10 md:pt-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="bg-center text-sm text-white/60 w-[140px] h-[40px] bg-[url('https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/d257331d-dbc9-4389-9767-ff5d0e2512eb_1600w.png')] bg-cover"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <a className="text-white/60 hover:text-white transition-colors" href="#">Docs</a>
          <a className="text-white/60 hover:text-white transition-colors" href="#">Fonctionnalités</a>
          <a className="text-white/60 hover:text-white transition-colors" href="#">Tarifs</a>
          <button className="border-gradient before:rounded-2xl inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm transition-colors bg-white/[0.04] hover:bg-white/10">
            <span className="iconify text-base" data-icon="solar:star-bold-duotone" />
            <span className="tracking-tight">Essayer</span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ── PAGE ──────────────────────────────────────────────────────────── */
export default function HomePage() {
  useEffect(() => {
    document.getElementById('footer-year')?.replaceWith(String(new Date().getFullYear()));
  }, []);

  return (
    <>
      {/* Background */}
      <div
        className="fixed top-0 w-full h-screen bg-cover bg-center -z-10"
        style={{
          backgroundImage: "url('https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/14f40dea-bfc2-4fea-9f86-798fbef967be_3840w.webp')",
          maskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)'
        }}
      />
      {/* Grid overlay */}
      <div
        className="fixed inset-0 -z-20 opacity-[0.45]"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(1200px 600px at 18% 24%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(1200px 600px at 18% 24%, #000 60%, transparent 100%)'
        }}
      />
      {/* Glow accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(59,130,246,.35), rgba(59,130,246,0) 65%)' }} />
        <div className="absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(16,185,129,.28), rgba(16,185,129,0) 65%)' }} />
      </div>

      <Navbar />

      {/* HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start mt-10 md:mt-16 max-w-7xl mx-auto px-6 md:px-10">
        <div className="lg:col-span-5">
          <div className="border-gradient before:rounded-2xl inline-flex items-center gap-2 rounded-2xl px-2.5 py-1.5 bg-white/[0.04]">
            <div className="h-6 w-6 grid place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <span className="iconify text-sm" data-icon="solar:shield-user-bold-duotone" />
            </div>
            <span className="text-xs text-white/70">IA conversationnelle email</span>
          </div>

          <h1 className="sm:text-6xl md:text-7xl leading-[0.95] text-5xl font-semibold text-white tracking-tight mt-5">
            Vos emails.<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(180deg, #fff, rgba(255,255,255,0.65))' }}>Réponses intelligentes.</span>
          </h1>

          <p className="sm:text-base leading-relaxed text-sm text-white/60 max-w-lg mt-5">
            Posez une question à vos emails. Emind explore vos conversations et vous propose une réponse adaptée en quelques secondes — sans jamais rien mémoriser.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {[
              { icon: "solar:shield-user-bold-duotone", label: "RGPD & confidentiel" },
              { icon: "solar:target-bold-duotone", label: "Réponse en 3s" },
              { icon: "solar:magic-stick-3-bold-duotone", label: "Multi-comptes" },
            ].map((chip, i) => (
              <div key={i} className="border-gradient before:rounded-2xl inline-flex hover:bg-white/[0.07] transition-colors rounded-2xl pt-1.5 pr-3 pb-1.5 pl-3 gap-2 items-center bg-white/[0.04]">
                <span className="iconify text-base" data-icon={chip.icon} />
                <span className="text-xs text-white/70">{chip.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a href="#pricing" className="border-gradient before:rounded-2xl group inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 text-zinc-900 hover:bg-white px-4 sm:px-5 py-3 text-sm font-medium tracking-tight transition-all hover:-translate-y-0.5">
              <span className="iconify text-base" data-icon="solar:play-bold-duotone" />
              <span>Voir les tarifs</span>
            </a>
            <a href="/chat" className="border-gradient before:rounded-2xl group inline-flex items-center justify-center gap-2 rounded-2xl bg-white/[0.03] hover:bg-white/10 px-4 sm:px-5 py-3 text-sm font-medium tracking-tight transition-all hover:-translate-y-0.5 text-white">
              <span className="iconify text-base" data-icon="solar:arrow-right-bold-duotone" />
              <span>Essayer gratuitement</span>
            </a>
          </div>

          <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="mt-6 grid grid-cols-3 gap-4 max-w-md">
            {[
              { label: "Délai moyen", value: "< 3s" },
              { label: "Utilisateurs", value: "2 400+" },
              { label: "Pays couverts", value: "28" },
            ].map((m, i) => (
              <div key={i} className="border-gradient before:rounded-3xl overflow-hidden aspect-[16/12] bg-white/[0.04] rounded-3xl pt-4 pr-4 pb-4 pl-4 relative">
                <div className="text-xs text-white/60">{m.label}</div>
                <div className="mt-1 text-lg font-medium tracking-tight text-white">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <TestimonialsCarousel />
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="md:px-10 md:pt-28 max-w-6xl mr-auto ml-auto pt-20 pr-6 pl-6">
        <div className="flex justify-center">
          <div className="border-gradient before:rounded-full inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/[0.04]">
            <span className="iconify text-sky-300" data-icon="solar:atom-bold-duotone" />
            <span className="text-sm text-sky-200/90">Fonctionnalités</span>
          </div>
        </div>
        <h1 className="mt-6 text-center text-4xl md:text-6xl font-semibold tracking-tight text-white">
          Ce qu'Emind fait<br />
          pour vous
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-center text-base md:text-lg text-white/70 font-normal">
          Des outils pensés pour vous faire gagner du temps sur vos emails, sans compromis sur la confidentialité.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-8 mt-12 gap-6">
          <KpiCard />
          <ClientListCard />
          <CollaborateCard />
          <AutomateCard />
        </div>
      </section>

      <LogoMarquee />

      {/* PRICING */}
      <section className="max-w-6xl mx-auto md:px-10 px-6 pt-16 md:pt-24">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Tarification simple et transparente</h2>
          <p className="mt-3 text-white/60">Commencez gratuitement. Passez à un plan quand vous êtes prêt.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Start */}
          <div className="border-gradient before:rounded-3xl rounded-3xl p-6 bg-white/[0.04] [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0.05)]">
            <h3 className="text-lg font-medium text-white">Start</h3>
            <p className="mt-1 text-sm text-white/60">Pour découvrir Emind sans engagement.</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-semibold text-white">9 €</span>
              <span className="text-white/60">/mois</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                10 messages/mois
              </span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-white/70">
              {["Accès au chat Emind", "Historique 30 jours", "Support par email"].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="iconify h-4 w-4 text-emerald-400" data-icon="solar:check-circle-bold-duotone" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              data-plan="start"
              className="stripe-checkout-btn border-gradient before:rounded-xl mt-6 w-full rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="btn-text">Choisir ce plan</span>
              <span className="btn-loader hidden">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            </button>
            <p className="btn-error hidden mt-2 text-xs text-red-400 text-center" />
          </div>

          {/* Scale */}
          <div className="border-gradient before:rounded-3xl relative rounded-3xl p-6 bg-white/[0.04] [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0.05)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 border-gradient before:rounded-full inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-amber-200 bg-white/[0.04]">
              <span className="iconify text-amber-300" data-icon="solar:star-bold-duotone" />
              Populaire
            </div>
            <h3 className="text-lg font-medium text-white">Scale</h3>
            <p className="mt-1 text-sm text-white/60">Pour les professionnels qui gèrent plusieurs boîtes.</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-semibold text-white">29 €</span>
              <span className="text-white/60">/mois</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                50 messages/mois
              </span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-white/70">
              {["Tout le plan Start", "Plusieurs boîtes email", "Historique 6 mois", "Support prioritaire"].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="iconify h-4 w-4 text-emerald-400" data-icon="solar:check-circle-bold-duotone" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              data-plan="scale"
              className="stripe-checkout-btn border-gradient before:rounded-xl mt-6 w-full rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="btn-text">Choisir ce plan</span>
              <span className="btn-loader hidden">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            </button>
            <p className="btn-error hidden mt-2 text-xs text-red-400 text-center" />
          </div>

          {/* Team */}
          <div className="border-gradient before:rounded-3xl rounded-3xl p-6 bg-white/[0.04] [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0.05)]">
            <h3 className="text-lg font-medium text-white">Team</h3>
            <p className="mt-1 text-sm text-white/60">Pour les équipes qui maximisent leur productivité email.</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-semibold text-white">59 €</span>
              <span className="text-white/60">/mois</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100 messages/mois
              </span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-white/70">
              {["Tout le plan Scale", "Tous les paysages email", "Historique illimité", "Support dédié"].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="iconify h-4 w-4 text-emerald-400" data-icon="solar:check-circle-bold-duotone" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              data-plan="team"
              className="stripe-checkout-btn border-gradient before:rounded-xl mt-6 w-full rounded-xl hover:bg-white/15 px-4 py-2.5 text-sm font-medium transition bg-white/[0.03] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="btn-text">Choisir ce plan</span>
              <span className="btn-loader hidden">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            </button>
            <p className="btn-error hidden mt-2 text-xs text-red-400 text-center" />
          </div>
        </div>
      </section>

      <FAQ />
      <FinalCTA />
      <Footer />

      {/* Stripe checkout script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              document.querySelectorAll('.stripe-checkout-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                  var planId = btn.getAttribute('data-plan');
                  var btnText = btn.querySelector('.btn-text');
                  var btnLoader = btn.querySelector('.btn-loader');
                  var btnError = btn.closest('.border-gradient').querySelector('.btn-error');

                  btnText.classList.add('hidden');
                  btnLoader.classList.remove('hidden');
                  btn.disabled = true;
                  if (btnError) btnError.classList.add('hidden');

                  fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId: planId })
                  })
                  .then(function(res) { return res.json(); })
                  .then(function(data) {
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      throw new Error(data.error || 'Erreur inconnue');
                    }
                  })
                  .catch(function(err) {
                    btnText.classList.remove('hidden');
                    btnLoader.classList.add('hidden');
                    btn.disabled = false;
                    if (btnError) {
                      btnError.textContent = err.message || 'Une erreur est survenue';
                      btnError.classList.remove('hidden');
                    }
                  });
                });
              });
            });
          `
        }}
      />
    </>
  );
}
