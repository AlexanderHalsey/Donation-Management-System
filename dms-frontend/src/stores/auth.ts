import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)

  function setToken(newToken: string) {
    accessToken.value = newToken
  }

  function clearToken() {
    accessToken.value = null
  }

  return {
    token: accessToken,
    setToken,
    clearToken,
  }
})
