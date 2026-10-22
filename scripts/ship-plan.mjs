// Plan interactif : menu aux flèches — Accepter · Éditer champ par champ · Régénérer (IA) · Abandonner.
import { TYPES, branchFor, subjectOf, titleFor } from './ship-agent.mjs';
import { config } from './ship-config.mjs';
import { c, prefill, select } from './ship-utils.mjs';

const TYPE_KEYS = Object.keys(TYPES);
const typeMenu = TYPE_KEYS.map((k) => `${k.padEnd(9)} ${c.dim(TYPES[k])}`);

const show = (p, { currentBranch, files }) => {
  const tag = { ai: `IA ${p.provider ?? ''}`.trim(), detected: 'détecté automatiquement', edited: 'édité' }[p.source] ?? p.source;
  console.log(`\n${c.bold('⛵ Plan')} ${c.dim(`(${tag})`)}`);
  console.log(`  titre     : ${c.cyan(p.title)}`);
  if (p.source === 'detected' && p.why) console.log(`  pourquoi  : ${c.dim(p.why.join(' · '))}`);
  console.log(`  branche   : ${currentBranch ? `${currentBranch} ${c.dim('(branche existante)')}` : p.branch}`);
  if (p.issue) console.log(`  issue     : ${config().issues.keyword} #${p.issue.number} ${c.dim(p.issue.title)}`);
  console.log(`  résumé    : ${p.summary.length > 100 ? `${p.summary.slice(0, 100)}…` : p.summary}`);
  console.log(`  review    : risques ${p.risks} · a11y ${p.accessibility} · breaking ${p.breaking}`);
  if (p.changesetMd) console.log(`  changeset : ${p.changesetMd.split('\n').filter((l) => l && l !== '---').join(' | ')}`);
  console.log(`  fichiers  : ${files.length}`);
  for (const f of files.slice(0, 12)) console.log(`              ${c.dim(f)}`);
  if (files.length > 12) console.log(`              ${c.dim(`… +${files.length - 12}`)}`);
};

const edit = async (io, plan, { currentBranch }) => {
  console.log(c.dim('\nEnter = garder la valeur. Flèches ← → pour éditer le texte.\n'));
  const type = TYPE_KEYS[await select(io, 'Type', typeMenu, TYPE_KEYS.indexOf(plan.type))];
  const oldSubject = subjectOf(plan.title);
  const subject = (await prefill(io.rl, `${c.bold('Sujet')}   : `, oldSubject)) || oldSubject;
  const title = titleFor(type, subject);

  // La branche suit le titre, sauf si on la modifie explicitement.
  let branch = plan.branch;
  if (!currentBranch) {
    const derived = type !== plan.type || subject !== oldSubject ? branchFor(type, subject) : plan.branch;
    branch = (await prefill(io.rl, `${c.bold('Branche')} : `, derived)) || derived;
  }
  const summary = (await prefill(io.rl, `${c.bold('Résumé')}  : `, plan.summary)) || plan.summary;
  const risks = (await prefill(io.rl, `${c.bold('Risques')} : `, plan.risks)) || plan.risks;
  const breaking = (await prefill(io.rl, `${c.bold('Breaking')}: `, plan.breaking)) || plan.breaking;
  return { ...plan, type, title, branch, summary, risks, breaking, source: 'edited' };
};

// → plan approuvé, ou null si abandon.
export const reviewPlan = async (io, plan, { currentBranch, files, regenerate }) => {
  show(plan, { currentBranch, files });
  while (true) {
    const actions = [['accept', 'Accepter et livrer'], ['edit', 'Éditer'], ...(regenerate ? [['regen', 'Régénérer (IA)']] : []), ['quit', 'Abandonner']];
    console.log('');
    const action = actions[await select(io, 'Ce plan te va ?', actions.map(([, label]) => label))][0];
    if (action === 'accept') return plan;
    if (action === 'quit') return null;
    if (action === 'edit') plan = await edit(io, plan, { currentBranch });
    if (action === 'regen') {
      const feedback = await io.rl.question('Feedback pour l\'agent (ex: "plus court", "c\'est un fix") — Enter sans feedback : ');
      console.log(c.dim('…régénération'));
      const next = await regenerate(plan, feedback.trim());
      if (next) plan = { ...next, issue: plan.issue };
    }
    show(plan, { currentBranch, files });
  }
};
