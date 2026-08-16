import { NotesRepository } from './notes.repository';

export class NotesService {
  constructor(private notesRepo: NotesRepository) {}

  async getAllNotes() {
    return this.notesRepo.getAllNotes();
  }

  async getNoteById(id: string) {
    return this.notesRepo.getNoteById(id);
  }

  async createNote(content: string, color: string) {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      throw new Error('留言内容不能为空');
    }

    // Calculate random coordinate offsets (range 15% - 75%) to spread notes
    const xPos = Math.floor(Math.random() * 60) + 15;
    const yPos = Math.floor(Math.random() * 60) + 15;

    const id = crypto.randomUUID();
    const now = new Date();

    const [newNote] = await this.notesRepo.insertNote({
      id,
      content: trimmedContent,
      color,
      xPos,
      yPos,
      createdAt: now,
      updatedAt: now,
    });

    return newNote;
  }

  async updatePosition(id: string, xPos: number, yPos: number) {
    return this.notesRepo.updateNotePosition(id, xPos, yPos);
  }

  async updateContent(id: string, content: string) {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      throw new Error('留言内容不能为空');
    }

    const [updatedNote] = await this.notesRepo.updateNoteContent(id, trimmedContent);
    if (!updatedNote) {
      throw new Error('未找到该留言');
    }

    return updatedNote;
  }

  async deleteNote(id: string) {
    return this.notesRepo.deleteNote(id);
  }
}
