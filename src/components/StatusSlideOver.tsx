import React, { useState, useRef, useEffect } from 'react';

export interface StatusResponse {
  found: boolean;
  registered_at_kyu: boolean;
  in_carry1st_archive: boolean;
  carry1st_shop_status: 'active' | 'missing_account' | 'not_found';
  typeform_sync_status: 'SUCCESS' | 'SYNCING' | 'PENDING' | 'NOT_REGISTERED';
  action_required: 'none' | 'register_kyu' | 'create_shop_account' | 'register_both';
  message: string;
  shop_activation_url: string;
  full_name_masked?: string | null;
  reg_number_masked?: string | null;
  email_masked?: string | null;
  phone_masked?: string | null;
  squad?: {
    game_title: string;
    whatsapp_group_link: string;
  } | null;
}

const BACKEND_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_URL) ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://kyu-esports-api-d0a8e4fnd5gcg7gt.northeurope-01.azurewebsites.net');

export default function StatusSlideOver() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusResponse | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Listen to custom window events so any button anywhere can trigger the drawer
  useEffect(() => {
    const handleOpen = (e: CustomEvent<{ query?: string } | undefined>) => {
      setIsOpen(true);
      setError(null);
      if (e.detail?.query) {
        setSearchTerm(e.detail.query);
        handleLookup(e.detail.query);
      }
    };

    const handleClose = () => {
      setIsOpen(false);
    };

    window.addEventListener('open-status-drawer' as any, handleOpen as any);
    window.addEventListener('close-status-drawer' as any, handleClose as any);

    // Support ?check_status= or ?status= in URL query params on initial load
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryParam = params.get('check_status') || params.get('status') || params.get('query');
      if (params.has('check_status') || (params.has('status') && window.location.pathname !== '/status')) {
        setIsOpen(true);
        if (queryParam) {
          setSearchTerm(queryParam);
          handleLookup(queryParam);
        }
      }
    }

    return () => {
      window.removeEventListener('open-status-drawer' as any, handleOpen as any);
      window.removeEventListener('close-status-drawer' as any, handleClose as any);
    };
  }, []);

  // Autofocus input when opened and lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Escape key closes slide-over
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleLookup = async (queryToSearch?: string) => {
    const query = (queryToSearch ?? searchTerm).trim();
    if (!query || query.length < 2) {
      setError('Enter your Reg Number, Carry1st email, or WhatsApp number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = (BACKEND_API_URL || '').replace(/\/+$/, '');
      const res = await fetch(
        `${baseUrl}/api/status?query=${encodeURIComponent(query)}`
      );

      if (res.status === 429) {
        throw new Error('Rate limit reached. Please wait a moment before trying again.');
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Status check failed. Please check your query.');
      }

      const data: StatusResponse = await res.json();
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed. Please retry.';
      setError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup();
  };

  const handleRegisterRedirect = (query: string) => {
    setIsOpen(false);
    const targetUrl = `/register?query=${encodeURIComponent(query)}`;
    window.location.href = targetUrl;
  };

  return (
    <div
      aria-live="polite"
      className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
    >
      {/* Backdrop with Emil-standard cubic-bezier fade */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-drawer-title"
        className={`fixed inset-y-0 right-0 w-full sm:w-[460px] max-w-full bg-[#121110] text-white border-l border-[#242933] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col z-10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Subtle Ambient Radial Highlight */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-60 h-60 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(251, 175, 23, 0.5), transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#202835] flex items-center justify-between shrink-0 relative z-10 bg-[#151413]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1c222d] border border-[#2c3545] flex items-center justify-center text-[#fbaf17] shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 id="status-drawer-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                Roster &amp; Wallet Status
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close status panel"
            className="w-8 h-8 rounded-lg bg-[#1a1918] hover:bg-[#262422] text-white/60 hover:text-white flex items-center justify-center border border-[#2b2926] transition-transform duration-150 active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Plain, Honest Context Description (No fluff) */}
          <p className="text-xs sm:text-[13px] text-white/70 leading-relaxed">
            Verify your confirmed university squad seed and check whether your Carry1st rewards wallet is linked for prize drops.
          </p>

          {/* Search Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Reg No (CT101/...), email, or phone"
                className="w-full h-11 pl-3.5 pr-20 rounded-xl bg-[#181f2a] border border-[#283344] text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:border-[#fbaf17] focus:ring-1 focus:ring-[#fbaf17] transition-colors font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1 top-1 bottom-1 px-3.5 rounded-lg bg-[#fbaf17] hover:bg-[#fcc043] text-black font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 transition-transform duration-150 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <svg className="w-3.5 h-3.5 animate-spin text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <>
                    <span>Verify</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/45 px-1">
              <span>Accepts: <code className="text-[#fbaf17] font-mono">CT101/G/...</code>, Email, or 07...</span>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setResult(null);
                    setError(null);
                  }}
                  className="text-white/60 hover:text-white underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Results View: Clean, Native Mobile-First Layout */}
          {result && (
            <div className="pt-2 pb-6 space-y-6">
              {/* 1. Athlete Information Block (Green Ambient Card with Stated Vertical Lines) */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-transparent border border-emerald-500/25 p-4 sm:p-5 relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-2">
                  {/* Primary Athlete Name */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                    {result.full_name_masked || 'Registered Athlete'}
                  </h3>

                  {/* Top Right: Dim, Small, Clean Status (Not a pill) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wide text-emerald-400/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                      Record Found
                    </span>
                    {result.in_carry1st_archive && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a1e1]/80">
                        • National Roster
                      </span>
                    )}
                  </div>
                </div>

                {/* Vertical Data Stack (each piece of info on its own line) */}
                <div className="space-y-1.5 font-mono text-xs">
                  {result.reg_number_masked && (
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-emerald-400/60 uppercase text-[10px]">Student Reg No</span>
                      <span className="text-white/90 font-semibold">{result.reg_number_masked}</span>
                    </div>
                  )}

                  {result.email_masked && (
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-emerald-400/60 uppercase text-[10px]">Carry1st Email</span>
                      <span className="text-white/90">{result.email_masked}</span>
                    </div>
                  )}

                  {result.phone_masked && (
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-emerald-400/60 uppercase text-[10px]">Phone Number</span>
                      <span className="text-white/90">{result.phone_masked}</span>
                    </div>
                  )}

                  {result.squad && (
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-emerald-400/60 uppercase text-[10px]">Game Squad</span>
                      <span className="text-emerald-300 font-semibold">{result.squad.game_title}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Status Row: Clean Two-Item List (Semantic States: Emerald / Amber / Red) */}
              <div className="divide-y divide-white/5 border-y border-white/5">
                {/* KyU Varsity Roster */}
                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">KyU Varsity Roster</div>
                    <div className="text-xs text-white/40 mt-0.5">
                      {result.squad ? result.squad.game_title : 'Campus gaming team'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        result.registered_at_kyu ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        result.registered_at_kyu ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {result.registered_at_kyu ? 'Active' : 'Unregistered'}
                    </span>
                  </div>
                </div>

                {/* Carry1st Shop Account */}
                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Carry1st Rewards Shop</div>
                    <div className="text-xs text-white/40 mt-0.5">Points &amp; tournament wallet</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        result.carry1st_shop_status === 'active'
                          ? 'bg-emerald-400'
                          : result.carry1st_shop_status === 'missing_account'
                          ? 'bg-rose-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        result.carry1st_shop_status === 'active'
                          ? 'text-emerald-400'
                          : result.carry1st_shop_status === 'missing_account'
                          ? 'text-rose-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {result.carry1st_shop_status === 'active'
                        ? 'Verified'
                        : result.carry1st_shop_status === 'missing_account'
                        ? 'Not Activated'
                        : 'Missing'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Action Guidance: Natural Text with state-aware emphasis */}
              <p
                className={`text-xs sm:text-[13px] leading-relaxed ${
                  result.action_required === 'none'
                    ? 'text-emerald-300/80'
                    : 'text-rose-200/80'
                }`}
              >
                {result.message}
              </p>

              {/* 4. Action Button */}
              <div>
                {result.action_required === 'none' && (
                  <a
                    href={result.squad?.whatsapp_group_link || 'https://chat.whatsapp.com/KWK9rvEpjJi8rAfRPTkvkF'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full justify-center py-3.5 px-4 text-sm font-bold shadow-md inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white transition-all cursor-pointer select-none"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Join {result.squad?.game_title || 'Campus'} WhatsApp Squad</span>
                  </a>
                )}

                {result.action_required === 'create_shop_account' && (
                  <a
                    href={result.shop_activation_url || 'https://shop.carry1st.com/?aff=reyhan'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-button-gold w-full justify-center !py-3.5 text-sm font-bold shadow-md inline-flex items-center gap-1.5 active:scale-[0.98] select-none"
                  >
                    <span>Activate Carry1st Shop Account &rarr;</span>
                  </a>
                )}

                {result.action_required === 'register_kyu' && (
                  <button
                    type="button"
                    onClick={() => handleRegisterRedirect(searchTerm)}
                    className="primary-button-blue w-full justify-center !py-3.5 text-sm font-bold shadow-md inline-flex items-center gap-1.5 active:scale-[0.98] cursor-pointer select-none"
                  >
                    <span>Complete KyU Roster Signup &rarr;</span>
                  </button>
                )}

                {result.action_required === 'register_both' && (
                  <button
                    type="button"
                    onClick={() => handleRegisterRedirect(searchTerm)}
                    className="primary-button-gold w-full justify-center !py-3.5 text-sm font-bold shadow-md inline-flex items-center gap-1.5 active:scale-[0.98] cursor-pointer select-none"
                  >
                    <span>Complete 60s Varsity Registration &rarr;</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Clean Guidance Box When Empty */}
          {!result && !loading && !error && (
            <div className="p-4 rounded-xl bg-[#161a22] border border-[#252c38] space-y-1.5 text-left">
              <h4 className="text-xs font-semibold text-white/90">Looking for your official squad link?</h4>
              <p className="text-[12px] text-white/55 leading-relaxed">
                Enter your student ID or phone number. If you are already enrolled, this will surface your game division's WhatsApp community link and prize qualification status.
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 bg-[#141820] border-t border-[#202835] text-center shrink-0">
          <span className="text-[11px] text-white/40 font-mono">
            Kirinyaga University Esports × Carry1st
          </span>
        </div>
      </div>
    </div>
  );
}
