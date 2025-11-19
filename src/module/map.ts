/*
 * 完整关系链数据 - 合并各类关系链数据
 */
import { prefix as _prefix } from "./data/prefix";
import { branch as _branch } from "./data/branch";
import { main as _main } from "./data/main";
import { multiple as _multiple } from "./data/multiple";

import { expandSelector } from "./selector";

let _map: Record<string, string[]> = { ..._multiple };

// 分支 - 前缀处理
const prefixMap: Record<string, Record<string, string[]>> = {};
Object.keys(_prefix).forEach((key) => {
  prefixMap[key] = {};
  const innerObj = _prefix[key];
  Object.keys(innerObj).forEach((selector) => {
    expandSelector(selector).forEach((s) => {
      prefixMap[key][s] = innerObj[selector];
    });
  });
});
// 分支 - 节点处理
const branchMap: Record<string, string[]> = {};
for (const selector in _branch) {
  expandSelector(selector).forEach(function (s: string) {
    branchMap[s] = _branch[selector];
  });
}
// 分支 - 合并
const getMap = function (
  prefixMap: Record<string, Record<string, string[]>>,
  branchMap: Record<string, string[]>
): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const key in branchMap) {
    const match = key.match(/\{.+?\}/);
    if (!match) continue;
    const tag = match[0];
    const nameList = branchMap[key];
    for (const k in prefixMap[tag]) {
      const prefixList = prefixMap[tag][k];
      const newKey = key.replace(tag, k);
      const isFilter = ["h,h", "w,w", "w,h", "h,w"].some((pair) =>
        newKey.includes(pair)
      );
      if (!isFilter) {
        const newList = prefixList.flatMap((prefix) =>
          nameList.map((name) =>
            name.includes("?") ? name.replace("?", prefix) : prefix + name
          )
        );
        if (!map[newKey]) {
          map[newKey] = _map[newKey] || [];
        }
        map[newKey] = newList.concat(map[newKey]);
      }
    }
  }
  return map;
};
_map = { ..._map, ...getMap(prefixMap, branchMap) };

// 主要关系
for (let key in _main) {
  _map[key] = [..._main[key], ...(_map[key] || [])];
}

// 配偶关系
const mateMap: Record<string, string[]> = {
  w: ["妻", "内", "岳", "岳家", "丈人"],
  h: ["夫", "外", "公", "婆家", "婆婆"],
};
const nameSet = new Set(Object.values(_map).flat());
for (const key in _map) {
  if (key.match(/^[fm]/) || key.match(/^[olx][bs]$|^[olx][bs],[^mf]/)) {
    // 只对长辈或者兄弟辈匹配
    for (const k in mateMap) {
      let newKey = k + "," + key;
      if (key.match(/[fm]/)) {
        let newKey_x = newKey
          .replace(/,[ol]([sb])(,[wh])?$/, ",x$1$2")
          .replace(/(,[sd])&[ol](,[wh])?$/, "$1$2");
        if (newKey_x != newKey && _map[newKey_x]) {
          // 不扩大解释年龄
          continue;
        }
      }
      if (!_map[newKey]) {
        _map[newKey] = [];
      }
      const prefixList = mateMap[k];
      const nameList = _map[key];
      prefixList.forEach(function (prefix) {
        nameList.forEach(function (name) {
          const newName = prefix + name;
          if (!nameSet.has(newName)) {
            // 配偶组合的称呼不得与原有称呼冲突(如：妻舅!=妻子的舅舅;外舅公!=老公的舅公)
            _map[newKey].push(newName);
          }
        });
      });
    }
  }
}

export default _map;
