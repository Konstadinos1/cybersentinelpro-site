// Headless smoke test for CyberSentinelPro self-scan (DOM stub, real inline JS)
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const registry = new Map();          // id -> element stub
const listeners = {};
function makeEl(id) {
  const el = {
    id, style: {}, innerHTML: '', textContent: '', value: '', checked: false,
    disabled: false, href: '#', addEventListener(ev, fn) { listeners[id + ':' + ev] = fn; },
    scrollIntoView() {}, submit() {},
    querySelector() { return makeEl(id + '?>' + Math.random()); },
    querySelectorAll(sel) { return matchSel(sel); },
  };
  // Parse generated markup like a browser would: every id="..." becomes a stub element
  Object.defineProperty(el, 'innerHTML', {
    get() { return el._html || ''; },
    set(v) {
      el._html = v;
      for (const m of (v.match(/id="([^"]+)"/g) || [])) {
        const kid = m.slice(4, -1);
        if (!registry.has(kid)) registry.set(kid, makeEl(kid));
      }
    },
  });
  return el;
}
function matchSel(sel) {
  if (sel === '#quiz input:checked') {
    return [...registry.values()].filter(e => /^q\d+_\d+$/.test(e.id) && e.checked);
  }
  if (sel === '#gaps .gap') {
    const g = registry.get('gaps');
    return (g.innerHTML.match(/class="gap"/g) || []).map(() => makeEl('gapspan'));
  }
  return [];
}
global.document = {
  getElementById(id) { if (!registry.has(id)) registry.set(id, makeEl(id)); return registry.get(id); },
  querySelector(sel) { return makeEl('qs:' + sel); },
  querySelectorAll(sel) { return matchSel(sel); },
};
global.window = global;
global.scrollIntoView = () => {};
let fetchCalls = [];
global.fetch = async (url, opts) => {
  fetchCalls.push({ url, body: JSON.parse(opts.body) });
  return { json: async () => ({ success: 'true' }) };
};

// run the page script for real
eval(script);

// seed static elements a real browser parses from HTML before the script runs
for (const id of ['go', 'result', 'lead', 'done', 'num', 'fill', 'verdict', 'gaps', 'pfill',
                  'lform', 'f-nom', 'f-cour', 'f-ent', 'f-tel', 'f-cons', 'ferr', 'wa2']) {
  if (!registry.has(id)) registry.set(id, makeEl(id));
}
registry.get('go').disabled = true;   // static HTML: <button id="go" disabled>

// --- assertions ---
const A = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + '  ' + name); if (!cond) process.exitCode = 1; };

A('20 questions generated', [...registry.keys()].filter(k => /^q\d+_\d+$/.test(k)).length === 20);
A('submit button starts disabled', registry.get('go').disabled === true);

// scenario 1: 2 of 20 checked -> score 10, red verdict
registry.get('q0_0').checked = true;
registry.get('q4_0').checked = true;
score();
A('score = 10/100', registry.get('num').textContent === '10/100');
A('verdict is red path', registry.get('verdict').textContent.includes('Rouge'));
A('lead form shown after scoring', registry.get('lead').style.display === 'block');
const gapsHtml = registry.get('gaps').innerHTML;
A('gaps rendered (18 gaps)', gapsHtml.includes('Vos écarts (18)'));
A('truncation note present', gapsHtml.includes('autre(s)'));

// scenario 2: perfect score path
registry.forEach(e => { if (/^q\d+_\d+$/.test(e.id)) e.checked = true; });
score();
A('perfect score = 100/100', registry.get('num').textContent === '100/100');
A('good-base verdict', registry.get('verdict').textContent.includes('Bonne base'));

// scenario 3: lead submission with consent
registry.get('f-nom').value = 'Test User';
registry.get('f-cour').value = 'test@example.com';
registry.get('f-ent').value = 'Resto Test';
registry.get('f-tel').value = '514-000-0000';
registry.get('f-cons').checked = true;
const handler = listeners['lform:submit'];
A('submit handler registered', typeof handler === 'function');
const fakeEvent = { preventDefault() {} };
Promise.resolve(handler(fakeEvent)).then(() => {
  A('form posted to formsubmit', fetchCalls.length === 1 && fetchCalls[0].url.includes('formsubmit.co/ajax/costa@belleproslaval440.com'));
  const b = fetchCalls[0].body;
  A('payload has score', b.score === '100/100');
  A('payload has consented lead', b.nom === 'Test User' && b.courriel === 'test@example.com');
  A('payload has gap detail', typeof b.ecarts === 'string' && b.ecarts.length > 0);
  A('success card shown, form hidden', registry.get('done').style.display === 'block' && registry.get('lead').style.display === 'none');
  A('whatsapp fallback link carries score', registry.get('wa2').href.includes('wa.me/15145737441') && registry.get('wa2').href.includes('100'));
  console.log('DONE');
}).catch(e => { console.log('FAIL  submit handler threw: ' + e.message); process.exitCode = 1; });
