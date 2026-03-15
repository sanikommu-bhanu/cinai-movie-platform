import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Minus, Star } from 'lucide-react'
import { apiFetch } from '../store/index.js'
import { SectionHeader, Spinner, PageWrapper, PosterImage } from '../components/UI.jsx'

const DELTAS = [3,-1,0,2,-2,1,5,-3,0,4,2,-1,3,0,-2,1,4,-1,2,0]

export default function TrendingPage({ onMovieClick }) {
  const [movies,  setMovies]  = useState([])
  const [window_, setWindow_] = useState('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiFetch(`/trending?time_window=${window_}`, 60000)
      .then(d => { setMovies(d.results || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [window_])

  return (
    <PageWrapper className="pt-20 px-6">
      <SectionHeader title="TRENDING" subtitle="What the world is watching right now" accentColor="#f5a623" />
      <div className="flex gap-3 mb-8">
        {['day','week'].map(w => (
          <button key={w} onClick={() => setWindow_(w)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors
              ${window_===w ? 'bg-cinema-gold text-black' : 'glass hover:border-cinema-gold/40'}`}>
            This {w.charAt(0).toUpperCase()+w.slice(1)}
          </button>
        ))}
      </div>
      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {movies.map((m,i) => {
            const delta = DELTAS[i % DELTAS.length]
            return (
              <motion.div key={m.id} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: i*0.035 }} onClick={() => onMovieClick(m)}
                className="glass rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-cinema-accent/40 transition-all group">
                <div className="w-10 text-center flex-shrink-0">
                  <span className={`font-display text-3xl ${i<3?'text-cinema-gold':'text-cinema-border group-hover:text-cinema-muted transition-colors'}`}>
                    {String(i+1).padStart(2,'0')}
                  </span>
                </div>
                <div className="w-8 flex flex-col items-center flex-shrink-0">
                  {delta>0 ? <ArrowUp size={13} className="text-green-400" /> :
                   delta<0 ? <ArrowDown size={13} className="text-red-400" /> :
                   <Minus size={13} className="text-cinema-border" />}
                  <span className={`text-xs font-mono ${delta>0?'text-green-400':delta<0?'text-red-400':'text-cinema-border'}`}>
                    {delta!==0 ? Math.abs(delta) : '—'}
                  </span>
                </div>
                <PosterImage movie={m} className="w-12 h-18 rounded-lg flex-shrink-0 aspect-[2/3] w-14" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl line-clamp-1">{m.title}</h3>
                  <p className="text-cinema-muted text-sm">{m.release_date?.slice(0,4)}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-cinema-gold text-sm flex items-center gap-1">
                      <Star size={11} fill="currentColor" />{m.vote_average?.toFixed(1)}
                    </span>
                    <span className="text-cinema-muted text-xs">{(m.popularity||0).toFixed(0)} popularity</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-end gap-0.5 h-8 flex-shrink-0">
                  {[3,5,4,7,6,8,9,7,10,8].map((v,j)=>(
                    <div key={j} className="w-1 rounded-full bg-cinema-accent"
                      style={{height:`${v*10}%`, opacity: j===9?1:0.2+j*0.08}} />
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}
