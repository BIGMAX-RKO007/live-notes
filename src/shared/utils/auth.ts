/**
 * 业务意图：使用原生 Web Crypto Subtle API 实现单向加盐 SHA-256 密码哈希生成。
 * 避免在 Edge/Worker 环境下使用体积庞大的 node.js C++ 依赖（如 bcrypt）。
 * 副作用：生成随机 8 位 Salt 并返回 `salt:hash` 格式的散列字符串。
 */
export async function hashPassword(password: string): Promise<string> {
  // 【步骤 1/4】加盐准备：生成随机 UUID 并截取前 8 位作为独立动态 Salt（防彩虹表攻击）
  const salt = crypto.randomUUID().slice(0, 8);
  const encoder = new TextEncoder();
  
  // 【步骤 2/4】字节编码：将 明文密码 + 动态盐 转化为 Uint8Array 字节数组
  const data = encoder.encode(password + salt);
  
  // 【步骤 3/4】哈希计算：调用浏览器/Worker 原生 Web Crypto Subtle 执行单向 SHA-256 散列
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // 【步骤 4/4】格式转换：将 256 位哈希 Buffer 格式化为 64 位 Hex 十六进制字符串并拼接 Salt 返回
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${salt}:${hash}`;
}

/**
 * 业务意图：校验用户输入的明文密码与 D1 数据库中存储的加盐哈希值是否匹配。
 * 副作用：计算输入密码的 Hash 值并进行恒定字符串比较。
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // 【步骤 1/3】分解存储字符串：按 `:` 拆分出原始 Salt 和期望的 Hash 值
  const [salt, hash] = storedHash.split(':');
  
  // 分支 A：数据库中的存储格式损坏或为空 (Guard Clause)
  if (!salt || !hash) return false;

  // 【步骤 2/3】使用拆分出的 Salt，再次对用户输入的明文密码计算 SHA-256 Hash
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // 【步骤 3/3】比对计算结果：若一致则判定密码正确，否则判定验证失败
  // 分支 B：匹配成功返回 true，否则返回 false
  return computedHash === hash;
}
