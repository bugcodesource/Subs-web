import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface ConfigDB extends DBSchema {
  remoteConfig: {
    key: string;
    value: any;
  };
  backendConfig: {
    key: string;
    value: any;
  };
  sourceSubUrl: {
    key: string;
    value: string;
  };
}

class DBService {
  private db: Promise<IDBPDatabase<ConfigDB>>
  private static instance: DBService

  private constructor() {
    this.db = this.initDB()
  }

  static getInstance(): DBService {
    if (!DBService.instance) {
      DBService.instance = new DBService()
    }
    return DBService.instance
  }

  private async initDB() {
    return await openDB<ConfigDB>('subconverter-config', 1, {
      upgrade(db) {
        // 创建存储对象
        if (!db.objectStoreNames.contains('remoteConfig')) {
          db.createObjectStore('remoteConfig')
        }
        if (!db.objectStoreNames.contains('backendConfig')) {
          db.createObjectStore('backendConfig')
        }
        if (!db.objectStoreNames.contains('sourceSubUrl')) {
          db.createObjectStore('sourceSubUrl')
        }
      }
    })
  }

  async getItem(storeName: 'remoteConfig' | 'backendConfig' | 'sourceSubUrl', key: string): Promise<any> {
    const db = await this.db
    const data = await db.get(storeName, key)
    return data ? JSON.parse(data) : null
  }

  async setItem(storeName: 'remoteConfig' | 'backendConfig' | 'sourceSubUrl', key: string, value: any): Promise<void> {
    const db = await this.db
    await db.put(storeName, JSON.stringify(value), key)
  }

  async removeItem(storeName: 'remoteConfig' | 'backendConfig' | 'sourceSubUrl', key: string): Promise<void> {
    const db = await this.db
    await db.delete(storeName, key)
  }

  async clear(storeName: 'remoteConfig' | 'backendConfig' | 'sourceSubUrl'): Promise<void> {
    const db = await this.db
    await db.clear(storeName)
  }
}

export const dbService = DBService.getInstance() 