import { Hono } from 'hono';
import { getDb } from '../../db/client';
import { NotesRepository } from './notes.repository';
import { NotesService } from './notes.service';

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

// 1. Poll API - Returns notes HTML fragment for HTMX polling
notesApp.get('/list', async (c) => {
  const service = getNotesService(c.env.DB);
  const allNotes = await service.getAllNotes();
  return c.html(
    <>
      {allNotes.map((note: any) => (
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

// 2. Create Note API
notesApp.post('/', async (c) => {
  const body = await c.req.parseBody();
  const content = String(body.content || '').trim();
  const color = String(body.color || 'yellow');

  try {
    const service = getNotesService(c.env.DB);
    const newNote = await service.createNote(content, color);
    
    return c.html(
      <Note 
        id={newNote.id} 
        content={newNote.content} 
        color={newNote.color} 
        xPos={newNote.xPos} 
        yPos={newNote.yPos} 
      />
    );
  } catch (error: any) {
    return c.text(error.message || '创建留言失败', 400);
  }
});

// 3. Update Note Position API
notesApp.put('/:id/position', async (c) => {
  const id = c.req.param('id');
  const { xPos, yPos } = await c.req.json<{ xPos: number; yPos: number }>();

  const service = getNotesService(c.env.DB);
  await service.updatePosition(id, xPos, yPos);

  return c.text('Position updated');
});

// 4. Get Inline Edit Form API (triggered on double click)
notesApp.get('/:id/edit', async (c) => {
  const id = c.req.param('id');
  const service = getNotesService(c.env.DB);
  const note = await service.getNoteById(id);

  if (!note) {
    return c.text('Note not found', 404);
  }

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

// 6. Update Note Content API
notesApp.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.parseBody();
  const content = String(body.content || '').trim();

  try {
    const service = getNotesService(c.env.DB);
    const updatedNote = await service.updateContent(id, content);
    
    return c.html(
      <Note
        id={updatedNote.id}
        content={updatedNote.content}
        color={updatedNote.color}
        xPos={updatedNote.xPos}
        yPos={updatedNote.yPos}
      />
    );
  } catch (error: any) {
    return c.text(error.message || '更新留言失败', 400);
  }
});

// 7. Delete Note API
notesApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const service = getNotesService(c.env.DB);
  await service.deleteNote(id);
  
  // Return empty string to swap note card out of DOM
  return c.text('');
});

export default notesApp;
