// Linguatron Translation Tool — Main JavaScript
// Uses MyMemory Translation API (free, no API key required)

(function() {
  'use strict';

  var translateTimeout = null;
  var isTranslating = false;
  var API_BASE = 'https://api.mymemory.translated.net/get';

  // ═══ TRANSLATION WITH QUALITY CHECK ═══
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
    hideQualityIndicator();

    var url = API_BASE + '?q=' + encodeURIComponent(text) + '&langpair=' + source + '|' + target;

    fetch(url)
    .then(function(response) {
      if (!response.ok) throw new Error('Service unavailable');
      return response.json();
    })
    .then(function(data) {
      if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        var translated = data.responseData.translatedText;
        var matchScore = data.responseData.match || 0;
        var matches = data.matches || [];

        var backUrl = API_BASE + '?q=' + encodeURIComponent(translated) + '&langpair=' + target + '|' + source;

        return fetch(backUrl)
        .then(function(r) { return r.json(); })
        .then(function(backData) {
          var backTranslated = '';
          if (backData.responseStatus === 200 && backData.responseData && backData.responseData.translatedText) {
            backTranslated = backData.responseData.translatedText;
          }

          var quality = calculateQuality(text, translated, backTranslated, matchScore, matches);

          output.innerHTML = '<span class="translated-text">' + escapeHtml(translated) + '</span>';
          document.getElementById('targetCharCount').textContent = translated.length + ' chars';

          showQualityIndicator(quality, text, translated, backTranslated);
        });
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

  // ═══ QUALITY CALCULATION ═══
  function calculateQuality(original, translated, backTranslated, matchScore, matches) {
    var score = 0;
    var checks = [];

    // Check 1: Back-translation similarity
    if (backTranslated) {
      var similarity = stringSimilarity(original.toLowerCase(), backTranslated.toLowerCase());
      if (similarity >= 0.7) {
        score += 35;
        checks.push({label: 'Back-translation verified', status: 'pass', detail: 'Translating back produces a similar result (' + Math.round(similarity * 100) + '% match).'});
      } else if (similarity >= 0.4) {
        score += 15;
        checks.push({label: 'Back-translation partial', status: 'warn', detail: 'Back-translation differs somewhat (' + Math.round(similarity * 100) + '% match).'});
      } else {
        score += 0;
        checks.push({label: 'Back-translation mismatch', status: 'fail', detail: 'Back-translation is very different (' + Math.round(similarity * 100) + '% match). The translation may be inaccurate.'});
      }
    }

    // Check 2: Length ratio
    var lenRatio = translated.length / Math.max(original.length, 1);
    if (lenRatio >= 0.5 && lenRatio <= 2.0) {
      score += 15;
      checks.push({label: 'Length check', status: 'pass', detail: 'Translation length is proportional to source.'});
    } else if (lenRatio >= 0.3 && lenRatio <= 3.0) {
      score += 5;
      checks.push({label: 'Length check', status: 'warn', detail: 'Translation length differs significantly from source.'});
    } else {
      score += 0;
      checks.push({label: 'Length check', status: 'fail', detail: 'Translation length is very different from source — possible error.'});
    }

    // Check 3: Not identical to source
    if (translated.toLowerCase().trim() === original.toLowerCase().trim()) {
      score += 0;
      checks.push({label: 'Identity check', status: 'warn', detail: 'Translation is identical to source — may not have been translated.'});
    } else {
      score += 10;
      checks.push({label: 'Identity check', status: 'pass', detail: 'Translation differs from source text.'});
    }

    // Check 4: Known phrase match (LAST — with examples)
    var exampleHtml = '';
    if (matches && matches.length > 0) {
      var goodMatches = matches.filter(function(m) { return m.quality >= 70; }).slice(0, 5);
      if (goodMatches.length > 0) {
        exampleHtml = '<div class="quality-examples">';
        goodMatches.forEach(function(m) {
          var seg = m.segment || '';
          var trans = m.translation || '';
          exampleHtml += '<div class="quality-example">' +
            '<div class="quality-example-source">' + highlightPhrase(escapeHtml(seg), escapeHtml(trans)) + '</div>' +
            '<div class="quality-example-target">' + highlightPhrase(escapeHtml(trans), escapeHtml(trans)) + '</div>' +
            '</div>';
        });
        exampleHtml += '</div>';
      }
    }

    if (matchScore >= 0.9) {
      score += 40;
      checks.push({
        label: 'Known phrase match',
        status: 'pass',
        detail: 'This is a well-established translation in the database.' + (exampleHtml ? ' Here are ' + Math.min(5, matches.filter(function(m){return m.quality>=70;}).length) + ' example sentences:' : ''),
        examples: exampleHtml
      });
    } else if (matchScore >= 0.7) {
      score += 25;
      checks.push({
        label: 'Partial phrase match',
        status: 'warn',
        detail: 'Parts of this translation are verified.' + (exampleHtml ? ' Example sentences:' : ''),
        examples: exampleHtml
      });
    } else if (matchScore >= 0.4) {
      score += 10;
      checks.push({
        label: 'Low phrase match',
        status: 'warn',
        detail: 'This translation may be literal rather than idiomatic.' + (exampleUrl ? ' Example sentences:' : ''),
        examples: exampleHtml
      });
    } else {
      score += 0;
      checks.push({
        label: 'No known match',
        status: 'fail',
        detail: 'This is not a commonly used phrase in the target language.',
        examples: ''
      });
    }

    return {
      score: Math.min(100, Math.round(score)),
      grade: score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low',
      checks: checks
    };
  }

  // Highlight the translated phrase within a sentence
  function highlightPhrase(text, phrase) {
    if (!phrase || !text) return text;
    var idx = text.toLowerCase().indexOf(phrase.toLowerCase());
    if (idx >= 0) {
      return text.substring(0, idx) +
        '<span class="quality-highlight">' + text.substring(idx, idx + phrase.length) + '</span>' +
        text.substring(idx + phrase.length);
    }
    // Try to highlight individual words from the phrase
    var words = phrase.split(/\s+/).filter(function(w) { return w.length > 3; });
    var result = text;
    words.forEach(function(w) {
      var widx = result.toLowerCase().indexOf(w.toLowerCase());
      if (widx >= 0) {
        result = result.substring(0, widx) +
          '<span class="quality-highlight">' + result.substring(widx, widx + w.length) + '</span>' +
          result.substring(widx + w.length);
      }
    });
    return result;
  }

  // ═══ STRING SIMILARITY ═══
  function stringSimilarity(a, b) {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;
    var wordsA = a.split(/\s+/).filter(function(w) { return w.length > 2; });
    var wordsB = b.split(/\s+/).filter(function(w) { return w.length > 2; });
    if (wordsA.length === 0 || wordsB.length === 0) return 0;
    var matches = 0;
    wordsA.forEach(function(wa) {
      wordsB.forEach(function(wb) {
        if (wa === wb || (wa.length > 3 && wb.length > 3 && (wa.indexOf(wb) >= 0 || wb.indexOf(wa) >= 0))) {
          matches++;
        }
      });
    });
    return (2 * matches) / (wordsA.length + wordsB.length);
  }

  // ═══ QUALITY INDICATOR UI ═══
  function showQualityIndicator(quality, original, translated, backTranslated) {
    var existing = document.querySelector('.quality-indicator');
    if (existing) existing.remove();

    var div = document.createElement('div');
    div.className = 'quality-indicator animate-in';

    var gradeColors = {high: 'var(--green)', medium: 'var(--amber)', low: 'var(--rose)'};
    var gradeLabels = {high: 'High Quality', medium: 'Moderate Quality', low: 'Low Quality — Review Recommended'};
    var gradeIcons = {high: '●', medium: '◐', low: '○'};

    var color = gradeColors[quality.grade];
    var label = gradeLabels[quality.grade];
    var icon = gradeIcons[quality.grade];

    var checksHtml = '';
    quality.checks.forEach(function(check) {
      var checkColor = check.status === 'pass' ? 'var(--green)' : check.status === 'warn' ? 'var(--amber)' : 'var(--rose)';
      var checkIcon = check.status === 'pass' ? '✓' : check.status === 'warn' ? '!' : '✗';
      checksHtml += '<div class="quality-check">' +
        '<span class="quality-check-icon" style="color:' + checkColor + '">' + checkIcon + '</span>' +
        '<div class="quality-check-text">' +
        '<div class="quality-check-label">' + check.label + '</div>' +
        '<div class="quality-check-detail">' + check.detail + '</div>' +
        (check.examples || '') +
        '</div></div>';
    });

    div.innerHTML =
      '<div class="quality-header">' +
        '<div class="quality-score" style="color:' + color + '">' +
          '<span class="quality-icon">' + icon + '</span>' +
          '<span class="quality-score-num">' + quality.score + '</span>' +
          '<span class="quality-score-max">/100</span>' +
        '</div>' +
        '<div class="quality-label" style="color:' + color + '">' + label + '</div>' +
        '<button class="btn btn-sm quality-toggle" onclick="this.parentElement.parentElement.classList.toggle(\'expanded\')">Details ▼</button>' +
      '</div>' +
      '<div class="quality-details">' + checksHtml + '</div>';

    var panels = document.querySelector('.panels');
    panels.parentNode.insertBefore(div, panels.nextSibling);
  }

  function hideQualityIndicator() {
    var existing = document.querySelector('.quality-indicator');
    if (existing) existing.remove();
  }

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
    hideQualityIndicator();
  };

  // ═══ UTILITY ═══
  window.clearSource = function() {
    document.getElementById('sourceText').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('targetOutput').innerHTML = '<span class="placeholder">Translation will appear here...</span>';
    document.getElementById('targetCharCount').textContent = '';
    hideQualityIndicator();
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

  window.showSection = function(section) {
    document.querySelectorAll('.topbar-nav a').forEach(function(a) { a.classList.remove('active'); });
    event.target.classList.add('active');
    showToast(section.charAt(0).toUpperCase() + section.slice(1) + ' — coming soon');
  };

  window.toggleTheme = function() {
    showToast('Theme picker — coming soon');
  };

  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      window.translateText();
    }
  });

})();
