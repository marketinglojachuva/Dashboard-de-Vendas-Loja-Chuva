import { useEffect, useState } from 'react'
import type { SaleRow, SalesPeriod, SalesSummary } from '@/types/sales'
import { isSupabaseConfigured } from '@/lib/supabase'
import { listRemoteImports, removeRemoteImport, saveRemoteImport } from '@/services/importHistoryService'

export interface ImportedData {
  id: string
  filename: string
  importedAt: string
  period: SalesPeriod
  data: SaleRow[]
  summary: SalesSummary
}

const DB_NAME = 'VendasDashboard'
const STORE_NAME = 'imports'

function sortImports(items: ImportedData[]) {
  return [...items].sort((a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime())
}

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
  })
}

async function getLocalImports(): Promise<ImportedData[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([STORE_NAME], 'readonly').objectStore(STORE_NAME).getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(sortImports(request.result as ImportedData[]))
  })
}

async function putLocalImport(importData: ImportedData): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    transaction.objectStore(STORE_NAME).put(importData)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

async function deleteLocalImport(id: string): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    transaction.objectStore(STORE_NAME).delete(id)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

function useImportHistory() {
  const [imports, setImports] = useState<ImportedData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadImports = async () => {
    setLoading(true)
    try {
      const localImports = await getLocalImports()
      if (isSupabaseConfigured) {
        try {
          const remoteImports = await listRemoteImports()
          setImports(remoteImports.length ? remoteImports : localImports)
          setError(null)
        } catch (remoteError) {
          setImports(localImports)
          setError(remoteError instanceof Error ? `Supabase indisponível; usando histórico local. ${remoteError.message}` : 'Supabase indisponível; usando histórico local.')
        }
      } else {
        setImports(localImports)
        setError(null)
      }
    } catch (localError) {
      setError(localError instanceof Error ? localError.message : 'Erro ao carregar o histórico.')
    } finally {
      setLoading(false)
    }
  }

  const addImport = async (importData: ImportedData): Promise<{ remoteSaved: boolean }> => {
    await putLocalImport(importData)
    let remoteSaved = !isSupabaseConfigured
    if (isSupabaseConfigured) {
      try {
        await saveRemoteImport(importData)
        remoteSaved = true
      } catch (remoteError) {
        setError(remoteError instanceof Error ? `Importação salva localmente, mas não no Supabase: ${remoteError.message}` : 'Importação salva localmente, mas não no Supabase.')
      }
    }
    await loadImports()
    return { remoteSaved }
  }

  const removeImport = async (id: string) => {
    await deleteLocalImport(id)
    if (isSupabaseConfigured) {
      try {
        await removeRemoteImport(id)
      } catch (remoteError) {
        setError(remoteError instanceof Error ? `Não foi possível excluir no Supabase: ${remoteError.message}` : 'Não foi possível excluir no Supabase.')
      }
    }
    await loadImports()
  }

  useEffect(() => {
    void loadImports()
  }, [])

  return { imports, loading, error, addImport, removeImport, loadImports, isRemoteEnabled: isSupabaseConfigured }
}

export default useImportHistory
