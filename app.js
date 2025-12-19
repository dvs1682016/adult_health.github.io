const DEFAULT_EXERCISES = {
    general: [
        { id: 'g1', cat: '熱身', name: '原地踏步', desc: '雙手擺動，膝蓋微抬', safety: '注意地面平整', levels: { beginner: '3分鐘', normal: '5分鐘', advanced: '8分鐘' } },
        { id: 'g2', cat: '有氧', name: '快走/散步', desc: '戶外或室內繞圈快走', safety: '穿著防滑鞋', levels: { beginner: '10分鐘', normal: '15分鐘', advanced: '20分鐘' } },
        { id: 'g3', cat: '肌力', name: '椅子坐站', desc: '雙手抱胸，站起再坐下', safety: '椅子要靠牆固定', levels: { beginner: '10次', normal: '15次', advanced: '20次' } },
        { id: 'g4', cat: '肌力', name: '推牆挺身', desc: '雙手扶牆，做伏地挺身', safety: '地面勿濕滑', levels: { beginner: '10次', normal: '15次', advanced: '20次' } },
        { id: 'g5', cat: '平衡', name: '單腳站立', desc: '扶著椅背，單腳抬起', safety: '手隨時準備扶好', levels: { beginner: '10秒/腳', normal: '20秒/腳', advanced: '30秒/腳' } },
        { id: 'g6', cat: '伸展', name: '全身伸展', desc: '雙手向上延伸', safety: '動作放慢', levels: { beginner: '30秒', normal: '1分鐘', advanced: '1分鐘' } },
    ],
    rainy: [
        { id: 'r1', cat: '熱身', name: '坐姿擺手', desc: '坐穩椅子，雙手擺動', safety: '坐穩不搖晃', levels: { beginner: '3分鐘', normal: '5分鐘', advanced: '8分鐘' } },
        { id: 'r2', cat: '有氧', name: '坐姿抬膝', desc: '左右輪流抬高膝蓋', safety: '背部打直', levels: { beginner: '10分鐘', normal: '15分鐘', advanced: '20分鐘' } },
        { id: 'r3', cat: '肌力', name: '抬小腿', desc: '坐姿，單腳伸直踢平', safety: '腳尖勾起', levels: { beginner: '10次/腳', normal: '15次/腳', advanced: '20次/腳' } },
        { id: 'r4', cat: '肌力', name: '寶特瓶舉重', desc: '手持水瓶向上推舉', safety: '選擇適合重量', levels: { beginner: '10次', normal: '15次', advanced: '20次' } },
        { id: 'r5', cat: '平衡', name: '直線走路', desc: '腳跟接腳尖走路', safety: '旁邊要有扶手', levels: { beginner: '來回3趟', normal: '來回5趟', advanced: '來回8趟' } },
        { id: 'r6', cat: '伸展', name: '坐姿前彎', desc: '坐椅子，身體前彎', safety: '防暈眩', levels: { beginner: '30秒', normal: '1分鐘', advanced: '1分鐘' } },
    ]
};

const QUOTES = ["動一動，健康好輕鬆！", "今天的汗水是明天的活力。", "慢慢來，有做就是一百分。", "保持活動，心情也會變好！"];

const LEVEL_THEMES = { beginner: "bg-teal-50 border-teal-200", normal: "bg-blue-50 border-blue-200", advanced: "bg-orange-50 border-orange-200" };
const LEVEL_NAMES = { beginner: "初階", normal: "普通", advanced: "高階" };

const app = {
    data: { level: 'normal', largeText: false, weatherMode: 'general', history: {}, today: '', exercises: JSON.parse(JSON.stringify(DEFAULT_EXERCISES)), editingCategory: 'general' },

    init() {
        this.data.today = this.getLocalDateStr(new Date());
        this.loadData();
        this.renderAll();
        this.applySettings();
        this.navTo('home');
        this.initSW();
    },

    getLocalDateStr(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; },

    loadData() {
        const saved = localStorage.getItem('seniorFitData_v2');
        if (saved) {
            this.data = { ...this.data, ...JSON.parse(saved) };
            this.data.today = this.getLocalDateStr(new Date()); 
        }
    },

    saveData() {
        localStorage.setItem('seniorFitData_v2', JSON.stringify(this.data));
    },

    changeDate(offset) {
        const current = new Date(this.data.today);
        current.setDate(current.getDate() + offset);
        this.data.today = this.getLocalDateStr(current);
        this.renderAll();
    },

    goToToday() {
        this.data.today = this.getLocalDateStr(new Date());
        this.renderAll();
    },

    renderAll() {
        this.renderDate();
        this.renderList();
        this.updateProgress();
        this.renderHistory();
        this.setWeatherMode(this.data.weatherMode, false);
    },

    renderDate() {
        const dateObj = new Date(this.data.today);
        const dayNames = ['日','一','二','三','四','五','六'];
        document.getElementById('currentDate').innerText = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日 星期${dayNames[dateObj.getDay()]}`;
        document.getElementById('btn-back-today').classList.toggle('hidden', this.data.today === this.getLocalDateStr(new Date()));
    },

    setWeatherMode(mode, shouldSave = true) {
        this.data.weatherMode = mode;
        const btnGen = document.getElementById('btn-mode-general');
        const btnRain = document.getElementById('btn-mode-rainy');
        
        btnGen.className = mode === 'general' ? "flex-1 py-2 rounded-lg text-sm font-bold bg-lime-600 text-white shadow-md" : "flex-1 py-2 rounded-lg text-sm font-bold bg-stone-100 text-stone-400";
        btnRain.className = mode === 'rainy' ? "flex-1 py-2 rounded-lg text-sm font-bold bg-blue-500 text-white shadow-md" : "flex-1 py-2 rounded-lg text-sm font-bold bg-stone-100 text-stone-400";

        if(shouldSave) { this.saveData(); this.renderList(); this.updateProgress(); }
    },

    navTo(pageId) {
        document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden'));
        document.getElementById(`view-${pageId}`).classList.remove('hidden');
        document.getElementById('weather-mode-switch').classList.toggle('hidden', pageId !== 'home' && pageId !== 'today');
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('text-lime-700', btn.dataset.target === pageId);
            btn.classList.toggle('text-stone-400', btn.dataset.target !== pageId);
        });
        if(pageId === 'history') this.renderHistory();
        if(pageId === 'edit-list') this.renderEditList();
    },

    renderList() {
        const list = this.data.exercises[this.data.weatherMode];
        const record = this.data.history[this.data.today] || { done: [] };
        let html = '';
        list.forEach(item => {
            const isDone = record.done.includes(item.id);
            const cardClass = isDone ? 'task-card completed' : `task-card ${LEVEL_THEMES[this.data.level]}`;
            html += `
            <div onclick="app.toggleTask('${item.id}')" class="${cardClass} border p-4 rounded-2xl shadow-sm flex items-center justify-between mb-3">
                <div>
                    <div class="flex items-center gap-2"><span class="text-xs opacity-60">${item.cat}</span><h3 class="font-bold text-lg">${item.name}</h3></div>
                    <p class="font-medium">目標：${item.levels[this.data.level]}</p>
                    ${item.safety ? `<p class="text-xs text-red-500 font-bold">${item.safety}</p>` : ''}
                </div>
                <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center ${isDone ? 'bg-lime-500 border-lime-500' : 'bg-white/50 border-black/10'}">
                    ${isDone ? '<i class="ph ph-check text-white"></i>' : ''}
                </div>
            </div>`;
        });
        document.getElementById('task-list').innerHTML = html;
        document.getElementById('level-display').innerText = LEVEL_NAMES[this.data.level];
    },

    toggleTask(id) {
        if (!this.data.history[this.data.today]) this.data.history[this.data.today] = { done: [], percent: 0 };
        const record = this.data.history[this.data.today];
        const idx = record.done.indexOf(id);
        if (idx > -1) record.done.splice(idx, 1);
        else record.done.push(id);
        
        const total = this.data.exercises[this.data.weatherMode].length;
        record.percent = Math.round((record.done.length / total) * 100);
        this.saveData(); this.renderList(); this.updateProgress();
    },

    updateProgress() {
        const record = this.data.history[this.data.today] || { percent: 0 };
        document.getElementById('progress-text').innerText = `${record.percent}%`;
        const circle = document.getElementById('progress-ring');
        circle.style.strokeDashoffset = 251.2 - (record.percent / 100) * 251.2;
    },

    renderHistory() {
        let html = '';
        const dates = [];
        for(let i=0; i<7; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            dates.push(this.getLocalDateStr(d));
        }
        dates.forEach(date => {
            const rec = this.data.history[date];
            const p = rec ? rec.percent : 0;
            html += `
            <div onclick="app.jumpToDate('${date}')" class="flex items-center p-3 bg-white rounded-xl border mb-2">
                <div class="w-16 font-bold text-stone-700">${date.slice(5)}</div>
                <div class="flex-1 px-4"><div class="bg-stone-100 rounded-full h-2"><div class="history-bar bg-lime-500 h-2 rounded-full" style="width:${p}%"></div></div></div>
                <div class="w-10 text-right text-sm font-bold">${p}%</div>
            </div>`;
        });
        document.getElementById('history-list').innerHTML = html;
    },

    jumpToDate(d) { this.data.today = d; this.renderAll(); this.navTo('today'); },

    setLevel(lvl) { this.data.level = lvl; this.applySettings(); this.saveData(); this.renderList(); },

    toggleLargeText() { this.data.largeText = !this.data.largeText; this.applySettings(); this.saveData(); },

    applySettings() {
        document.body.classList.toggle('large-text-mode', this.data.largeText);
        document.querySelectorAll('.setting-btn-level').forEach(btn => {
            const active = btn.dataset.val === this.data.level;
            btn.className = `setting-btn-level p-3 rounded-xl border text-center ${active ? btn.dataset.activeClass : btn.dataset.inactiveClass}`;
        });
        const btnLarge = document.getElementById('btn-large-text');
        btnLarge.classList.toggle('bg-lime-500', this.data.largeText);
        btnLarge.querySelector('div').style.transform = this.data.largeText ? "translateX(20px)" : "translateX(0)";
    },

    resetData() { if(confirm('確定清除紀錄？')) { localStorage.clear(); location.reload(); } },

    setEditMode(mode) { this.data.editingCategory = mode; this.renderEditList(); },

    renderEditList() {
        const list = this.data.exercises[this.data.editingCategory];
        let html = '';
        list.forEach(item => {
            html += `<div onclick="app.openEditItem('${item.id}')" class="bg-white p-3 rounded-xl border flex justify-between items-center">
                <div><h3 class="font-bold">${item.name}</h3><p class="text-xs text-stone-400">${item.cat}</p></div>
                <i class="ph ph-pencil-simple text-lime-600"></i>
            </div>`;
        });
        document.getElementById('edit-list-container').innerHTML = html;
        document.getElementById('btn-edit-mode-general').className = this.data.editingCategory === 'general' ? "flex-1 py-2 rounded-lg font-bold border-2 border-lime-500 bg-lime-50" : "flex-1 py-2 rounded-lg border";
        document.getElementById('btn-edit-mode-rainy').className = this.data.editingCategory === 'rainy' ? "flex-1 py-2 rounded-lg font-bold border-2 border-blue-500 bg-blue-50" : "flex-1 py-2 rounded-lg border";
    },

    openAddItem() {
        document.getElementById('edit-form').reset();
        document.getElementById('edit-id').value = "";
        document.getElementById('edit-category').value = this.data.editingCategory;
        document.getElementById('btn-delete-item').classList.add('hidden');
        this.navTo('edit-item');
    },

    openEditItem(id) {
        const item = this.data.exercises[this.data.editingCategory].find(x => x.id === id);
        document.getElementById('edit-id').value = item.id;
        document.getElementById('edit-category').value = this.data.editingCategory;
        document.getElementById('edit-name').value = item.name;
        document.getElementById('edit-cat').value = item.cat;
        document.getElementById('edit-desc').value = item.desc;
        document.getElementById('edit-safety').value = item.safety;
        document.getElementById('edit-level-beginner').value = item.levels.beginner;
        document.getElementById('edit-level-normal').value = item.levels.normal;
        document.getElementById('edit-level-advanced').value = item.levels.advanced;
        document.getElementById('btn-delete-item').classList.remove('hidden');
        this.navTo('edit-item');
    },

    saveExerciseChange() {
        const id = document.getElementById('edit-id').value;
        const cat = document.getElementById('edit-category').value;
        const list = this.data.exercises[cat];
        const newItem = {
            name: document.getElementById('edit-name').value,
            cat: document.getElementById('edit-cat').value,
            desc: document.getElementById('edit-desc').value,
            safety: document.getElementById('edit-safety').value,
            levels: {
                beginner: document.getElementById('edit-level-beginner').value || '無',
                normal: document.getElementById('edit-level-normal').value || '無',
                advanced: document.getElementById('edit-level-advanced').value || '無'
            }
        };
        if (id) {
            const idx = list.findIndex(x => x.id === id);
            list[idx] = { ...list[idx], ...newItem };
        } else {
            list.push({ id: 'e' + Date.now(), ...newItem });
        }
        this.saveData(); this.navTo('edit-list');
    },

    deleteItem() {
        if(confirm('確定刪除？')) {
            const id = document.getElementById('edit-id').value;
            const cat = document.getElementById('edit-category').value;
            this.data.exercises[cat] = this.data.exercises[cat].filter(x => x.id !== id);
            this.saveData(); this.navTo('edit-list');
        }
    },

    initSW() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js').catch(err => console.log(err));
        }
    }
};

app.init();