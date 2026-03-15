import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Brain, Target, Zap, TrendingUp } from 'lucide-react'
import { apiFetch } from '../store/index.js'
import { ConfidenceRing, SectionHeader, Spinner, PageWrapper, PosterImage } from '../components/UI.jsx'

function TasteBar({ label, value, color }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-cinema-muted">{label}</span>
        <span className="font-mono" style={{ color }}>{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 bg-cinema-border rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
      </div>
    </div>
  )
}

function RecCard({ movie, index, onClick }) {
  if (!movie?.poster_path) return null
  const colors = ['#4f8ef7','#a78bfa','#34d399','#f5a623','#e53935']
  const color = colors[index % colors.length]
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={() => onClick(movie)}
      className="glass rounded-2xl p-4 flex gap-4 cursor-pointer hover:border-cinema-accent/40 transition-all group">
      <div className="flex-shrink-0 w-8 font-display text-2xl text-cinema-border group-hover:text-cinema-accent transition-colors">
        {String(index + 1).padStart(2, '0')}
      </div>
      <PosterImage movie={movie} className="w-16 h-24 rounded-xl flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-lg leading-tight line-clamp-1 mb-1">{movie.title}</h3>
        <p className="text-cinema-muted text-xs mb-2">{movie.release_date?.slice(0,4)} · ⭐ {movie.vote_average?.toFixed(1)}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {(movie.reasons || ['Recommended']).map((r, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full border"
              style={{ borderColor: color+'50', color, background: color+'15' }}>{r}</span>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-xs">
          {[['Content','#4f8ef7',0.4],['Collab','#a78bfa',0.3],['Mood','#34d399',0.2],['Pop','#f5a623',0.1]].map(([l,c,w])=>(
            <div key={l} className="text-center">
              <div className="h-1 bg-cinema-border rounded mb-1 overflow-hidden">
                <div className="h-full rounded" style={{ background:c, width:`${(movie.score||0.7)*100*w*2.5}%` }} />
              </div>
              <span className="text-cinema-muted" style={{fontSize:'10px'}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <ConfidenceRing score={movie.confidence || 70} size={56} />
    </motion.div>
  )
}

export default function RecommendationsPage({ onMovieClick }) {
  const [recs,      setRecs]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [baseId,    setBaseId]    = useState(null)
  const [topMovies, setTopMovies] = useState([])

  useEffect(() => {
    apiFetch('/top_rated').then(d => {
      const m = d.results || []
      setTopMovies(m.slice(0, 10))
      if (m.length) setBaseId(m[0].id)
    })
  }, [])

  useEffect(() => {
  if (!baseId) return
  setLoading(true)
  apiFetch(`/recommendations/${baseId}`, 120000)
    .then(d => { setRecs(d.results || []); setLoading(false) })
    .catch(() => setLoading(false))
}, [baseId])

  return (
    <PageWrapper className="pt-20 px-6">
      <SectionHeader title="AI RECOMMENDATIONS" subtitle="Hybrid model: content × collaborative × mood × popularity" accentColor="#4f8ef7" />

      {/* Model breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Brain,     label: 'Content',      weight: '40%', color: '#4f8ef7', desc: 'Genre & keyword DNA' },
          { icon: Target,    label: 'Collaborative', weight: '30%', color: '#a78bfa', desc: 'Viewer patterns' },
          { icon: Zap,       label: 'Sentiment',    weight: '20%', color: '#34d399', desc: 'Emotional tone' },
          { icon: TrendingUp,label: 'Popularity',   weight: '10%', color: '#f5a623', desc: 'Cultural reach' },
        ].map(({ icon: Icon, label, weight, color, desc }) => (
          <div key={label} className="glass rounded-xl p-4 text-center">
            <Icon size={20} className="mx-auto mb-2" style={{ color }} />
            <p className="font-mono text-2xl font-bold" style={{ color }}>{weight}</p>
            <p className="font-medium text-sm">{label}</p>
            <p className="text-cinema-muted text-xs">{desc}</p>
          </div>
        ))}
      </div>

      {/* Base selector */}
      <div className="glass rounded-2xl p-4 mb-8">
        <p className="text-cinema-muted text-xs mb-3 uppercase tracking-wider">Base movie for recommendations:</p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {topMovies.map(m => (
            <button key={m.id} onClick={() => setBaseId(m.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm
                ${baseId === m.id ? 'bg-cinema-accent text-white' : 'glass hover:border-cinema-accent/40'}`}>
              {m.poster_path && <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt=""
                className="w-8 h-10 object-cover rounded flex-shrink-0" />}
              <span className="line-clamp-1 max-w-[6rem]">{m.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-display text-2xl text-cinema-accent mb-4">
            <Sparkles size={18} className="inline mr-2" />RECOMMENDATIONS
          </h2>
          {loading
            ? Array.from({length:6}).map((_,i)=><div key={i} className="skeleton h-32 rounded-2xl" />)
            : recs.map((m,i) => <RecCard key={m.id} movie={m} index={i} onClick={onMovieClick} />)
          }
        </div>
        <div>
          <h2 className="font-display text-2xl text-cinema-gold mb-4">TASTE PROFILE</h2>
          <div className="glass rounded-2xl p-6 mb-4">
            <p className="text-cinema-muted text-xs mb-4 uppercase tracking-wider">Genre Affinity</p>
            {[['Drama',82,'#4f8ef7'],['Sci-Fi',74,'#a78bfa'],['Thriller',68,'#e53935'],
              ['Action',61,'#f5a623'],['Comedy',45,'#34d399'],['Horror',32,'#ef4444']].map(([l,v,c])=>(
              <TasteBar key={l} label={l} value={v} color={c} />
            ))}
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-cinema-muted text-xs mb-4 uppercase tracking-wider">Era Preferences</p>
            {[['2020s',78,'#4f8ef7'],['2010s',85,'#4f8ef7'],['2000s',60,'#a78bfa'],
              ['1990s',55,'#f5a623'],['Classic',42,'#34d399']].map(([l,v,c])=>(
              <TasteBar key={l} label={l} value={v} color={c} />
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
