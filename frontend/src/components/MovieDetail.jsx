import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Plus, Check, Star, Clock, Calendar, Globe, ChevronDown } from 'lucide-react'
import { useStore, apiFetch } from '../store/index.js'
import { PosterImage, ConfidenceRing, Spinner, ErrorState } from './UI.jsx'

export default function MovieDetail({ movie, onClose, onMovieClick }) {
  const [detail,      setDetail]      = useState(null)
  const [recs,        setRecs]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [moreCast,    setMoreCast]    = useState(false)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, rateMovie, getRating } = useStore()

  const inWL     = movie ? isInWatchlist(movie.id) : false
  const myRating = movie ? getRating(movie.id) : 0

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (!movie?.id) return
    setLoading(true); setError(null); setDetail(null); setRecs([]); setShowTrailer(false)
    Promise.all([
      apiFetch(`/movies/${movie.id}`, 120000),
      apiFetch(`/recommendations/${movie.id}`, 120000),
    ])
      .then(([det, rec]) => { setDetail(det); setRecs((rec.results || []).slice(0, 8)); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [movie?.id])

  if (!movie) return null

  const dm       = detail || movie
  const backdrop = dm.backdrop_url || (dm.backdrop_path ? `https://image.tmdb.org/t/p/original${dm.backdrop_path}` : null)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 48, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="max-w-5xl mx-auto my-6 mx-4 rounded-2xl overflow-hidden bg-cinema-surface border border-cinema-border shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Backdrop */}
        <div className="relative h-60 sm:h-80 md:h-96 overflow-hidden">
          {backdrop && !showTrailer && (
            <img src={backdrop} alt={dm.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          )}
          {showTrailer && detail?.trailer_key && (
            <iframe className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${detail.trailer_key}?autoplay=1&controls=1&rel=0`}
              allow="autoplay; fullscreen" allowFullScreen frameBorder="0" title={detail.title} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-surface via-cinema-surface/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-surface/80 via-transparent to-transparent" />

          <button onClick={onClose}
            className="absolute top-4 right-4 p-2 glass rounded-full hover:border-cinema-accent/40 transition-colors z-10">
            <X size={18} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            {loading ? (
              <div className="space-y-2">
                <div className="skeleton h-8 w-64 rounded" />
                <div className="skeleton h-4 w-40 rounded" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(detail?.genres || []).slice(0, 4).map(g => (
                    <span key={g.id} className="text-xs px-2 py-0.5 bg-cinema-accent/20 text-cinema-accent rounded-full border border-cinema-accent/30">
                      {g.name}
                    </span>
                  ))}
                </div>
                <h1 className="font-display text-3xl sm:text-5xl tracking-wide leading-tight">{dm.title}</h1>
                {detail?.tagline && <p className="text-cinema-muted italic text-sm mt-1">"{detail.tagline}"</p>}
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          {error ? <ErrorState message={error} /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left */}
              <div className="space-y-4">
                <PosterImage movie={dm} className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-xl" />

                <div className="flex gap-2">
                  {detail?.trailer_key && (
                    <button onClick={() => setShowTrailer(v => !v)}
                      className="flex-1 flex items-center justify-center gap-2 bg-cinema-accent hover:bg-blue-400 transition-colors py-2.5 rounded-xl font-medium text-sm">
                      <Play size={14} fill="white" />{showTrailer ? 'Hide' : 'Trailer'}
                    </button>
                  )}
                  <button
                    onClick={() => inWL ? removeFromWatchlist(movie.id) : addToWatchlist(dm)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-colors
                      ${inWL ? 'bg-cinema-gold/20 text-cinema-gold border border-cinema-gold/40' : 'glass hover:border-cinema-accent/40'}`}>
                    {inWL ? <><Check size={14} />Saved</> : <><Plus size={14} />Watchlist</>}
                  </button>
                </div>

                {/* Star rating */}
                <div className="glass rounded-xl p-4">
                  <p className="text-cinema-muted text-xs uppercase tracking-wider mb-2">Your Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => rateMovie(movie.id, s * 2)}>
                        <Star size={20}
                          className={s * 2 <= myRating ? 'text-cinema-gold' : 'text-cinema-border'}
                          fill={s * 2 <= myRating ? '#f5a623' : 'none'} />
                      </button>
                    ))}
                  </div>
                  {myRating > 0 && <p className="text-cinema-muted text-xs mt-1 font-mono">{myRating}/10</p>}
                </div>

                {/* Stats */}
                {!loading && detail && (
                  <div className="glass rounded-xl p-4 space-y-3">
                    {[
                      { icon: Star,     c: '#f5a623', label: 'Rating',   val: `${detail.vote_average?.toFixed(1)}/10` },
                      { icon: Clock,    c: '#4f8ef7', label: 'Runtime',  val: detail.runtime ? `${Math.floor(detail.runtime/60)}h ${detail.runtime%60}m` : '—' },
                      { icon: Calendar, c: '#a78bfa', label: 'Year',     val: detail.release_date?.slice(0, 4) || '—' },
                      { icon: Globe,    c: '#34d399', label: 'Language', val: (detail.original_language || '—').toUpperCase() },
                    ].map(({ icon: Icon, c, label, val }) => (
                      <div key={label} className="flex items-center gap-2 text-sm">
                        <Icon size={13} style={{ color: c }} />
                        <span className="text-cinema-muted">{label}</span>
                        <span className="ml-auto font-mono text-xs">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right */}
              <div className="md:col-span-2 space-y-5">
                {loading ? (
                  <div className="space-y-3">
                    {[100, 92, 84, 76, 68].map(w => (
                      <div key={w} className="skeleton h-4 rounded" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                ) : (
                  <>
                    {detail?.overview && (
                      <div>
                        <h3 className="font-display text-lg text-cinema-accent mb-2">OVERVIEW</h3>
                        <p className="text-cinema-muted text-sm leading-relaxed">{detail.overview}</p>
                      </div>
                    )}

                    {detail?.directors?.length > 0 && (
                      <div>
                        <h3 className="font-display text-lg text-cinema-accent mb-2">DIRECTED BY</h3>
                        <div className="flex flex-wrap gap-2">
                          {detail.directors.map(d => (
                            <span key={d.id} className="px-3 py-1 glass rounded-full text-sm">{d.name}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {detail?.keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {detail.keywords.map(k => (
                          <span key={k} className="text-xs px-2.5 py-0.5 bg-cinema-card border border-cinema-border rounded-full text-cinema-muted">{k}</span>
                        ))}
                      </div>
                    )}

                    {detail?.cast?.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display text-lg text-cinema-accent">CAST</h3>
                          {detail.cast.length > 6 && (
                            <button onClick={() => setMoreCast(v => !v)}
                              className="text-cinema-muted text-xs flex items-center gap-1 hover:text-white transition-colors">
                              <ChevronDown size={12} className={moreCast ? 'rotate-180' : ''} />
                              {moreCast ? 'Less' : 'More'}
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {(moreCast ? detail.cast : detail.cast.slice(0, 8)).map(c => (
                            <div key={c.id} className="glass rounded-xl px-3 py-2 text-xs">
                              <p className="font-medium truncate">{c.name}</p>
                              <p className="text-cinema-muted truncate">{c.character}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {recs.length > 0 && (
                      <div>
                        <h3 className="font-display text-lg text-cinema-accent mb-3">YOU MIGHT ALSO LIKE</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {recs.map(rec => (
                            <div key={rec.id}
                              className="glass rounded-xl p-2.5 cursor-pointer hover:border-cinema-accent/40 transition-colors group"
                              onClick={() => onMovieClick(rec)}>
                              <div className="relative rounded-lg overflow-hidden aspect-[2/3] mb-2">
                                <img src={`https://image.tmdb.org/t/p/w185${rec.poster_path}`} alt={rec.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy" />
                                <div className="absolute top-1 right-1">
                                  <ConfidenceRing score={rec.confidence || 70} size={32} />
                                </div>
                              </div>
                              <p className="text-xs font-medium line-clamp-2 leading-tight mb-1">{rec.title}</p>
                              <p className="text-cinema-muted text-xs line-clamp-1">{rec.reasons?.[0] || ''}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
