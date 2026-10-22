#!/usr/bin/env node
// Ship-it watch — surveille la PR de ta branche et notifie (Windows / macOS / Linux) : reviews, commentaires,
// CI, conflit, merge. S'arrête quand la PR est mergée ou fermée. Usage : yarn ship:watch [numéro] [--test]
import { pathToFileURL } from 'node:url';
import { currentBranch } from './ship-git.mjs';
import { checksOf, openPrFor } from './ship-github.mjs';
import { IS_WIN, ShipError, banner, c, fail, ghJson, ghTry, git, gitTry, runAsync } from './ship-utils.mjs';

const INTERVAL = Math.max(10, Number(process.env.SHIP_WATCH_INTERVAL) || 30) * 1000;
const FIELDS = 'number,title,url,state,mergeable,reviewDecision,reviews,comments,statusCheckRollup';

// ── Notifications natives ──────────────────────────────────────────────────
const xml = (s) => s.replace(/[<>&'"]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[ch]);

// Toast Windows via PowerShell 5.1 (WinRT, sans module). Clic → ouvre la PR.
const windowsToast = (title, body, url) => {
  const toast = `<toast activationType="protocol" launch="${xml(url ?? '')}"><visual><binding template="ToastGeneric">`
    + `<text>${xml(title)}</text><text>${xml(body)}</text></binding></visual></toast>`;
  const script = [
    '[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null',
    '[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null',
    '$x = New-Object Windows.Data.Xml.Dom.XmlDocument',
    `$x.LoadXml('${toast.replace(/'/g, "''")}')`,
    "$id = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe'",
    '[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($id).Show([Windows.UI.Notifications.ToastNotification]::new($x))',
  ].join('\n');
  const encoded = Buffer.from(script, 'utf16le').toString('base64'); // -EncodedCommand : aucun souci d'échappement
  return runAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
};

export const notify = async (title, body, url) => {
  process.stdout.write('\x07'); // bip terminal, en complément
  if (IS_WIN) return windowsToast(title, body, url);
  if (process.platform === 'darwin') {
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return runAsync('osascript', ['-e', `display notification "${esc(body)}" with title "${esc(title)}" sound name "Glass"`]);
  }
  return runAsync('notify-send', ['--app-name=ship-it', title, body]);
};

// ── Détection des changements entre deux relevés ───────────────────────────
const snapshot = (pr) => ({
  state: pr.state,
  mergeable: pr.mergeable,
  reviews: new Set((pr.reviews ?? []).map((r) => r.id ?? `${r.author?.login}-${r.submittedAt}`)),
  comments: new Set((pr.comments ?? []).map((m) => m.id ?? `${m.author?.login}-${m.createdAt}`)),
  checks: checksOf(pr.statusCheckRollup),
});

const excerpt = (s = '', n = 90) => {
  const one = s.replace(/\s+/g, ' ').trim();
  return one.length > n ? `${one.slice(0, n - 1)}…` : one;
};

const events = (prev, pr) => {
  const out = [];
  const now = snapshot(pr);
  for (const r of pr.reviews ?? []) {
    if (prev.reviews.has(r.id ?? `${r.author?.login}-${r.submittedAt}`)) continue;
    const who = r.author?.login ?? 'quelqu\'un';
    if (r.state === 'APPROVED') out.push(['✅ PR approuvée', `${who} a approuvé${r.body ? ` : ${excerpt(r.body)}` : ''}`, 'green']);
    else if (r.state === 'CHANGES_REQUESTED') out.push(['✋ Changements demandés', `${who} : ${excerpt(r.body) || 'voir la PR'}`, 'red']);
    else if (r.body) out.push(['💬 Review', `${who} : ${excerpt(r.body)}`, 'cyan']);
  }
  for (const m of pr.comments ?? []) {
    if (prev.comments.has(m.id ?? `${m.author?.login}-${m.createdAt}`)) continue;
    out.push(['💬 Nouveau commentaire', `${m.author?.login ?? 'quelqu\'un'} : ${excerpt(m.body)}`, 'cyan']);
  }
  const wasRunning = prev.checks.pending > 0;
  if (wasRunning && now.checks.pending === 0 && (now.checks.ok || now.checks.failed)) {
    out.push(now.checks.failed
      ? ['❌ CI en échec', `${now.checks.failed} check(s) rouge(s) — gh pr checks ${pr.number}`, 'red']
      : ['🟢 CI verte', `${now.checks.ok} check(s) OK`, 'green']);
  }
  if (prev.mergeable !== 'CONFLICTING' && now.mergeable === 'CONFLICTING') {
    out.push(['⚠️ Conflit avec la base', 'Relance « yarn ship » sur ta branche : rebase automatique', 'yellow']);
  }
  if (now.state === 'MERGED') out.push(['🎉 PR mergée', `#${pr.number} ${pr.title} — « yarn ship » te ramène sur main à jour`, 'green']);
  if (now.state === 'CLOSED') out.push(['🚪 PR fermée sans merge', `#${pr.number} ${pr.title}`, 'yellow']);
  return { out, now };
};

const statusLine = (pr) => {
  const { ok, failed, pending } = checksOf(pr.statusCheckRollup);
  const ci = failed ? c.red(`CI ✗ ${failed}`) : pending ? c.yellow(`CI … ${pending}`) : ok ? c.green(`CI ✓ ${ok}`) : c.dim('pas de CI');
  const review = { APPROVED: c.green('approuvée'), CHANGES_REQUESTED: c.red('changements demandés'), REVIEW_REQUIRED: c.yellow('review en attente') }[pr.reviewDecision]
    ?? c.dim('pas de review requise');
  const conflict = pr.mergeable === 'CONFLICTING' ? ` · ${c.red('conflit')}` : '';
  return `${ci} · ${review} · 💬 ${(pr.comments?.length ?? 0) + (pr.reviews?.filter((r) => r.body).length ?? 0)}${conflict}`;
};

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });

// Boucle de surveillance — exportée pour être lancée directement à la fin de « yarn ship ».
export const watchPr = async (number) => {
  let pr = ghJson('pr', 'view', String(number), '--json', FIELDS);
  if (!pr) fail(`PR #${number} introuvable.`);
  banner(`watch — #${pr.number} ${pr.title}`);
  console.log(`  ${c.cyan(pr.url)}\n  ${statusLine(pr)}`);
  console.log(c.dim(`  Vérification toutes les ${INTERVAL / 1000} s · notifications natives · Ctrl+C pour arrêter.\n`));
  if (pr.state !== 'OPEN') return console.log(`  PR déjà ${pr.state === 'MERGED' ? 'mergée' : 'fermée'} — rien à surveiller.`);

  let prev = snapshot(pr);
  let offline = false;
  const tty = process.stdout.isTTY;
  process.on('SIGINT', () => { if (tty) process.stdout.write('\r\x1b[2K'); console.log(c.dim('Surveillance arrêtée.')); process.exit(0); });

  while (true) {
    for (let left = INTERVAL / 1000; left > 0; left--) {
      if (tty) process.stdout.write(`\r\x1b[2K  ${c.dim(`⏳ prochaine vérification dans ${left} s`)}`);
      await sleep(1000);
    }
    if (tty) process.stdout.write('\r\x1b[2K');

    const next = ghJson('pr', 'view', String(number), '--json', FIELDS);
    if (!next) {
      if (!offline) console.log(c.yellow(`  ${new Date().toLocaleTimeString()} GitHub injoignable — nouvel essai au prochain tour.`));
      offline = true;
      continue;
    }
    offline = false;
    pr = next;
    const { out, now } = events(prev, pr);
    prev = now;
    for (const [title, body, color] of out) {
      console.log(`  ${c.dim(new Date().toLocaleTimeString())} ${c[color](title)} ${c.dim('—')} ${body}`);
      await notify(`${title} · #${pr.number}`, body, pr.url);
    }
    if (out.length) console.log(`  ${statusLine(pr)}`);
    if (pr.state !== 'OPEN') return;
  }
};

const main = async () => {
  if (!gitTry('rev-parse', '--show-toplevel').ok) fail('Pas dans un dépôt git.');
  process.chdir(git('rev-parse', '--show-toplevel'));
  const args = process.argv.slice(2);

  if (args.includes('--test')) {
    const r = await notify('⛵ Ship-it', 'Les notifications fonctionnent !', 'https://github.com');
    console.log(r.ok ? `${c.green('✓')} Notification envoyée — tu devrais la voir apparaître.` : `${c.red('✗')} Échec : ${r.err.split('\n')[0]}`);
    if (!r.ok && process.platform === 'linux') console.log(c.dim('  → installe notify-send (paquet libnotify-bin)'));
    return;
  }
  if (!ghTry('auth', 'status').ok) fail('gh non authentifié : tape « gh auth login ».');

  const explicit = args.map((a) => a.replace(/^#/, '')).find((a) => /^\d+$/.test(a));
  const number = explicit ?? openPrFor(currentBranch())?.number;
  if (!number) fail(`Pas de PR ouverte pour la branche « ${currentBranch() || '?'} ». Précise un numéro : yarn ship:watch 12`);
  await watchPr(Number(number));
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`\n⛔ ${c.red(e instanceof ShipError ? e.message : `Erreur inattendue : ${e.message}`)}`);
    process.exitCode = 1;
  });
}
