import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { getDb } from '../../db/client';
import { NotesRepository } from './notes.repository';
import { NotesService } from './notes.service';
import { users } from '../users/users.schema';
import { JWT_SECRET } from '../auth/auth.controller';
import { eq } from 'drizzle-orm';

// Components specific to Notes
import { Note } from './components/Note';
import { NoteEditForm } from './components/NoteEditForm';

type Bindings = {
  DB: D1Database;
};

const notesApp = new Hono<{ Bindings: Bindings }>();

// Helper to get notes service instance
const getNotesService = (d1: D1Database) => {
  const db = getDb(d1);
  const repo = new NotesRepository(db);
  return new NotesService(repo);
};

// Middleware-like helper to authenticate and check note ownership
const checkNoteOwnership = async (c: any, noteId: string): Promise<{ currentUserId: string; service: NotesService } | null> => {
  const sessionToken = getCookie(c, 'session');
  if (!sessionToken) return null;

  try {
    const payload = await verify(sessionToken, JWT_SECRET, 'HS256');
    if (!payload || !payload.userId) return null;

    const currentUserId = String(payload.userId);
    const service = getNotesService(c.env.DB);
    const note = await service.getNoteById(noteId);

    if (!note || note.userId !== currentUserId) {
      return null;
    }

    return { currentUserId, service };
  } catch (e) {
    return null;
  }
};

// 1. Poll API - Returns notes HTML fragment for HTMX polling, filtered by owner
notesApp.get('/list', async (c) => {
  const boardOwnerName = String(c.req.query('boardOwner') || '').trim().toLowerCase();
  if (!boardOwnerName) {
    return c.text('Missing boardOwner query parameter', 400);
  }

  const db = getDb(c.env.DB);
  const [boardOwner] = await db.select().from(users).where(eq(users.username, boardOwnerName)).limit(1);
  if (!boardOwner) {
    return c.text('Board owner not found', 404);
  }

  // Check if current visitor is the board owner
  let isOwner = false;
  const sessionToken = getCookie(c, 'session');
  if (sessionToken) {
    try {
      const payload = await verify(sessionToken, JWT_SECRET, 'HS256');
      if (payload && payload.userId === boardOwner.id) {
        isOwner = true;
      }
    } catch (e) {
      // Ignore invalid session token
    }
  }

  const service = getNotesService(c.env.DB);
  const userNotes = await service.getNotesByUserId(boardOwner.id);

  return c.html(
    <>
      {userNotes.map((note: any) => (
        <Note
          key={note.id}
          id={note.id}
          content={note.content}
          color={note.color}
          xPos={note.xPos}
          yPos={note.yPos}
          likes={note.likes}
          isOwner={isOwner}
        />
      ))}
    </>
  );
});

// 2. Create Note API (Only allowed on user's own board)
notesApp.post('/', async (c) => {
  const sessionToken = getCookie(c, 'session');
  if (!sessionToken) return c.text('未登录，无权发布', 401);

  try {
    const payload = await verify(sessionToken, JWT_SECRET, 'HS256');
    if (!payload || !payload.userId) return c.text('登录过期，请重新登录', 401);
    
    const currentUserId = String(payload.userId);
    const body = await c.req.parseBody();
    const content = String(body.content || '').trim();
    const color = String(body.color || 'yellow');

    const service = getNotesService(c.env.DB);
    const newNote = await service.createNote(content, color, currentUserId);
    
    return c.html(
      <Note 
        id={newNote.id} 
        content={newNote.content} 
        color={newNote.color} 
        xPos={newNote.xPos} 
        yPos={newNote.yPos} 
        likes={newNote.likes}
        isOwner={true}
      />
    );
  } catch (error: any) {
    return c.text(error.message || '创建留言失败', 400);
  }
});

// 3. Update Note Position API (Authenticated & Owner checked)
notesApp.put('/:id/position', async (c) => {
  const id = c.req.param('id');
  const auth = await checkNoteOwnership(c, id);
  if (!auth) return c.text('Forbidden: Unauthorized or not owner of this note', 403);

  const { xPos, yPos } = await c.req.json<{ xPos: number; yPos: number }>();
  await auth.service.updatePosition(id, xPos, yPos);

  return c.text('Position updated');
});

// 4. Get Inline Edit Form API (triggered on double click, owner checked)
notesApp.get('/:id/edit', async (c) => {
  const id = c.req.param('id');
  const auth = await checkNoteOwnership(c, id);
  if (!auth) return c.text('Forbidden', 403);

  const note = await auth.service.getNoteById(id);
  if (!note) return c.text('Note not found', 404);

  return c.html(
    <NoteEditForm id={note.id} content={note.content} color={note.color} />
  );
});

// 5. Get note raw content API (triggered on inline edit cancel)
notesApp.get('/:id/content', async (c) => {
  const id = c.req.param('id');
  const service = getNotesService(c.env.DB);
  const note = await service.getNoteById(id);

  if (!note) {
    return c.text('Note not found', 404);
  }

  // Check if current visitor owns the note to decide double-click edit trigger
  let isOwner = false;
  const sessionToken = getCookie(c, 'session');
  if (sessionToken) {
    try {
      const payload = await verify(sessionToken, JWT_SECRET, 'HS256');
      if (payload && payload.userId === note.userId) {
        isOwner = true;
      }
    } catch (e) {
      // Ignore invalid session token
    }
  }

  if (isOwner) {
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
  } else {
    return c.html(
      <div class="note-content mt-2 flex-grow overflow-y-auto break-words text-sm font-medium leading-relaxed font-sans pr-1">
        {note.content}
      </div>
    );
  }
});

// 6. Update Note Content API (Authenticated & Owner checked)
notesApp.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const auth = await checkNoteOwnership(c, id);
  if (!auth) return c.text('Forbidden', 403);

  const body = await c.req.parseBody();
  const content = String(body.content || '').trim();

  try {
    const updatedNote = await auth.service.updateContent(id, content);
    
    return c.html(
      <Note
        id={updatedNote.id}
        content={updatedNote.content}
        color={updatedNote.color}
        xPos={updatedNote.xPos}
        yPos={updatedNote.yPos}
        likes={updatedNote.likes}
        isOwner={true}
      />
    );
  } catch (error: any) {
    return c.text(error.message || '更新留言失败', 400);
  }
});

// 7. Delete Note API (Authenticated & Owner checked)
notesApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const auth = await checkNoteOwnership(c, id);
  if (!auth) return c.text('Forbidden', 403);

  await auth.service.deleteNote(id);
  
  // Return empty string to swap note card out of DOM
  return c.text('');
});

// 8. Increment Likes API (Accessible to anyone, including visitors)
notesApp.post('/:id/like', async (c) => {
  const id = c.req.param('id');
  try {
    const service = getNotesService(c.env.DB);
    const updatedNote = await service.incrementLikes(id);
    
    return c.html(
      <button 
        hx-post={`/api/notes/${updatedNote.id}/like`}
        hx-swap="outerHTML" 
        class="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-slate-950/20 hover:bg-slate-950/30 border border-slate-900/5 transition-all text-[11px] font-sans font-bold text-rose-600/80 active:scale-95 cursor-pointer shadow-sm shadow-indigo-950/5 select-none"
        onclick="event.stopPropagation()"
      >
        ❤️ <span class="text-slate-700 font-mono font-medium">{updatedNote.likes}</span>
      </button>
    );
  } catch (error: any) {
    return c.text(error.message || '点赞失败', 400);
  }
});

export default notesApp;
