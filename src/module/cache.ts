/*
 * 缓存数据
 */
import { input as _input } from "./data/input";
import { sort as _sort } from "./data/sort";
import { modeData } from "./mode";

interface NameMap {
  [name: string]: string[];
}

function mergeValues(target: NameMap, source: NameMap): NameMap {
  Object.entries(source).forEach(([key, value]) => {
    target[key] = (target[key] || []).concat(value);
  });
  return target;
}
let _hash = mergeValues({ ...modeData }, _input);
_hash = mergeValues(_hash, _sort);

let cacheData: NameMap = {};
Object.entries(_hash).forEach(([key, names]) => {
  names.forEach((name) => {
    if (!cacheData[name]) {
      cacheData[name] = [];
    }
    cacheData[name].push(key);
  });
});

export { cacheData };
