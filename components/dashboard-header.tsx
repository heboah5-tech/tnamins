"use client"

import { Bell, CircleHelp, Search, Settings } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="h-14 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <img
          src="https://tse2.mm.bing.net/th/id/OIP.Q6RoywSIxzTk4FmYcrdZBAHaDG?rs=1&pid=ImgDetMain&o=7&rm=3"
          alt="bCare"
          className="h-7 w-auto"
        />
        <div className="h-6 w-px bg-slate-200" />
        <span className="text-sm font-black text-slate-800">صندوق الوارد</span>
        <span className="hidden sm:inline text-[10px] text-slate-400 font-bold">لوحة التحكم</span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-400">
        <button aria-label="بحث" className="p-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"><Search size={16} /></button>
        <button aria-label="الإشعارات" className="p-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"><Bell size={16} /></button>
        <button aria-label="المساعدة" className="hidden sm:block p-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"><CircleHelp size={16} /></button>
        <button aria-label="الإعدادات" className="p-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"><Settings size={16} /></button>
      </div>
    </header>
  )
}
