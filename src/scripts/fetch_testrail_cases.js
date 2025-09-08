

// Script: fetch_testrail_cases.js
// Description: Fetches all test cases from TestRail and stores them in a local SQLite database.
// Usage: node fetch_testrail_cases.js

const sqlite3 = require('sqlite3');
const dotenv = require('dotenv');
dotenv.config();

const TESTRAIL_URL = process.env.TESTRAIL_URL;
const TESTRAIL_USER = process.env.TESTRAIL_API_USER;
const TESTRAIL_KEY = process.env.TESTRAIL_API_KEY;

const db = new sqlite3.Database('./data/testrail_cases.db');

function base64(str) {
  return Buffer.from(str).toString('base64');
}


async function fetchFromTestrail(endpoint, attempt = 1) {
  const maxAttempts = 3;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  try {
    const res = await fetch(`${TESTRAIL_URL}/index.php?api/v2/${endpoint}`, {
      headers: {
        'Authorization': 'Basic ' + base64(`${TESTRAIL_USER}:${TESTRAIL_KEY}`),
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (err) {
    if (attempt < maxAttempts) {
      console.error(`[RETRY] Error on fetchFromTestrail(${endpoint}), attempt ${attempt}: ${err.message}`);
      await delay(1000 * attempt); // Exponential backoff: 1s, 2s
      return fetchFromTestrail(endpoint, attempt + 1);
    } else {
      console.error(`[FAIL] fetchFromTestrail(${endpoint}) failed after ${maxAttempts} attempts.`);
      throw err;
    }
  }
}

function createTables() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      name TEXT,
      is_completed INTEGER,
      suite_mode INTEGER,
      url TEXT,
      announcement TEXT,
      active INTEGER DEFAULT 1
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS suites (
      id INTEGER PRIMARY KEY,
      project_id INTEGER,
      name TEXT,
      description TEXT,
      is_master INTEGER,
      url TEXT,
      active INTEGER DEFAULT 1
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY,
      suite_id INTEGER,
      name TEXT,
      description TEXT,
      parent_id INTEGER,
      depth INTEGER,
      active INTEGER DEFAULT 1
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY,
      section_id INTEGER,
      title TEXT,
      custom_preconds TEXT,
      custom_steps_separated TEXT,
      custom_steps TEXT,
      type_id INTEGER,
      priority_id INTEGER,
      estimate TEXT,
      refs TEXT,
      created_by INTEGER,
      created_on INTEGER,
      updated_by INTEGER,
      updated_on INTEGER,
      milestone_id INTEGER,
      custom_expected TEXT,
      status_id INTEGER,
      template_id INTEGER,
      data TEXT,
      active INTEGER DEFAULT 1
    )`);
  });
}

async function syncTestrail() {
  createTables();
  const projectsResponse = await fetchFromTestrail('get_projects');
  console.log('Projects response:', projectsResponse);
  
  const projects = projectsResponse.projects || projectsResponse;
  if (!Array.isArray(projects)) {
    throw new Error('Failed to fetch projects. Check your TestRail credentials.');
  }
  
  // Filter only active projects (not completed)
  const activeProjects = projects.filter(p => !p.is_completed);
  console.log(`\nProcessing ${activeProjects.length} active projects out of ${projects.length} total...`);

  // Mark all as inactive before sync
  db.run('UPDATE projects SET active = 0');
  db.run('UPDATE suites SET active = 0');
  db.run('UPDATE sections SET active = 0');
  db.run('UPDATE cases SET active = 0');

  for (let i = 0; i < activeProjects.length; i++) {
    const project = activeProjects[i];
    console.log(`\n[${i+1}/${activeProjects.length}] Processing project: ${project.name} (ID: ${project.id})`);

    db.run(
      'INSERT OR REPLACE INTO projects (id, name, is_completed, suite_mode, url, announcement, active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [
        project.id,
        project.name,
        project.is_completed ? 1 : 0,
        project.suite_mode || null,
        project.url || null,
        project.announcement || null
      ]
    );

    try {
      const suitesResponse = await fetchFromTestrail(`get_suites/${project.id}`);
      const suites = Array.isArray(suitesResponse) ? suitesResponse : (suitesResponse.suites || []);
      console.log(`  - Found ${suites.length} suites`);

      for (let j = 0; j < suites.length; j++) {
        const suite = suites[j];
        console.log(`    [${j+1}/${suites.length}] Suite: ${suite.name}`);
        db.run(
          'INSERT OR REPLACE INTO suites (id, project_id, name, description, is_master, url, active) VALUES (?, ?, ?, ?, ?, ?, 1)',
          [
            suite.id,
            project.id,
            suite.name,
            suite.description || null,
            suite.is_master ? 1 : 0,
            suite.url || null
          ]
        );

        const sectionsResponse = await fetchFromTestrail(`get_sections/${project.id}&suite_id=${suite.id}`);
        const sections = Array.isArray(sectionsResponse) ? sectionsResponse : (sectionsResponse.sections || []);
        console.log(`      - Found ${sections.length} sections`);

        for (const section of sections) {
          db.run(
            'INSERT OR REPLACE INTO sections (id, suite_id, name, description, parent_id, depth, active) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [
              section.id,
              suite.id,
              section.name,
              section.description || null,
              section.parent_id || null,
              section.depth || null
            ]
          );

          // Fetch cases with limit to avoid timeout
          const casesResponse = await fetchFromTestrail(`get_cases/${project.id}&suite_id=${suite.id}&section_id=${section.id}&limit=100`);
          const cases = Array.isArray(casesResponse) ? casesResponse : (casesResponse.cases || []);

          console.log(`        - Section \"${section.name}\": ${cases.length} cases`);

          for (const c of cases) {
            db.run(
              `INSERT OR REPLACE INTO cases (
                id, section_id, title, custom_preconds, custom_steps_separated, custom_steps,
                type_id, priority_id, estimate, refs, created_by, created_on, updated_by, updated_on, milestone_id, custom_expected, status_id, template_id, data, active
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
              [
                c.id,
                section.id,
                c.title,
                c.custom_preconds || null,
                c.custom_steps_separated ? JSON.stringify(c.custom_steps_separated) : null,
                c.custom_steps || null,
                c.type_id || null,
                c.priority_id || null,
                c.estimate || null,
                c.refs || null,
                c.created_by || null,
                c.created_on || null,
                c.updated_by || null,
                c.updated_on || null,
                c.milestone_id || null,
                c.custom_expected || null,
                c.status_id || null,
                c.template_id || null,
                JSON.stringify(c)
              ]
            );
          }
        }
      }
    } catch (error) {
      console.error(`    Error in project ${project.name}:`, error.message);
      continue; // Continue with next project
    }
  }
  db.close();
  console.log('TestRail cases synced to SQLite!');
}

syncTestrail().catch(e => { console.error(e); db.close(); });
