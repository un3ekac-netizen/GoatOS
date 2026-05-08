import { createServer } from 'http';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const PORT = 8766;

function jsonResponse(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
  });
  res.end(JSON.stringify(data));
}

function getSessions() {
  const sessDir = '/home/ubuntu/.openclaw/agents/main/sessions';
  try {
    const files = readdirSync(sessDir)
      .filter(f => f.endsWith('.jsonl') && !f.includes('.trajectory'));
    return files.map(f => {
      const stat = statSync(join(sessDir, f));
      const sessionId = f.replace('.jsonl', '');
      // Read first and last few lines to get metadata
      const raw = readFileSync(join(sessDir, f), 'utf-8');
      const lines = raw.trim().split('\n').filter(Boolean);
      let channel = 'unknown', model = 'unknown', firstUserMsg = '';
      let msgCount = 0;
      for (const line of lines) {
        try {
          const obj = JSON.parse(line);
          if (obj.type === 'session') channel = obj.provider || 'unknown';
          if (obj.type === 'model_change') model = obj.modelId || 'unknown';
          if (obj.type === 'message' && obj.message?.role === 'user' && !firstUserMsg) {
            const c = obj.message.content;
            firstUserMsg = typeof c === 'string' ? c : (Array.isArray(c) ? c.filter(x=>x.type==='text').map(x=>x.text).join(' ') : '');
            firstUserMsg = firstUserMsg.slice(0, 120);
          }
          if (obj.type === 'message') msgCount++;
        } catch {}
      }
      return {
        sessionId,
        channel,
        model,
        preview: firstUserMsg,
        messageCount: msgCount,
        updatedAt: stat.mtimeMs,
        status: 'active'
      };
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch { return []; }
}

function getSessionHistory(sessionFile) {
  const sessDir = '/home/ubuntu/.openclaw/agents/main/sessions';
  // Match the session ID (ignore .trajectory files)
  const candidates = readdirSync(sessDir).filter(f =>
    f.endsWith('.jsonl') && !f.includes('.trajectory') && f.includes(sessionFile)
  );
  if (!candidates.length) return [];

  const raw = readFileSync(join(sessDir, candidates[0]), 'utf-8');
  const lines = raw.trim().split('\n').filter(Boolean);
  const messages = [];

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      // Session JSONL wraps messages: { type: 'message', message: { role, content } }
      if (obj.type !== 'message') continue;
      const msg = obj.message;
      if (!msg || !msg.role) continue;
      if (msg.role !== 'user' && msg.role !== 'assistant') continue;

      let content = '';
      if (typeof msg.content === 'string') {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        content = msg.content
          .filter(c => c.type === 'text')
          .map(c => c.text)
          .join('\n');
      }
      // Skip noise
      if (!content || content === 'NO_REPLY' || content === 'HEARTBEAT_OK') continue;
      if (content.startsWith('[OpenClaw heartbeat')) continue;
      // Trim very long messages
      if (content.length > 3000) content = content.slice(0, 3000) + '\n... (truncated)';
      messages.push({
        role: msg.role,
        content,
        timestamp: obj.timestamp || null,
      });
    } catch { /* skip malformed */ }
  }
  return messages;
}

function getTasks() {
  try { return JSON.parse(readFileSync('/home/ubuntu/projects/goat-os/ops/tasks.json', 'utf-8')); }
  catch { return []; }
}

function getDeliverables() {
  try { return JSON.parse(readFileSync('/home/ubuntu/projects/goat-os/ops/deliverables.json', 'utf-8')); }
  catch { return []; }
}

// Old getCronJobs removed — replaced by file-based version below

function getStatus() {
  try {
    const out = execSync('openclaw status --json 2>/dev/null', { timeout: 10000 }).toString();
    return JSON.parse(out);
  } catch { return {}; }
}

function getDailyBriefs() {
  const dir = '/home/ubuntu/projects/goat-os/brain/daily-briefs';
  try {
    const files = readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();
    return files.map(f => {
      const date = f.replace('.md', '');
      const content = readFileSync(join(dir, f), 'utf-8');
      // Extract first heading as title
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : date;
      return { date, title, filename: f };
    });
  } catch { return []; }
}

function getDailyBrief(date) {
  const filepath = join('/home/ubuntu/projects/goat-os/brain/daily-briefs', `${date}.md`);
  try {
    return readFileSync(filepath, 'utf-8');
  } catch { return null; }
}

function getPrototypes() {
  try {
    return JSON.parse(readFileSync('/home/ubuntu/projects/goat-os/lab/prototypes/manifest.json', 'utf-8'));
  } catch { return []; }
}

function getOvernightBuilds() {
  try {
    return JSON.parse(readFileSync('/home/ubuntu/projects/goat-os/lab/overnight-builds/builds.json', 'utf-8'));
  } catch { return []; }
}

function getCronJobs() {
  try {
    const raw = JSON.parse(readFileSync('/home/ubuntu/.openclaw/cron/jobs.json', 'utf-8'));
    const jobs = Array.isArray(raw) ? raw : (raw.jobs || []);
    let stateMap = {};
    try {
      const stateRaw = JSON.parse(readFileSync('/home/ubuntu/.openclaw/cron/jobs-state.json', 'utf-8'));
      // State file uses { jobs: { [id]: { state: {...} } } }
      stateMap = stateRaw.jobs || {};
    } catch {}
    return jobs.map(j => {
      const s = stateMap[j.id] || {};
      return { ...j, state: s.state || j.state || {} };
    });
  } catch (err) { console.error('getCronJobs failed:', err.message); return []; }
}

function getOsDocs() {
  try {
    return readFileSync('/home/ubuntu/projects/goat-os/brain/os-docs/latest.md', 'utf-8');
  } catch { return '# No documentation yet'; }
}

function getBuildLogs() {
  try {
    return JSON.parse(readFileSync('/home/ubuntu/projects/goat-os/lab/build-logs/logs.json', 'utf-8'));
  } catch { return []; }
}

function getIdeas() {
  try {
    return JSON.parse(readFileSync('/home/ubuntu/projects/goat-os/lab/self-improvement/ideas.json', 'utf-8'));
  } catch { return []; }
}

const server = createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  try {
    if (path === '/api/sessions') {
      jsonResponse(res, getSessions());
    } else if (path.startsWith('/api/sessions/') && path.endsWith('/history')) {
      const key = path.replace('/api/sessions/', '').replace('/history', '');
      jsonResponse(res, getSessionHistory(decodeURIComponent(key)));
    } else if (path === '/api/briefs') {
      jsonResponse(res, getDailyBriefs());
    } else if (path.startsWith('/api/briefs/')) {
      const date = path.replace('/api/briefs/', '');
      const content = getDailyBrief(date);
      if (content) jsonResponse(res, { date, content });
      else jsonResponse(res, { error: 'not found' }, 404);
    } else if (path === '/api/prototypes') {
      jsonResponse(res, getPrototypes());
    } else if (path === '/api/overnight-builds') {
      jsonResponse(res, getOvernightBuilds());
    } else if (path === '/api/os-docs') {
      jsonResponse(res, { content: getOsDocs() });
    } else if (path === '/api/build-logs') {
      jsonResponse(res, getBuildLogs());
    } else if (path === '/api/ideas') {
      jsonResponse(res, getIdeas());
    } else if (path === '/api/jira/sync' && req.method === 'POST') {
      import('/home/ubuntu/projects/goat-os/ops/jira-sync.mjs').then(({ syncJira }) => {
        syncJira().then(result => jsonResponse(res, result)).catch(e => jsonResponse(res, { error: e.message }, 500));
      }).catch(e => jsonResponse(res, { error: e.message }, 500));
      return;
    } else if (path === '/api/tasks' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const task = JSON.parse(body);
          const tasks = getTasks();
          const id = 'task-' + String(tasks.length + 1).padStart(3, '0') + '-' + Date.now().toString(36);
          const now = new Date().toISOString();
          const newTask = {
            id,
            title: task.title || 'Untitled',
            description: task.description || '',
            stage: task.stage || 'new',
            priority: task.priority || 'medium',
            assignee: task.assignee || 'Goat',
            client: task.client || 'Hampr',
            owner: 'Goat',
            dueDate: task.dueDate || null,
            slaDate: task.slaDate || task.dueDate || null,
            blockers: task.blockers || [],
            statusHistory: [{ stage: 'new', timestamp: now, note: task.note || 'Created by Goat via chat' }],
            createdAt: now,
            updatedAt: now
          };
          tasks.push(newTask);
          writeFileSync('/home/ubuntu/projects/goat-os/ops/tasks.json', JSON.stringify(tasks, null, 2));
          jsonResponse(res, newTask, 201);
        } catch (e) { jsonResponse(res, { error: e.message }, 400); }
      });
      return;
    } else if (path.startsWith('/api/tasks/') && path.endsWith('/deliverables') && req.method === 'GET') {
      const taskId = path.replace('/api/tasks/', '').replace('/deliverables', '');
      const delDir = join('/home/ubuntu/projects/goat-os/ops/deliverables', taskId);
      try {
        if (existsSync(delDir) && statSync(delDir).isDirectory()) {
          const files = readdirSync(delDir).map(f => {
            const fp = join(delDir, f);
            const st = statSync(fp);
            return {
              name: f,
              path: fp,
              size: st.size,
              updatedAt: st.mtimeMs,
              content: st.size < 100000 ? readFileSync(fp, 'utf-8') : '(file too large to preview)'
            };
          });
          jsonResponse(res, files);
        } else {
          jsonResponse(res, []);
        }
      } catch { jsonResponse(res, []); }
    } else if (path.startsWith('/api/tasks/') && path.includes('/download/')) {
      // /api/tasks/<taskId>/download/<filename>
      const parts = path.replace('/api/tasks/', '').split('/download/');
      const taskId = decodeURIComponent(parts[0]);
      const filename = decodeURIComponent(parts[1] || '');
      const filePath = join('/home/ubuntu/projects/goat-os/ops/deliverables', taskId, filename);
      try {
        if (existsSync(filePath) && statSync(filePath).isFile()) {
          const ext = extname(filePath).toLowerCase();
          const MIME_DL = {
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.pdf': 'application/pdf',
            '.md': 'text/markdown',
            '.txt': 'text/plain',
            '.js': 'application/javascript',
            '.py': 'text/x-python',
            '.ts': 'application/typescript',
            '.json': 'application/json',
            '.html': 'text/html',
            '.csv': 'text/csv',
          };
          const mime = MIME_DL[ext] || 'application/octet-stream';
          const data = readFileSync(filePath);
          res.writeHead(200, {
            'Content-Type': mime,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': data.length,
            'Access-Control-Allow-Origin': '*',
          });
          res.end(data);
        } else {
          jsonResponse(res, { error: 'file not found' }, 404);
        }
      } catch (e) { jsonResponse(res, { error: e.message }, 500); }
    } else if (path === '/api/delegate' && req.method === 'POST') {
      import('/home/ubuntu/projects/goat-os/ops/delegate.mjs').then(({ runDelegation }) => {
        runDelegation().then(result => jsonResponse(res, result)).catch(e => jsonResponse(res, { error: e.message }, 500));
      }).catch(e => jsonResponse(res, { error: e.message }, 500));
      return;
    } else if (path === '/api/delegation-queue') {
      try { jsonResponse(res, JSON.parse(readFileSync('/home/ubuntu/projects/goat-os/ops/delegation-queue.json', 'utf-8'))); }
      catch { jsonResponse(res, []); }
    } else if (path === '/api/tasks') {
      jsonResponse(res, getTasks());
    } else if (path === '/api/deliverables') {
      jsonResponse(res, getDeliverables());
    } else if (path.startsWith('/api/tasks/') && path.endsWith('/move') && req.method === 'PATCH') {
      const taskId = path.replace('/api/tasks/', '').replace('/move', '');
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { stage } = JSON.parse(body);
          const tasks = getTasks();
          const task = tasks.find(t => t.id === taskId);
          if (!task) { jsonResponse(res, { error: 'Task not found' }, 404); return; }
          const oldStage = task.stage;
          task.stage = stage;
          task.updatedAt = new Date().toISOString();
          task.statusHistory.push({ stage, timestamp: task.updatedAt, note: 'Manually moved by Albs' });
          writeFileSync('/home/ubuntu/projects/goat-os/ops/tasks.json', JSON.stringify(tasks, null, 2));
          jsonResponse(res, { id: taskId, stage, oldStage });
        } catch (e) { jsonResponse(res, { error: e.message }, 400); }
      });
      return;
    } else if (path === '/api/cron') {
      jsonResponse(res, getCronJobs());
    } else if (path === '/api/cron/detail') {
      jsonResponse(res, getCronJobs());
    } else if (path.startsWith('/api/cron/') && path.endsWith('/toggle') && req.method === 'PATCH') {
      const jobId = path.replace('/api/cron/', '').replace('/toggle', '');
      // Read current jobs, toggle enabled, write back
      try {
        const raw = JSON.parse(readFileSync('/home/ubuntu/.openclaw/cron/jobs.json', 'utf-8'));
        const jobs = raw.jobs || [];
        const job = jobs.find(j => j.id === jobId);
        if (!job) { jsonResponse(res, { error: 'Job not found' }, 404); return; }
        // Read request body for desired state
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const { enabled } = JSON.parse(body);
            job.enabled = !!enabled;
            job.updatedAtMs = Date.now();
            raw.jobs = jobs;
            writeFileSync('/home/ubuntu/.openclaw/cron/jobs.json', JSON.stringify(raw, null, 2));
            jsonResponse(res, { id: jobId, enabled: job.enabled });
          } catch (e) { jsonResponse(res, { error: e.message }, 400); }
        });
        return;
      } catch (e) { jsonResponse(res, { error: e.message }, 500); }
    } else if (path === '/api/status') {
      jsonResponse(res, getStatus());
    } else {
      // Static file serving for GoatOS UI
      const STATIC_DIR = '/home/ubuntu/projects/goat-os';
      const filePath = path === '/' ? '/index.html' : path;
      const fullPath = join(STATIC_DIR, filePath);
      const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
      try {
        if (existsSync(fullPath) && statSync(fullPath).isFile()) {
          const ext = extname(fullPath);
          const mime = MIME[ext] || 'application/octet-stream';
          const data = readFileSync(fullPath);
          res.writeHead(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' });
          res.end(data);
        } else {
          jsonResponse(res, { error: 'not found' }, 404);
        }
      } catch { jsonResponse(res, { error: 'not found' }, 404); }
    }
  } catch (e) {
    jsonResponse(res, { error: e.message }, 500);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`GoatOS API running on http://127.0.0.1:${PORT}`);
});
