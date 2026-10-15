import * as XLSX from 'xlsx'
import type { AggregatedSale, SaleRow, SalesSummary } from '@/types/sales'

const aliases = {
  adId: ['número do anúncio', 'numero do anuncio', 'número do anúncio mlb', 'numero do anuncio mlb', 'mlb', 'id do anúncio', 'id do anuncio', 'item id', 'listing id', 'código do anúncio', 'codigo do anuncio'],
  title: ['título do anúncio', 'titulo do anuncio', 'título', 'titulo', 'produto', 'producto', 'product', 'title'],
  unitsSold: ['unidades vendidas', 'unidades', 'quantidade', 'quantity', 'vendas', 'sales', 'units sold'],
  price: ['preço', 'preco', 'price', 'valor unitário', 'valor unitario', 'unit price'],
  revenue: ['faturamento total', 'faturamento', 'receita', 'valor total', 'total', 'revenue', 'total sales'],
} as const

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function findColumn(headers: string[], candidates: readonly string[]): string | undefined {
  const normalizedHeaders = headers.map((header) => ({ original: header, normalized: normalizeText(header) }))
  const normalizedCandidates = candidates.map(normalizeText)
  return normalizedHeaders.find(({ normalized }) => normalizedCandidates.includes(normalized))?.original
    ?? normalizedHeaders.find(({ normalized }) => normalizedCandidates.some((candidate) => normalized.includes(candidate)))?.original
}

export function parseNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const raw = String(value ?? '').trim().replace(/[^0-9,.-]/g, '')
  if (!raw) return 0

  const hasComma = raw.includes(',')
  const hasDot = raw.includes('.')
  const normalized = hasComma && hasDot
    ? (raw.lastIndexOf(',') > raw.lastIndexOf('.') ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/,/g, ''))
    : hasComma
      ? raw.replace(',', '.')
      : raw

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function parseSpreadsheetRows(rows: Record<string, unknown>[]): SaleRow[] {
  if (!rows.length) return []
  const headers = Object.keys(rows[0])
  const columns = {
    adId: findColumn(headers, aliases.adId),
    title: findColumn(headers, aliases.title),
    unitsSold: findColumn(headers, aliases.unitsSold),
    price: findColumn(headers, aliases.price),
    revenue: findColumn(headers, aliases.revenue),
  }

  if (!columns.adId || !columns.unitsSold) {
    throw new Error('Não encontramos as colunas de Número do Anúncio (MLB) e Unidades Vendidas.')
  }

  return rows
    .map((row) => {
      const adId = String(row[columns.adId!] ?? '').trim()
      const unitsSold = parseNumber(row[columns.unitsSold!])
      const price = columns.price ? parseNumber(row[columns.price]) : 0
      const revenueValue = columns.revenue ? parseNumber(row[columns.revenue]) : 0
      return {
        adId,
        title: String((columns.title && row[columns.title]) ?? adId).trim() || adId,
        unitsSold,
        price,
        revenue: revenueValue || price * unitsSold,
        source: row,
      }
    })
    .filter((row) => row.adId && (row.unitsSold !== 0 || row.revenue !== 0))
}

export async function readSalesFile(file: File): Promise<{ rows: SaleRow[]; rawRows: Record<string, unknown>[] }> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!firstSheet) throw new Error('A planilha não possui uma aba válida.')
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' })
  const rows = parseSpreadsheetRows(rawRows)
  if (!rows.length) throw new Error('Arquivo vazio ou sem linhas de vendas válidas.')
  return { rows, rawRows }
}

export function summarizeSales(rows: SaleRow[]): SalesSummary {
  return {
    totalUnits: rows.reduce((sum, row) => sum + row.unitsSold, 0),
    totalRevenue: rows.reduce((sum, row) => sum + row.revenue, 0),
    totalAds: new Set(rows.map((row) => row.adId)).size,
    totalRows: rows.length,
  }
}

export function groupByAd(rows: SaleRow[]): Map<string, SaleRow> {
  return rows.reduce((grouped, row) => {
    const existing = grouped.get(row.adId)
    if (existing) {
      existing.unitsSold += row.unitsSold
      existing.revenue += row.revenue
      existing.price = existing.price || row.price
    } else {
      grouped.set(row.adId, { ...row })
    }
    return grouped
  }, new Map<string, SaleRow>())
}

export function comparePeriods(currentRows: SaleRow[], previousRows: SaleRow[]): AggregatedSale[] {
  const current = groupByAd(currentRows)
  const previous = groupByAd(previousRows)
  const ids = new Set([...current.keys(), ...previous.keys()])

  return [...ids].map((adId) => {
    const currentSale = current.get(adId)
    const previousSale = previous.get(adId)
    const currentUnits = currentSale?.unitsSold ?? 0
    const previousUnits = previousSale?.unitsSold ?? 0
    const variation = previousUnits === 0 ? (currentUnits > 0 ? null : 0) : ((currentUnits - previousUnits) / previousUnits) * 100

    return {
      adId,
      title: currentSale?.title || previousSale?.title || adId,
      currentUnits,
      previousUnits,
      currentRevenue: currentSale?.revenue ?? 0,
      previousRevenue: previousSale?.revenue ?? 0,
      variation,
    }
  }).sort((a, b) => (a.variation ?? 0) - (b.variation ?? 0))
}
