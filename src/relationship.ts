import { getOptions } from "./module/options";
import { getSelectors, mergeSelector, selector2id } from "./module/selector";
import {
  reverseId,
  getItemsById,
  getChainById,
  getPairsById,
} from "./module/id";
import { setModeData, getModeData, modeData } from "./module/mode";

interface RelationshipOptions {
  text?: string;
  target?: string;
  sex?: number;
  type?: string; // 修改为string类型以匹配getOptions的实际返回
  reverse?: boolean;
  mode?: string;
  optimal?: boolean;
}

// 对外方法
const relationship = function (
  parameter: string | RelationshipOptions
): string[] {
  if (typeof parameter == "string") {
    parameter = getOptions(parameter);
  }
  let options = Object.assign(
    {
      text: "", // 目标对象：目标对象的称谓汉字表达，称谓间用‘的’字分隔
      target: "", // 相对对象：相对对象的称谓汉字表达，称谓间用‘的’字分隔，空表示自己
      sex: -1, // 本人性别：0表示女性,1表示男性
      type: "default", // 转换类型：'default'计算称谓,'chain'计算关系链,'pair'计算关系合称
      reverse: false, // 称呼方式：true对方称呼我,false我称呼对方
      mode: "default", // 模式选择：使用setMode方法定制不同地区模式，在此选择自定义模式
      optimal: false, // 最短关系：计算两者之间的最短关系
    },
    parameter
  );
  // 切换模式
  getModeData(options.mode);
  let fromSelectors = getSelectors(options.text);
  let toSelectors = getSelectors(options.target);
  if (!toSelectors.length) {
    toSelectors = [""];
  }
  const result: string[] = fromSelectors.flatMap((fromSelector: string) => {
    return toSelectors.flatMap((toSelector: string) => {
      return mergeSelector({
        from: fromSelector,
        to: toSelector,
        sex: options.sex,
        optimal: options.optimal,
      }).flatMap((data: { selector: string; sex: number }) => {
        const ids = data ? selector2id(data["selector"], data["sex"]) : [];
        return ids.flatMap((id: string) => {
          let temps = [id];
          let sex = data["sex"];
          if (options.reverse) {
            temps = reverseId(id, sex);
            if (id.match(/([fhs1](&[ol\d]+)?|[olx]b)$/)) {
              sex = 1;
            } else {
              sex = 0;
            }
          }
          if (options.type === "chain") {
            return temps
              .map((id) => getChainById(id, sex))
              .filter((item) => item);
          } else if (options.type === "pair") {
            const reversedTemps = reverseId(id, data["sex"]);
            return reversedTemps.flatMap((rId) => getPairsById(id, rId));
          } else {
            return temps.flatMap((id) => {
              let items = getItemsById(id);
              if (!items.length) {
                items = getItemsById(sex + "," + id);
              }
              return items;
            });
          }
        });
      });
    });
  });

  return [...new Set(result)];
};

// 获取数据表
relationship.data = modeData;
// 获取数据量
relationship.dataCount = Object.keys(modeData).length;
// 设置语言模式
relationship.setMode = setModeData;

export { relationship };
