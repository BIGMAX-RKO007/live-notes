import { Hono } from 'hono';
import boardController from './features/board/board.controller';
import notesController from './features/notes/notes.controller';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Mount feature controllers
app.route('/', boardController);
app.route('/api/notes', notesController);

export default app;
