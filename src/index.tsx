import { Hono } from 'hono';
import boardController from './features/board/board.controller';
import notesController from './features/notes/notes.controller';
import authController from './features/auth/auth.controller';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Mount feature controllers
app.route('/', boardController);
app.route('/api/notes', notesController);
app.route('/api/auth', authController);

export default app;
