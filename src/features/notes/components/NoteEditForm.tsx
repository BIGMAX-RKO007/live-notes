interface NoteEditFormProps {
  id: string;
  content: string;
  color: string;
}

/**
 * 业务意图：便签双击行内编辑表单组件 (Inline Note Edit Form Component)。
 * 双击卡片文字后由 HTMX 动态置换加载，允许用户就地编辑修改便签内容。
 * 副作用：无状态，通过 HTMX 提交 PATCH /api/notes/:id 更新文本或 GET /api/notes/:id/content 恢复视图。
 */
export const NoteEditForm = ({ id, content, color }: NoteEditFormProps) => {
  return (
    // 【步骤 1/3】表单根节点：拦截 click 冒泡防止触发展开，配置 HTMX 发起 PATCH 异步提交请求
    <form
      hx-patch={`/api/notes/${id}`}
      hx-target={`#note-${id}`}
      hx-swap="outerHTML"
      class="flex flex-col gap-2 w-full flex-grow mt-2"
      onclick="event.stopPropagation()"
    >
      {/* 【步骤 2/3】编辑文本域：自动聚焦并自动将光标移至末尾，方便用户快速修改 */}
      <textarea
        name="content"
        rows={4}
        maxLength={200}
        required
        class="w-full p-2 text-[15px] font-serif bg-white/60 border border-[#e2d4c7] rounded-lg focus:outline-none focus:border-amber-500 resize-none font-semibold leading-relaxed text-[#382b26]"
        autofocus
        onfocus="const val = this.value; this.value = ''; this.value = val;"
      >
        {content}
      </textarea>
      
      {/* 【步骤 3/3】按键交互控制区：包含取消与保存按钮 */}
      <div class="flex justify-end gap-1.5 text-[10px] font-bold">
        {/* 取消按钮：发起 GET /api/notes/:id/content，放弃修改并把 DOM 还原为原始渲染文本 */}
        <button
          type="button"
          class="px-2.5 py-1 bg-[#f4ebe1] hover:bg-[#ebdcd0] text-[#6b5b52] rounded-md cursor-pointer transition-colors duration-150 border border-[#e2d4c7]"
          hx-get={`/api/notes/${id}/content`}
          hx-target="closest form"
          hx-swap="outerHTML"
        >
          取消
        </button>
        {/* 保存按钮：触发表单 submit 事件，提交 PATCH 请求写库 */}
        <button
          type="submit"
          class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-md cursor-pointer transition-colors duration-150 font-bold border border-amber-400"
        >
          保存
        </button>
      </div>
    </form>
  );
};
