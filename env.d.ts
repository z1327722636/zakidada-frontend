/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // 其他环境变量的类型定义
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
