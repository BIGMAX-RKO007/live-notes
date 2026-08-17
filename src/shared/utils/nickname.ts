/**
 * 业务意图：基于便签 UUID 哈希映射可爱匿名动物昵称。
 * 消除纯字符串 UUID ID 带来的冷冰感，为匿名留言墙赋予柔和治愈的手账贴纸印章角色。
 * 副作用：纯确定性计算函数，相同 noteId 永远计算出同一个可爱的动物代号。
 */
export function getAnonymousNickname(noteId: string): string {
  // 【步骤 1/3】可爱动物名录映射字典
  const nicknames = [
    '🐈 匿名猫咪', 
    '🦊 匿名狐狸', 
    '🐼 匿名熊猫', 
    '🐨 匿名考拉', 
    '🐰 匿名兔子',
    '🐬 匿名海豚', 
    '🦉 匿名猫头鹰', 
    '🦄 匿名独角兽', 
    '🐯 匿名小老虎', 
    '🦁 匿名小狮子',
    '🐿️ 匿名小松鼠', 
    '🐧 匿名小企鹅', 
    '🐸 匿名小青蛙', 
    '🦆 匿名小黄鸭', 
    '🐝 匿名小蜜蜂'
  ];

  // 【步骤 2/3】确定性哈希计算：将 UUID 的字符串 ASCII 码累加求和
  // 实现方式：通过 reduce 对 UUID 每个字符取 charCodeAt 进行累加（可简化）
  const sum = noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // 【步骤 3/3】取模锁定：利用余数锁定对应的动物名，保证每次渲染该便签时名称永远稳定
  return nicknames[sum % nicknames.length];
}
