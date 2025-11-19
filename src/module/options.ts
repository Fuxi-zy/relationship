/*
 * 通过表达式获取配置
 */
import { expression as _expression } from "./rule/expression";

export function getOptions(text: string): {
  text?: string;
  target?: string;
  type?: string;
} {
  for (const item of _expression) {
    const match = text.match(item["exp"]);
    if (match) {
      return item["opt"](match);
    }
  }
  return {};
}
