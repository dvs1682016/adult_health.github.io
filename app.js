const DEFAULT_EXERCISES = {
    general: [
        { id: 'g1', cat: '熱身', name: '原地踏步', desc: '雙手擺動，膝蓋微抬', safety: '注意地面平整', levels: { beginner: '3分鐘', normal: '5分鐘', advanced: '8分鐘' } },
        { id: 'g2', cat: '有氧', name: '快走/散步', desc: '戶外或室內繞圈快走', safety: '穿著防滑鞋', levels: { beginner: '10分鐘', normal: '15分鐘', advanced: '20分鐘' } },
        { id: 'g3', cat: '肌力', name: '椅子坐站', desc: '雙手抱胸，從椅子站起再坐下', safety: '椅子要靠牆固定，膝蓋勿內夾', levels: { beginner: '10次', normal: '15次', advanced: '20次' } },
        { id: 'g4', cat: '肌力', name: '推牆挺身', desc: '雙手扶牆，做伏地挺身動作', safety: '地面勿濕滑', levels: { beginner: '10次', normal: '15次', advanced: '20次' } },
        { id: 'g5', cat: '平衡', name: '單腳站立', desc: '扶著椅背，單腳抬起維持', safety: '手隨時準備扶好', levels: { beginner: '10秒/腳', normal: '20秒/腳', advanced: '30秒/腳' } },
        { id: 'g6', cat: '伸展', name: '全身伸展', desc: '雙手向上延伸，深呼吸', safety: '動作放慢，不憋氣', levels: { beginner: '30秒', normal: '1分鐘', advanced: '1分鐘' } },
    ],
    rainy: [
        { id: 'r1', cat: '熱身', name: '坐姿擺手', desc: '坐穩椅子，雙手大幅擺動', safety: '坐穩不搖晃', levels: { beginner: '3分鐘', normal: '5分鐘', advanced: '8分鐘' } },
        { id: 'r2', cat: '有氧', name: '坐姿抬膝', desc: '左右輪流抬高膝蓋', safety: '背部打直', levels: { beginner: '10分鐘', normal: '15分鐘', advanced: '20分鐘' } },
        { id: 'r3', cat: '肌力', name: '抬小腿', desc: '坐姿，單腳伸直踢平', safety: '腳尖勾起', levels: { beginner: '10次/腳', normal: '15次/腳', advanced: '20次/腳' } },
        { id: 'r4', cat: '肌力', name: '寶特瓶舉重', desc: '手持水瓶向上推舉', safety: '選擇適合重量', levels: { beginner: '10次', normal: '15次', advanced: '20次' } },
        { id: 'r5', cat: '平衡', name: '直線走路', desc: '腳跟接腳尖，像走鋼索', safety: '旁邊要有牆或扶手', levels: { beginner: '來回3趟', normal: '來回5趟', advanced: '來回8趟' } },
        { id: 'r6', cat: '伸展', name: '坐姿前彎', desc: '坐椅子，身體慢慢前彎伸展背部', safety: '慢慢來，防暈眩', levels: { beginner: '30秒', normal: '1分鐘', advanced: '1分鐘' } },
    ]
};

const QUOTES = [
    "動一動，健康好輕鬆！",
    "今天的汗水是明天的活力。",
    "慢慢來，有做就是一百分。",
    "保持活動，心情也會變好喔！",
    "為了自己，也為了家人，動起來！"
];

// 定義難度顏色主題 (用於 List Card)
const LEVEL_THEMES = {
    beginner: "bg-teal-50 border-teal-200",
    normal: "bg-blue-50 border-blue-200",
    advanced: "bg-orange-50 border-orange-200"
};

// 定義難度文字 (用於顯示)
const LEVEL_NAMES = {
    beginner: "初階",
    normal: "普通",
    advanced: "高階"
};

const app = {
    data: {
        level: 'normal',
        largeText: false,
        weatherMode: 'general', // general | rainy
        history: {}, // Key: YYYY-MM-DD
        today: '', 
        exercises: JSON.parse(JSON.stringify(DEFAULT_EXERCISES)), 
        editingCategory: 'general' 
    },

    init() {
        this.data.today = this.getLocalDateStr(new Date());
        this.loadData();
        this.renderAll();
        this.applySettings();
        this.checkInstallPrompt();
        this.navTo('home');
    },

    getLocalDateStr(dateObj) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    loadData() {
        const saved = localStorage.getItem('seniorFitData_v2');
        if (saved) {
            const parsed = JSON.parse(saved);
            const currentSessionToday = this.data.today;
            this.data = { ...this.data, ...parsed };
            this.data.today = currentSessionToday;
            
            if (!this.data.exercises) {
                this.data.exercises = JSON.parse(JSON.stringify(DEFAULT_EXERCISES));
            }
        } else {
            this.saveData();
        }
    },

    saveData() {
        localStorage.setItem('seniorFitData_v2', JSON.stringify(this.data));
        const key = this.data.today;
        if (!this.data.history[key]) {
            this.data.history[key] = { done: [], percent: 0, mode: this.data.weatherMode };
        }
    },

    changeDate(offset) {
        const current = new Date(this.data.today);
        current.setDate(current.getDate() + offset);
        this.data.today = this.getLocalDateStr(current);
        
        if (!this.data.history[this.data.today]) {
             this.data.history[this.data.today] = { done: [], percent: 0, mode: this.data.weatherMode };
        } else {
            if (this.data.history[this.data.today].mode) {
                this.data.weatherMode = this.data.history[this.data.today].mode;
            }
        }
        this.renderAll();
        this.saveData();
    },

    goToToday() {
        this.data.today = this.getLocalDateStr(new Date());
        this.renderAll();
        this.saveData();
    },

    renderAll() {
        this.renderDate();
        this.setWeatherMode(this.data.weatherMode, false);
        this.renderList();
        this.updateProgress();
        this.renderHistory();
    },

    renderDate() {
        const dateObj = new Date(this.data.today);
        const dayNames = ['日','一','二','三','四','五','六'];
        const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日 星期${dayNames[dateObj.getDay()]}`;
        document.getElementById('currentDate').innerText = dateStr;
        document.getElementById('quoteOfTheDay').innerText = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        
        const todayStr = this.getLocalDateStr(new Date());
        const backBtn = document.getElementById('btn-back-today');
        const startBtnText = document.getElementById('start-btn-text');
        const taskListTitle = document.getElementById('task-list-title');

        if (this.data.today !== todayStr) {
            backBtn.classList.remove('hidden');
            startBtnText.innerText = "查看運動紀錄";
            taskListTitle.innerText = "當日任務";
        } else {
            backBtn.classList.add('hidden');
            startBtnText.innerText = "開始今日運動";
            taskListTitle.innerText = "今日任務";
        }
    },

    setWeatherMode(mode, shouldRender = true) {
        this.data.weatherMode = mode;
        
        const btnGen = document.getElementById('btn-mode-general');
        const btnRain = document.getElementById('btn-mode-rainy');
        const activeClass = "bg-lime-600 text-white shadow-md";
        const inactiveClass = "bg-stone-100 text-stone-400";

        if (mode === 'general') {
            btnGen.className = `flex-1 py-2 rounded-lg text-sm font-bold transition-colors flex justify-center items-center gap-2 ${activeClass}`;
            btnRain.className = `flex-1 py-2 rounded-lg text-sm font-bold transition-colors flex justify-center items-center gap-2 ${inactiveClass}`;
        } else {
            btnGen.className = `flex-1 py-2 rounded-lg text-sm font-bold transition-colors flex justify-center items-center gap-2 ${inactiveClass}`;
            btnRain.className = `flex-1 py-2 rounded-lg text-sm font-bold transition-colors flex justify-center items-center gap-2 bg-blue-500 text-white shadow-md`;
        }

        if (this.data.history[this.data.today]) {
            this.data.history[this.data.today].mode = mode;
        }

        if(shouldRender) {
            this.saveData();
            this.renderList();
            this.updateProgress();
        }
    },

    navTo(pageId) {
        document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden'));
        document.getElementById(`view-${pageId}`).classList.remove('hidden');
        
        const nav = document.getElementById('main-nav');
        const weatherSwitch = document.getElementById('weather-mode-switch');
        
        if (pageId.startsWith('edit-')) {
            nav.classList.add('hidden');
            weatherSwitch.classList.add('hidden');
        } else {
            nav.classList.remove('hidden');
            if(pageId === 'home' || pageId === 'today') {
                weatherSwitch.classList.remove('hidden');
            } else {
                weatherSwitch.classList.add('hidden');
            }
        }

        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.target === pageId) {
                btn.classList.add('text-lime-700', 'active');
                btn.classList.remove('text-stone-400');
            } else {
                btn.classList.remove('text-lime-700', 'active');
                btn.classList.add('text-stone-400');
            }
        });

        if (pageId === 'home') this.updateProgress();
        if (pageId === 'history') this.renderHistory();
        if (pageId === 'edit-list') this.renderEditList();
        
        document.getElementById('main-content').scrollTop = 0;
    },

    renderList() {
        const listContainer = document.getElementById('task-list');
        const list = this.data.exercises[this.data.weatherMode]; 
        const todayRecord = this.data.history[this.data.today] || { done: [] };
        
        // 取得目前難度的對應卡片顏色
        const currentLevelTheme = LEVEL_THEMES[this.data.level];
        const currentLevelName = LEVEL_NAMES[this.data.level];

        let html = '';
        list.forEach(item => {
            const isDone = todayRecord.done.includes(item.id);
            const target = item.levels[this.data.level];
            
            // 若未完成，使用難度顏色；若完成，使用預設的綠色樣式 (由 .completed class 處理)
            const cardBgClass = isDone ? 'task-card completed' : `task-card ${currentLevelTheme}`;
            
            html += `
            <div onclick="app.toggleTask('${item.id}')" class="${cardBgClass} border p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="bg-white/50 text-stone-600 text-xs px-2 py-0.5 rounded border border-black/5">${item.cat}</span>
                        <h3 class="font-bold text-lg ${isDone ? 'text-lime-800 line-through opacity-70' : 'text-stone-800'}">${item.name}</h3>
                    </div>
                    <p class="text-stone-700 font-medium mb-1">目標：<span class="font-bold text-lg">${target}</span></p>
                    ${item.safety ? `<p class="text-xs text-red-500 font-bold"><i class="ph ph-warning"></i> ${item.safety}</p>` : ''}
                </div>
                <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${isDone ? 'bg-lime-500 border-lime-500' : 'bg-white/50 border-black/10'}">
                    ${isDone ? '<i class="ph ph-check text-white text-xl font-bold"></i>' : ''}
                </div>
            </div>
            `;
        });
        
        listContainer.innerHTML = html;
        
        const levelDisplay = document.getElementById('level-display');
        levelDisplay.innerText = currentLevelName;
        
        if(this.data.level === 'beginner') levelDisplay.className = "px-2 py-0.5 rounded text-sm bg-teal-100 text-teal-800 font-bold";
        else if(this.data.level === 'normal') levelDisplay.className = "px-2 py-0.5 rounded text-sm bg-blue-100 text-blue-800 font-bold";
        else levelDisplay.className = "px-2 py-0.5 rounded text-sm bg-orange-100 text-orange-800 font-bold";

        const allDone = list.length > 0 && todayRecord.done.length === list.length;
        const doneMsg = document.getElementById('all-done-msg');
        if (allDone) doneMsg.classList.remove('hidden');
        else doneMsg.classList.add('hidden');
    },

    toggleTask(id) {
        const todayKey = this.data.today;
        if (!this.data.history[todayKey]) {
            this.data.history[todayKey] = { done: [], percent: 0, mode: this.data.weatherMode };
        }
        
        const record = this.data.history[todayKey];
        const index = record.done.indexOf(id);
        
        if (index > -1) {
            record.done.splice(index, 1); 
        } else {
            record.done.push(id); 
            if (navigator.vibrate) navigator.vibrate(50);
        }

        const total = this.data.exercises[this.data.weatherMode].length;
        record.percent = Math.round((record.done.length / total) * 100);
        
        this.saveData();
        this.renderList();
        this.updateProgress();
    },

    updateProgress() {
        const record = this.data.history[this.data.today] || { percent: 0, done: [] };
        const percent = record.percent;
        
        document.getElementById('progress-text').innerText = `${percent}%`;
        
        const circle = document.getElementById('progress-ring');
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;

        const cheer = document.getElementById('cheer-msg');
        let msg = "";
        if (percent === 0) msg = "開始第一步吧！";
        else if (percent < 50) msg = "很棒，繼續保持！";
        else if (percent < 100) msg = "太厲害了，快完成了！";
        else msg = "挑戰成功，您真棒！";
        cheer.innerText = msg;
    },

    renderHistory() {
        const container = document.getElementById('history-list');
        const dates = [];
        const todayStr = this.getLocalDateStr(new Date());

        for(let i=0; i<7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(this.getLocalDateStr(d));
        }

        let html = '';
        dates.forEach(date => {
            const rec = this.data.history[date];
            const isToday = date === todayStr;
            const isSelected = date === this.data.today;
            const dateObj = new Date(date);
            const displayDate = `${dateObj.getMonth()+1}/${dateObj.getDate()}`;
            
            const bgClass = isSelected ? "bg-lime-50 border-lime-500 border-2" : "bg-white border-stone-100";
            const emptyBgClass = isSelected ? "bg-lime-50 border-lime-500 border-2" : "bg-stone-50 border-stone-100 opacity-60";

            if (rec) {
                html += `
                <div onclick="app.jumpToDate('${date}')" class="flex items-center p-3 rounded-xl shadow-sm border cursor-pointer ${bgClass}">
                    <div class="w-12 text-center">
                        <span class="block text-xs text-stone-400">${isToday ? '今天' : ''}</span>
                        <span class="font-bold text-stone-700">${displayDate}</span>
                    </div>
                    <div class="flex-1 px-4">
                        <div class="w-full bg-stone-100 rounded-full h-3">
                            <div class="history-bar bg-lime-500 h-3 rounded-full" style="width: 0%" data-percent="${rec.percent}"></div>
                        </div>
                    </div>
                    <div class="w-12 text-right font-bold text-lime-600">${rec.percent}%</div>
                </div>
                `;
            } else {
                html += `
                <div onclick="app.jumpToDate('${date}')" class="flex items-center p-3 rounded-xl border cursor-pointer ${emptyBgClass}">
                    <div class="w-12 text-center font-bold text-stone-400">${displayDate}</div>
                    <div class="flex-1 text-center text-xs text-stone-400">無紀錄</div>
                </div>
                `;
            }
        });
        container.innerHTML = html;

        setTimeout(() => {
            container.querySelectorAll('.history-bar').forEach(bar => {
                bar.style.width = bar.dataset.percent + '%';
            });
        }, 50);
    },
    
    jumpToDate(dateStr) {
        this.data.today = dateStr;
        this.renderAll();
        this.saveData();
        this.navTo('home');
    },

    // --- Settings Actions ---
    setLevel(lvl) {
        this.data.level = lvl;
        this.applySettings();
        this.saveData();
        this.renderList();
    },

    toggleLargeText() {
        this.data.largeText = !this.data.largeText;
        this.applySettings();
        this.saveData();
    },

    applySettings() {
        document.querySelectorAll('.setting-btn-level').forEach(btn => {
            const isActive = btn.dataset.val === this.data.level;
            const activeClass = btn.dataset.activeClass;
            const inactiveClass = btn.dataset.inactiveClass;
            
            if (isActive) {
                btn.className = `setting-btn-level p-3 rounded-xl border text-center transition-all ${activeClass}`;
            } else {
                btn.className = `setting-btn-level p-3 rounded-xl border text-center transition-all ${inactiveClass}`;
            }
        });

        const btnLarge = document.getElementById('btn-large-text');
        const indicator = btnLarge.querySelector('div');
        if (this.data.largeText) {
            document.body.classList.add('large-text-mode');
            btnLarge.classList.remove('bg-stone-300');
            btnLarge.classList.add('bg-lime-500');
            indicator.style.transform = "translateX(20px)";
        } else {
            document.body.classList.remove('large-text-mode');
            btnLarge.classList.add('bg-stone-300');
            btnLarge.classList.remove('bg-lime-500');
            indicator.style.transform = "translateX(0)";
        }
    },

    resetData() {
        if(confirm('確定要刪除所有歷史紀錄嗎？')) {
            const saveExercises = JSON.parse(JSON.stringify(this.data.exercises));
            localStorage.removeItem('seniorFitData_v2');
            this.data.exercises = saveExercises;
            location.reload();
        }
    },

    resetExercises() {
        if(confirm('確定要還原所有運動項目為預設值嗎？\n您的自訂修改將會消失。')) {
            this.data.exercises = JSON.parse(JSON.stringify(DEFAULT_EXERCISES));
            this.saveData();
            alert('已還原為預設菜單。');
            this.renderList();
        }
    },
    
    // --- Edit Features ---
    setEditMode(mode) {
        this.data.editingCategory = mode;
        this.renderEditList();
    },

    renderEditList() {
        const category = this.data.editingCategory;
        const btnGen = document.getElementById('btn-edit-mode-general');
        const btnRain = document.getElementById('btn-edit-mode-rainy');
        
        if (category === 'general') {
            btnGen.className = "flex-1 py-2 rounded-lg font-bold border-2 border-lime-500 bg-lime-50 text-lime-800";
            btnRain.className = "flex-1 py-2 rounded-lg font-bold border border-stone-200 bg-white text-stone-500";
        } else {
            btnGen.className = "flex-1 py-2 rounded-lg font-bold border border-stone-200 bg-white text-stone-500";
            btnRain.className = "flex-1 py-2 rounded-lg font-bold border-2 border-blue-500 bg-blue-50 text-blue-800";
        }

        const list = this.data.exercises[category];
        const container = document.getElementById('edit-list-container');
        let html = '';

        list.forEach((item, index) => {
            const isFirst = index === 0;
            const isLast = index === list.length - 1;

             html += `
            <div class="bg-white p-3 rounded-xl shadow-sm border border-stone-100 flex items-center gap-3 mb-3">
                <div class="flex flex-col items-center justify-center gap-1 bg-stone-50 rounded-lg p-1">
                    <button onclick="event.stopPropagation(); app.moveItem('${item.id}', -1)" class="w-8 h-8 flex items-center justify-center rounded-full active:bg-stone-200 text-stone-500 ${isFirst ? 'opacity-20 pointer-events-none' : 'hover:text-lime-600'}">
                        <i class="ph ph-caret-up text-lg"></i>
                    </button>
                    <button onclick="event.stopPropagation(); app.moveItem('${item.id}', 1)" class="w-8 h-8 flex items-center justify-center rounded-full active:bg-stone-200 text-stone-500 ${isLast ? 'opacity-20 pointer-events-none' : 'hover:text-lime-600'}">
                        <i class="ph ph-caret-down text-lg"></i>
                    </button>
                </div>
                
                <div onclick="app.openEditItem('${item.id}')" class="flex-1 cursor-pointer">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">${item.cat}</span>
                        <i class="ph ph-pencil-simple text-xl text-lime-600"></i>
                    </div>
                    <h3 class="font-bold text-stone-800 text-lg mb-1">${item.name}</h3>
                    <div class="flex gap-1 mt-1 text-xs text-stone-500 flex-wrap opacity-80">
                        <span class="bg-teal-50 text-teal-700 px-1 rounded border border-teal-100">初:${item.levels.beginner}</span>
                        <span class="bg-blue-50 text-blue-700 px-1 rounded border border-blue-100">普:${item.levels.normal}</span>
                        <span class="bg-orange-50 text-orange-700 px-1 rounded border border-orange-100">高:${item.levels.advanced}</span>
                    </div>
                </div>
            </div>
            `;
        });
        container.innerHTML = html;
    },

    // --- 新增移動順序功能 ---
    moveItem(id, direction) {
        const category = this.data.editingCategory;
        const list = this.data.exercises[category];
        const index = list.findIndex(x => x.id === id);
        
        if (index === -1) return;
        
        const newIndex = index + direction;
        
        // 邊界檢查 (其實按鈕 UI 已經擋掉了，但邏輯再擋一次)
        if (newIndex < 0 || newIndex >= list.length) return;
        
        // 交換位置
        [list[index], list[newIndex]] = [list[newIndex], list[index]];
        
        this.saveData();
        this.renderEditList(); // 重新渲染列表以更新按鈕狀態與順序
    },

    openAddItem() {
        const category = this.data.editingCategory;
        
        document.getElementById('edit-id').value = ""; 
        document.getElementById('edit-category').value = category;
        
        document.getElementById('edit-page-title').innerText = "新增運動";

        document.getElementById('edit-name').value = "";
        document.getElementById('edit-cat').value = "";
        document.getElementById('edit-desc').value = "";
        document.getElementById('edit-safety').value = "";
        
        document.getElementById('edit-level-beginner').value = "";
        document.getElementById('edit-level-normal').value = "";
        document.getElementById('edit-level-advanced').value = "";

        document.getElementById('btn-delete-item').classList.add('hidden');

        this.navTo('edit-item');
    },

    openEditItem(id) {
        const category = this.data.editingCategory;
        const item = this.data.exercises[category].find(x => x.id === id);
        if (!item) return;

        document.getElementById('edit-page-title').innerText = "修改內容";

        document.getElementById('edit-id').value = item.id;
        document.getElementById('edit-category').value = category;
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
        const category = document.getElementById('edit-category').value;
        const list = this.data.exercises[category];

        const valBeginner = document.getElementById('edit-level-beginner').value;
        const valNormal = document.getElementById('edit-level-normal').value;
        const valAdvanced = document.getElementById('edit-level-advanced').value;

        const newItemData = {
            name: document.getElementById('edit-name').value,
            cat: document.getElementById('edit-cat').value,
            desc: document.getElementById('edit-desc').value,
            safety: document.getElementById('edit-safety').value,
            levels: {
                beginner: valBeginner || '無',
                normal: valNormal || '無',
                advanced: valAdvanced || '無'
            }
        };

        if (id) {
            const idx = list.findIndex(x => x.id === id);
            if (idx > -1) {
                list[idx] = { ...list[idx], ...newItemData };
                alert('修改已儲存！');
            }
        } else {
            const newId = (category === 'general' ? 'g' : 'r') + Date.now();
            list.push({ id: newId, ...newItemData });
            alert('新增成功！');
        }
        
        this.saveData();
        this.navTo('edit-list');
    },

    deleteItem() {
        const id = document.getElementById('edit-id').value;
        const category = document.getElementById('edit-category').value;
        
        if (!id) return;
        
        if (confirm("確定要刪除這個運動項目嗎？\n刪除後無法復原。")) {
            const list = this.data.exercises[category];
            const idx = list.findIndex(x => x.id === id);
            if (idx > -1) {
                list.splice(idx, 1);
                this.saveData();
                alert("已刪除項目。");
                this.navTo('edit-list');
            }
        }
    },

    checkInstallPrompt() {
        let deferredPrompt;
        const installBtn = document.getElementById('installBtn');
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.classList.remove('hidden');
            
            installBtn.addEventListener('click', () => {
                installBtn.classList.add('hidden');
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted install');
                    }
                    deferredPrompt = null;
                });
            });
        });
    }
};

// Start App
app.init();