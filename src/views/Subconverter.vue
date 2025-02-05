<!--
 * @file Subconverter.vue
 * @description 订阅转换器组件，用于将各种格式的订阅链接转换为不同客户端支持的格式
 * @author Your Name
 * @created 2024-02-05
-->

<template>
  <!-- 订阅转换器容器 -->
  <div class="subconverter-container">
    <!-- 主要内容区域 -->
    <a-row style="margin-top: 10px">
      <a-col>
        <a-card>
          <!-- 卡片标题区域 -->
          <template #title>
            Subscription Converter
            <!-- GitHub 项目链接 -->
            <icon-github style="margin-left: 20px; cursor: pointer" @click="goToProject" />
            <!-- 远程配置管理按钮 -->
            <a-button 
              type="text" 
              style="margin-left: 20px"
              @click="$router.push('/setting')">
              <template #icon><icon-settings /></template>
              远程配置管理
            </a-button>
          </template>

          <!-- 转换表单 -->
          <a-form :model="form" layout="vertical" style="width: 100%">
            <!-- 订阅链接输入框 -->
            <a-form-item label="订阅链接:">
              <a-textarea v-model="form.sourceSubUrl" :rows="3"
                placeholder="支持订阅或ss/ssr/vmess链接，多个链接每行一个或用 | 分隔" @blur="saveSubUrl" />
            </a-form-item>

            <!-- 客户端选择 -->
            <a-form-item label="客户端:">
              <a-select v-model="form.clientType" style="width: 100%">
                <a-option v-for="item in configStore.clientConfig" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-option>
              </a-select>
            </a-form-item>

            <!-- 后端地址配置 -->
            <a-form-item label="后端地址:">
              <a-auto-complete
                style="width: 100%"
                v-model="form.customBackend"
                :filter-option="false"
                :data="filteredBackends"
                placeholder="动动小手，（建议）自行搭建后端服务。例：http://127.0.0.1:25500/sub?">
                <template #suffix>
                  <a-button type="text" @click="gotoGayhub">
                    <template #icon><icon-link/></template>
                    前往项目仓库
                  </a-button>
                </template>
              </a-auto-complete>
            </a-form-item>

            <!-- 远程配置选择 -->
            <a-form-item label="远程配置:">
              <a-select v-model="form.remoteConfig" placeholder="请选择" style="width: 100%">
                <template v-if="remoteConfig && remoteConfig.length > 0">
                  <template v-for="group in remoteConfig" :key="group.label">
                    <a-optgroup :label="group.label">
                      <a-option v-for="item in group.options" :key="item.value" :value="item.value">
                        {{ item.label }}
                      </a-option>
                    </a-optgroup>
                  </template>
                </template>
                <template #suffix>
                  <a-space>
                    <a-button type="text" @click="gotoRemoteConfig">
                      <template #icon><icon-link /></template>
                      配置示例
                    </a-button>
                    <a-button type="text" @click="$router.push('/setting')">
                      <template #icon><icon-settings /></template>
                      配置管理
                    </a-button>
                  </a-space>
                </template>
              </a-select>
            </a-form-item>

            <!-- 节点过滤选项 -->
            <a-form-item label="Include:">
              <a-input v-model="form.includeRemarks" placeholder="节点名包含的关键字，支持正则" />
            </a-form-item>

            <a-form-item label="Exclude:">
              <a-input v-model="form.excludeRemarks" placeholder="节点名不包含的关键字，支持正则" />
            </a-form-item>

            <!-- 文件名设置 -->
            <a-form-item label="FileName:">
              <a-input v-model="form.filename" placeholder="返回的订阅文件名" />
            </a-form-item>

            <!-- 其他选项设置 -->
            <a-form-item>
              <a-space>
                <!-- 基本选项 -->
                <a-checkbox v-model="form.nodeList">输出为 Node List</a-checkbox>
                
                <!-- 更多选项下拉框 -->
                <a-popover position="bottom">
                  <a-button>更多选项</a-button>
                  <template #content>
                    <a-space direction="vertical">
                      <a-checkbox v-model="form.emoji">Emoji</a-checkbox>
                      <a-checkbox v-model="form.scv">跳过证书验证</a-checkbox>
                      <a-checkbox v-model="form.udp" @change="needUdp = true">启用 UDP</a-checkbox>
                      <a-checkbox v-model="form.appendType">节点类型</a-checkbox>
                      <a-checkbox v-model="form.sort">排序节点</a-checkbox>
                      <a-checkbox v-model="form.fdn">过滤非法节点</a-checkbox>
                      <a-checkbox v-model="form.expand">规则展开</a-checkbox>
                    </a-space>
                  </template>
                </a-popover>

                <!-- 定制功能下拉框 -->
                <a-popover position="bottom">
                  <a-button>定制功能</a-button>
                  <template #content>
                    <a-space direction="vertical">
                      <a-checkbox v-model="form.tpl.surge.doh">Surge.DoH</a-checkbox>
                      <a-checkbox v-model="form.tpl.clash.doh">Clash.DoH</a-checkbox>
                      <a-checkbox v-model="form.insert">网易云</a-checkbox>
                    </a-space>
                  </template>
                </a-popover>
              </a-space>
            </a-form-item>

            <!-- 分隔线 -->
            <a-divider>
              <icon-bulb />
            </a-divider>

            <!-- 生成的订阅链接 -->
            <a-form-item label="定制订阅:">
              <a-input-group>
                <a-input readonly v-model="customSubUrl">
                  <template #suffix>
                    <a-button @click="copyToClipboard(customSubUrl)">
                      <template #icon><icon-copy /></template>
                      复制
                    </a-button>
                  </template>
                </a-input>
              </a-input-group>
            </a-form-item>

            <!-- 生成按钮 -->
            <a-form-item style="text-align: center; margin-bottom: 0; display: flex; justify-content: center;">
              <a-button type="primary" status="danger" @click="makeUrl"
                :disabled="form.sourceSubUrl.length === 0" style="width: 200px; height: 40px">生成订阅链接</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
/**
 * 订阅转换器组件的脚本部分
 * @description 处理订阅转换的核心逻辑
 */

import { ref, onMounted, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import { Message } from '@arco-design/web-vue'
import { 
  IconGithub,
  IconSettings,
  IconLink,
  IconCopy,
  IconBulb
} from '@arco-design/web-vue/es/icon'

// 环境变量
const project = import.meta.env.VITE_APP_PROJECT
const remoteConfigSample = import.meta.env.VITE_APP_SUBCONVERTER_REMOTE_CONFIG
const gayhubRelease = import.meta.env.VITE_APP_BACKEND_RELEASE
const defaultBackend = import.meta.env.VITE_APP_SUBCONVERTER_DEFAULT_BACKEND + '/sub?'

// 状态管理
const configStore = useConfigStore()

// 响应式数据
const isPC = ref(true)
const remoteConfig = ref<{ label: string; options: { label: string; value: string }[] }[]>([])

/**
 * 表单数据对象
 * @description 包含所有转换配置选项
 */
const form = ref({
  sourceSubUrl: "",      // 源订阅链接
  clientType: "clash",   // 客户端类型
  customBackend: "",     // 自定义后端
  remoteConfig: "",      // 远程配置
  excludeRemarks: "",    // 排除关键词
  includeRemarks: "",    // 包含关键词
  filename: "",          // 文件名
  emoji: true,          // 启用 Emoji
  nodeList: false,      // 输出为节点列表
  extraset: false,      // 附加设置
  sort: false,          // 节点排序
  udp: false,           // UDP 支持
  tfo: false,           // TCP Fast Open
  scv: true,           // 跳过证书验证
  fdn: false,          // 过滤非法节点
  expand: true,        // 规则展开
  appendType: false,    // 添加节点类型
  insert: false,       // 插入节点
  new_name: true,      // 新命名方式
  tpl: {              // 模板配置
    surge: {
      doh: false      // Surge DNS over HTTPS
    },
    clash: {
      doh: false      // Clash DNS over HTTPS
    }
  }
})

// 生成的订阅链接
const customSubUrl = ref("")
const needUdp = ref(false)
const filteredBackends = ref<{ value: string }[]>([])

/**
 * 监听后端输入变化
 * @description 根据输入过滤后端列表
 */
watch(() => form.value.customBackend, (query) => {
  const backends = configStore.backendConfig || []
  filteredBackends.value = query
    ? backends.filter(backend => 
        backend.value.toLowerCase().includes(query.toLowerCase())
      )
    : backends
})

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 */
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    Message.success("已复制到剪贴板")
  } catch {
    Message.error("复制失败")
  }
}

/**
 * 跳转到前端项目仓库
 * @description 跳转到 Subs-web 项目的 GitHub 仓库
 */
const goToProject = () => {
  window.open('https://github.com/bugcodesource/Subs-web')
}

/**
 * 跳转到后端项目仓库
 * @description 跳转到 subconverter 项目的 GitHub 仓库
 */
const gotoGayhub = () => {
  window.open('https://github.com/tindy2013/subconverter')
}

/**
 * 跳转到远程配置示例
 */
const gotoRemoteConfig = () => {
  window.open(remoteConfigSample)
}

/**
 * 生成订阅链接
 * @description 根据表单配置生成完整的订阅转换链接
 */
const makeUrl = () => {
  // 验证必填项
  if (form.value.sourceSubUrl === "" || form.value.clientType === "") {
    Message.error("订阅链接与客户端为必填项")
    return false
  }

  // 确定后端地址
  let backend =
    form.value.customBackend === ""
      ? defaultBackend
      : form.value.customBackend

  // 处理订阅链接
  let sourceSub = form.value.sourceSubUrl
  sourceSub = sourceSub.replace(/(\n|\r|\n\r)/g, "|")

  // 构建基础 URL
  customSubUrl.value =
    backend +
    "target=" +
    form.value.clientType +
    "&url=" +
    encodeURIComponent(sourceSub) +
    "&insert=" +
    form.value.insert

  // 添加可选参数
  if (form.value.remoteConfig) {
    customSubUrl.value +=
      "&config=" + encodeURIComponent(form.value.remoteConfig)
  }
  if (form.value.excludeRemarks) {
    customSubUrl.value +=
      "&exclude=" + encodeURIComponent(form.value.excludeRemarks)
  }
  if (form.value.includeRemarks) {
    customSubUrl.value +=
      "&include=" + encodeURIComponent(form.value.includeRemarks)
  }
  if (form.value.filename) {
    customSubUrl.value +=
      "&filename=" + encodeURIComponent(form.value.filename)
  }
  if (form.value.appendType) {
    customSubUrl.value +=
      "&append_type=" + form.value.appendType.toString()
  }

  // 添加通用选项
  customSubUrl.value +=
    "&emoji=" +
    form.value.emoji.toString() +
    "&list=" +
    form.value.nodeList.toString() +
    "&tfo=" +
    form.value.tfo.toString() +
    "&scv=" +
    form.value.scv.toString() +
    "&fdn=" +
    form.value.fdn.toString() +
    "&expand=" +
    form.value.expand.toString() +
    "&sort=" +
    form.value.sort.toString()

  // 添加 UDP 选项
  if (needUdp.value) {
    customSubUrl.value += "&udp=" + form.value.udp.toString()
  }

  // 添加特定客户端选项
  if (form.value.tpl.surge.doh === true) {
    customSubUrl.value += "&surge.doh=true"
  }

  if (form.value.clientType === "clash") {
    if (form.value.tpl.clash.doh === true) {
      customSubUrl.value += "&clash.doh=true"
    }

    customSubUrl.value += "&new_name=" + form.value.new_name.toString()
  }

  // 复制生成的链接
  copyToClipboard(customSubUrl.value)
}

/**
 * 保存订阅链接到本地存储
 */
const saveSubUrl = async () => {
  if (form.value.sourceSubUrl !== '') {
    await configStore.saveSourceSubUrl(String(form.value.sourceSubUrl))
  }
}

/**
 * 初始化组件数据
 * @description 加载配置和初始化界面
 */
const initData = async () => {
  try {
    // 设置页面标题
    document.title = "Subscription Converter"
    // 检测设备类型
    isPC.value = /Windows|Macintosh/i.test(navigator.userAgent)

    // 获取缓存的订阅链接
    const savedUrl = await configStore.getSourceSubUrl()
    form.value.sourceSubUrl = savedUrl || ""
    
    // 初始化远程配置
    await configStore.initRemoteConfig()
    await configStore.initClientConfig()
    remoteConfig.value = configStore.remoteConfig || []
    
    // 初始化后端配置
    await configStore.initBackendConfig()
    filteredBackends.value = configStore.backendConfig || []
  } catch (error) {
    console.error('初始化数据失败:', error)
    remoteConfig.value = []
    filteredBackends.value = []
  }
}

// 监听后端配置变化
watch(() => configStore.backendConfig, (newBackends) => {
  if (newBackends) {
    filteredBackends.value = form.value.customBackend
      ? newBackends.filter(backend => 
          backend.value.toLowerCase().includes(form.value.customBackend.toLowerCase())
        )
      : newBackends
  }
}, { deep: true })

// 组件挂载时初始化数据
onMounted(() => {
  initData()
})
</script>

<style scoped>
/* 容器样式 */
.subconverter-container {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  background-color: var(--color-bg-1);
  position: relative;
  z-index: 1;
}

/* 下拉框图标居中样式 */
:deep(.arco-select-view) {
  display: flex;
  align-items: center;
}

:deep(.arco-select-view-suffix) {
  display: flex;
  align-items: center;
}

:deep(.arco-select-view-value) {
  display: flex;
  align-items: center;
}

:deep(.arco-select .arco-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* 强制隐藏代码块 */
:deep(pre),
:deep(code),
:deep([class*="language-"]),
:deep([class*="hljs"]),
:deep(.prism-code),
:deep(.token),
:deep(.markdown-body pre),
:deep(.highlight),
:deep(.syntax),
:deep(.source-code),
:deep([class*="prism-"]),
:deep([class*="highlight-"]),
:deep(.code-block),
:deep(.code-wrapper) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  width: 0 !important;
  position: absolute !important;
  pointer-events: none !important;
  overflow: hidden !important;
  clip: rect(0,0,0,0) !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
}

/* 表单布局样式 */
:deep(.arco-form-item-wrapper) {
  display: flex;
  align-items: flex-start;
}

:deep(.arco-form-item-label-col) {
  flex: 0 0 120px;
  text-align: right;
  padding-right: 12px;
  line-height: 32px;
  white-space: nowrap;
}

:deep(.arco-form-item-content) {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

:deep(.arco-form-item-label) {
  font-weight: 500;
  color: var(--color-text-2);
  white-space: nowrap;
}

:deep(.arco-form-vertical) .arco-form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

:deep(.arco-form-vertical) .arco-form-item-label {
  text-align: left;
  margin-bottom: 8px;
}

:deep(.arco-form-vertical) .arco-form-item-content {
  width: 100%;
}

:deep(.arco-form-item) {
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
}

:deep(.arco-form-item-content-wrapper) {
  flex: 1;
}

:deep(.arco-input-group) {
  display: flex;
  width: 100%;
  position: relative;
  z-index: 2;
}

:deep(.arco-space) {
  display: flex;
  gap: 8px;
}

:deep(.arco-divider) {
  margin: 24px 0;
  color: var(--color-text-2);
  position: relative;
  z-index: 2;
}

:deep(.arco-card) {
  margin: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background-color: var(--color-bg-2);
  position: relative;
  z-index: 2;
}

:deep(.arco-card-header) {
  border-bottom: 1px solid var(--color-border);
  position: relative;
  z-index: 2;
}

:deep(.arco-form) {
  padding: 24px;
  position: relative;
  z-index: 2;
}

:deep(.arco-btn) {
  border-radius: 4px;
  position: relative;
  z-index: 2;
}

:deep(.arco-input) {
  border-radius: 4px;
  position: relative;
  z-index: 2;
}

:deep(.arco-select) {
  border-radius: 4px;
  position: relative;
  z-index: 2;
}

/* 添加遮罩层防止代码显示 */
.subconverter-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg-1);
  z-index: 1;
}

/* 确保模态框在最上层 */
:deep(.arco-modal-wrapper) {
  z-index: 1000;
}

:deep(.arco-message-wrapper) {
  z-index: 1001;
}

/* 按钮图标居中样式 */
:deep(.arco-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

:deep(.arco-btn .arco-icon) {
  margin: 0;
  vertical-align: middle;
  position: relative;
  top: -1px;
}

:deep(.arco-btn-text) {
  padding: 0 8px;
  height: 32px;
  line-height: 32px;
}

/* 主要按钮样式 */
:deep(.arco-btn-primary) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.arco-btn-primary.arco-btn-status-danger) {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* 文本域样式 */
:deep(.arco-textarea-wrapper) {
  min-height: 150px;
}

:deep(.arco-textarea) {
  min-height: 150px;
  resize: vertical;
}
</style> 