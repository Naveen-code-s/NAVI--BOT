import { useEffect, useRef, useState } from 'react'
import { Activity, ArrowUp, AudioLines, BookOpen, Check, CheckCheck, ChevronDown, Command, Compass, FileText, LayoutDashboard, Menu, MessageCircle, Mic, MoreHorizontal, Plus, Search, Settings2, Sparkles, SquarePen, Trash2, Volume2, X } from 'lucide-react'
import ChatWindow from '../components/ChatWindow.jsx'
import TaskPanel from '../components/TaskPanel.jsx'
import GlassCard from '../components/GlassCard.jsx'
import FloatingCompanion from '../components/FloatingCompanion.jsx'
const API = 'http://localhost:8000/api'
const starter = [{ id: 'welcome', role: 'assistant', content: "Hey, I’m Navi. Your ideas, plans, and questions have a place here. What’s on your mind?" }]
async function request(path, options = {}) { const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options }); if (!response.ok) throw new Error(`Navi API error (${response.status}). Is the backend running?`); return response.json() }
export default function App() {
  const [view, setView] = useState('chat'), [messages, setMessages] = useState(starter), [input, setInput] = useState(''), [busy, setBusy] = useState(false), [tasks, setTasks] = useState([]), [memories, setMemories] = useState([]), [listening, setListening] = useState(false), [toast, setToast] = useState('')
  const [researchMode, setResearchMode] = useState(false), [mobileMenu, setMobileMenu] = useState(false), [memoryTitle, setMemoryTitle] = useState(''), [memoryContent, setMemoryContent] = useState('')
  const bottom = useRef(null), speech = useRef(null)
  const refresh = async () => { try { const [t, m] = await Promise.all([request('/tasks'), request('/memories')]); setTasks(t); setMemories(m) } catch { /* the assistant remains usable as a local UI */ } }
  useEffect(() => { refresh() }, [])
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy])
  const flash = (text) => { setToast(text); setTimeout(() => setToast(''), 2600) }
  const send = async (text = input) => {
    const clean = text.trim(); if (!clean || busy) return
    setInput(''); setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: clean }]); setBusy(true)
    try { const history = messages.filter(m => m.id !== 'welcome').slice(-12).map(({ role, content }) => ({ role, content })); const result = await request(researchMode ? '/research' : '/chat', { method: 'POST', body: JSON.stringify({ message: clean, history }) }); setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: result.reply || result.answer, research: researchMode }]) }
    catch (error) { setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: `${error.message} Start the backend with uvicorn and try again.`, error: true }]) }
    finally { setBusy(false) }
  }
  const startVoice = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) return flash('Voice recognition is not supported in this browser.')
    const recog = new Recognition(); speech.current = recog; recog.lang = 'en-US'; recog.interimResults = false
    recog.onresult = e => { const phrase = e.results[0][0].transcript; setInput(phrase); setListening(false) }; recog.onerror = () => setListening(false); recog.onend = () => setListening(false); setListening(true); recog.start()
  }
  const speak = (text) => { if (!('speechSynthesis' in window)) return flash('Speech playback is not supported here.'); window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.rate = 1; window.speechSynthesis.speak(utterance) }
  const createTask = async (title) => { await request('/tasks', { method: 'POST', body: JSON.stringify({ title }) }); await refresh() }
  const toggleTask = async id => { await request(`/tasks/${id}`, { method: 'PATCH' }); await refresh() }
  const deleteTask = async id => { await request(`/tasks/${id}`, { method: 'DELETE' }); await refresh() }
  const createMemory = async e => { e.preventDefault(); if (!memoryTitle.trim()) return; await request('/memories', { method: 'POST', body: JSON.stringify({ title: memoryTitle, content: memoryContent }) }); setMemoryTitle(''); setMemoryContent(''); await refresh(); flash('Saved to your knowledge library') }
  const deleteMemory = async id => { await request(`/memories/${id}`, { method: 'DELETE' }); await refresh() }
  const nav = [{ id: 'chat', label: 'Chat', icon: MessageCircle }, { id: 'research', label: 'Research', icon: Compass }, { id: 'tasks', label: 'Tasks', icon: CheckCheck }, { id: 'knowledge', label: 'Knowledge', icon: BookOpen }]
  const changeView = id => { setView(id); setResearchMode(id === 'research'); setMobileMenu(false) }
  return <div className="shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><div><b>navi</b><span>PERSONAL AI</span></div><button className="icon-btn mobile-close" onClick={() => setMobileMenu(false)}><X size={17}/></button></div>
      <button className="new-chat" onClick={() => { changeView('chat'); setMessages(starter) }}><SquarePen size={16}/> New conversation <span>⌘ K</span></button>
      <div className="side-label">WORKSPACE</div><nav>{nav.map(item => <button key={item.id} onClick={() => changeView(item.id)} className={`nav-item ${view === item.id ? 'active' : ''}`}><item.icon size={17}/>{item.label}{item.id === 'tasks' && tasks.filter(t => !t.done).length > 0 && <i>{tasks.filter(t => !t.done).length}</i>}</button>)}</nav>
      <div className="side-label recent-label">RECENT</div><button className="recent-item" onClick={() => changeView('chat')}><MessageCircle size={15}/> A calmer morning routine</button><button className="recent-item" onClick={() => changeView('chat')}><MessageCircle size={15}/> Notes from the week</button>
      <div className="sidebar-spacer"/><GlassCard className="upgrade-card"><div className="upgrade-icon"><AudioLines size={16}/></div><b>Your second brain</b><p>Save the little things. Find them when they matter.</p><button onClick={() => changeView('knowledge')}>Explore memory <span>↗</span></button></GlassCard>
      <button className="profile"><div className="avatar">N</div><div><b>Naveen</b><span>Personal workspace</span></div><MoreHorizontal size={17}/></button>
    </aside>
    {mobileMenu && <div className="scrim" onClick={() => setMobileMenu(false)}/>}
    <main className="main">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMobileMenu(true)}><Menu size={19}/></button><div className="crumb">Workspace <span>/</span> <b>{nav.find(n => n.id === view)?.label}</b><ChevronDown size={14}/></div><div className="top-actions"><span className="status"><i/> All systems ready</span><button className="icon-btn" aria-label="Search" onClick={() => flash('Search across your knowledge library is coming soon.')}><Search size={17}/></button><button className="icon-btn" aria-label="Settings" onClick={() => flash('Settings are coming soon.')}><Settings2 size={17}/></button><div className="top-avatar">N</div></div></header>
      {view === 'chat' || view === 'research' ? <section className="chat-page">
        <div className="chat-heading"><div className="eyebrow"><span className="spark-dot"/> YOUR PERSONAL AI</div><h1>{view === 'research' ? <>Curiosity, <em>with context.</em></> : <>A little more <em>clarity.</em></>}</h1><p>{view === 'research' ? 'Explore an idea, untangle a question, follow a thread.' : 'Think out loud. Navi will keep up.'}</p></div>
        <div className="messages-wrap"><ChatWindow messages={messages} busy={busy} onSpeak={speak}/><div ref={bottom}/></div>
        {messages.length === 1 && <div className="suggestions"><button onClick={() => send('Help me plan a focused, calm week')}>✳ <span>Plan a calmer week</span></button><button onClick={() => send('Help me think through a new idea')}>⌁ <span>Think through an idea</span></button><button onClick={() => changeView('knowledge')}>◌ <span>Find something I saved</span></button></div>}
        <div className="composer-wrap"><div className="composer"><textarea value={input} placeholder={researchMode ? 'What are you curious about?' : 'Ask Navi anything…'} rows={1} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}/><div className="composer-tools"><button className={`tool-btn ${researchMode ? 'selected' : ''}`} onClick={() => setResearchMode(v => !v)} title="Toggle research mode"><Compass size={15}/><span>Research</span></button><div className="composer-right"><button className={`voice-btn ${listening ? 'listening' : ''}`} onClick={startVoice} aria-label="Voice input"><Mic size={17}/></button><button className="send-btn" onClick={() => send()} disabled={!input.trim() || busy} aria-label="Send"><ArrowUp size={18}/></button></div></div></div><div className="composer-note"><Command size={11}/> Enter to send <span>·</span> Shift + Enter for a new line</div></div>
      </section> : view === 'tasks' ? <TaskPanel tasks={tasks} onAdd={createTask} onToggle={toggleTask} onDelete={deleteTask}/> : <section className="knowledge-page"><div className="eyebrow"><span className="spark-dot"/> YOUR SECOND BRAIN</div><h1>A home for <em>what matters.</em></h1><p className="page-sub">Ideas, details, little things you want to remember.</p><div className="knowledge-grid"><GlassCard className="memory-form-card"><div className="section-title"><div className="section-icon purple"><Plus size={17}/></div><div><h2>Save a memory</h2><p>Give future-you a small advantage.</p></div></div><form onSubmit={createMemory}><label htmlFor="mem-title">TITLE</label><input id="mem-title" placeholder="e.g. Coffee with Maya" value={memoryTitle} onChange={e => setMemoryTitle(e.target.value)}/><label htmlFor="mem-content">DETAILS <span>OPTIONAL</span></label><textarea id="mem-content" placeholder="What would be useful to remember?" rows={4} value={memoryContent} onChange={e => setMemoryContent(e.target.value)}/><button className="primary-btn" type="submit"><Plus size={16}/> Save to library</button></form></GlassCard><div className="memory-list"><div className="list-heading"><div><h2>Your library</h2><p>{memories.length} {memories.length === 1 ? 'memory' : 'memories'} saved</p></div><span className="storage-tag"><Activity size={12}/> PRIVATE</span></div>{memories.length ? memories.map(m => <GlassCard key={m.id} className="memory-card"><div className="memory-card-icon"><FileText size={16}/></div><div className="memory-card-body"><h3>{m.title}</h3><p>{m.content || 'No extra details'}</p><time>{new Date(m.created_at).toLocaleDateString()}</time></div><button className="icon-btn delete-icon" aria-label="Delete memory" onClick={() => deleteMemory(m.id)}><Trash2 size={15}/></button></GlassCard>) : <GlassCard className="empty-library"><div className="empty-orbit"><BookOpen size={23}/></div><h3>Nothing tucked away yet</h3><p>Save a thought or useful detail. Navi can bring it back when you need it.</p><button onClick={() => document.getElementById('mem-title')?.focus()}>Save your first memory <ArrowUp size={14}/></button></GlassCard>}</div></div></section>}
    </main><FloatingCompanion onClick={() => { changeView('chat'); document.querySelector('textarea')?.focus() }}/>{toast && <div className="toast"><Check size={15}/>{toast}<button onClick={() => setToast('')}><X size={14}/></button></div>}
  </div>
}
