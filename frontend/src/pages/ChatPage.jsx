import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User } from 'lucide-react'
import { apiFetch } from '../store/index.js'
import { PageWrapper } from '../components/UI.jsx'

const CHIPS = [
  {label:'🔥 Trending now',        p:{intent:'trending_movies'}},
  {label:'⭐ Top rated',           p:{intent:'top_rated'}},
  {label:'😊 Happy mood',         p:{intent:'mood_based',mood:'happy'}},
  {label:'😰 Thriller picks',     p:{intent:'recommend_genre',genre:'thriller'}},
  {label:'🚀 Sci-Fi',             p:{intent:'recommend_genre',genre:'science fiction'}},
  {label:'❤️ Romance',            p:{intent:'recommend_genre',genre:'romance'}},
  {label:'😂 Comedy',             p:{intent:'recommend_genre',genre:'comedy'}},
  {label:'👻 Horror',             p:{intent:'recommend_genre',genre:'horror'}},
]

function parseIntent(text) {
  const t = text.toLowerCase()
  if (/trend|popular|hot|this week/.test(t))            return {intent:'trending_movies'}
  if (/top.rat|best ever|greatest|all.time/.test(t))    return {intent:'top_rated'}
  if (/happy|fun|uplifting|cheer/.test(t))              return {intent:'mood_based',mood:'happy'}
  if (/sad|cry|emotional|tear/.test(t))                 return {intent:'mood_based',mood:'sad'}
  if (/scar|horror|creep|fear/.test(t))                 return {intent:'mood_based',mood:'scared'}
  if (/romantic|love|romance/.test(t))                  return {intent:'mood_based',mood:'romantic'}
  if (/action|excit|adrenalin/.test(t))                 return {intent:'mood_based',mood:'excited'}
  if (/dark|tense|suspens|thriller/.test(t))            return {intent:'recommend_genre',genre:'thriller'}
  if (/sci.fi|science.fict|space|future|robot/.test(t)) return {intent:'recommend_genre',genre:'science fiction'}
  if (/comed|funny|humor|laugh/.test(t))                return {intent:'recommend_genre',genre:'comedy'}
  if (/drama/.test(t))                                  return {intent:'recommend_genre',genre:'drama'}
  if (/anim/.test(t))                                   return {intent:'recommend_genre',genre:'animation'}
  if (/fantas|magic|wizard/.test(t))                    return {intent:'recommend_genre',genre:'fantasy'}
  if (/document/.test(t))                               return {intent:'recommend_genre',genre:'documentary'}
  return {intent:'search',query:text}
}

function MiniCard({ movie, onClick }) {
  if (!movie?.poster_path) return null
  return (
    <motion.div whileHover={{scale:1.04}} onClick={()=>onClick?.(movie)}
      className="flex-shrink-0 w-28 cursor-pointer group">
      <div className="relative rounded-xl overflow-hidden aspect-[2/3] mb-1.5 bg-cinema-card">
        <img src={movie.poster_url||`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-1 left-1 text-xs text-cinema-gold opacity-0 group-hover:opacity-100 transition-opacity">
          ⭐{movie.vote_average?.toFixed(1)}
        </div>
      </div>
      <p className="text-xs text-cinema-muted text-center line-clamp-2 leading-tight">{movie.title}</p>
    </motion.div>
  )
}

function Bubble({ msg, onMovieClick }) {
  const bot = msg.role === 'bot'
  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
      className={`flex gap-3 ${bot?'':'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1
        ${bot?'bg-cinema-accent/20 border border-cinema-accent/30':'bg-cinema-gold/20 border border-cinema-gold/30'}`}>
        {bot ? <Bot size={13} className="text-cinema-accent" /> : <User size={13} className="text-cinema-gold" />}
      </div>
      <div className={`max-w-[85%] ${bot?'':'items-end flex flex-col'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${bot?'bg-cinema-card border border-cinema-border rounded-tl-sm':'bg-cinema-accent/20 border border-cinema-accent/20 rounded-tr-sm'}`}>
          {msg.loading ? (
            <div className="flex gap-1 items-center py-1">
              {[0,1,2].map(i=>(
                <motion.div key={i} className="w-2 h-2 rounded-full bg-cinema-accent"
                  animate={{scale:[1,1.4,1]}} transition={{duration:0.7,repeat:Infinity,delay:i*0.15}} />
              ))}
            </div>
          ) : <p>{msg.text}</p>}
        </div>
        {msg.movies?.length>0 && (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {msg.movies.filter(m=>m.poster_path).map(m=>(
              <MiniCard key={m.id} movie={m} onClick={onMovieClick} />
            ))}
          </div>
        )}
        <p className="text-cinema-muted/40 text-xs mt-1 px-1">
          {new Date(msg.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
        </p>
      </div>
    </motion.div>
  )
}

export default function ChatPage({ onMovieClick }) {
  const [msgs,    setMsgs]    = useState([{
    role:'bot', text:"Hey! 🎬 I'm CINAI — your AI movie companion. Ask me about any genre, mood, or title!", movies:[], ts:Date.now()
  }])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}) }, [msgs])

  const send = async (text='', override=null) => {
    const t = (override ? '' : text).trim()
    if (!t && !override) return
    if (t) setMsgs(p=>[...p,{role:'user',text:t,movies:[],ts:Date.now()}])
    setInput(''); setLoading(true)
    const lid = Date.now()
    setMsgs(p=>[...p,{id:lid,role:'bot',text:'',movies:[],loading:true,ts:Date.now()}])
    try {
      const params = override || parseIntent(t)
      const qs = new URLSearchParams({intent:params.intent})
      if (params.query) qs.set('query',params.query)
      if (params.genre) qs.set('genre',params.genre)
      if (params.mood)  qs.set('mood', params.mood)
      const d = await apiFetch(`/chatbot?${qs}`, 30000)
      setMsgs(p=>p.map(m=>m.id===lid
        ? {role:'bot',text:d.message||'Here are some picks!',movies:d.movies||[],ts:Date.now()}
        : m))
    } catch {
      setMsgs(p=>p.map(m=>m.id===lid
        ? {role:'bot',text:'⚠️ Backend not reachable. Make sure FastAPI is running on port 8000.',movies:[],ts:Date.now()}
        : m))
    }
    setLoading(false)
  }

  const chip = (c) => {
    setMsgs(p=>[...p,{role:'user',text:c.label,movies:[],ts:Date.now()}])
    send('',c.p)
  }

  return (
    <PageWrapper className="pt-16">
      <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto w-full px-4">
        {/* Header */}
        <div className="flex items-center gap-3 py-4 border-b border-cinema-border flex-shrink-0">
          <div className="w-10 h-10 bg-cinema-accent/20 border border-cinema-accent/30 rounded-full flex items-center justify-center">
            <Bot size={18} className="text-cinema-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl gradient-text">CINAI ASSISTANT</h1>
            <p className="text-cinema-muted text-xs">AI-powered movie chatbot</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />Online
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4 hide-scrollbar">
          {msgs.map((m,i)=><Bubble key={i} msg={m} onMovieClick={onMovieClick} />)}
          <div ref={endRef} />
        </div>

        {/* Chips — show only at start */}
        {msgs.length <= 2 && (
          <div className="flex gap-2 flex-wrap pb-3 flex-shrink-0">
            {CHIPS.map((c,i)=>(
              <button key={i} onClick={()=>chip(c)}
                className="text-xs px-3 py-1.5 glass rounded-full hover:border-cinema-accent/40 hover:text-cinema-accent transition-colors">
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="pb-4 flex-shrink-0">
          <div className="flex gap-3 glass rounded-2xl p-3 border border-cinema-border focus-within:border-cinema-accent/40 transition-colors">
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send(input)}
              placeholder="Ask me anything… genre, mood, 'something like Interstellar'…"
              className="flex-1 bg-transparent text-sm outline-none placeholder-cinema-muted"
              disabled={loading} />
            <button onClick={()=>send(input)} disabled={loading||!input.trim()}
              className="p-2 bg-cinema-accent rounded-xl hover:bg-blue-400 transition-colors disabled:opacity-40 flex-shrink-0">
              <Send size={15} />
            </button>
          </div>
          <p className="text-cinema-muted/40 text-xs text-center mt-2">
            Try: "Recommend something dark and psychological" or "Best 90s action films"
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}
