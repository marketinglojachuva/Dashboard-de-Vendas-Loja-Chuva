import { Cloud, Database, FileSpreadsheet, LoaderCircle } from 'lucide-react'
import type { ImportedData } from '@/hooks/useImportHistory'

interface ImportHistoryPanelProps {
  imports: ImportedData[]
  loading: boolean
  remoteEnabled: boolean
  onSelect: (item: ImportedData) => void
}

export default function ImportHistoryPanel({ imports, loading, remoteEnabled, onSelect }: ImportHistoryPanelProps) {
  return <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><h2 className="text-lg font-black text-slate-950">Histórico de planilhas</h2><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider ${remoteEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{remoteEnabled ? <Cloud className="h-3 w-3" /> : <Database className="h-3 w-3" />}{remoteEnabled ? 'Supabase' : 'Local'}</span></div><p className="mt-1 text-sm text-slate-500">Selecione uma importação para carregar os dados no dashboard.</p></div><span className="text-xs font-bold text-slate-400">{imports.length} registro{imports.length === 1 ? '' : 's'}</span></div>
    {loading ? <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Carregando histórico...</div> : !imports.length ? <div className="rounded-2xl bg-slate-50 px-5 py-8 text-center"><FileSpreadsheet className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-500">Nenhuma planilha importada ainda.</p></div> : <div className="grid gap-3 md:grid-cols-2">{imports.slice(0, 8).map((item) => <button key={item.id} onClick={() => onSelect(item)} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-amber-300 hover:bg-amber-50/40"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-300"><FileSpreadsheet className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-sm font-bold text-slate-900">{item.filename}</span><span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase text-amber-800">{item.period === 'current' ? 'Atual' : 'Anterior'}</span></span><span className="mt-1 block text-xs text-slate-400">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.importedAt))} · {item.summary.totalAds} anúncios</span></span></button>)}</div>}
    {imports.length > 8 ? <p className="mt-4 text-center text-xs text-slate-400">Mostrando as 8 importações mais recentes. Acesse o histórico completo para ver todas.</p> : null}
  </section>
}
