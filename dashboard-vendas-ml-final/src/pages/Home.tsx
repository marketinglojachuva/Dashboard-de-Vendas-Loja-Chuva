import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, BarChart3, History, Package, RefreshCw, Search, TrendingDown, TrendingUp, Upload, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import ExcelImportDialog from '@/components/ExcelImportDialog'
import ImportHistoryPanel from '@/components/ImportHistoryPanel'
import useImportHistory, { type ImportedData } from '@/hooks/useImportHistory'
import { comparePeriods } from '@/utils/sales'
import type { AggregatedSale, SalesPeriod } from '@/types/sales'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const integer = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail: string; icon: typeof TrendingUp; tone: string }) {
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
    <div className="mb-5 flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">{label}</span><span className={`rounded-xl p-2.5 ${tone}`}><Icon className="h-5 w-5" /></span></div>
    <p className="text-2xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p>
  </div>
}

function Variation({ value }: { value: number | null }) {
  if (value === null) return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">Novo</span>
  const isUp = value > 0
  const isDown = value < 0
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${isUp ? 'bg-emerald-50 text-emerald-700' : isDown ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
    {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : isDown ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}{value > 0 ? '+' : ''}{value.toFixed(1).replace('.', ',')}%
  </span>
}

export default function Home() {
  const { imports, error: historyError, isRemoteEnabled, loading: historyLoading } = useImportHistory()
  const [currentImport, setCurrentImport] = useState<ImportedData | null>(null)
  const [previousImport, setPreviousImport] = useState<ImportedData | null>(null)
  const [dialogPeriod, setDialogPeriod] = useState<SalesPeriod | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'down'>('all')

  useEffect(() => {
    const selectedId = new URLSearchParams(window.location.search).get('importId')
    const selectedImport = selectedId ? imports.find((item) => item.id === selectedId) : undefined
    if (selectedImport) {
      if (selectedImport.period === 'current') setCurrentImport(selectedImport)
      else setPreviousImport(selectedImport)
    } else {
      if (!currentImport) setCurrentImport(imports.find((item) => item.period === 'current') ?? null)
      if (!previousImport) setPreviousImport(imports.find((item) => item.period === 'previous') ?? null)
    }
  }, [imports, currentImport, previousImport])

  const comparison = useMemo(() => comparePeriods(currentImport?.data ?? [], previousImport?.data ?? []), [currentImport, previousImport])
  const filteredRows = useMemo(() => comparison.filter((row) => {
    const matchesQuery = `${row.title} ${row.adId}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (filter === 'all' || (row.variation !== null && row.variation < 0))
  }), [comparison, filter, query])
  const drops = comparison.filter((row) => row.variation !== null && row.variation < 0)
  const currentSummary = currentImport?.summary
  const previousSummary = previousImport?.summary
  const totalVariation = previousSummary?.totalUnits ? ((currentSummary?.totalUnits ?? 0) - previousSummary.totalUnits) / previousSummary.totalUnits * 100 : null

  const handleImportSuccess = (data: ImportedData) => {
    if (data.period === 'current') setCurrentImport(data)
    else setPreviousImport(data)
    toast.success(`${data.summary.totalAds} anúncios prontos para análise.`)
  }

  const handleHistorySelect = (data: ImportedData) => {
    if (data.period === 'current') setCurrentImport(data)
    else setPreviousImport(data)
    toast.success(`${data.filename} carregada no período ${data.period === 'current' ? 'atual' : 'anterior'}.`)
  }

  const periodButton = (period: SalesPeriod, label: string, data: ImportedData | null) => <button onClick={() => setDialogPeriod(period)} className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${data ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{data ? <RefreshCw className="h-5 w-5" /> : <Upload className="h-5 w-5" />}</span>
    <span className="min-w-0"><span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span><span className="mt-0.5 block truncate text-sm font-bold text-slate-900">{data?.filename ?? 'Adicionar planilha'}</span></span>
  </button>

  return <div className="min-h-screen bg-[#f5f7fa] text-slate-900">
    <header className="border-b border-slate-800 bg-slate-950 text-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
      <div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950"><BarChart3 className="h-5 w-5" /></span><div><p className="text-lg font-black tracking-tight">Mercado<span className="text-amber-400">Pulse</span></p><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Sales intelligence</p></div></div></div>
      <a href="/historico" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"><History className="h-4 w-4" /> Histórico</a>
    </div></header>

    <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Performance comercial</p><h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Visão geral de vendas</h1><p className="mt-2 max-w-xl text-sm text-slate-500">Compare períodos e encontre rapidamente os anúncios que precisam de atenção.</p></div><div className="flex gap-3">{periodButton('current', 'Semana Atual', currentImport)}{periodButton('previous', 'Período Anterior', previousImport)}</div></div>

      {!currentImport && !previousImport ? <div className="mb-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Upload className="h-6 w-6" /></div><h2 className="text-xl font-black text-slate-950">Comece pela sua primeira planilha</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Importe a Semana Atual e, em seguida, o Período Anterior para ativar a comparação de desempenho.</p></div> : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="Unidades atuais" value={integer.format(currentSummary?.totalUnits ?? 0)} detail={totalVariation === null ? 'Aguardando período anterior' : `${totalVariation >= 0 ? '+' : ''}${totalVariation.toFixed(1).replace('.', ',')}% vs. anterior`} icon={Package} tone="bg-amber-100 text-amber-700" /><MetricCard label="Faturamento atual" value={currency.format(currentSummary?.totalRevenue ?? 0)} detail="Soma do faturamento total" icon={Wallet} tone="bg-emerald-100 text-emerald-700" /><MetricCard label="Anúncios analisados" value={integer.format(comparison.length)} detail={`${currentSummary?.totalRows ?? 0} linhas normalizadas`} icon={BarChart3} tone="bg-blue-100 text-blue-700" /><MetricCard label="Anúncios em queda" value={integer.format(drops.length)} detail="Prioridade para Ads ou preço" icon={TrendingDown} tone="bg-red-100 text-red-700" /></div>

      {historyError ? <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{historyError}</div> : null}
      <div className="mb-8"><ImportHistoryPanel imports={imports} loading={historyLoading} remoteEnabled={isRemoteEnabled} onSelect={handleHistorySelect} /></div>

      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between"><div><h2 className="text-lg font-black text-slate-950">Desempenho por anúncio</h2><p className="mt-1 text-sm text-slate-500">Quedas ficam destacadas para facilitar sua priorização.</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar anúncio ou MLB" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-amber-400 sm:w-56" /></label><div className="flex rounded-xl bg-slate-100 p-1"><button onClick={() => setFilter('all')} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Todos</button><button onClick={() => setFilter('down')} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${filter === 'down' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500'}`}>Quedas</button></div></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4 font-bold">Produto / anúncio</th><th className="px-5 py-4 text-right font-bold">Semana atual</th><th className="px-5 py-4 text-right font-bold">Período anterior</th><th className="px-5 py-4 text-right font-bold">Variação</th><th className="px-5 py-4 text-right font-bold">Ação</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredRows.map((row: AggregatedSale) => <tr key={row.adId} className={row.variation !== null && row.variation < 0 ? 'bg-red-50/60' : 'hover:bg-slate-50'}><td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${row.variation !== null && row.variation < 0 ? 'bg-red-500' : 'bg-emerald-500'}`} /><div><p className="max-w-[330px] truncate text-sm font-bold text-slate-900">{row.title}</p><p className="mt-0.5 text-xs font-medium text-slate-400">{row.adId}</p></div></div></td><td className="px-5 py-4 text-right text-sm font-bold text-slate-900">{integer.format(row.currentUnits)}</td><td className="px-5 py-4 text-right text-sm text-slate-500">{integer.format(row.previousUnits)}</td><td className="px-5 py-4 text-right"><Variation value={row.variation} /></td><td className="px-5 py-4 text-right">{row.variation !== null && row.variation < 0 ? <span className="text-xs font-bold text-red-700">Revisar</span> : <span className="text-xs font-semibold text-slate-400">Monitorar</span>}</td></tr>)}</tbody></table></div>
        {!filteredRows.length ? <div className="px-6 py-14 text-center"><TrendingUp className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-700">{comparison.length ? 'Nenhum anúncio corresponde ao filtro.' : 'Importe os dois períodos para visualizar a comparação.'}</p></div> : null}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-400"><span>{filteredRows.length} anúncio{filteredRows.length === 1 ? '' : 's'} exibido{filteredRows.length === 1 ? '' : 's'}</span>{drops.length > 0 ? <span className="inline-flex items-center gap-1 font-semibold text-red-600"><TrendingDown className="h-3.5 w-3.5" /> {drops.length} queda{drops.length === 1 ? '' : 's'} identificada{drops.length === 1 ? '' : 's'}</span> : null}</div>
      </section>
    </main>

    <ExcelImportDialog open={dialogPeriod !== null} period={dialogPeriod ?? 'current'} onOpenChange={(open) => { if (!open) setDialogPeriod(null) }} onImportSuccess={handleImportSuccess} />
  </div>
}
