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

export default function StatusLookup({
  isOpen,
  onClose,
  initialQuery = '',
  onPrefillRegistration,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onPrefillRegistration?: (query: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusResponse | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
      if (initialQuery && initialQuery.trim().length >= 2) {
        setSearchTerm(initialQuery);
        handleLookup(initialQuery);
      }
    }
  }, [isOpen, initialQuery]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLookup = async (queryToSearch?: string) => {
    const query = (queryToSearch ?? searchTerm).trim();
    if (!query || query.length < 2) {
      setError('Please enter a valid Reg Number, Email, or WhatsApp Number.');
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
        throw new Error('Rate limit exceeded. Please wait a moment before searching again.');
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Backdrop tap to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-[#131211] text-white border-2 border-[#202835] rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Subtle Watermark Radial Ambient Glow */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(251, 175, 23, 0.4), transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-[#202835]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fbaf17] animate-pulse" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#fbaf17]">
                Live Roster &amp; Carry1st Verification
              </p>
            </div>
            <h2 id="status-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Check Player &amp; Wallet Status
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close status check"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors active:scale-95 shrink-0 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3 mb-5">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Reg No (CT101/...), Carry1st email, or phone"
              className="w-full h-12 pl-4 pr-24 rounded-xl bg-[#191f2a] border-2 border-[#202835] text-white placeholder-white/40 text-[15px] focus:outline-none focus:border-[#fbaf17] focus:ring-2 focus:ring-[#fbaf17]/20 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-[#fbaf17] hover:bg-[#fce38a] text-black font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  <span>Check</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-white/50">
            Accepts Admission Number (e.g., <code className="text-[#fbaf17]">CT101/G/12345/24</code> or <code className="text-[#fbaf17]">12345</code>), Carry1st email, or WhatsApp phone.
          </p>
        </form>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm font-medium mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Status Response Results Display */}
        {result && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Status Telemetry Card */}
            {/* Results View: Clean, Native Mobile-First Layout */}
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
            </div>

            {/* Smart Contextual Action Buttons */}
            <div>
              {/* Scenario 1: Fully Verified ("none") -> Join WhatsApp Squad */}
              {result.action_required === 'none' && (
                <a
                  href={result.squad?.whatsapp_group_link || 'https://chat.whatsapp.com/KWK9rvEpjJi8rAfRPTkvkF'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full justify-center !py-3.5 !px-5 text-sm font-bold shadow-lg inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Join {result.squad?.game_title || 'Campus'} WhatsApp Squad</span>
                </a>
              )}

              {/* Scenario 2: Create Shop Account ("create_shop_account") */}
              {result.action_required === 'create_shop_account' && (
                <a
                  href={result.shop_activation_url || 'https://shop.carry1st.com/?aff=reyhan'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-button-gold w-full justify-center !py-3.5 text-sm font-bold shadow-lg inline-flex items-center gap-2 active:scale-[0.98]"
                >
                  <span>Activate Carry1st Rewards Wallet ↗</span>
                </a>
              )}

              {/* Scenario 3: Register at KyU ("register_kyu") */}
              {result.action_required === 'register_kyu' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onPrefillRegistration) onPrefillRegistration(searchTerm);
                      else window.location.href = `/register?query=${encodeURIComponent(searchTerm)}`;
                    }}
                    className="primary-button-blue w-full justify-center !py-3.5 text-sm font-bold shadow-lg inline-flex items-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <span>Complete KyU Roster Signup &rarr;</span>
                  </button>
                  <p className="text-[11px] text-center text-white/50">
                    Your Carry1st account is already verified. Complete varsity roster details to secure prizes.
                  </p>
                </div>
              )}

              {/* Scenario 4: Register Both ("register_both") */}
              {result.action_required === 'register_both' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onPrefillRegistration) onPrefillRegistration(searchTerm);
                      else window.location.href = `/register?query=${encodeURIComponent(searchTerm)}`;
                    }}
                    className="primary-button-gold w-full justify-center !py-3.5 text-sm font-bold shadow-lg inline-flex items-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <span>Register New Student (60s) &rarr;</span>
                  </button>
                  <p className="text-[11px] text-center text-white/50">
                    Free admission. No prior tournament experience required.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
