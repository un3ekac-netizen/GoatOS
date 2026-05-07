import { createServer } from 'http';
import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

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

function getCronJobs() {
  try {
    const out = execSync('openclaw cron list --json 2>/dev/null', { timeout: 10000 }).toString();
    return JSON.parse(out);
  } catch { return { jobs: [] }; }
}

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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    } else if (path === '/api/cron') {
      jsonResponse(res, getCronJobs());
    } else if (path === '/api/status') {
      jsonResponse(res, getStatus());
    } else {
      jsonResponse(res, { error: 'not found' }, 404);
    }
  } catch (e) {
    jsonResponse(res, { error: e.message }, 500);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`GoatOS API running on http://127.0.0.1:${PORT}`);
});
