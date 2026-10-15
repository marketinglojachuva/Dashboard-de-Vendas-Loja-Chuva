import type { ImportedData } from '@/hooks/useImportHistory'
import type { SalesPeriod } from '@/types/sales'
import { supabase } from '@/lib/supabase'

interface RemoteImport {
  id: string
  data_importacao: string
  periodo_referencia: string
  payload_dados: ImportedData['data'] | { filename?: string; data?: ImportedData['data']; summary?: ImportedData['summary'] }
}

function payloadToImportedData(row: RemoteImport): ImportedData {
  const payload = row.payload_dados
  const isWrappedPayload = !Array.isArray(payload)
  const data = (isWrappedPayload ? payload.data : payload) ?? []
  const summary = isWrappedPayload && payload.summary ? payload.summary : {
    totalUnits: data.reduce((sum, item) => sum + item.unitsSold, 0),
    totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
    totalAds: new Set(data.map((item) => item.adId)).size,
    totalRows: data.length,
  }

  return {
    id: row.id,
    filename: isWrappedPayload ? payload.filename ?? 'Importação Supabase' : 'Importação Supabase',
    importedAt: row.data_importacao,
    period: row.periodo_referencia === 'Semana Atual' || row.periodo_referencia === 'current' ? 'current' : 'previous',
    data,
    summary,
  }
}

export async function listRemoteImports(): Promise<ImportedData[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('historico_importacoes_ml')
    .select('id, data_importacao, periodo_referencia, payload_dados')
    .order('data_importacao', { ascending: false })
  if (error) throw error
  return ((data ?? []) as RemoteImport[]).map(payloadToImportedData)
}

export async function saveRemoteImport(importData: ImportedData): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('historico_importacoes_ml').upsert({
    id: importData.id,
    data_importacao: importData.importedAt,
    periodo_referencia: importData.period === 'current' ? 'Semana Atual' : 'Período Anterior',
    payload_dados: {
      filename: importData.filename,
      data: importData.data,
      summary: importData.summary,
    },
  })
  if (error) throw error
}

export async function removeRemoteImport(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('historico_importacoes_ml').delete().eq('id', id)
  if (error) throw error
}

export function periodLabelToType(period: string): SalesPeriod {
  return period === 'Semana Atual' || period === 'current' ? 'current' : 'previous'
}
