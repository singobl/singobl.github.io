document.querySelectorAll('.citation-stat[data-doi]').forEach(async (entry) => {
  try {
    const response = await fetch(`https://metrics-api.dimensions.ai/doi/${entry.dataset.doi}`, { cache: 'no-store' });
    if (!response.ok) return;

    const { times_cited: count } = await response.json();
    if (Number.isInteger(count) && count >= 0) {
      entry.querySelector('strong').textContent = String(count);
    }
  } catch {
    // Keep the unknown placeholder when Dimensions cannot be reached.
  }
});
