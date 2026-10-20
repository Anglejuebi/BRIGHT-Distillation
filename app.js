(() => {
  'use strict';
  const data = window.RESEARCH_DATA;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const fmt = new Intl.NumberFormat('zh-CN');
  const percent = n => (n / data.total * 100).toFixed(2);
  if (data.cohorts.reduce((n, c) => n + c.count, 0) !== data.total) throw new Error('队列总量不匹配');
  let chartMode = 'count';
  let selectedCohort = data.cohorts[0].id;
  function selectCohort(id) {
    selectedCohort = id;
    const cohort = data.cohorts.find(c => c.id === id);
    $('#selected-name').textContent = cohort.label;
    $('#selected-count').textContent = fmt.format(cohort.count);
    $('#selected-percent').textContent = `${percent(cohort.count)}%`;
    $$('.bar-row').forEach(b => { const on = b.dataset.cohort === id; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
  }
  function drawBars() {
    const root = $('#cohort-bars'); root.replaceChildren();
    data.cohorts.forEach(c => {
      const row = document.createElement('button'); row.type = 'button'; row.className = 'bar-row'; row.dataset.cohort = c.id;
      row.setAttribute('aria-label', `${c.label}，${fmt.format(c.count)} 例，占 ${percent(c.count)}%`);
      // Only project-owned config is rendered; user-supplied results are not accepted as HTML.
      row.innerHTML = `<span class="bar-label">${c.label}</span><span class="bar-track"><span class="bar-fill" style="--bar-width:${(chartMode === 'count' ? c.count / 15000 : c.count / data.total) * 100}%;--bar-color:${c.color}"></span></span><span class="bar-value">${chartMode === 'count' ? fmt.format(c.count) : percent(c.count) + '%'}<small>${chartMode === 'count' ? percent(c.count) + '%' : fmt.format(c.count) + '例'}</small></span>`;
      row.addEventListener('click', () => selectCohort(c.id)); root.append(row);
    });
    $('#bar-axis').innerHTML = chartMode === 'count' ? '<span>0</span><span>5,000</span><span>10,000</span><span>15,000 例</span>' : '<span>0%</span><span>33.3%</span><span>66.7%</span><span>100%</span>';
    selectCohort(selectedCohort);
  }
  let end = 0;
  const stops = data.cohorts.map(c => {const start = end; end += c.count / data.total * 100; return `${c.color} ${start}% ${end}%`;});
  $('.donut').style.setProperty('--donut-background', `conic-gradient(${stops.join(',')})`);
  $('#cohort-table').innerHTML = data.cohorts.map(c => `<tr><th scope="row">${c.label}</th><td>${fmt.format(c.count)}</td><td>${percent(c.count)}%</td></tr>`).join('') + '<tr><th scope="row">合计</th><td>18,756</td><td>100%（分项舍入和为 99.99%）</td></tr>';
  drawBars();
  $$('[data-chart-mode]').forEach(b => b.addEventListener('click', () => {
    chartMode = b.dataset.chartMode;
    $$('[data-chart-mode]').forEach(el => {const on = el === b; el.classList.toggle('active', on); el.setAttribute('aria-pressed', String(on));});
    drawBars();
  }));
  function selectPatch(index) {
    $$('.patch-grid button').forEach(b => {const on = Number(b.dataset.patch) === index; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on));});
    $('#spatial-caption').textContent = `已选区域 ${String(index + 1).padStart(2, '0')} · 学生 Patch token ${index + 1} 对应教师 tile ${index + 1} 的 Patch 目标`;
  }
  ['teacher', 'student'].forEach(kind => {
    const grid = $(`#${kind}-grid`);
    for (let i = 0; i < 16; i++) {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.patch = String(i); b.textContent = String(i + 1).padStart(2, '0');
      b.setAttribute('aria-label', `${kind === 'teacher' ? '教师 tile' : '学生 Patch token'} ${i + 1}，第 ${Math.floor(i / 4) + 1} 行第 ${i % 4 + 1} 列`);
      b.style.setProperty('--patch-bg', `hsl(${82 + i % 4 * 5} 18% ${70 + i * 1.1}%)`); b.style.setProperty('--r', `${i * 27}deg`);
      b.addEventListener('click', () => selectPatch(i));
      b.addEventListener('keydown', event => {
        const delta = {ArrowRight: 1, ArrowLeft: -1, ArrowUp: -4, ArrowDown: 4}[event.key];
        if (delta === undefined) return; event.preventDefault(); const next = (i + delta + 16) % 16; selectPatch(next); $(`[data-patch="${next}"]`, grid).focus();
      }); grid.append(b);
    }
  }); selectPatch(0);
  $$('[data-stage]').forEach(b => b.addEventListener('click', () => {
    $('.method-board').dataset.focus = b.dataset.stage;
    $$('[data-stage]').forEach(el => {const on = el === b;el.classList.toggle('active', on);el.setAttribute('aria-pressed', String(on));});
  }));
  let route = null;
  data.method.routes.forEach(r => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.route = r.id; b.textContent = `${r.label}${r.confirmed ? '' : ' *'}`; b.setAttribute('aria-pressed', 'false');
    if (!r.confirmed) $(`#line-${r.id}`).classList.add('cross');
    b.addEventListener('click', () => {
      route = route === r.id ? null : r.id;
      $$('.route').forEach(el => {const on = el.id === `line-${route}`;el.classList.toggle('highlight', on);el.classList.toggle('dim', Boolean(route) && !on);});
      $$('[data-route]').forEach(el => {const on = el.dataset.route === route;el.classList.toggle('active', on);el.setAttribute('aria-pressed', String(on));});
      const current = data.method.routes.find(item => item.id === route);
      $('#route-description').textContent = current ? `${current.label}：${current.note}` : '两条主对齐已确认；带 * 的交叉配对待与原实现核对。再次点击可取消高亮。';
    }); $('.route-buttons').append(b);
  });
  let selectedPipeline = 'P1';
  function showPipeline(id) {
    selectedPipeline = id; const p = data.pipelines.find(x => x.id === id);
    $$('[data-pipeline]').forEach(b => {const on = b.dataset.pipeline === id;b.classList.toggle('active', on);b.setAttribute('aria-pressed', String(on));});
    $('#pipeline-title').textContent = id;
    const n = $('#top-n').value; const valid = n !== '' && $('#top-n').checkValidity();
    $('#pipeline-chain').replaceChildren();
    [`5× BRIGHT-Flash-${p.backbone}`, p.sngp, valid ? `统一 Top-${n}` : '统一 Top-N（待预注册）', `20× ${p.encoder}`, '统一下游任务头 / 评价协议'].forEach((label, i) => {
      if (i) {const arrow = document.createElement('span');arrow.className = 'chain-arrow';arrow.textContent = '↓';arrow.setAttribute('aria-hidden', 'true');$('#pipeline-chain').append(arrow);}
      const el = document.createElement('span');el.className = 'chain-node';el.textContent = label;$('#pipeline-chain').append(el);
    });
    $('#pipeline-purpose').textContent = p.backbone === '1007' ? '固定 1007 及其对应 SNGP，建立同选区分支下的高倍编码器对照。' : '使用扩充蒸馏后的 ex 及对应 SNGP，在相同 Top-N 预算下检验下游表现。';
  }
  $$('[data-pipeline]').forEach(b => b.addEventListener('click', () => showPipeline(b.dataset.pipeline)));
  $('#top-n').addEventListener('input', () => {$('#top-n').setAttribute('aria-invalid', String(!$('#top-n').checkValidity()));showPipeline(selectedPipeline);});showPipeline('P1');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionPaused = media.matches; let methodVisible = false;
  function syncMotion() {
    const stopped = motionPaused || document.hidden;
    document.body.classList.toggle('motion-paused', stopped);
    const svg = $('#alignment-svg');
    if (stopped || !methodVisible) svg.pauseAnimations(); else svg.unpauseAnimations();
    $('#motion-toggle').textContent = motionPaused ? '播放动画' : '暂停动画';
    $('#motion-toggle').setAttribute('aria-pressed', String(motionPaused));
    $('#motion-toggle').setAttribute('aria-label', motionPaused ? '播放流程动画' : '暂停流程动画');
    $('#method').classList.toggle('offscreen-paused', !methodVisible);
  }
  $('#motion-toggle').addEventListener('click', () => {motionPaused = !motionPaused;syncMotion();});
  document.addEventListener('visibilitychange', syncMotion);
  media.addEventListener('change', e => {motionPaused = e.matches;syncMotion();});
  new IntersectionObserver(entries => {methodVisible = entries[0].isIntersecting;syncMotion();},{threshold:0.03}).observe($('#method'));
  syncMotion();
  const sections = $$('.slide'); let current = Math.max(0, sections.findIndex(s => `#${s.id}` === location.hash)); let presenting = false;
  function updateNavigation(index, focus = false) {
    current = Math.max(0, Math.min(sections.length - 1, index));
    sections.forEach((s, i) => {s.classList.toggle('current', i === current);s.hidden = presenting && i !== current;});
    $$('.section-nav a').forEach((a, i) => {if (i === current) a.setAttribute('aria-current', 'location');else a.removeAttribute('aria-current');});
    $('#slide-counter').textContent = `${String(current + 1).padStart(2, '0')} / 05`;
    $('#prev-slide').disabled = current === 0;$('#next-slide').disabled = current === sections.length - 1;
    if (presenting) { history.replaceState(null, '', `#${sections[current].id}`); window.scrollTo({top:0, behavior:'instant'}); }
    if (focus) {const h = $('h1,h2', sections[current]);h.tabIndex = -1;h.focus({preventScroll:true});}
  }
  function setPresentation(value) {
    presenting = value;document.body.classList.toggle('presenting', value);$('.presentation-controls').hidden = !value;
    $('#present-toggle').setAttribute('aria-pressed', String(value));$('#present-toggle').textContent = value ? '退出演示 ↙' : '演示模式 ↗';
    updateNavigation(current, value);
    if (!value) {sections[current].scrollIntoView({behavior:'instant'});$('#present-toggle').focus({preventScroll:true});}
  }
  // One observer for all chapters, including chapters taller than the viewport.
  const chapterObserver = new IntersectionObserver(entries => {if (presenting) return;entries.forEach(e => {if(e.isIntersecting)updateNavigation(sections.indexOf(e.target));});},{rootMargin:'-15% 0px -65% 0px',threshold:0});
  sections.forEach(s => chapterObserver.observe(s));
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {const index = sections.findIndex(s => `#${s.id}` === a.getAttribute('href'));if (presenting && index >= 0) {e.preventDefault();updateNavigation(index,true);}}));
  window.addEventListener('hashchange', () => {const index = sections.findIndex(s => `#${s.id}` === location.hash);if (index >= 0) updateNavigation(index,presenting);});
  $('#present-toggle').addEventListener('click', () => setPresentation(!presenting));
  $('#exit-present').addEventListener('click', () => setPresentation(false));
  $('#prev-slide').addEventListener('click', () => updateNavigation(current - 1,true));$('#next-slide').addEventListener('click', () => updateNavigation(current + 1,true));
  document.addEventListener('keydown', e => {
    if (!presenting || $('#method-dialog').open || /INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName) || e.altKey || e.ctrlKey || e.metaKey) return;
    if (['ArrowRight','PageDown','ArrowLeft','PageUp','Home','End','Escape'].includes(e.key)) e.preventDefault();
    if (['ArrowRight','PageDown'].includes(e.key)) updateNavigation(current + 1,true);
    if (['ArrowLeft','PageUp'].includes(e.key)) updateNavigation(current - 1,true);
    if(e.key === 'Home') updateNavigation(0,true);if(e.key === 'End') updateNavigation(4,true);if(e.key === 'Escape')setPresentation(false);
  });
  $('#fullscreen').addEventListener('click', async () => {
    try {if(!document.fullscreenElement) await document.documentElement.requestFullscreen();else await document.exitFullscreen();}
    catch {$('#announcer').textContent='当前环境不支持全屏，请使用浏览器全屏功能。';}
  });
  $('#method-details-open').addEventListener('click', () => $('#method-dialog').showModal());
  $('#method-details-close').addEventListener('click', () => $('#method-dialog').close());
  $('#method-dialog').addEventListener('click', e => {if(e.target === $('#method-dialog')) {const r = e.target.getBoundingClientRect();if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)e.target.close();}});
  updateNavigation(current);
})();
