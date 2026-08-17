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

  switch (action) {
    case 'post':
      return !isOwner && isLoggedIn;

    case 'drag':
      return !isOwner && isLoggedIn;

    case 'edit':
      return false;

    case 'delete':
      return isAdmin;

    case 'like':
      return true;

    default:
      return false;
  }
}
