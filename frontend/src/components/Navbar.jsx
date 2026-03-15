import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Mic, X, Film, Home, Compass, Sparkles,
  TrendingUp, Grid, Bookmark, BarChart2, MessageSquare, Info, Menu,
} from 'lucide-react'
import { useStore, apiFetch } from '../store/index.js'

const NAV = [
  { id: 'home',            label: 'Home',      icon: Home },
  { id: 'discover',        label: 'Discover',   icon: Compass },
  { id: 'recommendations', label: 'AI Picks',   icon: Sparkles },
  { id: 'trending',        label: 'Trending',   icon: TrendingUp },
  { id: 'genres',          label: 'Genres',     icon: Grid },
  { id: 'watchlist',       label: 'Watchlist',  icon: Bookmark },
  { id: 'analytics',       label: 'Analytics',  icon: BarChart2 },
  { id: 'chat',            label: 'AI Chat',    icon: MessageSquare },
  { id: 'about',           label: 'About',      icon: Info },
]

export default function Navbar({ onNavigate, currentPage }) {
  const [scrolled,   setScrolled]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query,      setQuery]      = useState('')
  const [results,    setResults]    = useState([])
  const [searching,  setSearching]  = useState(false)
  const [mobile,     setMobile]     = useState(false)
  const inputRef  = useRef(null)
  const debRef    = useRef(null)
  const { watchlist } = useStore()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    clearTimeout(debRef.current)
    if (!query.trim()) { setResults([]); return }
    debRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const d = await apiFetch(`/search?q=${encodeURIComponent(query)}`, 15000)
        setResults((d.results || []).filter(m => m.poster_path).slice(0, 7))
      } catch { setResults([]) }
      setSearching(false)
    }, 260)
    return () => clearTimeout(debRef.current)
  }, [query])

  const openSearch = () => {
    setSearchOpen(true)
    setTimeout(() => inputRef.current?.focus(), 80)
  }
  const closeSearch = () => { setSearchOpen(false); setQuery(''); setResults([]) }

  const pickResult = (movie) => {
    closeSearch()
    window.dispatchEvent(new CustomEvent('cinai:open-movie', { detail: movie }))
  }

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'en-US'
    r.onresult = (e) => { setQuery(e.results[0][0].transcript); setSearchOpen(true) }
    r.start()
  }

  const go = (id) => { onNavigate(id); setMobile(false) }
  const wl = watchlist.length

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${scrolled ? 'glass border-b border-cinema-border' : 'bg-gradient-to-b from-black/60 to-transparent'}`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

          {/* Logo */}
          <button onClick={() => go('home')} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-cinema-accent rounded-lg flex items-center justify-center shadow-lg shadow-cinema-accent/30">
              <Film size={15} fill="white" className="text-white" />
            </div>
            <span className="font-display text-2xl tracking-widest gradient-text">CINAI</span>
          </button>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => go(id)}
                className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5
                  ${currentPage === id
                    ? 'text-cinema-accent bg-cinema-accent/10'
                    : 'text-cinema-muted hover:text-white hover:bg-white/5'}`}>
                <Icon size={14} />
                {label}
                {id === 'watchlist' && wl > 0 && (
                  <span className="w-4 h-4 bg-cinema-accent rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                    {wl > 9 ? '9+' : wl}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={openSearch} className="p-2 glass rounded-lg hover:border-cinema-accent/40 transition-colors">
              <Search size={16} className="text-cinema-muted" />
            </button>
            <button onClick={startVoice} className="hidden sm:flex p-2 glass rounded-lg hover:border-cinema-accent/40 transition-colors">
              <Mic size={16} className="text-cinema-muted" />
            </button>
            <button onClick={() => setMobile(v => !v)} className="lg:hidden p-2 glass rounded-lg">
              <Menu size={16} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobile && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden glass border-t border-cinema-border">
              <div className="grid grid-cols-3 gap-2 p-4">
                {NAV.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => go(id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs transition-colors
                      ${currentPage === id ? 'bg-cinema-accent/20 text-cinema-accent' : 'text-cinema-muted hover:text-white'}`}>
                    <Icon size={18} />{label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-start pt-20 px-4"
            onClick={e => e.target === e.currentTarget && closeSearch()}>
            <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="w-full max-w-2xl">
              <div className="glass rounded-2xl border border-cinema-border overflow-hidden shadow-2xl">
                <div className="flex items-center px-4 py-3.5 gap-3">
                  <Search size={18} className="text-cinema-muted flex-shrink-0" />
                  <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && closeSearch()}
                    placeholder="Search movies, directors, genres…"
                    className="flex-1 bg-transparent text-white placeholder-cinema-muted text-base outline-none" />
                  {searching && <div className="w-4 h-4 border-2 border-cinema-border border-t-cinema-accent rounded-full animate-spin flex-shrink-0" />}
                  <button onClick={closeSearch} className="text-cinema-muted hover:text-white flex-shrink-0">
                    <X size={18} />
                  </button>
                </div>
                {results.length > 0 && (
                  <div className="border-t border-cinema-border divide-y divide-cinema-border/40">
                    {results.map(m => (
                      <button key={m.id} onClick={() => pickResult(m)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
                        <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt={m.title}
                          className="w-10 h-14 object-cover rounded-lg flex-shrink-0" loading="lazy" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{m.title}</p>
                          <p className="text-cinema-muted text-xs">
                            {m.release_date?.slice(0, 4)}{m.vote_average ? ` · ⭐ ${m.vote_average.toFixed(1)}` : ''}
                          </p>
                          {m.overview && <p className="text-cinema-muted text-xs line-clamp-1 mt-0.5">{m.overview}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {query && !searching && !results.length && (
                  <div className="px-4 py-6 text-center text-cinema-muted text-sm border-t border-cinema-border">
                    No results for "{query}"
                  </div>
                )}
              </div>
              <p className="text-cinema-muted/40 text-xs text-center mt-3">Press Esc to close · Voice search with 🎤</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
