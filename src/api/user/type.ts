// 用户注册
export interface UserRegisterParams {
  username: string
  password: string
  email: string
}

export interface UserRegisterResponse {
  message: string
  user: {
    id: number
    username: string
    email: string
    role: string
  }
}

// 用户登录
export interface UserLoginParams {
  username: string
  password: string
}

export interface UserLoginResponse {
  token: string
  user: {
    id: number
    username: string
    email: string
    role: string
  }
}

// 用户信息
export interface UserProfile {
  id: number
  username: string
  email: string
  role: string
  status: string
}