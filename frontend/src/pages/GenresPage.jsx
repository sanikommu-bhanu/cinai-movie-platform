import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { apiFetch } from '../store/index.js'
import { MovieCard, SectionHeader, Spinner, PageWrapper } from '../components/UI.jsx'

const STYLE = {
  28:    {color:'#ef4444',emoji:'💥',bg:'from-red-900/30'},
  12:    {color:'#f59e0b',emoji:'🗺️',bg:'from-amber-900/30'},
  16:    {color:'#34d399',emoji:'✨',bg:'from-emerald-900/30'},
  35:    {color:'#fbbf24',emoji:'😂',bg:'from-yellow-900/30'},
  80:    {color:'#9ca3af',emoji:'🔫',bg:'from-gray-800/40'},
  99:    {color:'#60a5fa',emoji:'📖',bg:'from-blue-900/30'},
  18:    {color:'#8b5cf6',emoji:'💔',bg:'from-purple-900/30'},
  10751:{color:'#f9a8d4',emoji:'👨‍👩‍👧',bg:'from-pink-900/30'},
  14:    {color:'#a78bfa',emoji:'🧙',bg:'from-violet-900/30'},
  36:    {color:'#d97706',emoji:'⚔️',bg:'from-orange-900/30'},
  27:    {color:'#dc2626',emoji:'👻',bg:'from-red-950/50'},
  10402:{color:'#ec4899',emoji:'🎵',bg:'from-pink-900/30'},
  9648:  {color:'#1d4ed8',emoji:'🔍',bg:'from-blue-950/50'},
  10749:{color:'#f472b6',emoji:'❤️',bg:'from-rose-900/30'},
  878:   {color:'#38bdf8',emoji:'🚀',bg:'from-sky-900/30'},
  53:    {color:'#64748b',emoji:'😰',bg:'from-slate-800/40'},
  10752:{color:'#92400e',emoji:'🎖️',bg:'from-stone-900/30'},
  37:    {color:'#b45309',emoji:'🤠',bg:'from-yellow-950/50'},
}
const DEF = {color:'#4f8ef7',emoji:'🎬',bg:'from-blue-900/30'}

export default function GenresPage({ onMovieClick }) {
  const [genres,  setGenres]  = useState([])
  const [active,  setActive]  = useState(null)
  const [movies,  setMovies]  = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { apiFetch('/genres').then(d => setGenres(d.genres || [])) }, [])

  const pick = (g) => {
    setActive(g); setLoading(true)
    apiFetch(`/discover?genre=${g.id}&sort_by=popularity.desc`, 60000)
      .then(d => { setMovies((d.results||[]).slice(0,20)); setLoading(false) })
      .catch(() => setLoading(false))
  }

  return (
    <PageWrapper className="pt-20 px-6">
      <SectionHeader title="GENRES" subtitle="Explore every corner of cinema" accentColor="#a78bfa" />
      {!active ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {genres.map((g,i) => {
            const s = STYLE[g.id] || DEF
            return (
              <motion.button key={g.id} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
                transition={{delay:i*0.025}} onClick={() => pick(g)}
                className={`relative h-28 rounded-2xl overflow-hidden bg-gradient-to-br ${s.bg} to-cinema-card border border-cinema-border hover:scale-105 transition-all group`}
                style={{borderColor:s.color+'30'}}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="font-display text-base tracking-wide" style={{color:s.color}}>{g.name.toUpperCase()}</span>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                  style={{background:`${s.color}12`}} />
              </motion.button>
            )
          })}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => {setActive(null);setMovies([])}}
              className="glass px-4 py-2 rounded-xl text-sm hover:border-cinema-accent/40 transition-colors">← All Genres</button>
            <h2 className="font-display text-3xl" style={{color:(STYLE[active.id]||DEF).color}}>
              {(STYLE[active.id]||DEF).emoji} {active.name.toUpperCase()}
            </h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({length:12}).map((_,i)=><div key={i} className="aspect-[2/3] skeleton rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {movies.map((m,i)=>(
                <motion.div key={m.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}>
                  <MovieCard movie={m} onClick={onMovieClick} size="lg" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  )
}
