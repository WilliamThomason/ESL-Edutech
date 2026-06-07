/* ═══════════════════════════════════════════════════
   ChromaSkin — Standalone JS Controller
   Include after chromaskin.css:
     <script src="chromaskin.js"></script>
   
   API:
     ChromaSkin.setPreset('mustard')     — apply preset
     ChromaSkin.setHue(45)               — custom hue 0-360
     ChromaSkin.setSat(60)               — saturation 0-100
     ChromaSkin.setLit(50)               — lightness 5-95
     ChromaSkin.setMode('dark'|'light')  — toggle mode
     ChromaSkin.save()                   — persist to localStorage
     ChromaSkin.load()                   — restore from localStorage
     ChromaSkin.exportCSS()              — return CSS string
     ChromaSkin.exportJSON()             — return JSON string
     ChromaSkin.onThemeChange(fn)        — register listener
   ═══════════════════════════════════════════════════ */
(function(){
  'use strict';

  var STORAGE_KEY = 'chromaskin';
  var root = document.documentElement;

  // ═══ PRESETS ═══
  var PRESETS = {
    midnight:  {h:220, s:15, l:8},
    mustard:   {h:45,  s:60, l:12},
    burgundy:  {h:350, s:45, l:10},
    forest:    {h:140, s:35, l:10},
    ocean:     {h:200, s:50, l:12},
    violet:    {h:270, s:40, l:10},
    charcoal:  {h:220, s:5,  l:8},
    classic:   {h:220, s:5,  l:95, mode:'light'}
  };

  // ═══ STATE ═══
  var state = {h:220, s:15, l:8, mode:'dark'};
  var listeners = [];

  // ═══ CORE FUNCTIONS ═══
  function applyState(){
    root.style.setProperty('--cs-hue', state.h);
    root.style.setProperty('--cs-sat', state.s + '%');
    root.style.setProperty('--cs-lit', state.l + '%');
    root.setAttribute('data-cs-mode', state.mode);
    notifyListeners();
  }

  function notifyListeners(){
    var i;
    for(i=0;i<listeners.length;i++){
      try{listeners[i](state);}catch(e){}
    }
    // Dispatch custom event
    try{
      window.dispatchEvent(new CustomEvent('chromaskin:change',{detail:state}));
    }catch(e){}
    // BroadcastChannel for cross-tab sync
    try{
      if(!window._csBC) window._csBC = new BroadcastChannel('chromaskin');
      window._csBC.postMessage(state);
    }catch(e){}
  }

  // ═══ PUBLIC API ═══
  window.ChromaSkin = {

    setPreset: function(name){
      var p = PRESETS[name];
      if(!p) return;
      state.h = p.h;
      state.s = p.s;
      state.l = p.l;
      state.mode = p.mode || 'dark';
      // Set preset class on body
      var body = document.body;
      var classes = body.className.split(' ');
      var newClasses = [];
      var i;
      for(i=0;i<classes.length;i++){
        if(classes[i].indexOf('cs-') !== 0) newClasses.push(classes[i]);
      }
      newClasses.push('cs-' + name);
      body.className = newClasses.join(' ');
      applyState();
      return this;
    },

    setHue: function(h){
      state.h = Math.max(0,Math.min(360,Math.round(h)));
      // Remove preset class when custom hue
      var body = document.body;
      var classes = body.className.split(' ');
      var newClasses = [];
      var i;
      for(i=0;i<classes.length;i++){
        if(classes[i].indexOf('cs-') !== 0) newClasses.push(classes[i]);
      }
      body.className = newClasses.join(' ');
      applyState();
      return this;
    },

    setSat: function(s){
      state.s = Math.max(0,Math.min(100,Math.round(s)));
      applyState();
      return this;
    },

    setLit: function(l){
      state.l = Math.max(5,Math.min(95,Math.round(l)));
      applyState();
      return this;
    },

    setMode: function(mode){
      state.mode = (mode === 'light') ? 'light' : 'dark';
      applyState();
      return this;
    },

    toggleMode: function(){
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      applyState();
      return this;
    },

    getState: function(){
      return {h:state.h, s:state.s, l:state.l, mode:state.mode};
    },

    save: function(){
      try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }catch(e){}
      return this;
    },

    load: function(){
      try{
        var saved = localStorage.getItem(STORAGE_KEY);
        if(saved){
          var parsed = JSON.parse(saved);
          if(parsed.h !== undefined) state.h = parsed.h;
          if(parsed.s !== undefined) state.s = parsed.s;
          if(parsed.l !== undefined) state.l = parsed.l;
          if(parsed.mode) state.mode = parsed.mode;
          applyState();
        }
      }catch(e){}
      return this;
    },

    reset: function(){
      state = {h:220, s:15, l:8, mode:'dark'};
      var body = document.body;
      var classes = body.className.split(' ');
      var newClasses = [];
      var i;
      for(i=0;i<classes.length;i++){
        if(classes[i].indexOf('cs-') !== 0) newClasses.push(classes[i]);
      }
      newClasses.push('cs-midnight');
      body.className = newClasses.join(' ');
      applyState();
      return this;
    },

    exportCSS: function(){
      return ':root {\n' +
        '  --cs-hue: ' + state.h + ';\n' +
        '  --cs-sat: ' + state.s + '%;\n' +
        '  --cs-lit: ' + state.l + '%;\n' +
        '  --cs-mode: ' + state.mode + ';\n' +
        '}\n' +
        'body { data-cs-mode: ' + state.mode + '; }\n';
    },

    exportJSON: function(){
      return JSON.stringify(state, null, 2);
    },

    onThemeChange: function(fn){
      if(typeof fn === 'function') listeners.push(fn);
      return this;
    },

    getPresets: function(){
      return Object.keys(PRESETS);
    }
  };

  // ═══ URL PARAMS ═══
  function loadFromURL(){
    var params = new URLSearchParams(window.location.search);
    var theme = params.get('theme');
    var hue = params.get('hue');
    var mode = params.get('mode');
    if(theme && PRESETS[theme]){
      window.ChromaSkin.setPreset(theme);
    }
    if(hue && !isNaN(hue)){
      window.ChromaSkin.setHue(parseInt(hue));
    }
    if(mode){
      window.ChromaSkin.setMode(mode);
    }
  }

  // ═══ CROSS-TAB SYNC ═══
  try{
    var bc = new BroadcastChannel('chromaskin');
    bc.onmessage = function(e){
      if(e.data && e.data.h !== undefined){
        state = e.data;
        applyState();
      }
    };
  }catch(e){}

  // ═══ INIT ═══
  // Load saved state on DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      window.ChromaSkin.load();
      loadFromURL();
    });
  }else{
    window.ChromaSkin.load();
    loadFromURL();
  }

})();
