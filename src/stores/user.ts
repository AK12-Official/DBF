import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userLogin, getUserProfile, type UserProfile } from '@/api/user'
import { SET_TOKEN, GET_TOKEN, REMOVE_TOKEN } from '@/utils/token'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(GET_TOKEN() || '')
  const userInfo = ref<UserProfile | null>(null)

  // 登录
  const login = async (username: string, password: string) => {
    try {
      const response = await userLogin({ username, password })
      token.value = response.token
      userInfo.value = response.user
      SET_TOKEN(response.token)
      return response
    } catch (error) {
      throw error
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const user = await getUserProfile()
      userInfo.value = user
      return user
    } catch (error) {
      throw error
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    REMOVE_TOKEN()
  }

  // 检查是否已登录
  const isLoggedIn = () => {
    return !!token.value && !!GET_TOKEN()
  }

  return {
    token,
    userInfo,
    login,
    fetchUserInfo,
    logout,
    isLoggedIn,
  }
})

