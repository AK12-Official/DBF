import request from "@/utils/request"
import type { UserRegisterParams, UserLoginParams, UserLoginResponse, UserRegisterResponse, UserProfile } from "./type"

enum API {
  USER_REGISTER_URL = '/v1/register',
  USER_LOGIN_URL = '/v1/login',
  USER_PROFILE_URL = '/v1/profile',
}

// 用户注册
export const userRegister = (data: UserRegisterParams) => {
  return request.post<UserRegisterResponse>(API.USER_REGISTER_URL, data)
}

// 用户登录
export const userLogin = (data: UserLoginParams) => {
  return request.post<UserLoginResponse>(API.USER_LOGIN_URL, data)
}

// 获取当前用户信息
export const getUserProfile = () => {
  return request.get<UserProfile>(API.USER_PROFILE_URL)
}