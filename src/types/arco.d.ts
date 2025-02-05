declare module '@arco-design/web-vue' {
  const content: any
  export const Message: any
  export const Modal: any
  export interface TreeNodeData {
    key?: string | number
    title?: string
    selectable?: boolean
    disabled?: boolean
    disableCheckbox?: boolean
    checkable?: boolean
    children?: TreeNodeData[]
  }
  export default content
}

declare module '@arco-design/web-vue/es/icon' {
  export const IconGithub: any
  export const IconSettings: any
  export const IconLink: any
  export const IconPlus: any
  export const IconDelete: any
  export const IconInfo: any
  export const IconCopy: any
  export const IconUpload: any
  export const IconFile: any
  export const IconBulb: any
  export const IconQuestion: any
} 