import { useRef, useState } from 'react'
import { FileSpreadsheet, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import useImportHistory, { type ImportedData } from '@/hooks/useImportHistory'
import { readSalesFile, summarizeSales } from '@/utils/sales'
import type { SalesPeriod } from '@/types/sales'

interface ExcelImportDialogProps {
  open: boolean
  period: SalesPeriod
  onOpenChange: (open: boolean) => void
  onImportSuccess?: (data: ImportedData) => void
}

const periodLabels: Record<SalesPeriod, string> = {
  current: 'Semana Atual',
  previous: 'Período Anterior',
}

export default function ExcelImportDialog({ open, period, onOpenChange, onImportSuccess }: ExcelImportDialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addImport } = useImportHistory()

  const processFile = async (file: File) => {
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      toast.error('Selecione um arquivo .xlsx, .xls ou .csv.')
      return
    }
    try {
      setIsLoading(true)
      const { rows } = await readSalesFile(file)
      const importData: ImportedData = {
        id: `import_${period}_${Date.now()}`,
        filename: file.name,
        importedAt: new Date().toISOString(),
        period,
        data: rows,
        summary: summarizeSales(rows),
      }
      const { remoteSaved } = await addImport(importData)
      if (remoteSaved) {
        toast.success(`${periodLabels[period]} importada e salva no histórico.`)
      } else {
        toast.warning(`${periodLabels[period]} salva localmente. Verifique a conexão com o Supabase.`)
      }
      onImportSuccess?.(importData)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível processar a planilha.')
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) void processFile(file)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Importação</p>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">{periodLabels[period]}</h2>
            <p className="mt-1 text-sm text-slate-500">Carregue a exportação correspondente a este período.</p>
          </div>
          <button onClick={() => onOpenChange(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/50'}`}
        >
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={(event) => { const file = event.target.files?.[0]; if (file) void processFile(file) }} className="hidden" disabled={isLoading} />
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-amber-300">
            {isLoading ? <Upload className="h-6 w-6 animate-pulse" /> : <FileSpreadsheet className="h-6 w-6" />}
          </div>
          <p className="font-bold text-slate-900">{isLoading ? 'Processando planilha...' : 'Clique ou arraste sua planilha aqui'}</p>
          <p className="mt-2 text-sm text-slate-500">Arquivos .xlsx, .xls e .csv · primeira aba</p>
        </div>

        <button onClick={() => onOpenChange(false)} disabled={isLoading} className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
      </div>
    </div>
  )
}
