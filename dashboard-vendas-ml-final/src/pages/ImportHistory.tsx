import { useState } from 'react'
import { ArrowLeft, Eye, ExternalLink, Trash2 } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import useImportHistory, { type ImportedData } from '@/hooks/useImportHistory'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ImportHistory() {
  const { imports, loading, removeImport } = useImportHistory()
  const [selectedImport, setSelectedImport] = useState<ImportedData | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta importação?')) {
      await removeImport(id)
      toast.success('Importação excluída.')
    }
  }

  return <div className="min-h-screen bg-[#f5f7fa] px-5 py-8 text-slate-900 lg:px-8"><div className="mx-auto max-w-5xl">
    <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Voltar ao dashboard</a>
    <div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Dados locais</p><h1 className="text-3xl font-black tracking-tight text-slate-950">Histórico de importações</h1><p className="mt-2 text-sm text-slate-500">{imports.length} importação{imports.length === 1 ? '' : 'ões'} salva{imports.length === 1 ? '' : 's'} neste navegador.</p></div>
    {loading ? <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-500 shadow-sm">Carregando histórico...</div> : !imports.length ? <div className="rounded-2xl bg-white p-12 text-center shadow-sm"><p className="font-bold text-slate-700">Nenhuma planilha importada ainda.</p><a href="/" className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Ir para o dashboard</a></div> : <div className="space-y-4">{imports.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black text-slate-950">{item.filename}</h2><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800">{item.period === 'current' ? 'Semana atual' : 'Período anterior'}</span></div><p className="mt-1 text-xs text-slate-400">Importado {formatDistanceToNow(new Date(item.importedAt), { addSuffix: true, locale: ptBR })}</p></div><div className="flex gap-2"><a href={`/?importId=${encodeURIComponent(item.id)}`} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"><ExternalLink className="h-4 w-4" /> Abrir</a><button onClick={() => setSelectedImport(item)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><Eye className="h-4 w-4" /> Detalhes</button><button onClick={() => void handleDelete(item.id)} className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50" aria-label="Excluir importação"><Trash2 className="h-4 w-4" /></button></div></div><div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4"><div><p className="text-xs text-slate-400">Unidades</p><p className="mt-1 font-black">{item.summary.totalUnits}</p></div><div><p className="text-xs text-slate-400">Faturamento</p><p className="mt-1 font-black">{currency.format(item.summary.totalRevenue)}</p></div><div><p className="text-xs text-slate-400">Anúncios</p><p className="mt-1 font-black">{item.summary.totalAds}</p></div><div><p className="text-xs text-slate-400">Linhas</p><p className="mt-1 font-black">{item.summary.totalRows}</p></div></div></article>)}</div>}

    {selectedImport ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-100 p-5"><div><h2 className="font-black text-slate-950">{selectedImport.filename}</h2><p className="mt-1 text-xs text-slate-400">{format(new Date(selectedImport.importedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p></div><button onClick={() => setSelectedImport(null)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50">Fechar</button></div><div className="max-h-[65vh] overflow-auto p-5"><table className="w-full min-w-[620px] text-left text-sm"><thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-400"><tr><th className="px-3 py-3">Anúncio</th><th className="px-3 py-3">Título</th><th className="px-3 py-3 text-right">Unidades</th><th className="px-3 py-3 text-right">Faturamento</th></tr></thead><tbody className="divide-y divide-slate-100">{selectedImport.data.slice(0, 100).map((row) => <tr key={`${row.adId}-${row.title}`}><td className="px-3 py-3 font-bold">{row.adId}</td><td className="max-w-[320px] truncate px-3 py-3">{row.title}</td><td className="px-3 py-3 text-right">{row.unitsSold}</td><td className="px-3 py-3 text-right">{currency.format(row.revenue)}</td></tr>)}</tbody></table>{selectedImport.data.length > 100 ? <p className="mt-4 text-xs text-slate-400">Mostrando 100 de {selectedImport.data.length} linhas.</p> : null}</div></div></div> : null}
  </div></div>
}
