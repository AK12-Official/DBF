# DBFront

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## 跨域配置

**注意：后端接口已有 `/api` 前缀**，配置时需要特别注意。

项目支持两种跨域解决方案，可根据实际情况选择：

### 方式一：直接使用完整 API 地址（当前配置）

在项目根目录的 `.env` 文件中配置：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

**工作原理：**
- baseURL: `http://localhost:8080/api`
- API 路径: `/v1/register`
- 最终请求: `http://localhost:8080/api/v1/register` ✓

**优点：**
- 配置简单，直接使用完整地址
- 如果后端已配置 CORS，可直接使用

**注意事项：**
- 需要确保后端服务器已正确配置 CORS 头
- Vite 开发服务器已启用 `cors: true` 支持跨域

### 方式二：使用 Vite 代理（推荐用于开发环境）

如果需要使用代理方式，可以修改 `.env` 文件：

```env
# 使用相对路径，通过代理转发
VITE_API_BASE_URL=/api
```

**工作原理：**
- baseURL: `/api`
- API 路径: `/v1/register`
- 前端请求: `/api/v1/register`
- 代理转发到: `http://localhost:8080/api/v1/register` ✓（保持路径不变）

**优点：**
- 完全避免跨域问题
- 不需要后端配置 CORS
- 适合开发环境

**代理配置说明：**
- 代理会自动从 `VITE_API_BASE_URL` 提取基础地址（去掉 `/api` 后缀）
- 例如：`http://localhost:8080/api` → 代理 target: `http://localhost:8080`
- 代理会保持 `/api` 前缀，直接转发到后端

### 环境变量说明

- **VITE_API_BASE_URL**: API 基础路径
  - 完整地址：`http://localhost:8080/api`（需要后端支持 CORS，后端已有 `/api` 前缀）
  - 相对路径：`/api`（使用 Vite 代理，代理会自动转发到后端）

### 当前配置

根据 `.env` 文件，当前使用**方式一**（直接使用完整 API 地址）：
- API 地址：`http://localhost:8080/api`
- 需要确保后端服务器在 `http://localhost:8080` 运行
- 需要后端配置 CORS 允许来自 `http://localhost:5173` 的请求
- 后端接口路径示例：`http://localhost:8080/api/v1/register`

### 切换到代理方式

如果遇到跨域问题，可以切换到代理方式：

1. 修改 `.env` 文件：
```env
VITE_API_BASE_URL=/api
```

2. 重启开发服务器：
```bash
npm run dev
```

### 生产环境配置

生产环境建议创建 `.env.production` 文件：

```env
VITE_API_BASE_URL=https://your-production-domain.com/api
```

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
