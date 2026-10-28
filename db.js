// db.js - IndexedDB wrapper using localForage (NO ES modules)

localforage.config({
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
  name: 'WorkoutPWA',
  version: 1.0,
  storeName: 'keyvaluepairs'
});

const db = {
  // ── Exercise library ──
  async getAllExercises() {
    const ex = await localforage.getItem('exercises');
    return ex || [];
  },
  async setExercises(list) {
    await localforage.setItem('exercises', list || []);
  },
  async deleteExerciseByName(name) {
    const list = await this.getAllExercises();
    const filtered = list.filter(e => e.name.toLowerCase() !== name.toLowerCase());
    await localforage.setItem('exercises', filtered);
  },
  async addExercise(ex) {
    const list = await this.getAllExercises();
    const existing = list.find(e => e.name.toLowerCase() === ex.name.toLowerCase());
    if (!existing) {
      list.push(ex);
      await localforage.setItem('exercises', list);
    } else if (ex.muscle && !existing.muscle) {
      existing.muscle = ex.muscle;
      await localforage.setItem('exercises', list);
    }
  },

  // ── Schede / Workout Plans Multi-Ambiente (Versionamento e Storico) ──
  async getActivePlan(env) {
    return await localforage.getItem(env + '_activePlan');
  },
  async setActivePlan(env, plan) {
    await localforage.setItem(env + '_activePlan', plan);
  },
  async archivePlan(env, plan) {
    const key = env + '_archives';
    const archives = (await localforage.getItem(key)) || [];
    archives.push(plan);
    await localforage.setItem(key, archives);
  },
  async saveNewPlan(env, planData) {
    const current = await this.getActivePlan(env);
    if (current && current.name) {
      const archived = {
        ...current,
        endDate: planData.startDate || new Date().toISOString().split('T')[0]
      };
      await this.archivePlan(env, archived);
    }
    const newPlan = {
      id: 'plan_' + Date.now(),
      name: planData.name || (env === 'gym' ? 'Palestra' : 'Casa') + ' - ' + new Date().toISOString().split('T')[0],
      env: env,
      startDate: planData.startDate || new Date().toISOString().split('T')[0],
      days: planData.days || []
    };
    await this.setActivePlan(env, newPlan);
    return newPlan;
  },
  async getArchives(env) {
    return (await localforage.getItem(env + '_archives')) || [];
  },

  // Ricerca una scheda (attiva o archiviata) per un determinato ambiente valida ad una data specifica (YYYY-MM-DD)
  async getPlanByDate(env, targetDate) {
    if (!targetDate) return null;
    const target = new Date(targetDate).getTime();

    // 1. Controlla la scheda attiva corrente
    const active = await this.getActivePlan(env);
    if (active && active.startDate) {
      const start = new Date(active.startDate).getTime();
      const end = active.endDate ? new Date(active.endDate).getTime() : Infinity;
      if (target >= start && target <= end) {
        return { plan: active, source: 'Scheda Attiva' };
      }
    }

    // 2. Controlla tra le schede archiviate
    const archives = await this.getArchives(env);
    for (let i = archives.length - 1; i >= 0; i--) {
      const arch = archives[i];
      if (arch.startDate) {
        const start = new Date(arch.startDate).getTime();
        const end = arch.endDate ? new Date(arch.endDate).getTime() : Infinity;
        if (target >= start && target <= end) {
          return { plan: arch, source: 'Archivio Storico (' + arch.startDate + ' → ' + (arch.endDate || 'attiva') + ')' };
        }
      }
    }

    // 3. Fallback: trova la scheda con la startDate più vicina <= target
    if (archives.length > 0) {
      const pastPlans = archives.filter(a => a.startDate && new Date(a.startDate).getTime() <= target);
      if (pastPlans.length > 0) {
        pastPlans.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        return { plan: pastPlans[0], source: 'Archivio Storico (Valida nel periodo)' };
      }
    }

    if (active && active.days && active.days.length > 0) {
      return { plan: active, source: 'Scheda Attiva Corrente (Nessun archivio trovato per la data indicata)' };
    }

    return null;
  },

  // ── Workout Logs, Suggerimento Carico & Note Precedenti ──
  async addLogEntry(entry) {
    const logs = (await localforage.getItem('logs')) || [];
    logs.push(entry);
    await localforage.setItem('logs', logs);
  },
  async addBulkLogs(entries) {
    const logs = (await localforage.getItem('logs')) || [];
    entries.forEach(e => logs.push(e));
    await localforage.setItem('logs', logs);
  },
  async getLogs() {
    return (await localforage.getItem('logs')) || [];
  },

  // Suggerimento Carico Intelligente Globale a ritroso (anche mesi/anni prima)
  async getLastExerciseStats(exerciseName) {
    if (!exerciseName) return null;
    const logs = (await localforage.getItem('logs')) || [];
    const cleanName = exerciseName.trim().toLowerCase();
    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      if (log.exercise && log.exercise.trim().toLowerCase() === cleanName && !String(log.status).toLowerCase().includes('saltato') && (Number(log.kg) > 0 || Number(log.reps) > 0 || log.notes)) {
        return {
          kg: log.kg,
          reps: log.reps,
          date: log.date,
          notes: log.notes || ''
        };
      }
    }
    return null;
  },

  // Raggruppa i log storici in sedute distinte (per data + ambiente + scheda + giorno)
  async getCompletedSessions(limit = 10) {
    const logs = (await localforage.getItem('logs')) || [];
    if (logs.length === 0) return [];

    // Mappa le sedute raggruppandole per sessionKey
    const sessionsMap = {};

    for (let i = logs.length - 1; i >= 0; i--) {
      const entry = logs[i];
      const sessionKey = (entry.date || 'Senza Data') + '___' + (entry.env || 'gym') + '___' + (entry.planName || 'Scheda') + '___' + (entry.dayName || '');

      if (!sessionsMap[sessionKey]) {
        sessionsMap[sessionKey] = {
          sessionKey: sessionKey,
          date: entry.date,
          env: entry.env || 'gym',
          planName: entry.planName || 'Scheda',
          dayName: entry.dayName || '',
          timestamp: entry.date ? new Date(entry.date).getTime() : 0,
          exercises: []
        };
      }
      sessionsMap[sessionKey].exercises.unshift(entry); // mantieni ordine originale
    }

    const sessionsList = Object.values(sessionsMap);
    // Ordina dalla seduta più recente alla più vecchia
    sessionsList.sort((a, b) => b.timestamp - a.timestamp);

    return sessionsList.slice(0, limit);
  },

  async getRecentCount(days) {
    const logs = (await localforage.getItem('logs')) || [];
    const extra = (await localforage.getItem('extra')) || [];
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    
    const workoutDates = new Set();
    logs.forEach(l => {
      if (new Date(l.date).getTime() >= cutoff && l.status === 'Completato') {
        workoutDates.add(l.date + '_' + (l.env || ''));
      }
    });
    
    const extraCount = extra.filter(a => new Date(a.date).getTime() >= cutoff).length;
    return workoutDates.size + extraCount;
  },

  // ── Extra Activities & Sport Library ──
  async getSportTypesLibrary() {
    const list = (await localforage.getItem('sport_types_library')) || [];
    return list;
  },
  async addSportTypeToLibrary(sport) {
    if (!sport || !sport.trim()) return;
    const cleanSport = sport.trim();
    const lib = await this.getSportTypesLibrary();
    if (!lib.some(s => s.toLowerCase() === cleanSport.toLowerCase())) {
      lib.push(cleanSport);
      await localforage.setItem('sport_types_library', lib);
    }
  },
  async addExtraActivity(activity) {
    const extra = (await localforage.getItem('extra')) || [];
    if (!activity.id) {
      activity.id = 'extra_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }
    extra.push(activity);
    await localforage.setItem('extra', extra);
    if (activity.sport) {
      await this.addSportTypeToLibrary(activity.sport);
    }
    return activity;
  },
  async updateExtraActivity(id, updatedFields) {
    const extra = (await localforage.getItem('extra')) || [];
    const idx = extra.findIndex(a => a.id === id);
    if (idx !== -1) {
      extra[idx] = { ...extra[idx], ...updatedFields };
      await localforage.setItem('extra', extra);
      if (updatedFields.sport) {
        await this.addSportTypeToLibrary(updatedFields.sport);
      }
      return extra[idx];
    }
    return null;
  },
  async deleteExtraActivity(id) {
    const extra = (await localforage.getItem('extra')) || [];
    const updated = extra.filter(a => a.id !== id);
    await localforage.setItem('extra', updated);
  },
  async getExtraActivities() {
    const extra = (await localforage.getItem('extra')) || [];
    let modified = false;
    extra.forEach(item => {
      if (!item.id) {
        item.id = 'extra_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        modified = true;
      }
    });
    if (modified) {
      await localforage.setItem('extra', extra);
    }
    return extra;
  },

  // ── Injuries & Pain Types Library ──
  async getInjuryTypesLibrary() {
    const list = (await localforage.getItem('injury_types_library')) || [];
    if (list.length === 0) {
      const defaults = [
        'Spalla destra', 'Spalla sinistra',
        'Ginocchio destro', 'Ginocchio sinistro',
        'Lombare / Bassa schiena', 'Cervicale / Collo',
        'Gomito destro (epitrocleite/epicondilite)', 'Gomito sinistro',
        'Polso destro', 'Polso sinistro',
        'Caviglia destra', 'Caviglia sinistra',
        'Pettorale', 'Bicipite femorale', 'Adduttori', 'Tendine d\'Achille'
      ];
      await localforage.setItem('injury_types_library', defaults);
      return defaults;
    }
    return list;
  },
  async addInjuryTypeToLibrary(type) {
    if (!type || !type.trim()) return;
    const cleanType = type.trim();
    const lib = await this.getInjuryTypesLibrary();
    if (!lib.some(t => t.toLowerCase() === cleanType.toLowerCase())) {
      lib.push(cleanType);
      await localforage.setItem('injury_types_library', lib);
    }
  },
  async addInjury(injury) {
    const list = (await localforage.getItem('injuries')) || [];
    if (!injury.id) {
      injury.id = 'inj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }
    list.push(injury);
    await localforage.setItem('injuries', list);
    if (injury.type) {
      await this.addInjuryTypeToLibrary(injury.type);
    }
    return injury;
  },
  async updateInjury(id, updatedFields) {
    const list = (await localforage.getItem('injuries')) || [];
    const idx = list.findIndex(i => (i.id && i.id === id) || (!i.id && i === id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedFields };
      await localforage.setItem('injuries', list);
      if (updatedFields.type) {
        await this.addInjuryTypeToLibrary(updatedFields.type);
      }
      return list[idx];
    }
    return null;
  },
  async deleteInjury(id) {
    const list = (await localforage.getItem('injuries')) || [];
    const updated = list.filter(i => i.id !== id);
    await localforage.setItem('injuries', updated);
  },
  async getInjuries() {
    const list = (await localforage.getItem('injuries')) || [];
    let modified = false;
    list.forEach(item => {
      if (!item.id) {
        item.id = 'inj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        modified = true;
      }
    });
    if (modified) {
      await localforage.setItem('injuries', list);
    }
    return list;
  },

  // ── Azzeramento dati di test / Reset manuale ──
  async clearTestData() {
    await localforage.removeItem('logs');
    await localforage.removeItem('extra');
    await localforage.removeItem('injuries');
    await localforage.removeItem('gym_activePlan');
    await localforage.removeItem('home_activePlan');
    await localforage.removeItem('gym_archives');
    await localforage.removeItem('home_archives');
    await localforage.removeItem('ai_chat_history');
    await localforage.removeItem('exercises'); // Svuota anche i nomi di prova inseriti
  },

  // ── Gestione API Key & Cronologia Chat IA ──
  async getApiKey() {
    return (await localforage.getItem('gemini_api_key')) || '';
  },
  async setApiKey(key) {
    await localforage.setItem('gemini_api_key', key ? key.trim() : '');
  },
  async getAiModel() {
    return (await localforage.getItem('gemini_selected_model')) || 'gemini-2.0-flash';
  },
  async setAiModel(model) {
    await localforage.setItem('gemini_selected_model', model || 'gemini-2.0-flash');
  },
  async getAiChatHistory() {
    return (await localforage.getItem('ai_chat_history')) || [];
  },
  async saveAiChatHistory(history) {
    await localforage.setItem('ai_chat_history', history || []);
  },
  async clearAiChatHistory() {
    await localforage.removeItem('ai_chat_history');
  },

  // ── Ripristino Backup Completo (JSON) ──
  async restoreBackup(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Dati di backup non validi o formato corrotto.');
    }

    const keysToRestore = [
      'exercises',
      'logs',
      'extra',
      'sport_types_library',
      'injuries',
      'injury_types_library',
      'gym_activePlan',
      'home_activePlan',
      'gym_archives',
      'home_archives',
      'ai_chat_history'
    ];

    for (const key of keysToRestore) {
      if (data[key] !== undefined && data[key] !== null) {
        await localforage.setItem(key, data[key]);
      }
    }
    return true;
  }
};
