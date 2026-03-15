import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Shuffle } from 'lucide-react'
import { apiFetch } from '../store/index.js'
import { MovieCard, GenrePill, SectionHeader, Spinner, PageWrapper } from '../components/UI.jsx'

const SORTS = [
  { value: 'popularity.desc',    label: 'Most Popular' },
  { value: 'vote_average.desc',  label: 'Top Rated' },
  { value: 'release_date.desc',  label: 'Newest First' },
  { value: 'revenue.desc',       label: 'Box Office' },
]

export default function DiscoverPage({ onMovieClick }) {
  const [movies,      setMovies]      = useState([])
  const [genres,      setGenres]      = useState([])
  const [genre,       setGenre]       = useState(null)
  const [sort,        setSort]        = useState('popularity.desc')
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loaderRef = useRef(null)

  useEffect(() => { apiFetch('/genres').then(d => setGenres(d.genres || [])) }, [])

  const load = useCallback(async (p, reset = false) => {
    if (reset) { setLoading(true); } else { setLoadingMore(true) }
    try {
      const qs = new URLSearchParams({ page: p, sort_by: sort })
      if (genre) qs.set('genre', genre)
      const d = await apiFetch(`/discover?${qs}`, 30000)
      const r = d.results || []
      setMovies(prev => reset ? r : [...prev, ...r])
      setTotalPages(d.total_pages || 1)
    } catch (e) { console.error(e) }
    setLoading(false); setLoadingMore(false)
  }, [genre, sort])

  useEffect(() => { setPage(1); setMovies([]); load(1, true) }, [genre, sort])

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingMore && page < totalPages) {
        const next = page + 1; setPage(next); load(next)
      }
    }, { rootMargin: '200px' })
    if (loaderRef.current) obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [loadingMore, page, totalPages, load])

  const surprise = () => {
    setSort(SORTS[Math.floor(Math.random() * SORTS.length)].value)
    setGenre(null)
  }

  return (
    <PageWrapper className="pt-20 px-6">
      <SectionHeader title="DISCOVER" subtitle="Browse the entire cinematic universe" accentColor="#4f8ef7" />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <GenrePill label="All" active={!genre} onClick={() => setGenre(null)} />
        {genres.map(g => (
          <GenrePill key={g.id} label={g.name} active={genre === String(g.id)}
            onClick={() => setGenre(genre === String(g.id) ? null : String(g.id))} />
        ))}
      </div>

      <div className="flex gap-3 mb-8">
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="glass px-3 py-1.5 rounded-lg text-sm text-cinema-text bg-cinema-surface border border-cinema-border outline-none cursor-pointer">
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button onClick={surprise}
          className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg text-sm hover:border-cinema-accent/40 transition-colors">
          <Shuffle size={14} />Surprise Me
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => <div key={i} className="aspect-[2/3] skeleton rounded-xl" />)}
        </div>
      ) : (
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" layout>
          {movies.filter(m => m?.poster_path).map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i < 18 ? (i % 6) * 0.04 : 0 }}>
              <MovieCard movie={m} onClick={onMovieClick} size="lg" />
            </motion.div>
          ))}
        </motion.div>
      )}

      <div ref={loaderRef} className="py-10 flex justify-center">
        {loadingMore && <Spinner />}
      </div>
    </PageWrapper>
  )
}
