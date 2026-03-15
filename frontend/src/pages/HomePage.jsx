import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info, Plus, Check, ChevronLeft, ChevronRight, Volume2, VolumeX, Star } from 'lucide-react'
import { apiFetch, useStore } from '../store/index.js'
import { MovieRow, PageWrapper } from '../components/UI.jsx'

export default function HomePage({ onMovieClick }) {
  const [heroMovies, setHeroMovies] = useState([])
  const [heroIdx,    setHeroIdx]    = useState(0)
  const [heroKey,    setHeroKey]    = useState(null)
  const [muted,      setMuted]      = useState(true)
  const [trending,   setTrending]   = useState([])
  const [aiPicks,    setAiPicks]    = useState([])
  const [gems,       setGems]       = useState([])
  const [nowPlay,    setNowPlay]    = useState([])
  const [topRated,   setTopRated]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const rotRef = useRef(null)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useStore()

  useEffect(() => {
Promise.all([
  apiFetch('/trending'),
  apiFetch('/ai_picks'),
  apiFetch('/hidden_gems'),
  apiFetch('/now_playing'),
  apiFetch('/top_rated')
]).then(([t, a, g, n, tr]) => {
      const heroes = (t.results || []).filter(m => m.poster_path && m.backdrop_path).slice(0, 6)
      setHeroMovies(heroes)
      setTrending(t.results || [])
      setAiPicks(a.results || [])
      setGems(g.results || [])
      setNowPlay(n.results || [])
      setTopRated(tr.results || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Trailer for current hero
  useEffect(() => {
    const h = heroMovies[heroIdx]
    if (!h) return
    setHeroKey(null)
    apiFetch(`/movies/${h.id}`, 120000).then(d => setHeroKey(d.trailer_key || null)).catch(() => {})
  }, [heroIdx, heroMovies])

  // Auto-rotate
  useEffect(() => {
    if (heroMovies.length < 2) return
    clearInterval(rotRef.current)
    rotRef.current = setInterval(() => setHeroIdx(i => (i + 1) % heroMovies.length), 12000)
    return () => clearInterval(rotRef.current)
  }, [heroMovies.length])

  const cycle = useCallback((d) => {
    clearInterval(rotRef.current)
    setHeroIdx(i => (i + d + heroMovies.length) % heroMovies.length)
  }, [heroMovies.length])

  const hero = heroMovies[heroIdx] || null
  const inWL = hero ? isInWatchlist(hero.id) : false

  return (
    <PageWrapper>
      {/* ── Hero ── */}
      <div className="relative w-full overflow-hidden" style={{ height: '90vh', minHeight: 560, maxHeight: 860 }}>
        <AnimatePresence mode="wait">
          {hero && (
            <motion.div key={hero.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1.1 }} className="absolute inset-0">
              {heroKey ? (
                <iframe
                  className="absolute w-[160%] h-[160%] -left-[30%] -top-[30%]"
                  style={{ pointerEvents: 'none' }}
                  src={`https://www.youtube.com/embed/${heroKey}?autoplay=1&mute=${muted?1:0}&controls=0&loop=1&playlist=${heroKey}&start=5`}
                  allow="autoplay" frameBorder="0" title="hero" />
              ) : hero.backdrop_url ? (
                <img src={hero.backdrop_url} alt={hero.title}
                  className="absolute inset-0 w-full h-full object-cover" />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-black/30" />

        {/* Hero content */}
        <div className="absolute inset-0 flex items-end pb-28 px-6 sm:px-14">
          <AnimatePresence mode="wait">
            {hero && (
              <motion.div key={hero.id}
                initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.55 }} className="max-w-2xl">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                  className="flex gap-2 mb-3">
                  <span className="text-xs px-3 py-1 bg-cinema-gold/20 text-cinema-gold rounded-full border border-cinema-gold/30 flex items-center gap-1">
                    <Star size={10} fill="currentColor" />{hero.vote_average?.toFixed(1)}
                  </span>
                  {hero.release_date && (
                    <span className="text-xs px-3 py-1 bg-cinema-accent/20 text-cinema-accent rounded-full border border-cinema-accent/30">
                      {hero.release_date.slice(0, 4)}
                    </span>
                  )}
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-wider leading-none mb-3 drop-shadow-2xl">
                  {hero.title}
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="text-cinema-muted text-sm sm:text-base leading-relaxed mb-6 line-clamp-2 max-w-lg">
                  {hero.overview}
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                  className="flex flex-wrap gap-3">
                  <button onClick={() => onMovieClick(hero)}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-cinema-accent hover:text-white transition-all text-sm shadow-xl">
                    <Play size={15} fill="currentColor" />Watch Now
                  </button>
                  <button onClick={() => onMovieClick(hero)}
                    className="flex items-center gap-2 glass border border-white/20 px-6 py-3 rounded-full font-medium hover:border-cinema-accent/50 transition-all text-sm">
                    <Info size={15} />More Info
                  </button>
                  <button onClick={() => inWL ? removeFromWatchlist(hero.id) : addToWatchlist(hero)}
                    className={`p-3 rounded-full transition-all border
                      ${inWL ? 'bg-cinema-gold/20 text-cinema-gold border-cinema-gold/40' : 'glass border-white/20 hover:border-cinema-accent/50'}`}>
                    {inWL ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 right-6 sm:right-12 flex items-center gap-2.5">
          {heroKey && (
            <button onClick={() => setMuted(v => !v)}
              className="p-2 glass rounded-full hover:border-cinema-accent/40 transition-colors">
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          )}
          <div className="flex gap-1.5 items-center">
            {heroMovies.map((_, i) => (
              <button key={i} onClick={() => { clearInterval(rotRef.current); setHeroIdx(i) }}
                className={`h-1 rounded-full transition-all duration-300 ${i === heroIdx ? 'w-8 bg-cinema-accent' : 'w-2 bg-white/30'}`} />
            ))}
          </div>
          <button onClick={() => cycle(-1)} className="p-2 glass rounded-full hover:border-cinema-accent/40">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => cycle(1)} className="p-2 glass rounded-full hover:border-cinema-accent/40">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Rows ── */}
      <div className="-mt-20 relative z-10 pt-4">
        <MovieRow title="TRENDING NOW"    movies={trending}  onMovieClick={onMovieClick} loading={loading} icon="🔥" accentColor="#f5a623" />
        <MovieRow title="AI PICKS"        movies={aiPicks}   onMovieClick={onMovieClick} loading={loading} icon="🤖" accentColor="#4f8ef7" />
        <MovieRow title="HIDDEN GEMS"     movies={gems}      onMovieClick={onMovieClick} loading={loading} icon="💎" accentColor="#a78bfa" />
        <MovieRow title="NOW IN CINEMAS"  movies={nowPlay}   onMovieClick={onMovieClick} loading={loading} icon="🎬" accentColor="#34d399" />
        <MovieRow title="ALL-TIME GREATS" movies={topRated}  onMovieClick={onMovieClick} loading={loading} icon="⭐" accentColor="#f5a623" />
      </div>
    </PageWrapper>
  )
}
