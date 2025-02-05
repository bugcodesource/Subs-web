import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/utils/db'
import { Message } from '@arco-design/web-vue'

interface RemoteConfigOption {
  label: string
  value: string
}

interface RemoteConfigGroup {
  label: string
  options: RemoteConfigOption[]
}

interface BackendConfig {
  value: string
}

interface ClientConfig {
  label: string
  value: string
}

const defaultRemoteConfig: RemoteConfigGroup[] = [
  {
    label: "universal",
    options: [
      {
        label: "No-Urltest",
        value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/universal/no-urltest.ini"
      },
      {
        label: "Urltest",
        value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/universal/urltest.ini"
      }
    ]
  },
  {
    label: "customized",
    options: [
      {
        label: "Maying",
        value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/maying.ini"
      },
      {
        label: "Ytoo",
        value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/ytoo.ini"
      }
    ]
  }
]

const defaultBackendConfig: BackendConfig[] = [
  {
    value: "http://10.10.11.6:20000/sub?"
  },
  {
    value: "https://sub.xeton.dev/sub?"
  },
  {
    value: "https://api.dler.io/sub?"
  }
]

const defaultClientConfig: ClientConfig[] = [
  { label: 'Clash', value: 'clash' },
  { label: 'Surge', value: 'surge&ver=4' },
  { label: 'Quantumult', value: 'quan' },
  { label: 'QuantumultX', value: 'quanx' },
  { label: 'Mellow', value: 'mellow' },
  { label: 'Surfboard', value: 'surfboard' },
  { label: 'Loon', value: 'loon' },
  { label: 'singbox', value: 'singbox' },
  { label: 'ss', value: 'ss' },
  { label: 'ssd', value: 'ssd' },
  { label: 'sssub', value: 'sssub' },
  { label: 'ssr', value: 'ssr' },
  { label: 'ClashR', value: 'clashr' },
  { label: 'V2Ray', value: 'v2ray' },
  { label: 'Trojan', value: 'trojan' },
  { label: 'Surge3', value: 'surge&ver=3' }
]

export const useConfigStore = defineStore('config', () => {
  const remoteConfig = ref<RemoteConfigGroup[]>(defaultRemoteConfig)
  const backendConfig = ref<BackendConfig[]>(defaultBackendConfig)
  const clientConfig = ref<ClientConfig[]>(defaultClientConfig)

  // 初始化远程配置
  const initRemoteConfig = async () => {
    try {
      const config = await db.getItem<RemoteConfigGroup[]>('remoteConfig')
      if (config) {
        remoteConfig.value = config
      }
    } catch (error) {
      console.error('初始化远程配置失败:', error)
      Message.error('初始化远程配置失败，使用默认配置')
    }
  }

  // 更新远程配置
  const updateRemoteConfig = async (config: RemoteConfigGroup[]) => {
    try {
      await db.setItem('remoteConfig', config)
      remoteConfig.value = config
    } catch (error) {
      console.error('更新远程配置失败:', error)
      Message.error('更新远程配置失败，请重试')
      throw error
    }
  }

  // 初始化后端配置
  const initBackendConfig = async () => {
    try {
      const config = await db.getItem<BackendConfig[]>('backendConfig')
      if (config) {
        backendConfig.value = config
      }
    } catch (error) {
      console.error('初始化后端配置失败:', error)
      Message.error('初始化后端配置失败，使用默认配置')
    }
  }

  // 更新后端配置
  const updateBackendConfig = async (config: BackendConfig[]) => {
    try {
      await db.setItem('backendConfig', config)
      backendConfig.value = config
    } catch (error) {
      console.error('更新后端配置失败:', error)
      Message.error('更新后端配置失败，请重试')
      throw error
    }
  }

  // 初始化客户端配置
  const initClientConfig = async () => {
    try {
      const config = await db.getItem<ClientConfig[]>('clientConfig')
      if (config) {
        clientConfig.value = config
      }
    } catch (error) {
      console.error('初始化客户端配置失败:', error)
      Message.error('初始化客户端配置失败，使用默认配置')
    }
  }

  // 更新客户端配置
  const updateClientConfig = async (config: ClientConfig[]) => {
    try {
      await db.setItem('clientConfig', config)
      clientConfig.value = config
    } catch (error) {
      console.error('更新客户端配置失败:', error)
      Message.error('更新客户端配置失败，请重试')
      throw error
    }
  }

  // 保存订阅链接
  const saveSourceSubUrl = async (url: string) => {
    try {
      await db.setItem('sourceSubUrl', url)
    } catch (error) {
      console.error('保存订阅链接失败:', error)
      throw error
    }
  }

  // 获取订阅链接
  const getSourceSubUrl = async (): Promise<string> => {
    try {
      const url = await db.getItem<string>('sourceSubUrl')
      return url || ''
    } catch (error) {
      console.error('获取订阅链接失败:', error)
      return ''
    }
  }

  return {
    remoteConfig,
    backendConfig,
    clientConfig,
    initRemoteConfig,
    updateRemoteConfig,
    initBackendConfig,
    updateBackendConfig,
    initClientConfig,
    updateClientConfig,
    saveSourceSubUrl,
    getSourceSubUrl
  }
}) 