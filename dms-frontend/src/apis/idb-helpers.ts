// IndexedDB helper for file caching
const fileCacheDBName = 'file-cache-db-v1'
const fileCacheStore = 'files'

const openFileCacheDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(fileCacheDBName, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(fileCacheStore)) {
        db.createObjectStore(fileCacheStore)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export interface FileCacheRecord {
  etag: string
  blob: Blob
}

export const setFileCache = async (fileId: string, record: FileCacheRecord) => {
  const db = await openFileCacheDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(fileCacheStore, 'readwrite')
    tx.objectStore(fileCacheStore).put(record, fileId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export const getFileCache = async (fileId: string): Promise<FileCacheRecord | undefined> => {
  const db = await openFileCacheDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(fileCacheStore, 'readonly').objectStore(fileCacheStore).get(fileId)
    req.onsuccess = () => resolve(req.result as FileCacheRecord | undefined)
    req.onerror = () => reject(req.error)
  })
}
