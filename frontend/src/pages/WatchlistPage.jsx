import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Star } from 'lucide-react'
import { useStore } from '../store/index.js'
import { SectionHeader, GenrePill, PageWrapper, PosterImage } from '../components/UI.jsx'

const STATUSES = ['want','watching','done','dropped']
const LABELS   = {want:'Want to Watch',watching:'Watching',done:'Completed',dropped:'Dropped'}
const COLORS   = {want:'#4f8ef7',watching:'#f5a623',done:'#34d399',dropped:'#6b7280'}
const ICONS    = {want:'🎯',watching:'▶️',done:'✅',dropped:'❌'}

export default function WatchlistPage({ onMovieClick }) {
  const { watchlist, removeFromWatchlist, updateWatchlistStatus } = useStore()
  const [filter, setFilter] = useState('all')

  const shown = filter === 'all' ? watchlist : watchlist.filter(m => m.status === filter)

  return (
    <PageWrapper className="pt-20 px-6">
      <SectionHeader title="WATCHLIST" subtitle={`${watchlist.length} movie${watchlist.length!==1?'s':''} in your collection`} accentColor="#34d399" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {STATUSES.map(s => (
          <div key={s} className="glass rounded-xl p-4">
            <p className="text-2xl mb-1">{ICONS[s]}</p>
            <p className="font-display text-3xl" style={{color:COLORS[s]}}>
              {watchlist.filter(m=>m.status===s).length}
            </p>
            <p className="text-cinema-muted text-xs">{LABELS[s]}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        <GenrePill label="All" active={filter==='all'} onClick={()=>setFilter('all')} />
        {STATUSES.map(s=>(
          <GenrePill key={s} label={LABELS[s]} active={filter===s} onClick={()=>setFilter(s)} />
        ))}
      </div>

      {shown.length===0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-cinema-muted text-sm">
            {watchlist.length===0
              ? 'Your watchlist is empty. Discover movies and add them here!'
              : 'No movies in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((m,i)=>(
            <motion.div key={m.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
              transition={{delay:i*0.045}}
              className="glass rounded-2xl p-4 flex gap-4">
              <div className="cursor-pointer flex-shrink-0" onClick={()=>onMovieClick(m)}>
                <PosterImage movie={m} className="w-20 h-28 rounded-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 onClick={()=>onMovieClick(m)}
                  className="font-medium line-clamp-2 mb-1 cursor-pointer hover:text-cinema-accent transition-colors text-sm">
                  {m.title}
                </h3>
                <p className="text-cinema-muted text-xs mb-1">
                  {m.release_date?.slice(0,4)}
                  {m.vote_average ? ` · ⭐ ${m.vote_average.toFixed(1)}` : ''}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {STATUSES.map(s=>(
                    <button key={s} onClick={()=>updateWatchlistStatus(m.id,s)}
                      title={LABELS[s]}
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors border
                        ${m.status===s ? 'text-black font-medium border-transparent' : 'glass border-cinema-border text-cinema-muted hover:text-white'}`}
                      style={m.status===s ? {background:COLORS[s],borderColor:COLORS[s]} : {}}>
                      {ICONS[s]}
                    </button>
                  ))}
                </div>
                <p className="text-cinema-muted text-xs capitalize mb-2"
                  style={{color:COLORS[m.status]||'#7a7a9a'}}>
                  {LABELS[m.status]||m.status}
                </p>
                <button onClick={()=>removeFromWatchlist(m.id)}
                  className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                  <Trash2 size={10} />Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
