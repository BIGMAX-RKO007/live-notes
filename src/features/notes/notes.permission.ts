export type NotePermissionAction = 'post' | 'drag' | 'edit' | 'delete' | 'like';

export interface NotePermissionContext {
  isOwner: boolean;
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

/**
 * 业务意图：集中式单一全局权限判定器 (Single Source of Truth Authorization Matrix)。
 * 彻底消解前端、后端与 API 控制器在权限规则上的二义性冲突与逻辑重复。
 * 规则策略表：
 * - post: 只能在别人的画板上发帖 (!isOwner && isLoggedIn)
 * - drag: 只能在别人的画板上拖拽卡片 (!isOwner && isLoggedIn)
 * - edit: 普通用户一律禁止编辑 (false)
 * - delete: 普通用户一律禁止删除，下架权归属于管理员 (isAdmin === true)
 * - like: 所有人（含游客与主人）均可点赞 (true)
 */
export function canUserPerformNoteAction(
  action: NotePermissionAction, 
  ctx: NotePermissionContext
): boolean {
  const { isOwner, isLoggedIn, isAdmin = false } = ctx;

  // 管理员后台拥有最高管理特权
  if (isAdmin && action === 'delete') return true;

  switch (action) {
    case 'post':
      // 只能在别人的画板上发帖
      return !isOwner && isLoggedIn;

    case 'drag':
      // 只能在别人的画板上拖拽排版
      return !isOwner && isLoggedIn;

    case 'delete':
      // 核心 ABC 故事玩法：已登录的朋友访客 (C) 可以帮宿主 (A) 撕掉墙上不实/恶意的便签 (B)；宿主本人纯只读不能撕
      return !isOwner && isLoggedIn;

    case 'edit':
      // 普通视图一律禁止修改正文，保证留痕真实
      return false;

    case 'like':
      // 所有人（包含宿主与访客）均可点赞
      return true;

    default:
      return false;
  }
}
