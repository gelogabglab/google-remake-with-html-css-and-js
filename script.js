// Use DuckDuckGo's Instant Answer API for demo purposes, since Google blocks CORS.
// In real scenarios, use a backend proxy or serverless function for Google Custom Search API.
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const luckyBtn = document.getElementById('luckyBtn');
const clearBtn = document.getElementById('clearBtn');

function showResults(items) {
  resultsDiv.innerHTML = '';
  if (!items || items.length === 0) {
    resultsDiv.innerHTML = '<div class="result-item">No results found.</div>';
  } else {
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'result-item';
      el.innerHTML = `
        <a href="${item.url}" target="_blank" class="result-title">${item.title}</a>
        <span class="result-link">${item.url}</span>
        <span class="result-snippet">${item.snippet}</span>
      `;
      resultsDiv.appendChild(el);
    });
  }
  resultsDiv.style.display = 'flex';
  clearBtn.style.display = 'inline-block';
}

function clearResults() {
  resultsDiv.innerHTML = '';
  resultsDiv.style.display = 'none';
  clearBtn.style.display = 'none';
}

function fetchDuckDuckGoResults(query, lucky = false) {
  // DuckDuckGo Instant Answer API (docs: https://api.duckduckgo.com/api)
  // CORS is allowed
  fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`)
    .then(r => r.json())
    .then(data => {
      let results = [];
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        results = data.RelatedTopics.filter(t => t.Text && t.FirstURL).map(t => ({
          title: t.Text.split(' - ')[0] || t.Text,
          url: t.FirstURL,
          snippet: t.Text
        }));
      }
      if (results.length === 0 && data.AbstractURL) {
        results.push({
          title: data.Heading || query,
          url: data.AbstractURL,
          snippet: data.Abstract || query
        });
      }
      if (lucky && results.length > 0) {
        window.open(results[0].url, '_blank');
        return;
      }
      showResults(results);
    })
    .catch(() => {
      resultsDiv.innerHTML = '<div class="result-item">Unable to fetch results.</div>';
      resultsDiv.style.display = 'flex';
    });
}

searchForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  fetchDuckDuckGoResults(query, false);
});

luckyBtn.addEventListener('click', function() {
  const query = searchInput.value.trim();
  if (!query) return;
  fetchDuckDuckGoResults(query, true);
});

clearBtn.addEventListener('click', clearResults);

// Pressing "Enter" in the search bar triggers search
searchInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    // Let form's submit event handler take over
    return;
  }
});
