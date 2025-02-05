class DB {
  private db: IDBDatabase | null = null
  private readonly dbName: string = 'subconverter'
  private readonly version: number = 1
  private readonly storeName: string = 'config'

  constructor() {
    this.init()
  }

  private init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error('无法打开数据库'))
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })
  }

  async setItem(key: string, value: any): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const serializedValue = JSON.stringify(value)
        const request = store.put(serializedValue, key)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('保存数据失败'))
      } catch (error) {
        reject(error)
      }
    })
  }

  async getItem<T>(key: string): Promise<T | null> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.get(key)

        request.onsuccess = () => {
          if (!request.result) {
            resolve(null)
            return
          }

          // 尝试解析JSON字符串
          try {
            const value = JSON.parse(request.result)
            resolve(value as T)
          } catch {
            // 如果解析失败，说明是旧数据，直接返回
            resolve(request.result as T)
          }
        }
        request.onerror = () => reject(new Error('获取数据失败'))
      } catch (error) {
        reject(error)
      }
    })
  }

  async removeItem(key: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.delete(key)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('删除数据失败'))
      } catch (error) {
        reject(error)
      }
    })
  }

  async clear(): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('清空数据失败'))
      } catch (error) {
        reject(error)
      }
    })
  }
}

export const db = new DB() 