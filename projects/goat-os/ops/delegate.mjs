import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

const TASKS_PATH = '/home/ubuntu/projects/goat-os/ops/tasks.json';
const QUEUE_PATH = '/home/ubuntu/projects/goat-os/ops/delegation-queue.json';
const DELIVERABLES_DIR = '/home/ubuntu/projects/goat-os/ops/deliverables';

function loadTasks() {
  try { return JSON.parse(readFileSync(TASKS_PATH, 'utf-8')); }
  catch { return []; }
}

function saveTasks(tasks) {
  writeFileSync(TASKS_PATH, JSON.stringify(tasks, null, 2));
}

function loadQueue() {
  try { return JSON.parse(readFileSync(QUEUE_PATH, 'utf-8')); }
  catch { return []; }
}

function saveQueue(queue) {
  writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
}

// Map task type to agent name and output format
function getAgentConfig(taskType) {
  const configs = {
    'Code': { agent: 'Forge', format: 'code', ext: 'js' },
    'Research/Analysis': { agent: 'Echo', format: 'report', ext: 'md' },
    'Marketing': { agent: 'Vector', format: 'marketing', ext: 'md' },
    'Copy': { agent: 'Vector', format: 'copy', ext: 'md' },
    'Writing': { agent: 'Vector', format: 'writing', ext: 'md' },
    'Operational': { agent: 'Castle', format: 'sop', ext: 'md' },
  };
  return configs[taskType] || { agent: 'Vector', format: 'writing', ext: 'md' };
}

// Build the sub-agent prompt based on task details
function buildAgentPrompt(task, agentConfig) {
  const safeTitle = task.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
  const outputDir = `${DELIVERABLES_DIR}/${task.id}`;
  const mdFile = `${safeTitle}.${agentConfig.ext}`;
  const docxFile = `${safeTitle}.docx`;
  const mdPath = `${outputDir}/${mdFile}`;
  const docxPath = `${outputDir}/${docxFile}`;

  const formatInstructions = {
    code: `Write clean, well-documented code files. Include a README.md explaining the code structure and how to run it.`,
    report: `Write a comprehensive markdown report with clear sections, data-driven insights, and actionable recommendations.`,
    marketing: `Write marketing deliverables — strategy docs, campaign briefs, or go-to-market plans. Be creative and brand-aware.`,
    copy: `Write polished, conversion-focused copy. Ads, emails, landing pages — whatever the brief calls for.`,
    writing: `Write professional, well-structured content. JDs, proposals, docs, articles — make it polished and ready to use.`,
    sop: `Write clear, step-by-step SOPs or checklists. Numbered steps, responsible parties, and deadlines where applicable.`,
  };

  return `You are ${agentConfig.agent}, a specialist agent in the GoatOS system. You have been assigned a task by Goat (the Executive Assistant).

## Your Task

**Title:** ${task.title}
**Type:** ${task.taskType || 'General'}
**Priority:** ${task.priority || 'Medium'}

## Description
${task.description || 'No description provided.'}

## Instructions
1. ${formatInstructions[agentConfig.format] || formatInstructions.writing}
2. Save your work to: ${mdPath}
3. After writing the .md file, convert it to .docx by running: pandoc "${mdPath}" -o "${docxPath}"
4. Update the task status in ${TASKS_PATH}: set stage to "albs-approval", set outputPath to "${mdPath}", and add a statusHistory entry with note "Work completed by ${agentConfig.agent}, moved to Albs review"

## Output Directory
${outputDir}

## Important
- Create the output directory if it doesn't exist
- Produce high-quality work — this goes straight to Albs for review
- The .docx file must be created so Albs can download it from the GoatOS dashboard
- Do your best work. No shortcuts.`;
}

export async function runDelegation() {
  const queue = loadQueue();
  if (queue.length === 0) {
    return { delegated: 0, message: 'No tasks in queue' };
  }

  const tasks = loadTasks();
  let delegated = 0;

  for (const queuedTask of queue) {
    const task = tasks.find(t => t.id === queuedTask.id);
    if (!task) continue;

    // Update task to in-progress
    task.stage = 'in-progress';
    task.delegated = true;
    task.updatedAt = new Date().toISOString();
    task.statusHistory.push({
      stage: 'in-progress',
      timestamp: task.updatedAt,
      note: `Delegated to sub-agent for ${task.taskType || 'general'} work`
    });

    // Create deliverables directory
    const taskDir = `${DELIVERABLES_DIR}/${task.id}`;
    if (!existsSync(taskDir)) {
      mkdirSync(taskDir, { recursive: true });
    }

    // Get agent config
    const agentConfig = getAgentConfig(task.taskType);

    // Build and spawn sub-agent
    const prompt = buildAgentPrompt(task, agentConfig);

    // Spawn the sub-agent via OpenClaw CLI
    try {
      const safeLabel = `agent-${task.id.replace(/[^a-zA-Z0-9]/g, '-')}`;
      const cmd = `openclaw sessions spawn --mode run --label "${safeLabel}" --message ${JSON.stringify(prompt)} 2>&1`;
      execSync(cmd, { timeout: 300000, cwd: '/home/ubuntu' });
      delegated++;
    } catch (e) {
      console.error(`Failed to spawn agent for ${task.id}:`, e.message);
      // Revert task status
      task.stage = 'new';
      task.delegated = false;
      task.statusHistory.push({
        stage: 'new',
        timestamp: new Date().toISOString(),
        note: `Delegation failed: ${e.message}`
      });
    }
  }

  // Clear the queue
  saveQueue([]);
  saveTasks(tasks);

  return { delegated, message: `${delegated} task(s) delegated to agents` };
}
