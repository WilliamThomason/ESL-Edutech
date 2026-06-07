// Linguatron Translation Tool — Main JavaScript
// Uses MyMemory Translation API (free, no API key required)
// Docs: https://mymemory.translated.net/doc/spec.php

(function() {
  'use strict';

  var translateTimeout = null;
  var isTranslating = false;
  var API_BASE = 'https://api.mymemory.translated.net/get';

  // ═══ TRANSLATION ═══
  window.translateText = function() {
    var text = document.getElementById('sourceText').value.trim();
    if (!text || isTranslating) return;

    var source = document.getElementById('sourceLang').value;
    var target = document.getElementById('targetLang').value;

    if (source === target) {
      showError('Source and target languages must be different.');
      return;
    }

    isTranslating = true;
    var btn = document.getElementById('translateBtn');
    btn.disabled = true;
    btn.textContent = 'Translating...';

    var output = document.getElementById('targetOutput');
    output.innerHTML = '<div class="loading"><div class="loading-spinner"></div> Translating...</div>';

    // MyMemory API: GET request with query parameters
    var url = API_BASE + '?q=' + encodeURIComponent(text) + '&langpair=' + source + '|' + target;

    fetch(url)
    .then(function(response) {
      if (!response.ok) throw new Error('Service unavailable');
      return response.json();
    })
    .then(function(data) {
      if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        var translated = data.responseData.translatedText;
        output.innerHTML = '<span class="translated-text">' + escapeHtml(translated) + '</span>';
        document.getElementById('targetCharCount').textContent = translated.length + ' chars';
      } else if (data.responseStatus === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        throw new Error('No translation returned');
      }
    })
    .catch(function(e) {
      console.error('Translation error:', e);
      output.innerHTML = '<span class="placeholder">Translation failed. Please try again.</span>';
      showError(e.message || 'Translation failed. Please try again.');
    })
    .finally(function() {
      isTranslating = false;
      btn.disabled = false;
      btn.textContent = 'Translate';
    });
  };

  // ═══ AUTO-TRANSLATE ═══
  window.handleInput = function() {
    var text = document.getElementById('sourceText').value;
    document.getElementById('charCount').textContent = text.length;
    clearTimeout(translateTimeout);
    if (text.trim().length > 2) {
      translateTimeout = setTimeout(window.translateText, 800);
    }
  };

  // ═══ LANGUAGE HANDLING ═══
  window.handleLangChange = function() {
    var source = document.getElementById('sourceLang');
    var target = document.getElementById('targetLang');
    document.getElementById('sourceLangLabel').textContent = source.options[source.selectedIndex].text;
    document.getElementById('targetLangLabel').textContent = target.options[target.selectedIndex].text;
    if (document.getElementById('sourceText').value.trim()) {
      window.translateText();
    }
  };

  window.swapLanguages = function() {
    var source = document.getElementById('sourceLang');
    var target = document.getElementById('targetLang');
    var temp = source.value;
    source.value = target.value;
    target.value = temp;
    window.handleLangChange();

    var sourceText = document.getElementById('sourceText');
    var targetOutput = document.getElementById('targetOutput');
    var translatedText = targetOutput.querySelector('.translated-text');
    if (translatedText) {
      var oldSource = sourceText.value;
      sourceText.value = translatedText.textContent;
      targetOutput.innerHTML = '<span class="translated-text">' + escapeHtml(oldSource) + '</span>';
      document.getElementById('charCount').textContent = sourceText.value.length;
    }
  };

  // ═══ UTILITY ═══
  window.clearSource = function() {
    document.getElementById('sourceText').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('targetOutput').innerHTML = '<span class="placeholder">Translation will appear here...</span>';
    document.getElementById('targetCharCount').textContent = '';
  };

  window.copyTranslation = function() {
    var output = document.getElementById('targetOutput');
    var text = output.querySelector('.translated-text');
    if (text) {
      navigator.clipboard.writeText(text.textContent).then(function() {
        showToast('Copied to clipboard');
      });
    }
  };

  window.pasteFromClipboard = function() {
    navigator.clipboard.readText().then(function(text) {
      document.getElementById('sourceText').value = text;
      document.getElementById('charCount').textContent = text.length;
      window.translateText();
    }).catch(function() {
      showToast('Clipboard access denied');
    });
  };

  window.speakTranslation = function() {
    var output = document.getElementById('targetOutput');
    var text = output.querySelector('.translated-text');
    if (text && 'speechSynthesis' in window) {
      var utterance = new SpeechSynthesisUtterance(text.textContent);
      utterance.lang = document.getElementById('targetLang').value;
      speechSynthesis.speak(utterance);
    }
  };

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showError(msg) {
    var existing = document.querySelector('.error-msg');
    if (existing) existing.remove();
    var div = document.createElement('div');
    div.className = 'error-msg animate-in';
    div.textContent = msg;
    document.querySelector('.translate-area').insertBefore(div, document.querySelector('.panels'));
    setTimeout(function() { div.remove(); }, 5000);
  }

  window.showToast = function(msg) {
    var existing = document.querySelector('.toast-msg');
    if (existing) existing.remove();
    var div = document.createElement('div');
    div.className = 'toast-msg';
    div.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--bg-card);border:1px solid var(--accent);color:var(--text);padding:10px 20px;border-radius:8px;font-size:.8rem;font-weight:600;z-index:9999;white-space:nowrap;animation:slideUp .3s ease;box-shadow:0 4px 20px rgba(0,0,0,.4);';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(function() { div.style.opacity = '0'; div.style.transition = 'opacity .3s'; setTimeout(function() { div.remove(); }, 300); }, 2000);
  };

  // ═══ SECTION NAVIGATION ═══
  window.showSection = function(section) {
    document.querySelectorAll('.topbar-nav a').forEach(function(a) { a.classList.remove('active'); });
    event.target.classList.add('active');
    showToast(section.charAt(0).toUpperCase() + section.slice(1) + ' — coming soon');
  };

  // ═══ THEME TOGGLE (placeholder) ═══
  window.toggleTheme = function() {
    showToast('Theme picker — coming soon');
  };

  // ═══ KEYBOARD SHORTCUTS ═══
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      window.translateText();
    }
  });

})();
