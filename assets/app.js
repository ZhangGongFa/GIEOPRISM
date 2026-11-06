(() => {
  'use strict';
  const {departments, quiz} = window.GIEO_DATA;
  const CONFIG = window.GIEO_CONFIG || {};
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const getDept = id => departments.find(dept => dept.id === id);
  const escapeHTML = raw => String(raw ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeText = value => String(value || '').trim() || '—';
  const form = $('#application-form');
  let currentQuestion = 0;
  let quizSelections = Array(quiz.length).fill(null);
  let toastTimeout;
  const specialistAnswers = new Map();
  const getSelectedDepartments = () => $$('input[name="departments"]:checked').map(input => input.value);

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {el.hidden = true;}, 4600);
  }

  function setupNavigation() {
    $('#mobile-menu-button').addEventListener('click', () => {
      const menu = $('#mobile-menu');
      menu.hidden = !menu.hidden;
      $('#mobile-menu-button').setAttribute('aria-expanded', String(!menu.hidden));
    });
    $$('#mobile-menu a').forEach(a => a.addEventListener('click', () => {
      $('#mobile-menu').hidden = true;
      $('#mobile-menu-button').setAttribute('aria-expanded', 'false');
    }));
  }

  function setupDepartments() {
    $('#department-grid').innerHTML = departments.map((dept, index) => `
      <article class="department-card" data-symbol="${dept.symbol}" style="--dept-color:${dept.color}">
        <div class="dept-top"><span class="dept-index">SPECTRUM / 0${index+1}</span><span class="dept-glyph" aria-hidden="true">${dept.icon}</span></div>
        <div><h3>${dept.label}</h3><h4>${dept.name}</h4><p class="dept-hook">${dept.hook}</p></div>
        <div class="dept-bottom"><div class="dept-tags">${dept.tags.map(tag => `<span>${tag}</span>`).join('')}</div><button aria-label="Xem chi tiết ${dept.name}" data-department-detail="${dept.id}" type="button">↗</button></div>
      </article>`).join('');
    $('#department-picker').innerHTML = departments.map(dept => `<label class="pick-option" style="--pick-color:${dept.color}"><input type="checkbox" name="departments" value="${dept.id}" /><span class="pick-icon">${dept.icon}</span><span>${dept.label}<small>${dept.name}</small></span><span class="pick-check" aria-hidden="true">✓</span></label>`).join('');
    document.addEventListener('click', event => {
      const detailButton = event.target.closest('[data-department-detail]');
      if (detailButton) openDepartment(detailButton.dataset.departmentDetail);
    });
    $('#close-department-dialog').addEventListener('click', () => $('#department-dialog').close());
    $('#department-dialog').addEventListener('click', event => {
      if (event.target === $('#department-dialog')) $('#department-dialog').close();
    });
    $$('input[name="departments"]').forEach(input => input.addEventListener('change', () => {
      renderSpecialistQuestions(); updateCV();
    }));
    renderSpecialistQuestions();
  }

  function renderSpecialistQuestions() {
    const selected = getSelectedDepartments();
    const count = selected.length;
    $('#department-question').textContent = count ? `Đã chọn ${count} ban. Hãy trả lời ${selected.reduce((n,id)=>n+(getDept(id)?.professionalQuestions?.length||0),0)} câu hỏi chuyên môn bên dưới.` : 'Bạn có thể chọn nhiều ban. Mỗi ban được chọn sẽ có bộ câu hỏi chuyên môn riêng.';
    const root = $('#specialist-questions');
    if (!count) {
      root.innerHTML = '<p class="specialist-empty">Hãy chọn ít nhất một ban để hiển thị câu hỏi chuyên môn.</p>';
      return;
    }
    root.innerHTML = selected.map(id => {
      const dept=getDept(id);
      return `<fieldset class="specialist-group" style="--special-color:${dept.color}"><legend>${dept.icon} ${escapeHTML(dept.name)}</legend>${dept.professionalQuestions.map((question,index)=>{
        const key=`${id}:${index}`;
        return `<label class="specialist-question" for="special-${id}-${index}"><span class="question-index">Câu ${index+1} / ${dept.professionalQuestions.length} <em>*</em></span><span class="question-copy">${escapeHTML(question)}</span><textarea id="special-${id}-${index}" data-special-key="${key}" required maxlength="1200" rows="4" placeholder="Chia sẻ cách bạn sẽ thực hiện, có thể dùng ví dụ thực tế...">${escapeHTML(specialistAnswers.get(key)||'')}</textarea></label>`;
      }).join('')}</fieldset>`;
    }).join('');
  }


  function openDepartment(id) {
    const dept = getDept(id);
    if (!dept) return;
    const node = $('#dialog-body');
    node.style.setProperty('--dialog-color', dept.color);
    node.innerHTML = `<div class="dialog-accent"></div><p class="eyebrow">${dept.tagline} · ${dept.subtitle}</p><h2>${dept.label}</h2><div class="dialog-subtitle">${dept.name}</div><p>${dept.story}</p>
      <h3>✳ NHỮNG ĐIỀU BẠN CÓ THỂ CÙNG LÀM</h3><ul>${dept.tasks.map(t=>`<li>${t}</li>`).join('')}</ul>
      <h3>✳ KỸ NĂNG CÓ CƠ HỘI PHÁT TRIỂN</h3><ul>${dept.growth.map(t=>`<li>${t}</li>`).join('')}</ul>
      <h3>✳ BẠN CÓ THỂ SẼ HỢP NẾU...</h3><p>${dept.fit}</p>
      <button id="pick-from-dialog" type="button" class="btn btn-primary" data-select="${id}">Chọn sắc màu này <span>↗</span></button>`;
    $('#pick-from-dialog').addEventListener('click', () => {
      selectDepartment(id);
      $('#department-dialog').close();
      $('#apply').scrollIntoView({behavior:'smooth'});
    });
    $('#department-dialog').showModal();
  }

  function selectDepartment(id) {
    const input = $(`input[name="departments"][value="${id}"]`);
    if (input && !input.checked) {
      input.checked = true;
      input.dispatchEvent(new Event('change',{bubbles:true}));
    }
    if (input?.checked) toast('Đã thêm ban vào CV. Bạn có thể chọn thêm các ban khác.');
  }

  function renderQuestion() {
    const question = quiz[currentQuestion];
    $('#quiz-result').hidden = true;
    $('#quiz-question-area').hidden = false;
    $('.quiz-navigation').hidden = false;
    $('#quiz-error').hidden = true;
    $('#quiz-progress-label').textContent = `CÂU ${String(currentQuestion+1).padStart(2,'0')} / ${quiz.length}`;
    $('#quiz-progress').style.width = `${(currentQuestion+1)/quiz.length*100}%`;
    $('#quiz-question-area').innerHTML = `
      <h3 class="quiz-question" id="quiz-question-heading">${escapeHTML(question.q)}</h3>
      <div class="quiz-options" role="group" aria-labelledby="quiz-question-heading">${question.a.map(([text], index) => `
        <button type="button" class="quiz-option ${quizSelections[currentQuestion]===index?'selected':''}" data-answer="${index}" aria-pressed="${quizSelections[currentQuestion]===index?'true':'false'}">
          <span class="option-letter">${'ABCD'[index]}</span><span>${escapeHTML(text)}</span>
        </button>`).join('')}
      </div>`;
    $$('[data-answer]',$('#quiz-question-area')).forEach(button => button.addEventListener('click', () => {
      quizSelections[currentQuestion] = Number(button.dataset.answer);
      $$('[data-answer]',$('#quiz-question-area')).forEach(b => {
        const selected = b === button;
        b.classList.toggle('selected', selected);
        b.setAttribute('aria-pressed',String(selected));
      });
      $('#quiz-error').hidden = true;
    }));
    $('#quiz-prev').disabled = currentQuestion === 0;
    $('#quiz-prev').style.opacity = currentQuestion === 0 ? '.45':'1';
    $('#quiz-next').innerHTML = currentQuestion === quiz.length-1 ? 'XEM PHỔ MÀU CỦA TÔI <span>✦</span>' : 'Câu tiếp theo <span>→</span>';
  }

  function calculateQuiz() {
    const raw = Object.fromEntries(departments.map(dept => [dept.id,0]));
    quiz.forEach((question,index) => {
      const selected = question.a[quizSelections[index]];
      Object.entries(selected[1]).forEach(([id,weight]) => {raw[id] += weight;});
    });
    const total = Object.values(raw).reduce((sum,score)=>sum+score,0);
    // Hamilton (largest-remainder) rounding: percentages sum to exactly 100.
    const rows = departments.map(dept => ({...dept,raw:raw[dept.id],exact:100*raw[dept.id]/total}));
    let diff = 100 - rows.reduce((sum,row)=>sum+Math.floor(row.exact),0);
    const byRemainder = [...rows].sort((a,b)=>(b.exact%1)-(a.exact%1));
    const bonuses = new Set(byRemainder.slice(0,diff).map(row => row.id));
    rows.forEach(row => {row.pct = Math.floor(row.exact)+(bonuses.has(row.id)?1:0);});
    return rows.sort((a,b)=>b.raw-a.raw);
  }

  function showQuizResult() {
    const ranking = calculateQuiz();
    const first = ranking[0], second = ranking[1];
    $('#quiz-progress').style.width = '100%';
    $('#quiz-progress-label').textContent = 'KHÁM PHÁ HOÀN THÀNH';
    $('#quiz-question-area').hidden = true;
    $('.quiz-navigation').hidden = true;
    const result = $('#quiz-result');
    result.innerHTML = `<div class="result-hero" style="--result-color:${first.color}"><span class="result-caption">✦ SẮC MÀU NỔI BẬT</span><h3>${first.label}</h3><b>${first.name}</b><p>${first.result}</p></div>
      <div class="result-bars">${ranking.map(d=>`<div><div class="result-bar-head"><span>${d.label}</span><span>${d.pct}%</span></div><div class="result-bar-track"><div style="--bar-color:${d.color};width:${d.pct}%"></div></div></div>`).join('')}</div>
      <div class="result-explain"><b>Vì sao có kết quả này?</b><br>12 lựa chọn của bạn được cộng điểm theo vai trò và hành vi ưa thích. <b>${first.short}</b> có ${first.raw} điểm, tiếp theo là <b>${second.short}</b> với ${second.raw} điểm. Tỷ lệ trên là <b>tỷ trọng điểm định hướng</b>, không phải xác suất bạn sẽ đậu hay thang đo tâm lý đã được kiểm định. Bạn có thể tự chọn ban khác nếu đó là điều bạn thực sự yêu thích.</div>
      <div class="result-actions"><button type="button" id="choose-quiz-dept" class="btn btn-primary">Chọn ${first.short} để ứng tuyển ↗</button><button type="button" id="explore-quiz-second" class="btn btn-glass">Tìm hiểu ${second.short}</button><button type="button" id="retake-quiz" class="btn btn-glass">Làm lại ↺</button></div>`;
    result.hidden = false;
    $('#choose-quiz-dept').addEventListener('click', () => {selectDepartment(first.id);$('#apply').scrollIntoView({behavior:'smooth'});});
    $('#explore-quiz-second').addEventListener('click', () => openDepartment(second.id));
    $('#retake-quiz').addEventListener('click', () => {quizSelections.fill(null);currentQuestion=0;renderQuestion();});
    result.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function setupQuiz() {
    $('#quiz-prev').addEventListener('click',()=>{if(currentQuestion>0){currentQuestion--;renderQuestion();}});
    $('#quiz-next').addEventListener('click',()=>{
      if(quizSelections[currentQuestion] === null){$('#quiz-error').hidden=false;return;}
      if(currentQuestion < quiz.length-1){currentQuestion++;renderQuestion();}
      else showQuizResult();
    });
    renderQuestion();
  }

  function rawFormData() {
    const data = Object.fromEntries(new FormData(form).entries());
    delete data.photo;
    data.departments = getSelectedDepartments();
    return data;
  }

  function formatDate(value) {
    if (!value) return '—';
    const [year,month,day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : '—';
  }

  function setText(id, value, placeholder='—') {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value||'').trim() || placeholder;
  }

  function updateCV() {
    const data = rawFormData();
    const selected = data.departments.map(getDept).filter(Boolean);
    setText('cv-name',data.fullName,'HỌ VÀ TÊN');
    setText('cv-caption',selected.length ? `Ứng viên Gen 5 · ${selected.map(d=>d.short).join(' / ')}` : 'Ứng viên · GIEO CLUB');
    setText('cv-studentId',data.studentId);setText('cv-major',data.major);setText('cv-dob',formatDate(data.dob));
    setText('cv-year',data.year);setText('cv-email',data.email);setText('cv-phone',data.phone);setText('cv-facebook',data.facebook);
    setText('cv-department',selected.map(dept=>dept.name).join('\n') || 'Chưa chọn ban');
    setText('cv-introduction',data.introduction,'Giới thiệu ngắn về bản thân của bạn sẽ xuất hiện ở đây.');
    setText('cv-strengths',data.strengths,'Thế mạnh và kỹ năng của bạn...');
    setText('cv-experience',data.experience,'Hoạt động, dự án hoặc trải nghiệm của bạn...');
    setText('cv-goal',data.goal,'Mục tiêu và những giá trị bạn muốn đóng góp...');
    $('#cv-specialAnswers').innerHTML = selected.length ? selected.map(dept=>{
      return `<div class="cv-dept-block"><h5 style="--cv-dept-color:${dept.color}">${escapeHTML(dept.name)}</h5>${dept.professionalQuestions.map((q,index)=>{
        const key=`${dept.id}:${index}`;
        const answer=specialistAnswers.get(key)||'';
        return `<div class="cv-qa"><strong>${index+1}. ${escapeHTML(q)}</strong><p>${escapeHTML(answer.trim() || 'Chưa có câu trả lời.')}</p></div>`;
      }).join('')}</div>`;
    }).join('') : '<p>Chọn ban ứng tuyển để xem câu hỏi chuyên môn.</p>';
  }

  function showFeedback(message,kind='error') {
    const box=$('#form-feedback');box.hidden=false;box.className=`form-feedback ${kind}`;box.textContent=message;
    box.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function setupCV() {
    form.addEventListener('input', event => {
      if (event.target.matches('[data-special-key]')) specialistAnswers.set(event.target.dataset.specialKey,event.target.value);
      if (event.target.type !== 'file') updateCV();
    });
    form.addEventListener('change', event => {
      if (event.target.id !== 'photo') updateCV();
    });
    $('#reset-cv').addEventListener('click', () => {
      if (!confirm('Xóa thông tin CV đang nhập trong trang này?')) return;
      form.reset();specialistAnswers.clear();renderSpecialistQuestions();
      $('#cv-avatar').replaceChildren(Object.assign(document.createElement('span'),{textContent:'✦'}));
      $('#form-feedback').hidden = true;
      updateCV();toast('Đã xóa nội dung CV đang nhập.');
    });
    $('#photo').addEventListener('change', async event => {
      const file = event.target.files?.[0];
      if (!file) {$('#cv-avatar').innerHTML='<span>✦</span>';return;}
      if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 3*1024*1024) {
        event.target.value='';toast('Ảnh cần là JPG, PNG hoặc WebP, tối đa 3 MB.');return;
      }
      try {
        const photoUrl=await new Promise((resolve,reject)=>{
          const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);
        });
        const image=document.createElement('img');image.src=photoUrl;image.alt='Ảnh chân dung CV';
        $('#cv-avatar').replaceChildren(image);
      } catch {toast('Không thể đọc ảnh. Vui lòng chọn ảnh khác.');}
    });
    $('#style-prism').addEventListener('click',()=>setCVStyle('prism'));
    $('#style-classic').addEventListener('click',()=>setCVStyle('classic'));
    window.addEventListener('afterprint',()=>{delete document.body.dataset.print;});
    setupGoogleFormLink();updateCV();
  }

  function setupGoogleFormLink() {
    const button=$('#open-google-form');
    const raw=String(CONFIG.googleFormUrl||'').trim();
    let url;
    try {url=new URL(raw);} catch {url=null;}
    const valid=!!url && url.protocol==='https:' &&
      (url.hostname==='forms.gle' || (url.hostname==='docs.google.com' && url.pathname.startsWith('/forms/')));
    if (!valid) {
      button.disabled=true;button.setAttribute('aria-disabled','true');button.textContent='Google Form chưa sẵn sàng';return;
    }
    button.disabled=false;button.setAttribute('aria-disabled','false');button.textContent='Mở Google Form ↗';
    button.addEventListener('click',()=>window.open(url.href,'_blank','noopener,noreferrer'));
  }

  function setCVStyle(style) {
    $('#cv-sheet').classList.toggle('cv--prism',style==='prism');
    $('#cv-sheet').classList.toggle('cv--classic',style==='classic');
    $('#style-prism').setAttribute('aria-pressed',String(style==='prism'));
    $('#style-classic').setAttribute('aria-pressed',String(style==='classic'));
  }

  function validateCV(data) {
    if (!data.departments.length) return 'Hãy chọn ít nhất một ban ứng tuyển.';
    if (!form.checkValidity()) {
      const first=form.querySelector(':invalid');
      if (first) {first.scrollIntoView({behavior:'smooth',block:'center'});first.reportValidity();}
      return 'Vui lòng điền đủ thông tin và trả lời tất cả câu hỏi chuyên môn của những ban đã chọn.';
    }
    if (!/^\+?[\d\s().-]{9,22}$/.test(data.phone)) return 'Số điện thoại chưa đúng định dạng.';
    return null;
  }

  function setupExport() {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const message=validateCV(rawFormData());
      if (message) {showFeedback(message);return;}
      $('#form-feedback').hidden=true;updateCV();
      document.body.dataset.print='cv';
      requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
    });
  }
  function setupMotion() {
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    document.documentElement.classList.add('js-motion');
    const targets=$$('.section-heading,.journey-card,.department-card,.story-photo,.story-content,.quiz-panel,.studio-form,.studio-preview,.faq-list details');
    if ('IntersectionObserver' in window) {
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
      }),{threshold:.09,rootMargin:'0px 0px -35px 0px'});
      targets.forEach(el=>{el.classList.add('scroll-reveal');observer.observe(el);});
    }
    const stage=$('.prism-stage');
    if(stage && window.matchMedia('(pointer: fine)').matches) {
      stage.addEventListener('pointermove',event=>{
        const box=stage.getBoundingClientRect();
        const x=(event.clientX-box.left)/box.width-.5;
        const y=(event.clientY-box.top)/box.height-.5;
        stage.style.setProperty('--mouse-x',`${(x*17).toFixed(1)}px`);
        stage.style.setProperty('--mouse-y',`${(y*13).toFixed(1)}px`);
      },{passive:true});
      stage.addEventListener('pointerleave',()=>{
        stage.style.setProperty('--mouse-x','0px');stage.style.setProperty('--mouse-y','0px');
      });
    }
  }

  setupNavigation();setupDepartments();setupQuiz();setupCV();setupExport();setupMotion();
})();
