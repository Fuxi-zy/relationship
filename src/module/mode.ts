/*
 * 模式数据
 */
import _map from "./map";

let _mode: Record<string, string[]> = {}; // 模式缓存
let modeData = { ..._map }; // 最终数据

// 设置模式数据
export function setModeData(sign: string, data: Record<string, string[]>) {
  _mode[sign] = { ...(_mode[sign] || {}), ...data };
}

// 获取模式数据
export function getModeData(sign: string) {
  modeData = { ..._map };
  if (sign && _mode[sign]) {
    for (const key in _mode[sign]) {
      modeData[key] = [...(_mode[sign][key] || []), ...(_map[key] || [])];
    }
  }
  return modeData;
}

export { modeData };
