/* ============================================
   Search Functionality
   ============================================ */

(function() {
  'use strict';

  var searchBtn = document.getElementById('searchBtn');
  var searchModal = document.getElementById('searchModal');
  var searchClose = document.getElementById('searchClose');
  var searchInput = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');

  // Open search modal
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      searchModal.classList.add('active');
      setTimeout(function() {
        searchInput.focus();
      }, 100);
    });
  }

  // Close search modal
  function closeSearch() {
    searchModal.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '<p class="search-placeholder">Type to search across all pages...</p>';
  }

  if (searchClose) {
    searchClose.addEventListener('click', closeSearch);
  }

  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && searchModal.classList.contains('active')) {
      closeSearch();
    }
  });

  // Close on backdrop click
  searchModal.addEventListener('click', function(e) {
    if (e.target === searchModal) {
      closeSearch();
    }
  });

  // Searchable content
  var searchableContent = [
    { title: 'Home', url: 'index.html', keywords: 'lanmodulin terbium rare earth recovery e-waste fluorescent lamp protein engineering' },
    { title: 'Project Description', url: 'description.html', keywords: 'problem solution terbium scarcity e-waste challenges green solution' },
    { title: 'Design', url: 'design.html', keywords: 'tryptophan sensitized variants binding luminescence rational design' },
    { title: 'Engineering', url: 'engineering.html', keywords: 'design build test learn cycle gene synthesis protein purification characterization' },
    { title: 'Results', url: 'results.html', keywords: 'binding curves luminescence spectra selectivity assays leachate recovery data' },
    { title: 'Parts', url: 'parts.html', keywords: 'biobrick parts registry plasmids sequences' },
    { title: 'Safety', url: 'safety.html', keywords: 'responsible handling biosafety protocols environmental considerations' },
    { title: 'Human Practices', url: 'human-practices.html', keywords: 'engagement recyclers industry experts community stakeholder' },
    { title: 'Team', url: 'team.html', keywords: 'members students researchers advisors' },
    { title: 'Collaborations', url: 'collaborations.html', keywords: 'partnerships collaboration teams institutions' },
    { title: 'Attributions', url: 'attributions.html', keywords: 'acknowledgments sponsors support contributors' }
  ];

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      var query = searchInput.value.toLowerCase().trim();

      if (query.length === 0) {
        searchResults.innerHTML = '<p class="search-placeholder">Type to search across all pages...</p>';
        return;
      }

      var results = searchableContent.filter(function(item) {
        return item.title.toLowerCase().includes(query) ||
               item.keywords.toLowerCase().includes(query);
      });

      if (results.length === 0) {
        searchResults.innerHTML = '<p class="search-placeholder">No results found for "' + query + '"</p>';
        return;
      }

      var html = '';
      results.forEach(function(item) {
        var snippet = item.keywords.split(' ').slice(0, 10).join(' ') + '...';
        html += '<div class="search-result-item" onclick="window.location.href=\'' + item.url + '\'">' +
                '<div class="search-result-title">' + item.title + '</div>' +
                '<div class="search-result-snippet">' + snippet + '</div>' +
                '<div class="search-result-page">' + item.url + '</div>' +
                '</div>';
      });
      searchResults.innerHTML = html;
    });
  }
})();
