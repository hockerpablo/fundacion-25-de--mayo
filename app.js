(function(){
  var html=document.documentElement, fs=18;
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};

  // ---------- Preferencias guardadas ----------
  var anuncio=$('#anuncio');
  function say(t){if(!anuncio)return;anuncio.textContent='';setTimeout(function(){anuncio.textContent=t},50)}
  function store(k,v){try{localStorage.setItem('a11y-'+k,v)}catch(e){}}
  function load(k){try{return localStorage.getItem('a11y-'+k)}catch(e){return null}}

  // ---------- Tamaño de letra ----------
  if(load('fs')){fs=+load('fs');html.style.fontSize=fs+'px'}
  $$('[data-fs]').forEach(function(b){
    b.addEventListener('click',function(){var d=+b.dataset.fs;fs=d===0?18:Math.min(26,Math.max(15,fs+d));html.style.fontSize=fs+'px';store('fs',fs)});
  });

  // ---------- Alto contraste, subrayado, espaciado ----------
  $$('[data-toggle]').forEach(function(b){
    var k=b.dataset.toggle;
    function apply(on){document.body.classList.toggle(k,on);b.setAttribute('aria-pressed',on?'true':'false')}
    if(load(k)==='1')apply(true);
    b.addEventListener('click',function(){var on=!document.body.classList.contains(k);apply(on);store(k,on?'1':'0');say(b.textContent+(on?' activado':' desactivado'))});
  });

  // ---------- Daltonismo ----------
  var modes=$$('#colorModes button');
  function setColor(m){['prot','deut','trit','gray'].forEach(function(x){html.classList.toggle('cb-'+x,x===m)});modes.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.color===m?'true':'false')});store('color',m)}
  modes.forEach(function(b){b.addEventListener('click',function(){setColor(b.dataset.color);say('Modo de color: '+b.textContent)})});
  if(load('color'))setColor(load('color'));

  // ---------- Pantalla de carga al pasar de una página a otra del sitio ----------
  var loaderEl=$('#loader');
  if(loaderEl)document.addEventListener('click',function(e){
    var l=e.target.closest&&e.target.closest('a[href]');if(!l||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||l.target==='_blank')return;
    var u=new URL(l.href,location.href);
    if(u.origin!==location.origin||u.pathname===location.pathname)return; // mismo sitio, otra página
    loaderEl.classList.remove('loader-off');loaderEl.classList.add('loader-on');
  });

  // ---------- Menú hamburguesa (celular) ----------
  var burger=$('.burger'), headerEl=$('header');
  if(burger){
    function setNav(o){headerEl.classList.toggle('nav-open',o);burger.setAttribute('aria-expanded',o?'true':'false');burger.setAttribute('aria-label',o?'Cerrar menú':'Abrir menú');if(o)setTimeout(fixNav,30)}
    burger.addEventListener('click',function(){setNav(!headerEl.classList.contains('nav-open'))});
    $$('#mainNav a').forEach(function(l){l.addEventListener('click',function(){setNav(false)})});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&headerEl.classList.contains('nav-open')){setNav(false);burger.focus()}});
  }

  // ---------- Modo nocturno ----------
  var themeT=$('#themeToggle');
  if(themeT){
    themeT.checked=html.classList.contains('noche');
    themeT.addEventListener('change',function(){
      html.classList.toggle('noche',themeT.checked);
      try{localStorage.setItem('tema',themeT.checked?'oscuro':'claro')}catch(e){}
      say(themeT.checked?'Modo nocturno activado':'Modo nocturno desactivado');
    });
  }

  // ---------- Barra de navegación: botones de trazo ----------
  $$('header nav .nl, .hero .btn').forEach(function(l){
    var t=document.createElement('span');t.className='sk-text';
    while(l.firstChild)t.appendChild(l.firstChild);
    l.classList.add('sk');
    l.innerHTML='<span class="sk-line" aria-hidden="true"></span><span class="sk-line" aria-hidden="true"></span>';
    l.appendChild(t);
    l.insertAdjacentHTML('beforeend','<span class="sk-d1" aria-hidden="true"></span><span class="sk-d2" aria-hidden="true"></span>');
  });
  // ancho fijo para que al separarse las letras no se mueva el resto del menú
  function fixNav(){$$('header nav .nl.sk, .hero .btn.sk').forEach(function(l){l.style.width='';var t=$('.sk-text',l),n=t.textContent.trim().length,hero=l.classList.contains('btn');var w=hero?Math.max(140,t.scrollWidth+58+n):Math.max(120,t.scrollWidth+2*44+n*2);l.style.width=w+'px'})}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fixNav);else fixNav();
  // si cambian el tamaño de letra o el espaciado desde accesibilidad, se recalcula
  $$('[data-fs],[data-toggle],#a11yReset').forEach(function(b){b.addEventListener('click',function(){setTimeout(fixNav,60)})});

  // ---------- Menús desplegables (accesibilidad y ¿Cómo ayudar?) ----------
  var scrim=$('#scrim'), hover=window.matchMedia('(hover: hover)').matches, menus=[];
  function mega(trigger, panel, zone){
    var m={open:false,t:null};
    m.set=function(o,instant){
      if(o)menus.forEach(function(x){if(x!==m&&x.open)x.set(false,true)});
      m.open=o;panel.classList.toggle('instant',!!instant);panel.classList.toggle('open',o);panel.inert=!o;
      trigger.setAttribute('aria-expanded',o?'true':'false');
      if(scrim)scrim.classList.toggle('on',menus.some(function(x){return x.open}));
    };
    if(hover){
      zone.addEventListener('mouseenter',function(){clearTimeout(m.t);m.t=setTimeout(function(){m.set(true,false)},120)});
      zone.addEventListener('mouseleave',function(){clearTimeout(m.t);m.t=setTimeout(function(){if(!zone.contains(document.activeElement)||document.activeElement===trigger)m.set(false,false)},350)});
    }
    zone.addEventListener('focusout',function(e){if(m.open&&!zone.contains(e.relatedTarget))m.set(false,true)});
    document.addEventListener('click',function(e){if(m.open&&!zone.contains(e.target))m.set(false,false)});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&m.open){m.set(false,true);trigger.focus()}});
    menus.push(m);return m;
  }
  // Accesibilidad: botón que abre/cierra
  var a11yTg=$('#a11yToggle'), a11yPanel=$('#a11yPanel');
  if(a11yTg){
    var am=mega(a11yTg,a11yPanel,a11yTg.closest('.topbar')||a11yTg.closest('.a11y-nav'));
    a11yTg.addEventListener('click',function(e){
      if(hover&&e.detail>0){am.set(true,false);return}
      var o=!am.open;am.set(o,e.detail===0);
      if(o&&e.detail===0){var f=$('button',a11yPanel);if(f)f.focus()}
    });
    var close=$('#a11yClose');if(close)close.addEventListener('click',function(){am.set(false,true);a11yTg.focus()});
  }
  // ¿Cómo ayudar?: el enlace lleva a la página Sumate; con mouse despliega el menú
  var ayTg=$('#ayudarToggle');
  if(ayTg){
    var aym=mega(ayTg,$('#ayudarPanel'),ayTg.closest('.mega-item'));
    ayTg.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();aym.set(true,true);var f=$('#ayudarPanel a');if(f)f.focus()}});
  }

  // ---------- Restablecer ----------
  var reset=$('#a11yReset');
  if(reset)reset.addEventListener('click',function(){
    fs=18;html.style.fontSize='';store('fs','');setColor('');
    $$('[data-toggle]').forEach(function(b){document.body.classList.remove(b.dataset.toggle);b.setAttribute('aria-pressed','false');store(b.dataset.toggle,'0')});
    if(window.speechSynthesis)speechSynthesis.cancel();
    say('Opciones de accesibilidad restablecidas');
  });

  // ---------- Sección visible marcada en el menú (solo enlaces internos) ----------
  var links=$$('.nl').filter(function(l){var h=l.getAttribute('href')||'';return h.charAt(0)==='#'});
  if('IntersectionObserver' in window&&links.length){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)links.forEach(function(l){l.setAttribute('aria-current',l.getAttribute('href')==='#'+e.target.id?'true':'false')})})},{rootMargin:'-45% 0px -50% 0px'});
    links.forEach(function(l){var t=document.getElementById(l.getAttribute('href').slice(1));if(t)io.observe(t)});
  }

  // ---------- Selector de donación (página Sumate) ----------
  var donar=$('#donar-btn');
  if(donar){
    var freq='',amt='$10.000';
    var pick=function(id,set){var g=$('#'+id);if(!g)return;$$('button',g).forEach(function(b){b.addEventListener('click',function(){$$('button',g).forEach(function(x){x.setAttribute('aria-pressed','false')});b.setAttribute('aria-pressed','true');set(b.dataset.v);donar.textContent='Donar '+(amt?amt+' ':'')+freq})})};
    pick('freq',function(v){freq=v});pick('amt',function(v){amt=v});
  }

  // ---------- Formularios: el visitante elige enviar por email (FormSubmit) o por WhatsApp ----------
  var WA_NUM='5493515901524';
  $$('.send-form').forEach(function(f){
    var st=$('.form-status',f), via='email';
    $$('button[type=submit]',f).forEach(function(b){b.addEventListener('click',function(){via=b.dataset.via||'email'})});
    f.addEventListener('submit',function(e){
      if($('.hp',f).value){e.preventDefault();return} // trampa para robots
      var fields=[];
      $$('input,select,textarea',f).forEach(function(el){
        if(!el.name||el.type==='hidden'||el.classList.contains('hp'))return;
        var lab=$('label[for="'+el.id+'"]',f);fields.push([lab?lab.textContent:el.name,el.value.trim()]);
      });
      if(via==='whatsapp'){
        e.preventDefault();
        var kind=f.dataset.kind==='voluntario'?'Quiero sumarme como voluntario/a':'Consulta desde la web';
        var txt='¡Hola! '+kind+' de la Fundación 25 de Mayo.\n\n'+fields.filter(function(x){return x[1]}).map(function(x){return '*'+x[0]+':* '+x[1]}).join('\n');
        window.open('https://wa.me/'+WA_NUM+'?text='+encodeURIComponent(txt),'_blank','noopener');
        st.className='form-status ok';st.textContent='Se abrió WhatsApp con tu mensaje listo: solo tocá Enviar.';
        return;
      }
      if(!window.fetch)return; // sin fetch se envía de la forma clásica
      e.preventDefault();
      var btns=$$('button[type=submit]',f), data={};
      new FormData(f).forEach(function(v,k){data[k]=v});
      btns.forEach(function(b){b.disabled=true});st.className='form-status';st.innerHTML='<span class="progress mini" aria-hidden="true"><span class="inner"></span><span class="inner"></span><span class="inner"></span><span class="inner"></span><span class="inner"></span></span>Enviando…';
      fetch(f.action.replace('formsubmit.co/','formsubmit.co/ajax/'),{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json().then(function(j){if(!r.ok||j.success==='false'||j.success===false)throw j;return j})})
        .then(function(){f.reset();st.className='form-status ok';st.textContent='¡Gracias! Recibimos tu mensaje y te vamos a responder pronto.'})
        .catch(function(){st.className='form-status err';st.textContent='No se pudo enviar por email. Probá de nuevo o usá el botón de WhatsApp.'})
        .then(function(){btns.forEach(function(b){b.disabled=false})});
    });
  });

  // ---------- Comisión: en celular se abren los datos tocando ----------
  $$('.person').forEach(function(p){
    p.addEventListener('click',function(e){if(e.pointerType==='mouse')return;var on=!p.classList.contains('show');$$('.person.show').forEach(function(x){x.classList.remove('show')});p.classList.toggle('show',on)});
  });
  document.addEventListener('click',function(e){if(!e.target.closest('.person'))$$('.person.show').forEach(function(x){x.classList.remove('show')})});

  // ---------- Animaciones al hacer scroll (como AOS): zoom-in, zoom-in-up y zoom-out ----------
  (function(){
    if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var plan=[
      ['#nosotros','zoom-in','h2, h2+.lead, .row>*, .grid>.box, h3, .team>.person'],
      ['#programas','zoom-in-up','h2, .lead, .pc'],
      ['#galeria','zoom-out','h2, .lead, .days>*'],
      ['#transparencia','zoom-out','h2, .row>*'],
      ['#contacto','zoom-out','h2, .row>*']
    ];
    var els=[];
    plan.forEach(function(p){
      var sec=$(p[0]);if(!sec)return;
      $$(p[2],sec).forEach(function(el,i){
        if(el.closest('[data-aos]'))return;
        el.setAttribute('data-aos',p[1]);
        el.style.setProperty('--aos-delay',Math.min(i%4,3)*90+'ms');
        els.push(el);
      });
    });
    html.classList.add('aos-ready');
    // se repite cada vez: al salir de la pantalla vuelve a esconderse y al volver a entrar se anima de nuevo (subiendo o bajando)
    var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('aos-in',e.isIntersecting)})},{rootMargin:'0px 0px -8% 0px',threshold:.05});
    els.forEach(function(el){io.observe(el)});
    // si se llega por un enlace (#contacto, etc.) mostrar todo lo que ya está a la vista
    window.addEventListener('hashchange',function(){setTimeout(function(){els.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)el.classList.add('aos-in')})},400)});
  })();

  // ---------- Carruseles: cambian solos cada 2 s o con un clic (también Enter o flechas) ----------
  var INTERVAL=2000, reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('.carousel').forEach(function(car){
    var slides=$$('.slide',car), n=slides.length, cur=0, timer=null, hold=false, visible=false;
    slides.forEach(function(s){var im=$('img',s);if(im)s.style.setProperty('--bg','url("'+im.getAttribute('src')+'")')});
    if(n<2)return;
    car.tabIndex=0;
    car.setAttribute('aria-label',car.getAttribute('aria-label')+'. Hacé clic o presioná Enter para ver la siguiente foto');
    function go(k){
      cur=(k+n)%n;
      slides.forEach(function(s,j){var on=j===cur;s.classList.toggle('is-on',on);s.setAttribute('aria-hidden',on?'false':'true');if(on){var im=$('img',s);if(im)im.loading='eager'}});
      var nx=$('img',slides[(cur+1)%n]);if(nx)nx.loading='eager';
    }
    function tick(){clearTimeout(timer);if(reduceMotion||hold||!visible)return;timer=setTimeout(function(){go(cur+1);tick()},INTERVAL)}
    car.addEventListener('click',function(){go(cur+1)});
    car.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '||e.key==='ArrowRight'){e.preventDefault();go(cur+1)}
      else if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1)}
    });
    // Con el mouse encima se queda quieta para poder mirarla; al salir sigue sola
    car.addEventListener('mouseenter',function(){hold=true;clearTimeout(timer)});
    car.addEventListener('mouseleave',function(){hold=false;tick()});
    car.addEventListener('focus',function(){hold=true;clearTimeout(timer)});
    car.addEventListener('blur',function(){hold=false;tick()});
    var x0=null;car.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
    car.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(cur+(dx<0?1:-1));x0=null});
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting;tick()},{threshold:.3}).observe(car);else{visible=true;tick()}
    go(0);
  });

  // ---------- Video de la galería: arranca solo, sin sonido; se respeta "reducir movimiento" ----------
  $$('.g-video video').forEach(function(v){
    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce||!('IntersectionObserver' in window))return;
    new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{threshold:.4}).observe(v);
  });

  // ---------- Lectura por voz ----------
  // Al activarla: lee la presentación, anuncia cada sección al llegar
  // y después solo habla cuando pasás el mouse (o enfocás / tocás) un elemento.
  var synth=window.speechSynthesis, readAll=$('#readAll');
  if(!synth||!readAll){if(readAll)readAll.hidden=true;return}
  var on=false, lastEl=null, hoverT=null, chip=null, secIO=null, lastSec=null;
  var SEL='.person,.brand,h1,h2,h3,p,li,dt,dd,blockquote,label,a,button,img,.ph,.stats>div>div,.bar';
  function clean(t){return (t||'').replace(/\[|\]/g,'').replace(/\s+/g,' ').trim()}
  // Elige la voz más natural disponible (las "Natural"/"Online" de Edge y las de Google suenan mucho mejor)
  function score(x){var n=x.name,sc=0;if(/natural|neural/i.test(n))sc+=6;if(/online/i.test(n))sc+=4;if(/google/i.test(n))sc+=3;if(/AR/i.test(x.lang))sc+=2;if(/419|MX|US/i.test(x.lang))sc+=1;return sc}
  function voces(){return synth.getVoices().filter(function(x){return /^es/i.test(x.lang)}).sort(function(a,b){return score(b)-score(a)})}
  var chosen=null;try{chosen=localStorage.getItem('a11y-voice')}catch(e){}
  function voz(){var list=voces();return list.find(function(x){return x.name===chosen})||list[0]||null}
  var vs=$('#voiceSel');
  function fillVoices(){
    if(!vs)return;var list=voces();if(!list.length){vs.closest('.voice-pick').hidden=true;return}
    vs.closest('.voice-pick').hidden=false;
    var cur=(voz()||{}).name;vs.innerHTML='';
    list.forEach(function(x){var o=document.createElement('option');o.value=x.name;o.textContent=x.name.replace(/Microsoft |Google /,'').replace(/ - .*$/,'')+' ('+x.lang+')';if(x.name===cur)o.selected=true;vs.appendChild(o)});
  }
  fillVoices();if(synth.onvoiceschanged!==undefined)synth.addEventListener('voiceschanged',fillVoices);
  if(vs)vs.addEventListener('change',function(){chosen=vs.value;try{localStorage.setItem('a11y-voice',chosen)}catch(e){}speak('Hola, esta es mi voz. ¿Te gusta cómo suena?',null)});
  function mark(el){if(lastEl)lastEl.classList.remove('reading');lastEl=el;if(el)el.classList.add('reading')}
  function speak(text,el){
    text=clean(text);if(!text)return;
    synth.cancel();mark(el||null);
    var u=new SpeechSynthesisUtterance(text);var v=voz();u.lang=v?v.lang:'es-AR';u.voice=v||null;u.rate=1;u.pitch=1.05;
    u.onend=function(){if(lastEl===el)mark(null)};
    synth.speak(u);
  }
  function describe(el){
    var tag=el.tagName, label=el.getAttribute('aria-label')||el.getAttribute('alt')||el.getAttribute('title');
    var txt=clean(label||el.innerText||'');
    if(el.id==='a11yToggle')return TOGGLE_MSG;
    var st=el.getAttribute('aria-pressed');
    if(tag==='BUTTON')return 'Botón: '+txt+(st==='true'?', activado':st==='false'&&el.closest('.mm-row')?', desactivado':'');
    if(el.classList.contains('brand'))return txt;
    if(el.classList.contains('person'))return clean(el.innerText);
    if(tag==='A')return 'Enlace: '+txt;
    if(tag==='IMG'||el.classList.contains('ph'))return 'Imagen: '+txt;
    return txt;
  }
  function firstSentence(t){t=clean(t);var m=t.match(/^.+?[.!?](\s|$)/);return m?m[0].trim():t}
  function announce(sec){
    var h=$('h1,h2',sec);if(!h)return;
    var lead=$('.lead',sec), msg='Sección: '+clean(h.innerText)+'.';
    if(lead)msg+=' '+firstSentence(lead.innerText);
    speak(msg,h);
  }
  // El menú de accesibilidad siempre habla, aunque la lectura por voz esté apagada
  // En el menú de accesibilidad solo habla el ícono y la columna Audio
  function audioPart(el){return el.id==='a11yToggle'||!!el.closest('[aria-labelledby="g-audio"]')}
  function silent(el){return !!el.closest('#a11yPanel')&&!audioPart(el)}
  function guided(el){return !!el.closest('.topbar')&&audioPart(el)}
  // en pantallas angostas la columna de Audio queda arriba de todo: se dice "debajo" en vez de "a la izquierda"
  var narrowMQ=window.matchMedia('(max-width: 900px)');
  var TOGGLE_MSG;
  function setToggleMsg(){TOGGLE_MSG='Opciones de accesibilidad. '+(narrowMQ.matches?'Debajo':'A la izquierda')+' están las opciones para activar la lectura por voz.'}
  setToggleMsg();if(narrowMQ.addEventListener)narrowMQ.addEventListener('change',setToggleMsg);
  // Al subir el mouse hasta la franja de accesibilidad: dice la frase y se abre el menú (la apertura la maneja el menú)
  var topbar=a11yTg.closest('.topbar');
  if(topbar)topbar.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&lastEl!==a11yTg)speak(TOGGLE_MSG,a11yTg)});
  // Apenas se abre la página: avisa dónde están las opciones (una vez por visita)
  var INTRO='Opciones de accesibilidad en la parte superior de la pantalla.';
  var introDone=false;try{introDone=sessionStorage.getItem('a11y-intro')==='1'}catch(e){}
  function introSaid(){introDone=true;try{sessionStorage.setItem('a11y-intro','1')}catch(e){}}
  if(!introDone){
    var act=navigator.userActivation;
    if(!act||act.hasBeenActive){speak(INTRO,null);introSaid()}
    else{
      // El navegador no deja hablar hasta el primer clic o tecla: se dice en ese momento
      var first=function(e){
        document.removeEventListener('pointerdown',first,true);document.removeEventListener('keydown',first,true);
        if(introDone)return;introSaid();
        if(e.type==='keydown'&&e.key==='Tab')return; // con Tab ya se escucha la frase del botón
        speak(INTRO,null);
      };
      document.addEventListener('pointerdown',first,true);document.addEventListener('keydown',first,true);
    }
  }
  // Al abrir el menú con el teclado, se avisa cómo recorrerlo
  a11yTg.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&a11yTg.getAttribute('aria-expanded')!=='true')setTimeout(function(){speak('Menú de accesibilidad abierto. Usá Tab para recorrer las opciones y Escape para cerrarlo.',null)},60)});
  // Pasar el mouse sobre un elemento
  document.addEventListener('pointerover',function(e){
    if(e.pointerType!=='mouse')return;
    var el=e.target.closest&&e.target.closest(SEL);
    if(!el||silent(el)||!(on||guided(el)))return;
    if(el===lastEl||el.closest('#voiceChip')||el.closest('.voice-pick'))return;
    clearTimeout(hoverT);
    hoverT=setTimeout(function(){speak(describe(el),el)},250);
  });
  document.addEventListener('pointerout',function(){clearTimeout(hoverT)});
  // Teclado: al enfocar con Tab
  document.addEventListener('focusin',function(e){
    var el=e.target.closest&&e.target.closest(SEL);
    if(!el||silent(el)||!(on||guided(el)))return;
    if(el!==lastEl&&!el.closest('#voiceChip'))speak(describe(el),el);
  });
  // Pantallas táctiles: tocar un texto lo lee
  document.addEventListener('click',function(e){
    if(!on||e.pointerType==='mouse'||(e.detail===0))return;
    var el=e.target.closest&&e.target.closest('h1,h2,h3,p,li,dt,dd,blockquote,.ph,img');
    if(el)speak(describe(el),el);
  });
  // Anunciar cada sección al llegar
  function watchSections(){
    if(!('IntersectionObserver' in window))return;
    secIO=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting||e.target===lastSec)return;
      lastSec=e.target;announce(e.target);
    })},{rootMargin:'-40% 0px -55% 0px'});
    $$('main section').forEach(function(s,i){if(i>0)secIO.observe(s)});
  }
  function makeChip(){
    chip=document.createElement('div');chip.id='voiceChip';chip.className='voice-chip';chip.setAttribute('role','status');
    chip.innerHTML='<span>Lectura por voz activa</span><button type="button">Desactivar</button>';
    document.body.appendChild(chip);
    $('button',chip).addEventListener('click',function(){setOn(false)});
  }
  function setOn(v){
    on=v;readAll.setAttribute('aria-pressed',v?'true':'false');
    readAll.textContent=v?'Desactivar lectura por voz':'Activar lectura por voz';
    if(v){
      if(!chip)makeChip();chip.hidden=false;
      var first=$('main section');lastSec=first;
      var h1=$('h1',first),lead=$('.lead',first);
      speak('Lectura por voz activada. '+clean(h1?h1.innerText:'')+'. '+clean(lead?lead.innerText:'')+' Pasá el mouse sobre cualquier texto, botón o imagen para escucharlo.',h1);
      if(!secIO)watchSections();
    }else{
      synth.cancel();mark(null);clearTimeout(hoverT);if(chip)chip.hidden=true;
      if(secIO){secIO.disconnect();secIO=null}
      say('Lectura por voz desactivada');
    }
  }
  readAll.textContent='Activar lectura por voz';
  readAll.addEventListener('click',function(){setOn(!on)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&on){synth.cancel();mark(null)}});
})();
