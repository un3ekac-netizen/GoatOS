import { readFileSync, writeFileSync, existsSync } from 'fs';

const CREDS_PATH = '/home/ubuntu/projects/goat-os/.jira-credentials.json';
const TASKS_PATH = '/home/ubuntu/projects/goat-os/ops/tasks.json';
const QUEUE_PATH = '/home/ubuntu/projects/goat-os/ops/delegation-queue.json';

function loadCreds() {
  return JSON.parse(readFileSync(CREDS_PATH, 'utf-8'));
}

function loadTasks() {
  try { return JSON.parse(readFileSync(TASKS_PATH, 'utf-8')); }
  catch { return []; }
}

function saveTasks(tasks) {
  writeFileSync(TASKS_PATH, JSON.stringify(tasks, null, 2));
}

function getAuth(creds) {
  return 'Basic ' + Buffer.from(`${creds.email}:${creds.apiToken}`).toString('base64');
}

// Map Jira status to GoatOS pipeline stage
function mapStatus(jiraStatus) {
  const s = jiraStatus.toLowerCase();
  if (s === 'done' || s === 'closed' || s === 'resolved') return 'done';
  if (s === 'in review' || s === 'review' || s === 'approval') return 'albs-approval';
  if (s === 'in progress') return 'in-progress';
  if (s === 'blocked' || s === 'waiting' || s === 'on hold') return 'pending';
  return 'new'; // To Do, Open, Backlog, etc.
}

// Map Jira priority to GoatOS priority
function mapPriority(jiraPriority) {
  const p = (jiraPriority || '').toLowerCase();
  if (p === 'highest' || p === 'critical') return 'critical';
  if (p === 'high') return 'high';
  if (p === 'low' || p === 'lowest') return 'low';
  return 'medium';
}

// Extract plain text from Jira's ADF (Atlassian Document Format) description
function extractDescription(adf) {
  if (!adf || !adf.content) return '';
  function walk(nodes) {
    return nodes.map(n => {
      if (n.type === 'text') return n.text || '';
      if (n.content) return walk(n.content);
      return '';
    }).flat().join('');
  }
  return walk(adf.content).trim();
}

export async function syncJira() {
  const creds = loadCreds();
  const auth = getAuth(creds);
  const tasks = loadTasks();

  // Fetch COS issues where Goat-OS = Yes (using v3 search/jql POST endpoint)
  const jql = `project=${creds.projectKey} AND "${creds.customField}"="${creds.customFieldTrigger}"`;
  const fields = ['summary','description','status','priority','assignee','duedate','customfield_10600','customfield_10601','created','updated'];
  const url = `https://${creds.domain}/rest/api/3/search/jql`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ jql, fields, maxResults: 50 })
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`Jira API error: ${res.status} ${errText}`);
    return { synced: 0, created: 0, updated: 0, error: `HTTP ${res.status}` };
  }

  const data = await res.json();
  const issues = data.issues || [];
  let created = 0, updated = 0;
  const newTasks = [];

  for (const issue of issues) {
    const f = issue.fields;
    const jiraKey = issue.key;
    const taskId = `jira-${jiraKey}`;

    const stage = mapStatus(f.status?.name || 'To Do');
    const priority = mapPriority(f.priority?.name || 'Medium');
    const summary = f.summary || 'Untitled';
    const description = extractDescription(f.description);
    const dueDate = f.duedate || null;
    const assignee = f.assignee?.displayName || null;

    // Extract Task Type from dropdown field
    const taskTypeRaw = f.customfield_10601;
    const taskType = taskTypeRaw?.value || null;

    const existing = tasks.find(t => t.id === taskId);

    if (existing) {
      // Update if Jira changed
      const jiraUpdated = f.updated || '';
      if (existing._jiraUpdated !== jiraUpdated) {
        existing.title = summary;
        existing.description = description;
        existing.stage = stage;
        existing.priority = priority;
        existing.taskType = taskType || existing.taskType;
        existing.dueDate = dueDate;
        existing.assignee = assignee || existing.assignee;
        existing.updatedAt = new Date().toISOString();
        existing._jiraUpdated = jiraUpdated;
        existing.statusHistory.push({
          stage,
          timestamp: new Date().toISOString(),
          note: `Synced from Jira (${jiraKey})`
        });
        updated++;
      }
    } else {
      // Create new task
      const newTask = {
        id: taskId,
        title: summary,
        description,
        stage: 'new',
        priority,
        taskType,
        assignee: assignee || 'Goat',
        client: 'Hampr',
        owner: 'Goat',
        dueDate,
        slaDate: dueDate,
        blockers: [],
        delegated: false,
        outputPath: null,
        statusHistory: [
          { stage: 'new', timestamp: new Date().toISOString(), note: `Imported from Jira (${jiraKey})` }
        ],
        createdAt: f.created || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _jiraKey: jiraKey,
        _jiraUpdated: f.updated || ''
      };
      tasks.push(newTask);
      newTasks.push(newTask);
      created++;
    }
  }

  saveTasks(tasks);

  // Write new undelegated tasks to the delegation queue
  if (newTasks.length > 0) {
    let queue = [];
    try { queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf-8')); } catch {}
    for (const t of newTasks) {
      if (!queue.find(q => q.id === t.id)) {
        queue.push({
          id: t.id,
          title: t.title,
          description: t.description,
          taskType: t.taskType,
          priority: t.priority,
          _jiraKey: t._jiraKey,
          queuedAt: new Date().toISOString()
        });
      }
    }
    writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
    console.log(`Delegation queue: ${newTasks.length} new tasks queued`);
  }

  console.log(`Jira sync: ${issues.length} issues found, ${created} created, ${updated} updated`);
  return { synced: issues.length, created, updated, queued: newTasks.length };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncJira().then(r => console.log(JSON.stringify(r)));
}
