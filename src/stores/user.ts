import { defineStore } from 'pinia'
import { ref } from 'vue'

interface UserInfo {
  id: number
  username: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)

  function setUserInfo(info: UserInfo | null) {
    userInfo.value = info
  }

  function setToken(newToken: string | null) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  function logout() {
    userInfo.value = null
    setToken(null)
  }

  // 初始化时从 localStorage 获取 token
  const storedToken = localStorage.getItem('token')
  if (storedToken) {
    token.value = storedToken
  }

  return {
    userInfo,
    token,
    setUserInfo,
    setToken,
    logout
  }
})