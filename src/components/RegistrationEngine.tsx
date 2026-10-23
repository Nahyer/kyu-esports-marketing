import React, { useState, useEffect, useRef } from 'react';

export const ALL_GAMES = [
  'eFootball Mobile',
  'Call of Duty: Mobile',
  'PUBG Mobile',
  'Bloodstrike',
  'Dream League Soccer (DLS)',
  'EA Sports FC (EAFC)',
  'Free Fire Max',
  'Delta Force',
  'Mini Militia Classic',
  'Chess Online',
  "Rubik's Cube",
  'Fortnite',
  'Sudoku',
  'General Gaming',
] as const;

export type GameSelection = (typeof ALL_GAMES)[number];

export const GAME_METADATA: Record<
  GameSelection,
  { icon: string; tag: string; tagColor: string; description: string; image?: string }
> = {
  'eFootball Mobile': {
    icon: '⚽',
    image: '/images/games/efootball-logo.png',
    tag: 'Mobile Football',
    tagColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    description: 'Connect with KyU eFootball athletes, campus league fixtures, and weekend co-op rooms.',
  },
  'Call of Duty: Mobile': {
    icon: '🎯',
    image: '/images/games/codm-logo.png',
    tag: 'Shooter / BR',
    tagColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    description: 'Jump into weekly clan wars, 5v5 scrims, Battle Royale squads, and CDP prize lobbies.',
  },
  'PUBG Mobile': {
    icon: '🪂',
    image: '/images/games/pubgm-logo.png',
    tag: 'Battle Royale',
    tagColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    description: 'Coordinate squad drops, custom room scrims, and campus chicken dinner tournaments.',
  },
  'Bloodstrike': {
    icon: '🩸',
    tag: 'Fast-Paced FPS',
    tagColor: 'bg-red-500/10 text-red-600 border-red-500/20',
    description: 'Fast-action tactical squad comms, loadout discussions, and lightning bracket matches.',
  },
  'Dream League Soccer (DLS)': {
    icon: '⚽',
    tag: 'Mobile Football',
    tagColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    description: 'Match up with top KyU DLS managers, friendly head-to-heads, and campus cup qualifiers.',
  },
  'EA Sports FC (EAFC)': {
    icon: '🎮',
    image: '/images/games/fc-mobile-badge.webp',
    tag: 'Console / PC',
    tagColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    description: 'On-campus LAN bracket seedings, console friendlies, and competitive 1v1 showdowns.',
  },
  'Free Fire Max': {
    icon: '🔥',
    image: '/images/games/freefire-badge.png',
    tag: 'Battle Royale',
    tagColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    description: 'Clash Squad tactics, weekly survival tournaments, and division prize pool updates.',
  },
  'Delta Force': {
    icon: '🎖️',
    tag: 'Tactical Shooter',
    tagColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    description: 'Tactical operator squads, extraction missions, and coordinated warfare operations.',
  },
  'Mini Militia Classic': {
    icon: '🪖',
    tag: 'Party Combat',
    tagColor: 'bg-lime-500/10 text-lime-600 border-lime-500/20',
    description: 'Classic doodle combat rooms, campus rivalry skirmishes, and quick break matches.',
  },
  'Chess Online': {
    icon: '♟️',
    image: '/images/games/chess-badge.png',
    tag: 'Strategy',
    tagColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    description: 'Blitz & rapid campus brackets, opening strategy discussions, and inter-faculty matches.',
  },
  "Rubik's Cube": {
    icon: '🧩',
    tag: 'Speedcubing',
    tagColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    description: 'Speedcubing time trials, algorithm sharing, and live KyU campus solve showdowns.',
  },
  'Fortnite': {
    icon: '⛏️',
    tag: 'Battle Royale',
    tagColor: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    description: 'Battle Royale trios, build/zero-build squads, and seasonal event watch lobbies.',
  },
  'Sudoku': {
    icon: '🔢',
    tag: 'Mind Sports',
    tagColor: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
    description: 'Timed number puzzles, puzzle race leaderboards, and mind sports challenges.',
  },
  'General Gaming': {
    icon: '🕹️',
    tag: 'KyU Gamers Hub',
    tagColor: 'bg-amber-500/10 text-[#fbaf17] border-amber-500/30',
    description: 'The master community lounge for campus game nights, general updates, and casual banter.',
  },
};

interface FormDataState {
  fullName: string;
  regNumber: string;
  whatsappNumber: string;
  primaryTitle: GameSelection;
  carry1stEmail: string;
  agreedToMandate: boolean;
}

interface RegistrationApiResponse {
  status: string;
  message: string;
  whatsapp_group_link: string;
  already_registered: boolean;
  full_name: string;
  reg_number: string;
  primary_game: string;
  wa_status_link?: string;
}

// Configurable backend URL with live production fallback
const BACKEND_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_URL) ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://kyu-esports-api-d0a8e4fnd5gcg7gt.northeurope-01.azurewebsites.net');

// Cloudflare Turnstile Public Site Key (Defaults to Cloudflare's official testing key if not set)
// Cloudflare Always-Passes Testing Key: '1x00000000000000000000AA'
const TURNSTILE_SITE_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_TURNSTILE_SITE_KEY) ||
  '1x00000000000000000000AA';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'flexible' | 'compact';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const CARRY1ST_AFFILIATE_URL = 'https://shop.carry1st.com/?aff=reyhan';

// Verified KyU Esports WhatsApp Division Links from backend config
const WHATSAPP_CHANNELS: Record<
  string,
  { label: string; buttonText: string; href: string }
> = {
  'eFootball Mobile': {
    label: 'eFootball Mobile',
    buttonText: 'Join KyU eFootball Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/EnNqmQaXqUW7498dwHO1Wa',
  },
  'Call of Duty: Mobile': {
    label: 'Call of Duty: Mobile (CODM)',
    buttonText: 'Join KyU CODM Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/DeN8Z2iiwmQ19ieXuBF5SZ',
  },
  'PUBG Mobile': {
    label: 'PUBG Mobile (PUBG-M)',
    buttonText: 'Join KyU PUBG-M Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/DdvAePm3N9CFl2VcfZrFpu',
  },
  'Bloodstrike': {
    label: 'Bloodstrike',
    buttonText: 'Join KyU Bloodstrike Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/FxyoVTwckuFAkWTUSs1HOp?s=cl&p=a&mlu=4&ilr=4',
  },
  'Dream League Soccer (DLS)': {
    label: 'Dream League Soccer (DLS)',
    buttonText: 'Join KyU DLS Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/BF7mMvOtVWN5OuhVE1Rmxg',
  },
  'EA Sports FC (EAFC)': {
    label: 'EA Sports FC (EAFC / FIFA)',
    buttonText: 'Join KyU EA Sports FC Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/LIkSA4APUpa98El4DrijV7',
  },
  'Free Fire Max': {
    label: 'Garena Free Fire Max',
    buttonText: 'Join KyU Free Fire Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/L0ti7N1vaJKEhNQvq3GEPW?s=cl&p=a&mlu=4&ilr=4',
  },
  'Delta Force': {
    label: 'Delta Force',
    buttonText: 'Join KyU Delta Force Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/H7uC2DpBWJSK0fXRI2qOZ4?s=cl&p=a&mlu=4&ilr=4',
  },
  'Mini Militia Classic': {
    label: 'Mini Militia Classic',
    buttonText: 'Join KyU Mini Militia Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/GxsuQddM2vxHhifTR0zuaB',
  },
  'Chess Online': {
    label: 'Chess Online',
    buttonText: 'Join KyU Chess Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/EWhggxNmgj90jStB7QMNTl?mode=wwt',
  },
  "Rubik's Cube": {
    label: "Rubik's Cube",
    buttonText: "Join KyU Rubik's Cube Division (WhatsApp)",
    href: 'https://chat.whatsapp.com/GLUaYxZSOAY5M8K0kWg3yI?s=cl&p=a&mlu=4&ilr=4',
  },
  'Fortnite': {
    label: 'Fortnite',
    buttonText: 'Join KyU Fortnite Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/KcWRCe91CCs4MhD5G92IvH',
  },
  'Sudoku': {
    label: 'Sudoku',
    buttonText: 'Join KyU Sudoku Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/DciY32bphnI72oM9yVNsrH?mode=gi_t',
  },
  'General Gaming': {
    label: 'General Gaming (KyU Gamers)',
    buttonText: 'Join KyU General Gaming Division (WhatsApp)',
    href: 'https://chat.whatsapp.com/KWK9rvEpjJi8rAfRPTkvkF',
  },
};

export default function RegistrationEngine() {
  const [step1Clicked, setStep1Clicked] = useState(false);
  const [activePopupOpen, setActivePopupOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<RegistrationApiResponse | null>(null);

  const popupRef = useRef<Window | null>(null);
  const popupTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameDropdownRef = useRef<HTMLDivElement | null>(null);
  const [gameDropdownOpen, setGameDropdownOpen] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const step1CardRef = useRef<HTMLDivElement | null>(null);
  const [pulseButton, setPulseButton] = useState(false);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    fullName: '',
    regNumber: '',
    whatsappNumber: '',
    primaryTitle: 'eFootball Mobile',
    carry1stEmail: '',
    agreedToMandate: true,
  });

  // Render Cloudflare Turnstile widget explicitly
  useEffect(() => {
    let checkInterval: ReturnType<typeof setInterval> | null = null;
    let attempts = 0;

    const tryRenderTurnstile = () => {
      if (
        typeof window !== 'undefined' &&
        window.turnstile &&
        turnstileContainerRef.current &&
        !turnstileWidgetIdRef.current
      ) {
        try {
          const widgetId = window.turnstile.render(turnstileContainerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            theme: 'light',
            callback: (token: string) => {
              setTurnstileToken(token);
              if (errorMessage) setErrorMessage(null);
            },
            'error-callback': () => {
              // On widget error, allow graceful degradation
              setTurnstileToken('client_error');
            },
            'expired-callback': () => {
              setTurnstileToken(null);
            },
          });
          turnstileWidgetIdRef.current = widgetId;
          if (checkInterval) clearInterval(checkInterval);
        } catch (e) {
          console.warn('Turnstile render warning:', e);
        }
      }
    };

    tryRenderTurnstile();

    if (!turnstileWidgetIdRef.current) {
      checkInterval = setInterval(() => {
        attempts += 1;
        tryRenderTurnstile();
        if (attempts > 20 && checkInterval) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (
        typeof window !== 'undefined' &&
        window.turnstile &&
        turnstileWidgetIdRef.current
      ) {
        try {
          window.turnstile.remove(turnstileWidgetIdRef.current);
        } catch (e) {}
        turnstileWidgetIdRef.current = null;
      }
    };
  }, []);

  // Close custom game dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        gameDropdownRef.current &&
        !gameDropdownRef.current.contains(event.target as Node)
      ) {
        setGameDropdownOpen(false);
      }
    };
    if (gameDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [gameDropdownOpen]);

  useEffect(() => {
    // Read game or prefill search term from URL query param if present
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryParam = urlParams.get('query');
      if (queryParam) {
        const val = decodeURIComponent(queryParam).trim();
        if (val.includes('@')) {
          setFormData((prev) => ({ ...prev, carry1stEmail: val }));
        } else if (val.startsWith('0') || val.startsWith('+254')) {
          setFormData((prev) => ({ ...prev, whatsappNumber: val }));
        } else if (val.length > 2) {
          setFormData((prev) => ({ ...prev, regNumber: val.toUpperCase() }));
        }
      }

      const gameParam = urlParams.get('game');
      if (gameParam) {
        const decoded = decodeURIComponent(gameParam).toLowerCase();
        let matched: GameSelection | undefined;
        for (const g of ALL_GAMES) {
          const gLower = g.toLowerCase();
          if (
            gLower === decoded ||
            gLower.includes(decoded) ||
            decoded.includes(gLower)
          ) {
            matched = g;
            break;
          }
        }
        // Specific shorthand aliases
        if (!matched) {
          if (decoded.includes('codm') || decoded.includes('call of duty')) matched = 'Call of Duty: Mobile';
          else if (decoded.includes('pubg')) matched = 'PUBG Mobile';
          else if (decoded.includes('blood')) matched = 'Bloodstrike';
          else if (decoded.includes('dls')) matched = 'Dream League Soccer (DLS)';
          else if (decoded.includes('fifa') || decoded.includes('fc') || decoded.includes('eafc')) matched = 'EA Sports FC (EAFC)';
          else if (decoded.includes('free fire') || decoded.includes('freefire')) matched = 'Free Fire Max';
          else if (decoded.includes('delta')) matched = 'Delta Force';
          else if (decoded.includes('militia')) matched = 'Mini Militia Classic';
          else if (decoded.includes('chess')) matched = 'Chess Online';
          else if (decoded.includes('rubik') || decoded.includes('rubix') || decoded.includes('cube')) matched = "Rubik's Cube";
          else if (decoded.includes('fortnite')) matched = 'Fortnite';
          else if (decoded.includes('sudoku')) matched = 'Sudoku';
        }
        if (matched) {
          setFormData((prev) => ({
            ...prev,
            primaryTitle: matched!,
          }));
        }
      }
    }

    const handleSelectGame = (e: Event) => {
      const customEvent = e as CustomEvent<{ game?: string }>;
      if (customEvent.detail?.game) {
        const target = customEvent.detail.game.toLowerCase();
        const matched = ALL_GAMES.find(
          (g) => g.toLowerCase() === target || g.toLowerCase().includes(target) || target.includes(g.toLowerCase())
        );
        if (matched) {
          setFormData((prev) => ({
            ...prev,
            primaryTitle: matched,
          }));
          setSubmitted(false);
        }
      }
    };
    window.addEventListener('kyu:select-game', handleSelectGame);
    return () => window.removeEventListener('kyu:select-game', handleSelectGame);
  }, []);

  // Companion popup "tiny tab" launcher for desktop
  const handleOpenCarry1st = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setStep1Clicked(true);
    const isMobile =
      typeof window !== 'undefined' &&
      (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 640);

    if (!isMobile && typeof window !== 'undefined') {
      e.preventDefault();
      const width = 520;
      const height = 720;
      const left = Math.max(0, (window.screen.width - width) / 2);
      const top = Math.max(0, (window.screen.height - height) / 2);
      const features = `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,location=yes,status=no,resizable=yes,scrollbars=yes`;

      setActivePopupOpen(true);
      const popup = window.open(CARRY1ST_AFFILIATE_URL, 'Carry1stAuth', features);

      if (popup) {
        popupRef.current = popup;
        try {
          popup.focus();
        } catch (err) {}

        if (popupTimerRef.current) clearInterval(popupTimerRef.current);
        popupTimerRef.current = setInterval(() => {
          try {
            if (!popupRef.current || popupRef.current.closed) {
              if (popupTimerRef.current) clearInterval(popupTimerRef.current);
              setActivePopupOpen(false);
              popupRef.current = null;
              const input = document.getElementById('carry1stEmail');
              if (input) input.focus();
            }
          } catch (err) {
            // Ignore cross-origin access exceptions
          }
        }, 600);
      }
    }
  };

  const handleManualDone = () => {
    if (popupRef.current && !popupRef.current.closed) {
      try {
        popupRef.current.close();
      } catch (e) {}
    }
    setActivePopupOpen(false);
    popupRef.current = null;
    const input = document.getElementById('carry1stEmail');
    if (input) input.focus();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !formData.fullName.trim() ||
      !formData.regNumber.trim() ||
      !formData.whatsappNumber.trim() ||
      !formData.carry1stEmail.trim()
    ) {
      setErrorMessage('Please complete all required varsity verification fields.');
      return;
    }
    if (!step1Clicked) {
      setErrorMessage('Please open and create your free Carry1st account in Step 1 first so your rewards wallet is connected.');
      setPulseButton(true);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = setTimeout(() => {
        setPulseButton(false);
      }, 4000);

      if (step1CardRef.current) {
        // Calculate offset so sticky navbar doesn't cover top of Step 1 on mobile & desktop
        const rect = step1CardRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 100;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
      return;
    }
    if (!formData.agreedToMandate) {
      setErrorMessage(
        'Please confirm the Tribe Campus database & Directorate of Sports agreement checkbox.'
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        full_name: formData.fullName.trim(),
        reg_number: formData.regNumber.trim(),
        phone_number: formData.whatsappNumber.trim(),
        primary_game: formData.primaryTitle,
        carry1st_email: formData.carry1stEmail.trim(),
        tribe_db_confirmed: formData.agreedToMandate,
        turnstile_token: turnstileToken,
      };

      const baseUrl = (BACKEND_API_URL || '').replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        let msg = data.detail || 'Registration failed. Please check your details.';
        if (Array.isArray(data.detail)) {
          msg = data.detail.map((d: { msg?: string }) => d.msg || d).join(', ');
        }
        throw new Error(msg);
      }

      setApiResponse(data);
      setSubmitted(true);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection error. Please try again.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const assignedChannelKey =
    formData.primaryTitle in WHATSAPP_CHANNELS
      ? formData.primaryTitle
      : 'General Gaming';

  const fallbackChannel =
    WHATSAPP_CHANNELS[assignedChannelKey] || WHATSAPP_CHANNELS['General Gaming'];
  const activeChannelLink = apiResponse?.whatsapp_group_link || fallbackChannel.href;
  const statusWaLink =
    apiResponse?.wa_status_link || 'https://wa.me/254710908080?text=%21status';

  return (
    <div className="registration-shell-white max-w-4xl mx-auto">
      {/* Main Content Area */}
      <div className="w-full">
        <div className="flex flex-col justify-center">
          {!submitted ? (
            <div className="space-y-6">
              {/* Rewards Wallet Connection Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-[#161b25] tracking-tight">
                  Rewards Wallet Connection
                </h3>
                {step1Clicked && (
                  <span className="text-[11px] sm:text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full font-bold">
                    {activePopupOpen ? 'COMPANION OPEN' : 'OPENED ✓'}
                  </span>
                )}
              </div>

              {/* STEP 1: FREE CARRY1ST ACCOUNT CARD */}
              <div
                ref={step1CardRef}
                className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#07a3e1] via-[#0957b8] to-[#06244f] text-white p-5 sm:p-6 shadow-xl border-2 border-white/20"
              >
                {/* Subtle Geometric Circle Watermark */}
                <div className="pointer-events-none absolute -right-8 -bottom-8 w-36 h-36 rounded-full border-[18px] border-white/10" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="max-w-md">
                    <h4 className="text-base sm:text-lg font-bold text-white mb-1">
                      Connect Rewards Wallet
                    </h4>
                    <p className="text-xs sm:text-sm text-white/85 leading-snug">
                      Prizes and CDP points are deposited directly into your Carry1st account.
                    </p>
                  </div>

                  <div className="shrink-0">
                    <a
                      href={CARRY1ST_AFFILIATE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setPulseButton(false);
                        handleOpenCarry1st();
                      }}
                      className={`primary-button-gold w-full sm:w-auto justify-center !py-3 !px-6 !text-sm font-bold shadow-lg inline-flex items-center gap-2 transition-all active:scale-[0.97] ${
                        pulseButton ? 'ring-4 ring-[#fbaf17]/60 shadow-[0_0_25px_rgba(251,175,23,0.7)] animate-pulse' : ''
                      }`}
                    >
                      <span>Launch Carry1st ↗</span>
                    </a>
                  </div>
                </div>

                {/* Active Companion Popup Banner */}
                {activePopupOpen && (
                  <div className="mt-3.5 p-3 rounded-xl bg-black/40 border border-emerald-400/50 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-pulse">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                      <span className="truncate text-xs font-medium">Carry1st window active...</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleManualDone}
                      className="shrink-0 px-3 py-1.5 bg-[#fbaf17] hover:bg-white text-black font-bold rounded-full text-xs transition active:scale-[0.97] cursor-pointer"
                    >
                      I'm Done &rarr;
                    </button>
                  </div>
                )}
              </div>

              {/* STEP 2: FORM */}
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="border-b border-slate-200 pb-3">
                  <h4 className="text-lg sm:text-xl font-bold text-[#161b25] tracking-tight">
                    Student Verification Details
                  </h4>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm font-medium">
                    {errorMessage}
                  </div>
                )}

              {/* Row 1: Full Name & Reg Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-[13px] font-semibold text-[#161b25] mb-1.5"
                  >
                    Full Name (as on Student ID) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    autoCapitalize="words"
                    placeholder="e.g., Brian Mwangi"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="contact-field-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="regNumber"
                    className="block text-[13px] font-semibold text-[#161b25] mb-1.5"
                  >
                    Student Registration Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="regNumber"
                    name="regNumber"
                    type="text"
                    required
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="e.g., CT101/G/XXXXX/XX"
                    value={formData.regNumber}
                    onChange={handleInputChange}
                    className="contact-field-input font-mono uppercase"
                  />
                </div>
              </div>

              {/* Row 2: WhatsApp Number & Carry1st Account Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="whatsappNumber"
                    className="block text-[13px] font-semibold text-[#161b25] mb-1.5"
                  >
                    WhatsApp Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    placeholder="e.g., 0712345678 or +254..."
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    className="contact-field-input"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    For squad link &amp; match notifications
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="carry1stEmail"
                    className="block text-[13px] font-semibold text-[#161b25] mb-1.5"
                  >
                    Carry1st Account Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="carry1stEmail"
                    name="carry1stEmail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    required
                    placeholder="Email used in Step 1 (e.g., name@gmail.com)"
                    value={formData.carry1stEmail}
                    onChange={handleInputChange}
                    className="contact-field-input"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Used to deposit prize payouts &amp; CDP points
                  </span>
                </div>
              </div>

              {/* Row 3: Primary Esports Title (Custom Mobile-Optimized Game Selector) */}
              <div className="relative" ref={gameDropdownRef}>
                <label
                  htmlFor="primaryTitle"
                  className="block text-[13px] font-semibold text-[#161b25] mb-1.5"
                >
                  Primary Esports Title <span className="text-red-600">*</span>
                </label>

                {/* Hidden native input for seamless form submission & accessibility */}
                <input
                  type="hidden"
                  name="primaryTitle"
                  id="primaryTitle"
                  value={formData.primaryTitle}
                />

                {/* Custom Trigger Button */}
                <button
                  type="button"
                  onClick={() => setGameDropdownOpen((prev) => !prev)}
                  className={`w-full min-h-[52px] px-3.5 py-2.5 rounded-xl border-2 transition-all flex items-center justify-between text-left cursor-pointer ${
                    gameDropdownOpen
                      ? 'bg-white border-[#00a1e1] shadow-[0_0_0_3px_rgba(0,161,225,0.18)]'
                      : 'bg-[#eceef0] hover:bg-[#e4e7ea] border-transparent hover:border-slate-300'
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={gameDropdownOpen}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="w-9 h-9 rounded-lg bg-white shadow-xs border border-slate-200/80 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {GAME_METADATA[formData.primaryTitle]?.image ? (
                        <img
                          src={GAME_METADATA[formData.primaryTitle]?.image}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-lg">{GAME_METADATA[formData.primaryTitle]?.icon || '🎮'}</span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[14px] sm:text-[15px] font-bold text-[#161b25] truncate">
                        {formData.primaryTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        {GAME_METADATA[formData.primaryTitle]?.tag || 'Division Squad'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`hidden xs:inline-flex text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${GAME_METADATA[formData.primaryTitle]?.tagColor}`}>
                      Selected
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        gameDropdownOpen ? 'rotate-180 text-[#00a1e1]' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Custom Game Picker Dropdown Panel */}
                {gameDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-white border-2 border-slate-200 shadow-2xl p-2.5 max-h-[340px] sm:max-h-[380px] overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                      <span>Tap your game to select</span>
                      <span className="text-[10px] text-[#00a1e1] font-bold">{ALL_GAMES.length} Titles</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {ALL_GAMES.map((game) => {
                        const isSelected = formData.primaryTitle === game;
                        const meta = GAME_METADATA[game];
                        return (
                          <button
                            type="button"
                            key={game}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, primaryTitle: game }));
                              setGameDropdownOpen(false);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer select-none active:scale-[0.98] ${
                              isSelected
                                ? 'bg-amber-50/70 border-[#fbaf17] shadow-xs'
                                : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/70'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                                {meta?.image ? (
                                  <img
                                    src={meta.image}
                                    alt=""
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <span className="text-base">{meta?.icon || '🎮'}</span>
                                )}
                              </span>
                              <div className="min-w-0">
                                <div className={`text-[13px] font-bold truncate ${
                                  isSelected ? 'text-black' : 'text-[#161b25]'
                                }`}>
                                  {game}
                                </div>
                                <div className="text-[10.5px] text-slate-500 truncate">
                                  {meta?.tag}
                                </div>
                              </div>
                            </div>

                            {isSelected ? (
                              <span className="w-5 h-5 rounded-full bg-[#fbaf17] text-black flex items-center justify-center text-xs font-bold shrink-0">
                                ✓
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300 shrink-0">
                                ›
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  Instantly routes you to your title's official WhatsApp division
                </span>
              </div>

              {/* Mandatory Agreement Checkbox */}
              <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-100 border border-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="agreedToMandate"
                  checked={formData.agreedToMandate}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 rounded border-slate-400 text-[#00a1e1] focus:ring-[#00a1e1]"
                />
                <span className="text-xs sm:text-[13px] leading-relaxed text-[#161b25] font-medium">
                  I agree to follow the KyU Esports Club and Tribe Campus community rules, and to receive match notifications on WhatsApp.
                </span>
              </label>

              {/* Cloudflare Turnstile Verification Widget (Smart bot check) */}
              <div className="py-1">
                <div ref={turnstileContainerRef} className="cf-turnstile min-h-[65px]"></div>
              </div>

              {/* Submission Action */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-start gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="primary-button-gold w-full sm:w-auto justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Checking Roster...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Status Lookup Link for Students */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    const query = formData.regNumber || formData.carry1stEmail || formData.whatsappNumber;
                    window.dispatchEvent(
                      new CustomEvent('open-status-drawer', {
                        detail: query ? { query } : undefined,
                      })
                    );
                  }}
                  className="font-semibold text-[#00a1e1] hover:text-[#0a6bd1] hover:underline inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 text-[#fbaf17]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Already signed up? Check your live roster &amp; wallet status &rarr;</span>
                </button>
              </div>
            </form>
          </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Clean Success Header (No glowing pills, separate lines for credentials) */}
              <div className="text-left space-y-3">
                <h4 className="font-display-impact text-3xl sm:text-4xl lg:text-5xl text-[#161b25] tracking-tight">
                  {apiResponse?.already_registered ? 'WELCOME BACK, GAMER!' : 'WELCOME TO THE CLUB!'}
                </h4>

                <div className="space-y-1 text-sm sm:text-[15px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium w-24">Student:</span>
                    <strong className="text-[#161b25]">{apiResponse?.full_name || formData.fullName}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium w-24">Reg Number:</span>
                    <span className="font-mono font-bold text-[#161b25]">{apiResponse?.reg_number || formData.regNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium w-24">Game Title:</span>
                    <strong className="text-emerald-700">{apiResponse?.primary_game || formData.primaryTitle}</strong>
                  </div>
                </div>
              </div>

              {/* Main Action Card: Authentic WhatsApp Green Aesthetic */}
              <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#075e54] via-[#128c7e] to-[#054c44] text-white p-6 sm:p-8 shadow-xl border-2 border-emerald-400/40">
                {/* Subtle Geometric Circle Watermark */}
                <div className="pointer-events-none absolute -right-6 -bottom-6 w-36 h-36 rounded-full border-[16px] border-white/10" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[#fbaf17]">
                    <span>Step 3 of 3</span>
                    <span className="text-white/40">•</span>
                    <span>Official Clan Invite</span>
                  </div>

                  <div>
                    <h5 className="text-xl sm:text-2xl font-bold text-white mb-1.5 flex items-center gap-2">
                      <span>Join {apiResponse?.primary_game || formData.primaryTitle}</span>
                    </h5>
                    {/* Game-Specific Dynamic Description */}
                    <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-normal">
                      {GAME_METADATA[(apiResponse?.primary_game as GameSelection) || formData.primaryTitle]?.description ||
                        'Connect directly with fellow KyU athletes, scrim lobbies, and match coordinators.'}
                    </p>
                  </div>

                  <a
                    href={activeChannelLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full justify-center !py-3.5 !px-6 !text-sm sm:!text-base font-extrabold shadow-lg inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white border-2 border-white/30 transition-all cursor-pointer"
                  >
                    <span>Join WhatsApp Group</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500">
                  Co-moderated by KyU Sports &amp; Carry1st
                </span>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="font-semibold text-[#00a1e1] hover:underline cursor-pointer"
                >
                  ← Edit Roster Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
