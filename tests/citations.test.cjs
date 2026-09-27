const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('loads current Dimensions counts and leaves unavailable counts unknown', async () => {
  const scriptPath = path.join(__dirname, '..', 'citations.js');
  assert.ok(fs.existsSync(scriptPath), 'citation loader is missing');

  const counts = ['—', '—', '—'].map((textContent) => ({ textContent }));
  const dois = ['10.1016/j.optlaseng.2024.108671', '10.1016/j.patcog.2026.114993', '10.1364/OE.562136'];
  const entries = dois.map((doi, index) => ({ dataset: { doi }, querySelector: () => counts[index] }));
  const requests = [];
  const responses = [
    { doi: dois[0], times_cited: 9, recent_citations: 8, relative_citation_ratio: null, field_citation_ratio: null },
    { doi: dois[1], times_cited: null, recent_citations: null, relative_citation_ratio: null, field_citation_ratio: null },
  ];
  const fetch = async (url, options) => {
    requests.push({ url, options });
    const index = requests.length - 1;
    if (index === 2) throw new Error('network unavailable');
    return { ok: true, json: async () => responses[index] };
  };

  vm.runInNewContext(fs.readFileSync(scriptPath, 'utf8'), {
    document: { querySelectorAll: () => entries },
    fetch,
    Number,
  });
  await new Promise(setImmediate);

  assert.deepEqual(counts.map((count) => count.textContent), ['9', '—', '—']);
  assert.equal(requests.length, 3);
  assert.equal(requests[0].url, 'https://metrics-api.dimensions.ai/doi/10.1016/j.optlaseng.2024.108671');
  assert.equal(requests[0].options.cache, 'no-store');
});
