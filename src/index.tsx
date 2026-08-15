import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { getDb } from './db';
import { notes } from './db/schema';

// Component imports
import { Layout } from './components/Layout';
import { Board } from './components/Board';
import { Note } from './components/Note';
import { NoteEditForm } from './components/NoteEditForm';

// Define Cloudflare Bindings type
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// 1. Home Page Route - Renders layout + board with initial notes
app.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const allNotes = await db.select().from(notes).orderBy(desc(notes.createdAt));
    return c.html(
      <Layout title="实时匿名留言墙">
        <Board notes={allNotes} />
      </Layout>
    );
  } catch (error) {
    console.error('Failed to load board:', error);
    return c.html(
      <Layout title="实时匿名留言墙 - 错误">
        <div class="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
          <div class="text-4xl">⚠️</div>
          <h2 class="text-xl font-bold text-red-400">数据库加载失败</h2>
          <p class="text-xs text-slate-500 max-w-sm">请确认您是否已经运行了数据库迁移。运行命令：npx wrangler d1 migrations apply live-notes-db --local</p>
        </div>
      </Layout>
    );
  }
});

// 2. Poll API - Returns notes HTML fragment for HTMX polling
app.get('/api/notes/list', async (c) => {
  const db = getDb(c.env.DB);
  const allNotes = await db.select().from(notes).orderBy(desc(notes.createdAt));
  return c.html(
    <>
      {allNotes.map((note) => (
        <Note
          key={note.id}
          id={note.id}
          content={note.content}
          color={note.color}
          xPos={note.xPos}
          yPos={note.yPos}
        />
      ))}
    </>
  );
});

// 3. Create Note API
app.post('/api/notes', async (c) => {
  const body = await c.req.parseBody();
  const content = String(body.content || '').trim();
  const color = String(body.color || 'yellow');

  if (!content) {
    return c.text('留言内容不能为空', 400);
  }

  // Calculate random coordinate offsets (range 15% - 75%) to spread notes
  const xPos = Math.floor(Math.random() * 60) + 15;
  const yPos = Math.floor(Math.random() * 60) + 15;

  const id = crypto.randomUUID();
  const now = new Date();

  const db = getDb(c.env.DB);
  await db.insert(notes).values({
    id,
    content,
    color,
    xPos,
    yPos,
    createdAt: now,
    updatedAt: now,
  });

  return c.html(
    <Note id={id} content={content} color={color} xPos={xPos} yPos={yPos} />
  );
});

// 4. Update Note Position API
app.put('/api/notes/:id/position', async (c) => {
  const id = c.req.param('id');
  const { xPos, yPos } = await c.req.json<{ xPos: number; yPos: number }>();

  const db = getDb(c.env.DB);
  await db
    .update(notes)
    .set({ xPos, yPos, updatedAt: new Date() })
    .where(eq(notes.id, id));

  return c.text('Position updated');
});

// 5. Get Inline Edit Form API (triggered on double click)
app.get('/api/notes/:id/edit', async (c) => {
  const id = c.req.param('id');
  const db = getDb(c.env.DB);
  const noteList = await db.select().from(notes).where(eq(notes.id, id)).limit(1);

  if (noteList.length === 0) {
    return c.text('Note not found', 404);
  }

  const note = noteList[0];
  return c.html(
    <NoteEditForm id={note.id} content={note.content} color={note.color} />
  );
});

// 6. Get note raw content API (triggered on inline edit cancel)
app.get('/api/notes/:id/content', async (c) => {
  const id = c.req.param('id');
  const db = getDb(c.env.DB);
  const noteList = await db.select().from(notes).where(eq(notes.id, id)).limit(1);

  if (noteList.length === 0) {
    return c.text('Note not found', 404);
  }

  const note = noteList[0];
  return c.html(
    <div
      class="note-content mt-2 flex-grow overflow-y-auto break-words text-sm font-medium leading-relaxed font-sans pr-1"
      hx-get={`/api/notes/${id}/edit`}
      hx-trigger="dblclick"
      hx-target="this"
      hx-swap="outerHTML"
      title="双击可编辑内容"
    >
      {note.content}
    </div>
  );
});

// 7. Update Note Content API
app.patch('/api/notes/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.parseBody();
  const content = String(body.content || '').trim();

  if (!content) {
    return c.text('留言内容不能为空', 400);
  }

  const db = getDb(c.env.DB);
  const [updatedNote] = await db
    .update(notes)
    .set({ content, updatedAt: new Date() })
    .where(eq(notes.id, id))
    .returning();

  if (!updatedNote) {
    return c.text('Note not found', 404);
  }

  return c.html(
    <Note
      id={updatedNote.id}
      content={updatedNote.content}
      color={updatedNote.color}
      xPos={updatedNote.xPos}
      yPos={updatedNote.yPos}
    />
  );
});

// 8. Delete Note API
app.delete('/api/notes/:id', async (c) => {
  const id = c.req.param('id');
  const db = getDb(c.env.DB);
  await db.delete(notes).where(eq(notes.id, id));
  
  // Return empty string to swap note card out of DOM
  return c.text('');
});

export default app;
