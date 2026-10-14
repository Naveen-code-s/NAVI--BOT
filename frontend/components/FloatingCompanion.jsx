import { Sparkles } from 'lucide-react'
export default function FloatingCompanion({ onClick }) { return <button className="floating-companion" onClick={onClick} aria-label="Talk to Navi"><Sparkles size={19}/><span className="companion-pulse"/></button> }
