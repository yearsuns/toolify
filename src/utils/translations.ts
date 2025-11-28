/**
 * 从嵌套对象中获取值，支持 "jsonFormatter.title" 这样的键
 */
export function getNestedValue(key: string, obj: any): string | undefined {
  const keys = key.split(".");
  let value = obj;
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  return typeof value === "string" ? value : undefined;
}

