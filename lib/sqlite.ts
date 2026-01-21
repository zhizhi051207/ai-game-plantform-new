// 假的SQLite模块 - 用于解决导入问题，实际使用内存存储

export const db = {
  prepare: () => ({
    get: () => ({}),
    all: () => [],
    run: () => {},
  }),
  exec: () => {},
  pragma: () => {},
}

export function initDatabase() {
  console.log('SQLite disabled - using memory storage')
}