import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import { apiFetch } from '../store/index.js'
import { SectionHeader, Spinner, PageWrapper } from '../components/UI.jsx'

const COLORS = ['#4f8ef7','#a78bfa','#34d399','#f5a623','#e53935','#ec4899','#38bdf8','#fb923c']

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg p-2 text-xs border border-cinema-border shadow-xl">
      <p className="font-medium mb-1">{label}</p>
      {payload.map(p=><p key={p.name} style={{color:p.color||'#f0ebe0'}}>{p.value}</p>)}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/analytics', 300000)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <PageWrapper className="pt-20 px-6"><Spinner /></PageWrapper>
  if (!data)   return <PageWrapper className="pt-20 px-6"><p className="text-cinema-muted text-center py-20">Failed to load analytics.</p></PageWrapper>

  return (
    <PageWrapper className="pt-20 px-6">
      <SectionHeader title="ANALYTICS" subtitle="Deep dive into the cinematic data universe" accentColor="#e53935" />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {label:'Movies Analyzed', value:data.total_movies,              color:'#4f8ef7'},
          {label:'Avg Rating',      value:`${data.avg_rating?.toFixed(2)}/10`, color:'#f5a623'},
          {label:'Genres Tracked',  value:data.genre_popularity?.length,  color:'#34d399'},
          {label:'Languages',       value:data.language_distribution?.length, color:'#a78bfa'},
        ].map(({label,value,color})=>(
          <div key={label} className="glass rounded-xl p-5">
            <p className="font-display text-4xl mb-1" style={{color}}>{value}</p>
            <p className="text-cinema-muted text-xs">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Genre popularity */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-xl text-cinema-accent mb-4">GENRE POPULARITY</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.genre_popularity?.slice(0,8)} margin={{top:0,right:0,bottom:24,left:0}}>
              <XAxis dataKey="genre" tick={{fill:'#7a7a9a',fontSize:10}} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{fill:'#7a7a9a',fontSize:10}} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {data.genre_popularity?.slice(0,8).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rating distribution */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-xl text-cinema-gold mb-4">RATING DISTRIBUTION</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.rating_distribution} margin={{top:0,right:0,bottom:24,left:0}}>
              <XAxis dataKey="range" tick={{fill:'#7a7a9a',fontSize:10}} />
              <YAxis tick={{fill:'#7a7a9a',fontSize:10}} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" fill="#f5a623" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment radar */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-xl text-cinema-accent mb-4">SENTIMENT BY GENRE</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={data.sentiment_trends}>
              <PolarGrid stroke="#1e1e35" />
              <PolarAngleAxis dataKey="genre" tick={{fill:'#7a7a9a',fontSize:11}} />
              <Radar dataKey="sentiment" stroke="#4f8ef7" fill="#4f8ef7" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Language pie */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-xl text-cinema-accent mb-4">LANGUAGE DIVERSITY</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.language_distribution} dataKey="count" nameKey="language"
                cx="50%" cy="50%" outerRadius={90}
                label={({language,percent})=>`${language.toUpperCase()} ${(percent*100).toFixed(0)}%`}
                labelLine={false}>
                {data.language_distribution?.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Year line */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-display text-xl text-cinema-accent mb-4">RELEASE YEAR TRENDS</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data.year_distribution}>
            <XAxis dataKey="year" tick={{fill:'#7a7a9a',fontSize:10}} />
            <YAxis tick={{fill:'#7a7a9a',fontSize:10}} />
            <Tooltip content={<Tip />} />
            <Line type="monotone" dataKey="count" stroke="#4f8ef7" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PageWrapper>
  )
}
