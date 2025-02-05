<!--
 * @file Setting.vue
 * @description 设置页面组件，用于管理远程配置、后端地址和客户端配置
 * @author Your Name
 * @created 2024-02-05
-->

<template>
  <!-- 设置页面容器 -->
  <div class="setting-container">
    <!-- 设置卡片 -->
    <a-card class="setting-card">
      <!-- 卡片标题 -->
      <template #title>
        <span>远程配置管理</span>
        <a-button type="text" style="float: right; padding: 10px 0" @click="handleAdd">添加配置组</a-button>
      </template>

      <!-- 设置内容布局 -->
      <a-layout class="setting-content">
        <!-- 左侧树形结构 -->
        <a-layout-sider :width="400" class="tree-aside">
          <!-- 配置选项卡 -->
          <a-tabs v-model:activeKey="activeTab">
            <!-- 远程配置选项卡 -->
            <a-tab-pane key="remote" title="远程配置">
              <!-- 配置树形结构 -->
              <a-tree
                :data="treeData"
                :field-names="{
                  key: 'id',
                  title: 'label',
                  children: 'children'
                }"
                @select="handleNodeClick"
                :selected-keys="currentNode?.id ? [currentNode.id] : []"
                :auto-expand-parent="true"
                :default-expanded-keys="expandedKeys">
                <!-- 自定义节点模板 -->
                <template #title="nodeData">
                  <div class="custom-tree-node">
                    <span>{{ nodeData.label }}</span>
                    <span class="tree-actions">
                      <!-- 添加子节点按钮 -->
                      <a-button
                        type="text"
                        size="mini"
                        v-if="!nodeData.isLeaf"
                        @click.stop="() => handleAddChild(nodeData)">
                        <icon-plus />
                      </a-button>
                      <!-- 删除节点按钮 -->
                      <a-button
                        type="text"
                        size="mini"
                        @click.stop="() => handleDeleteNode(nodeData)">
                        <icon-delete />
                      </a-button>
                    </span>
                  </div>
                </template>
              </a-tree>
            </a-tab-pane>

            <!-- 后端地址选项卡 -->
            <a-tab-pane key="backend" title="后端地址">
              <!-- 后端地址列表 -->
              <div class="backend-list">
                <div v-for="(backend, index) in backendList" :key="index" class="backend-item">
                  <a-input-group>
                    <a-input 
                      v-model="backend.value" 
                      size="small"
                      placeholder="后端地址">
                      <template #append>
                        <a-button 
                          @click="handleDeleteBackend(index)">
                          <icon-delete />
                        </a-button>
                      </template>
                    </a-input>
                  </a-input-group>
                </div>
                <!-- 添加后端地址按钮 -->
                <a-button 
                  type="text" 
                  @click="handleAddBackend"
                  style="margin-top: 10px">
                  <icon-plus />添加后端地址
                </a-button>
              </div>
            </a-tab-pane>

            <!-- 客户端选项卡 -->
            <a-tab-pane key="client" title="客户端">
              <!-- 客户端列表 -->
              <div class="client-list">
                <div v-for="(client, index) in clientList" :key="index" class="client-item">
                  <a-input-group style="display: flex; gap: 8px;">
                    <a-input 
                      v-model="client.label" 
                      size="small"
                      placeholder="客户端名称"
                      style="width: 50%">
                    </a-input>
                    <a-input 
                      v-model="client.value" 
                      size="small"
                      placeholder="客户端标识"
                      style="width: 50%">
                      <template #append>
                        <a-button 
                          @click="handleDeleteClient(index)">
                          <icon-delete />
                        </a-button>
                      </template>
                    </a-input>
                  </a-input-group>
                </div>
                <!-- 添加客户端按钮 -->
                <a-button 
                  type="text" 
                  @click="handleAddClient"
                  style="margin-top: 10px">
                  <icon-plus />添加客户端
                </a-button>
              </div>
            </a-tab-pane>
          </a-tabs>
        </a-layout-sider>

        <!-- 右侧表单区域 -->
        <a-layout-content class="form-main">
          <!-- 远程配置编辑表单 -->
          <template v-if="activeTab === 'remote'">
            <a-form v-if="currentNode" :model="currentNode" layout="vertical">
              <a-form-item label="名称">
                <a-input v-model="currentNode.label" />
              </a-form-item>
              <a-form-item label="链接" v-if="currentNode.isLeaf">
                <a-textarea v-model="currentNode.value" :auto-size="{ minRows: 4, maxRows: 6 }" />
              </a-form-item>
            </a-form>
            <div v-else class="empty-tip">
              请选择左侧节点进行编辑
            </div>
          </template>

          <!-- 后端地址说明 -->
          <template v-else-if="activeTab === 'backend'">
            <div class="backend-tip">
              <h3>后端地址说明</h3>
              <p>1. 后端地址必须以 /sub? 结尾</p>
              <p>2. 建议自行搭建后端服务</p>
              <p>3. 公共后端可能会有限制</p>
            </div>
          </template>

          <!-- 客户端说明 -->
          <template v-else>
            <div class="client-tip">
              <h3>客户端说明</h3>
              <p>1. 需要添加客户端请自行在左侧添加</p>
              <p>2. 客户端名称为显示名称</p>
              <p>3. 客户端标识为实际使用的标识符</p>
            </div>
          </template>
        </a-layout-content>
      </a-layout>

      <!-- 底部操作按钮 -->
      <div class="setting-footer">
        <a-space>
          <a-button @click="$router.push('/')">返回</a-button>
          <a-button type="primary" @click="handleSave">保存配置</a-button>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
/**
 * 设置页面组件的脚本部分
 * @description 处理配置管理的核心逻辑
 */

import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/config'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus, IconDelete } from '@arco-design/web-vue/es/icon'
import type { TreeNodeData } from '@arco-design/web-vue'

/**
 * 自定义树节点数据类型
 */
interface CustomTreeNodeData extends TreeNodeData {
  id: string | number
  label: string
  value?: string
  isLeaf?: boolean
  children?: CustomTreeNodeData[]
  parent?: CustomTreeNodeData
  dataRef?: any
}

/**
 * 客户端配置类型
 */
interface ClientConfig {
  label: string  // 客户端显示名称
  value: string  // 客户端标识符
}

// 路由实例
const router = useRouter()
// 配置存储实例
const configStore = useConfigStore()

// 响应式状态
const activeTab = ref('remote')                    // 当前激活的选项卡
const currentNode = ref<CustomTreeNodeData | null>(null)  // 当前选中的节点
const treeData = ref<CustomTreeNodeData[]>([])     // 树形数据
const backendList = ref<{ value: string }[]>([])   // 后端地址列表
const clientList = ref<ClientConfig[]>([])         // 客户端列表
const expandedKeys = ref<(string | number)[]>([])  // 展开的节点 key 列表

/**
 * 处理节点点击事件
 * @description 更新当前选中的节点
 */
const handleNodeClick = (
  selectedKeys: (string | number)[],
  data: { selected?: boolean; selectedNodes: TreeNodeData[]; node?: TreeNodeData; e?: Event }
) => {
  if (selectedKeys.length > 0 && data.node) {
    const nodeKey = data.node.key || `node_${Date.now()}`
    currentNode.value = {
      id: nodeKey,
      label: data.node.title as string,
      title: data.node.title as string,
      key: nodeKey,
      value: (data.node as any).value,
      isLeaf: (data.node as any).isLeaf,
      children: (data.node as any).children,
      parent: (data.node as any).parent,
      dataRef: data.node
    }
  }
}

/**
 * 删除节点
 * @description 删除选中的配置节点
 */
const handleDeleteNode = async (node: CustomTreeNodeData) => {
  try {
    await Modal.confirm({
      title: '确认删除',
      content: '确认删除该节点?',
      okText: '确定',
      cancelText: '取消'
    })
    
    const parent = node.parent
    const children = parent?.dataRef?.children || parent?.dataRef
    if (Array.isArray(children)) {
      const index = children.findIndex((d: CustomTreeNodeData) => d.id === node.id)
      if (index > -1) {
        children.splice(index, 1)
        if (currentNode.value && currentNode.value.id === node.id) {
          currentNode.value = null
        }
        Message.success('删除成功')
      }
    }
  } catch {}
}

/**
 * 创建新节点
 * @description 创建一个新的配置节点
 */
const createNode = (id: string | number, label: string, value: string = '', isLeaf: boolean = false): CustomTreeNodeData => {
  return {
    id,
    label,
    title: label,
    key: id,
    value,
    isLeaf,
    children: isLeaf ? undefined : []
  }
}

/**
 * 添加配置组
 * @description 在根级别添加新的配置组
 */
const handleAdd = () => {
  const groupId = 'group_' + treeData.value.length
  const newGroup = createNode(groupId, '新配置组')
  treeData.value.push(newGroup)
  currentNode.value = newGroup
  expandedKeys.value.push(groupId)
}

/**
 * 添加子节点
 * @description 在选中的配置组下添加新的配置项
 */
const handleAddChild = (data: CustomTreeNodeData) => {
  if (!data.children) {
    data.children = []
  }
  const childId = `${data.id}_option_${data.children.length}`
  const newChild = createNode(childId, '新配置项', '', true)
  data.children.push(newChild)
  currentNode.value = newChild
}

/**
 * 添加后端地址
 * @description 添加新的后端服务地址
 */
const handleAddBackend = () => {
  if (!Array.isArray(backendList.value)) {
    backendList.value = []
  }
  backendList.value.push({
    value: ''
  })
}

/**
 * 删除后端地址
 * @description 删除指定的后端服务地址
 */
const handleDeleteBackend = async (index: number) => {
  if (!Array.isArray(backendList.value)) return
  
  try {
    await Modal.confirm({
      title: '确认删除',
      content: '确认删除该后端地址?',
      okText: '确定',
      cancelText: '取消'
    })
    
    backendList.value.splice(index, 1)
    Message.success('删除成功')
  } catch {}
}

/**
 * 添加客户端
 * @description 添加新的客户端配置
 */
const handleAddClient = () => {
  if (!Array.isArray(clientList.value)) {
    clientList.value = []
  }
  clientList.value.push({
    label: '',
    value: ''
  })
}

/**
 * 删除客户端
 * @description 删除指定的客户端配置
 */
const handleDeleteClient = async (index: number) => {
  try {
    await Modal.confirm({
      title: '确认删除',
      content: '确认删除该客户端?',
      okText: '确定',
      cancelText: '取消'
    })
    
    clientList.value.splice(index, 1)
    Message.success('删除成功')
  } catch {}
}

/**
 * 转换远程配置数据结构
 * @description 将后端数据转换为树形结构
 */
const convertRemoteConfig = (config: any[]): CustomTreeNodeData[] => {
  return config.map((group, groupIndex) => ({
    id: `group_${groupIndex}`,
    label: group.label,
    title: group.label,
    key: `group_${groupIndex}`,
    children: group.options.map((option: any, optionIndex: number) => ({
      id: `group_${groupIndex}_option_${optionIndex}`,
      label: option.label,
      title: option.label,
      key: `group_${groupIndex}_option_${optionIndex}`,
      value: option.value,
      isLeaf: true
    }))
  }))
}

// 组件挂载时初始化数据
onMounted(async () => {
  try {
    await configStore.initRemoteConfig()
    await configStore.initBackendConfig()
    await configStore.initClientConfig()
    treeData.value = convertRemoteConfig(configStore.remoteConfig)
    backendList.value = configStore.backendConfig
    clientList.value = [...configStore.clientConfig]
  } catch (error) {
    console.error('初始化数据失败:', error)
    Message.error('初始化数据失败')
  }
})

/**
 * 保存配置
 * @description 保存所有配置更改
 */
const handleSave = async () => {
  try {
    // 保存远程配置
    const config = treeData.value.map(group => ({
      label: group.label,
      options: (group.children || []).map((option: CustomTreeNodeData) => ({
        label: option.label,
        value: option.value || ''
      }))
    }))
    await configStore.updateRemoteConfig(config)

    // 保存后端地址
    await configStore.updateBackendConfig(backendList.value)
    
    // 保存客户端配置
    await configStore.updateClientConfig([...clientList.value])
    
    Message.success('保存成功')
    router.push('/')
  } catch (error) {
    console.error('保存失败:', error)
    Message.error('保存失败')
  }
}

// 监听当前节点变化，自动更新树形数据
watch(currentNode, (newVal) => {
  if (!newVal) return
  
  const updateNode = (nodes: CustomTreeNodeData[]) => {
    for (let node of nodes) {
      if (node.id === newVal.id) {
        // 更新节点数据
        Object.assign(node, {
          ...newVal,
          title: newVal.label, // 同步更新 title 属性
          key: newVal.id      // 同步更新 key 属性
        })
        return true
      }
      if (node.children && node.children.length) {
        if (updateNode(node.children)) return true
      }
    }
    return false
  }
  
  updateNode(treeData.value)
}, { deep: true })
</script>

<style scoped>
/* 容器样式 */
.setting-container {
  padding: 20px;
  height: 100%;
}

/* 设置卡片样式 */
.setting-card {
  min-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

/* 内容区域样式 */
.setting-content {
  flex: 1;
  overflow: hidden;
}

/* 左侧树形面板样式 */
.tree-aside {
  border-right: 1px solid var(--color-neutral-3);
  overflow-y: auto;
  background: var(--color-bg-2);
}

/* 右侧表单区域样式 */
.form-main {
  padding: 20px;
  overflow-y: auto;
  background: var(--color-bg-2);
}

/* 树节点自定义样式 */
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

/* 树节点操作按钮样式 */
.tree-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.custom-tree-node:hover .tree-actions {
  opacity: 1;
}

/* 空状态提示样式 */
.empty-tip {
  color: var(--color-text-3);
  text-align: center;
  margin-top: 100px;
}

/* 底部操作区域样式 */
.setting-footer {
  text-align: center;
  padding: 10px 0;
  border-top: 1px solid var(--color-neutral-3);
}

/* 后端地址列表样式 */
.backend-list {
  padding: 10px;
}

.backend-item {
  margin-bottom: 10px;
}

/* 后端说明样式 */
.backend-tip {
  color: var(--color-text-2);
  line-height: 1.8;
}

.backend-tip h3 {
  margin-bottom: 15px;
}

/* 客户端列表样式 */
.client-list {
  padding: 10px;
}

.client-item {
  margin-bottom: 10px;
}

/* 客户端说明样式 */
.client-tip {
  color: var(--color-text-2);
  line-height: 1.8;
}

.client-tip h3 {
  margin-bottom: 15px;
}

/* 选项卡样式 */
:deep(.arco-tabs) {
  margin-top: 16px;
}

:deep(.arco-tabs-nav) {
  margin-bottom: 16px;
}
</style> 