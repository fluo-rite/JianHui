/**
 * 鏍规嵁浼犲叆鐨勫瓧绗︿覆璁＄畻鍊?
 * 闈炲瓧绗︿覆绫诲瀷鐩存帴杩斿洖鍘熷€硷紝鏂逛究澶勭悊瀵硅薄鍜屾暟缁勯厤缃?
 * @param str 浼犲叆鐨勫€?
 * @returns 璁＄畻鍚庣殑鍊?
 */
export function calcValueByString<T = unknown>(str: T) {
  if (typeof str !== "string") return str;

  let value;
  if (/^\d+$/.test(str)) value = Number(str);
  else if (["true", "false"].includes(str)) value = str === "true";

  return value ?? str;
}

/**
 * 鏍规嵁杈撳叆鐨勫瓧绗︿覆璁＄畻鏁版嵁绫诲瀷
 * @param str 杈撳叆鐨勫瓧绗︿覆
 * @returns 鏁版嵁绫诲瀷(string, boolean, number)
 */
export function calcTypeByString(str: string) {
  if (/^\d+$/.test(str)) return "number";
  else if (["true", "false"].includes(str)) return "boolean";

  return "string";
}
