import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { getDb } from '../../db/client';
import { users } from '../users/users.schema';
import { NotesRepository } from '../notes/notes.repository';
import { NotesService } from '../notes/notes.service';
import { Layout } from '../../shared/components/Layout';
import { Board } from './components/Board';
import { Landing } from './components/Landing';
import { JWT_SECRET } from '../auth/auth.controller';
import { eq } from 'drizzle-orm';

type Bindings = {
  DB: D1Database;
};

const boardApp = new Hono<{ Bindings: Bindings }>();

// 1. GET / - Check session, redirect or render Landing Page
boardApp.get('/', async (c) => {
  const sessionToken = getCookie(c, 'session');
  
  if (sessionToken) {
    try {
      const payload = await verify(sessionToken, JWT_SECRET, 'HS256');
      if (payload && payload.username) {
        return c.redirect(`/board/${payload.username}`);
      }
    } catch (e) {
      // Invalid token, fall through to Landing
    }
  }

  // Render Landing Page
  return c.html(
    <Layout title="实时匿名留言墙 - 钉上你的想法">
      <Landing />
    </Layout>
  );
});

// 2. GET /board/:username - Render user specific board (supports read-only shared view)
boardApp.get('/board/:username', async (c) => {
  const username = c.req.param('username').trim().toLowerCase();
  
  const db = getDb(c.env.DB);
  const [boardOwner] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  
  if (!boardOwner) {
    return c.html(
      <Layout title="画板未找到 - 实时匿名留言墙">
        <div class="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 text-center">
          <div class="text-5xl mb-4 select-none">🫙</div>
          <h1 class="text-2xl font-extrabold text-white mb-2 font-sans">该留言墙看板不存在</h1>
          <p class="text-sm text-slate-500 max-w-sm mb-6 font-sans">请确认您访问的网址是否有拼写错误，或者立即免费创建一个属于您自己的画板！</p>
          <a href="/" class="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 font-semibold transition-all font-sans">返回首页</a>
        </div>
      </Layout>
    );
  }

  // Check login state
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

  const notesRepo = new NotesRepository(db);
  const notesService = new NotesService(notesRepo);
  const userNotes = await notesService.getNotesByUserId(boardOwner.id);

  return c.html(
    <Layout title={`${username} 的留言墙 - 实时匿名留言墙`}>
      <Board notes={userNotes} isOwner={isOwner} username={username} />
    </Layout>
  );
});

// 3. GET /api/board/friends-modal - Render friends board look-up modal
boardApp.get('/api/board/friends-modal', (c) => {
  return c.html(
    <div id="friends-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="relative w-full max-w-md p-8 mx-4 rounded-2xl border border-[#e2d4c7] bg-[#fffdfa] shadow-2xl">
        <button 
          class="absolute top-4 right-4 text-[#8c7b70] hover:text-[#382b26] transition-colors p-1 rounded-full hover:bg-black/5"
          onclick="document.getElementById('friends-modal').remove()"
        >
          ✕
        </button>
        <h2 class="text-2xl font-bold text-[#382b26] text-center mb-6 font-serif">翻阅朋友的手账</h2>
        
        <form 
          onsubmit="event.preventDefault(); const name = document.getElementById('friend-name-input').value.trim().toLowerCase(); if(name) window.location.href = '/board/' + name;"
          class="flex flex-col gap-4"
        >
          <div>
            <label class="block text-xs font-semibold text-[#8c7b70] uppercase tracking-wider mb-2 font-sans">手账主人的用户名</label>
            <input 
              id="friend-name-input"
              type="text" 
              required 
              placeholder="请输入朋友的用户名" 
              class="w-full px-4 py-3 rounded-xl border border-[#e2d4c7] bg-[#fcfaf7] text-[#382b26] placeholder-[#b5a69c] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
            />
          </div>
          <button 
            type="submit" 
            class="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-semibold transition-all shadow-md shadow-amber-900/10 active:scale-[0.98] font-sans cursor-pointer"
          >
            立即翻阅
          </button>
        </form>

        {/* Visited history */}
        <div class="mt-6 border-t border-[#eee5dc] pt-4">
          <span class="block text-xs font-semibold text-[#8c7b70] uppercase tracking-wider mb-3 font-sans">历史访问记录</span>
          <div id="visited-history-list" class="flex flex-wrap gap-2 min-h-[36px] items-center">
            {/* Populated dynamically via JS from localStorage */}
          </div>
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const container = document.getElementById('visited-history-list');
            let list = [];
            try {
              list = JSON.parse(localStorage.getItem('visited_boards') || '[]');
            } catch(e) {}
            
            if (list.length === 0) {
              container.innerHTML = '<span class="text-xs text-[#b5a69c] font-sans">暂无历史访问记录</span>';
            } else {
              container.innerHTML = list.map(function(username) {
                return '<a href="/board/' + username + '" class="px-3.5 py-1.5 rounded-xl bg-[#f4ebe1] border border-[#e2d4c7] hover:border-amber-400 text-xs text-[#6b5b52] hover:text-[#382b26] transition-all font-sans flex items-center gap-1 cursor-pointer">📖 ' + username + '</a>';
              }).join('');
            }
          })();
        `
      }} />
    </div>
  );
});

// 4. GET /api/board/my-redirect - Direct redirect to own board if logged in, else open login modal
boardApp.get('/api/board/my-redirect', async (c) => {
  const sessionToken = getCookie(c, 'session');
  
  if (sessionToken) {
    try {
      const payload = await verify(sessionToken, JWT_SECRET, 'HS256');
      if (payload && payload.username) {
        c.header('HX-Redirect', `/board/${payload.username}`);
        return c.text('Redirecting...');
      }
    } catch (e) {
      // Invalid token, fall through to modal render
    }
  }

  // Not logged in -> Return the Login Modal
  return c.html(
    <div id="auth-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="relative w-full max-w-md p-8 mx-4 rounded-2xl border border-[#e2d4c7] bg-[#fffdfa] shadow-2xl">
        <button 
          class="absolute top-4 right-4 text-[#8c7b70] hover:text-[#382b26] transition-colors p-1 rounded-full hover:bg-black/5"
          onclick="document.getElementById('auth-modal').remove()"
        >
          ✕
        </button>
        <h2 class="text-2xl font-bold text-[#382b26] text-center mb-6 font-serif">打开我的手账本</h2>
        
        <div id="auth-error" class="hidden mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm text-center font-sans"></div>

        <form 
          hx-post="/api/auth/login" 
          hx-target="#auth-error" 
          hx-swap="innerHTML"
          class="flex flex-col gap-4"
        >
          <div>
            <label class="block text-xs font-semibold text-[#8c7b70] uppercase tracking-wider mb-2 font-sans">用户名</label>
            <input 
              type="text" 
              name="username" 
              required 
              placeholder="请输入您的用户名" 
              class="w-full px-4 py-3 rounded-xl border border-[#e2d4c7] bg-[#fcfaf7] text-[#382b26] placeholder-[#b5a69c] focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all font-sans"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#8c7b70] uppercase tracking-wider mb-2 font-sans">密码</label>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="请输入您的密码" 
              class="w-full px-4 py-3 rounded-xl border border-[#e2d4c7] bg-[#fcfaf7] text-[#382b26] placeholder-[#b5a69c] focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all font-sans"
            />
          </div>
          <button 
            type="submit" 
            class="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-300 hover:to-pink-400 text-white font-semibold transition-all shadow-md shadow-rose-900/10 active:scale-[0.98] font-sans cursor-pointer"
          >
            开启手账本
          </button>
        </form>
        <div class="mt-6 text-center text-sm text-[#8c7b70] font-sans">
          还没有手账本？ 
          <button 
            class="text-rose-500 hover:underline ml-1 cursor-pointer font-medium"
            hx-get="/api/auth/register-modal"
            hx-target="#auth-modal"
            hx-swap="outerHTML"
          >
            免费新建
          </button>
        </div>
      </div>
    </div>
  );
});

export default boardApp;
