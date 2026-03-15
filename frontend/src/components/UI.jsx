import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Plus, Check, Play, Info, ChevronRight } from 'lucide-react'
import { useStore } from '../store/index.js'

/* ── Poster — never renders without poster_path ────────────────────────────── */
export function PosterImage({ movie, className = '', onClick }) {
  const [loaded,  setLoaded]  = useState(false)
  const [errored, setErrored] = useState(false)
  if (!movie?.poster_path) return null
  const src = movie.poster_url || `https://image.tmdb.org/t/p/w500${movie.poster_path}`
  return (
    <div className={`relative overflow-hidden bg-cinema-card ${className}`} onClick={onClick}>
      {!loaded && !errored && <div className="skeleton absolute inset-0" />}
      {!errored ? (
        <img
          src={src} alt={movie.title || ''}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => { setErrored(true); setLoaded(true) }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2">
          <p className="text-cinema-muted text-xs text-center line-clamp-3">{movie.title}</p>
        </div>
      )}
    </div>
  )
}

/* ── Movie card with hover trailer ─────────────────────────────────────────── */
export function MovieCard({ movie, onClick, size = 'md' }) {
  const [hovered,     setHovered]     = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  const timer = useRef(null)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useStore()
  if (!movie?.poster_path) return null

  const inWL = isInWatchlist(movie.id)
  const w    = { sm: 'w-32', md: 'w-44', lg: 'w-52', xl: 'w-60' }[size] || 'w-44'
  const yr   = movie.release_date?.slice(0, 4) || ''
  const rt   = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '—'

  const enter = () => {
    setHovered(true)
    timer.current = setTimeout(() => setShowTrailer(true), 900)
  }
  const leave = () => {
    setHovered(false); setShowTrailer(false); clearTimeout(timer.current)
  }

  return (
    <motion.div
      className={`movie-card relative flex-shrink-0 ${w} cursor-pointer rounded-xl overflow-hidden`}
      onMouseEnter={enter} onMouseLeave={leave}
      onClick={() => onClick?.(movie)}
    >
      <PosterImage movie={movie} className="w-full aspect-[2/3] rounded-xl" />

      {/* Rating badge */}
      {!hovered && (
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-cinema-gold text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
          <Star size={9} fill="currentColor" />{rt}
        </div>
      )}

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 rounded-xl overflow-hidden"
          >
            {showTrailer && movie.trailer_key && (
              <iframe
                className="absolute inset-0 w-[220%] h-[220%] -left-[60%] -top-[60%]"
                src={`https://www.youtube.com/embed/${movie.trailer_key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${movie.trailer_key}&start=15`}
                allow="autoplay" frameBorder="0" style={{ pointerEvents: 'none' }}
                title={movie.title}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="font-display text-sm leading-tight mb-1 line-clamp-2">{movie.title}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cinema-gold text-xs flex items-center gap-1">
                  <Star size={9} fill="currentColor" />{rt}
                </span>
                {yr && <span className="text-cinema-muted text-xs">{yr}</span>}
              </div>
              <div className="flex gap-1.5">
                <button className="p-1.5 bg-cinema-accent rounded-full hover:bg-blue-400 transition-colors"
                  onClick={e => { e.stopPropagation(); onClick?.(movie) }}>
                  <Play size={10} fill="white" />
                </button>
                <button
                  className={`p-1.5 rounded-full transition-colors ${inWL ? 'bg-cinema-gold' : 'bg-white/20 hover:bg-white/30'}`}
                  onClick={e => { e.stopPropagation(); inWL ? removeFromWatchlist(movie.id) : addToWatchlist(movie) }}>
                  {inWL ? <Check size={10} /> : <Plus size={10} />}
                </button>
                <button className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  onClick={e => { e.stopPropagation(); onClick?.(movie) }}>
                  <Info size={10} />
                </button>
              </div>
            </div>
            {movie.confidence != null && (
              <div className="absolute top-2 right-2 bg-cinema-accent/90 text-xs px-2 py-0.5 rounded-full font-mono">
                {movie.confidence}%
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Horizontal movie row ───────────────────────────────────────────────────── */
export function MovieRow({ title, movies = [], onMovieClick, icon, loading, accentColor = '#4f8ef7' }) {
  const ref = useRef(null)
  const scroll = (d) => ref.current?.scrollBy({ left: d * 320, behavior: 'smooth' })
  if (!loading && !movies.filter(m => m?.poster_path).length) return null
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 px-6">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <h2 className="font-display text-2xl tracking-wide" style={{ color: accentColor }}>{title}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="p-1.5 glass rounded-full hover:border-cinema-accent/40 transition-colors">
            <ChevronRight size={14} className="rotate-180" />
          </button>
          <button onClick={() => scroll(1)} className="p-1.5 glass rounded-full hover:border-cinema-accent/40 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-3 overflow-x-auto pb-3 px-6 hide-scrollbar">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="w-44 flex-shrink-0 aspect-[2/3] skeleton rounded-xl" />)
          : movies.filter(m => m?.poster_path).map(m => (
              <MovieCard key={m.id} movie={m} onClick={onMovieClick} />
            ))
        }
      </div>
    </div>
  )
}

/* ── Confidence ring ────────────────────────────────────────────────────────── */
export function ConfidenceRing({ score = 0, size = 56 }) {
  const r    = size / 2 - 6
  const circ = 2 * Math.PI * r
  const off  = circ - (Math.min(score, 100) / 100) * circ
  const col  = score >= 80 ? '#4f8ef7' : score >= 60 ? '#f5a623' : '#e53935'
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e35" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="5"
          strokeDasharray={`${circ}`} strokeDashoffset={`${off}`}
          className="conf-ring" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-mono font-bold" style={{ color: col }}>{score}%</span>
      </div>
    </div>
  )
}

/* ── Genre pill ─────────────────────────────────────────────────────────────── */
export function GenrePill({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border
        ${active
          ? 'bg-cinema-accent text-white border-cinema-accent shadow-lg shadow-cinema-accent/20'
          : 'glass text-cinema-muted border-cinema-border hover:text-white hover:border-cinema-accent/40'}`}>
      {label}
    </button>
  )
}

/* ── Section header ─────────────────────────────────────────────────────────── */
export function SectionHeader({ title, subtitle, accentColor = '#4f8ef7' }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-5xl tracking-wider mb-1" style={{ color: accentColor }}>{title}</h1>
      {subtitle && <p className="text-cinema-muted text-sm">{subtitle}</p>}
    </div>
  )
}

/* ── Spinner ────────────────────────────────────────────────────────────────── */
export function Spinner({ size = 32 }) {
  return (
    <div className="flex items-center justify-center p-10">
      <div className="rounded-full border-2 border-cinema-border border-t-cinema-accent animate-spin"
        style={{ width: size, height: size }} />
    </div>
  )
}

/* ── Error state ────────────────────────────────────────────────────────────── */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="text-5xl">⚠️</div>
      <p className="text-cinema-muted max-w-md text-sm">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="px-5 py-2 bg-cinema-accent rounded-xl text-sm hover:bg-blue-400 transition-colors">
          Retry
        </button>
      )}
    </div>
  )
}

/* ── Page wrapper ───────────────────────────────────────────────────────────── */
export function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen pb-20 ${className}`}
    >
      {children}
    </motion.div>
  )
}
