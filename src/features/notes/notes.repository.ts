import { eq, desc } from 'drizzle-orm';
import { notes } from './notes.schema';

export class NotesRepository {
  constructor(private db: any) {}

  async getAllNotes() {
    return this.db.select().from(notes).orderBy(desc(notes.createdAt));
  }

  async getNoteById(id: string) {
    const list = await this.db.select().from(notes).where(eq(notes.id, id)).limit(1);
    return list[0] || null;
  }

  async insertNote(noteData: {
    id: string;
    content: string;
    color: string;
    xPos: number;
    yPos: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return this.db.insert(notes).values(noteData).returning();
  }

  async updateNotePosition(id: string, xPos: number, yPos: number) {
    return this.db
      .update(notes)
      .set({ xPos, yPos, updatedAt: new Date() })
      .where(eq(notes.id, id));
  }

  async updateNoteContent(id: string, content: string) {
    return this.db
      .update(notes)
      .set({ content, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
  }

  async deleteNote(id: string) {
    return this.db.delete(notes).where(eq(notes.id, id));
  }
}
