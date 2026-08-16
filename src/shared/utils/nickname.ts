export function getAnonymousNickname(noteId: string): string {
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
  const sum = noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return nicknames[sum % nicknames.length];
}
