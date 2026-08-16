import { Hono } from 'hono';
import { getDb } from '../../db/client';
import { NotesRepository } from '../notes/notes.repository';
import { NotesService } from '../notes/notes.service';
import { Layout } from '../../shared/components/Layout';
import { Board } from './components/Board';

type Bindings = {
  DB: D1Database;
};

const boardApp = new Hono<{ Bindings: Bindings }>();

boardApp.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const notesRepo = new NotesRepository(db);
    const notesService = new NotesService(notesRepo);
    
    const allNotes = await notesService.getAllNotes();

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

export default boardApp;
