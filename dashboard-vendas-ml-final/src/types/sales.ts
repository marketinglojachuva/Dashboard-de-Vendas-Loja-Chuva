export type SalesPeriod = 'current' | 'previous'

export interface SaleRow {
  adId: string
  title: string
  unitsSold: number
  price: number
  revenue: number
  source: Record<string, unknown>
}

export interface AggregatedSale {
  adId: string
  title: string
  currentUnits: number
  previousUnits: number
  currentRevenue: number
  previousRevenue: number
  variation: number | null
}

export interface SalesSummary {
  totalUnits: number
  totalRevenue: number
  totalAds: number
  totalRows: number
}
