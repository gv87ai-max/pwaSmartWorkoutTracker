// app.js - Main application logic (NO ES modules, uses global 'db')

(function () {
  'use strict';

  // ── Costanti Gruppi Muscolari ──
  var MUSCLE_GROUPS = ['Spalle', 'Gambe', 'Dorso', 'Petto', 'Addome', 'Tricipiti', 'Bicipiti'];

  // ── UI Elements Generali ──
  var btnGym = document.getElementById('btnGym');
  var btnHome = document.getElementById('btnHome');
  var recentCountSpan = document.getElementById('recentCount');
  var exportBtn = document.getElementById('exportBtn');
  var backupBtn = document.getElementById('backupBtn');
  var restoreBtn = document.getElementById('restoreBtn');
  var restoreFileInput = document.getElementById('restoreFileInput');
  var analyzeBtn = document.getElementById('analyzeBtn');
  var openStatsModalBtnFooter = document.getElementById('openStatsModalBtnFooter');
  var toggleDataMenuBtn = document.getElementById('toggleDataMenuBtn');
  var dataMenuModal = document.getElementById('dataMenuModal');
  var closeDataMenuBtn = document.getElementById('closeDataMenuBtn');

  // ── Elements Sezione "Allenamento di Oggi" ──
  var openStatsModalBtn = document.getElementById('openStatsModalBtn');
  var planInfoSubtext = document.getElementById('planInfoSubtext');
  var goToNewPlanBtn = document.getElementById('goToNewPlanBtn');
  var openPdfExportModalBtn = document.getElementById('openPdfExportModalBtn');
  var editCurrentPlanBtn = document.getElementById('editCurrentPlanBtn');
  var cancelEditPlanBtn = document.getElementById('cancelEditPlanBtn');
  var isEditingActivePlan = false;
  var daySelectorContainer = document.getElementById('daySelectorContainer');
  var workoutDaysAccordionContainer = document.getElementById('workoutDaysAccordionContainer');
  var exerciseListDiv = document.getElementById('exerciseList');
  var workoutCompletionSlot = document.getElementById('workoutCompletionSlot');
  var finishWorkoutBtn = document.getElementById('finishWorkoutBtn');

  // ── Elements Sezione "Ultime Schede Svolte" (Soluzione 1) ──
  var toggleRecentSessionsBtn = document.getElementById('toggleRecentSessionsBtn');
  var recentSessionsContent = document.getElementById('recentSessionsContent');
  var recentSessionsArrow = document.getElementById('recentSessionsArrow');
  var recentSessionsCountBadge = document.getElementById('recentSessionsCountBadge');
  var recentSessionsList = document.getElementById('recentSessionsList');

  // ── Elements Sezione "Inserisci Nuova Scheda" ──
  var toggleNewPlanAccordionBtn = document.getElementById('toggleNewPlanAccordionBtn');
  var newPlanEnvLabel = document.getElementById('newPlanEnvLabel');
  var newPlanContent = document.getElementById('newPlanContent');
  var newPlanArrow = document.getElementById('newPlanArrow');
  var newPlanNameInput = document.getElementById('newPlanName');
  var newPlanStartDateInput = document.getElementById('newPlanStartDate');
  var newPlanNumDaysSelect = document.getElementById('newPlanNumDays');
  var daysBuilderContainer = document.getElementById('daysBuilderContainer');
  var saveCompletePlanBtn = document.getElementById('saveCompletePlanBtn');
  var exerciseSuggestionsGlobal = document.getElementById('exerciseSuggestionsGlobal');

  // ── Elements Sezione "Esporta PDF Scheda" ──
  var togglePdfAccordionBtn = document.getElementById('togglePdfAccordionBtn');
  var pdfContent = document.getElementById('pdfContent');
  var pdfAccordionArrow = document.getElementById('pdfAccordionArrow');
  var pdfTargetDateInput = document.getElementById('pdfTargetDate');
  var pdfTargetEnvSelect = document.getElementById('pdfTargetEnv');
  var generatePdfBtn = document.getElementById('generatePdfBtn');
  var pdfStatusMsg = document.getElementById('pdfStatusMsg');

  // ── Elements Attività Extra ──
  var extraForm = document.getElementById('extraForm');
  var extraFormTitle = document.getElementById('extraFormTitle');
  var extraIdInput = document.getElementById('extraId');
  var extraDateInput = document.getElementById('extraDate');
  var extraSportInput = document.getElementById('extraSport');
  var sportSuggestions = document.getElementById('sportSuggestions');
  var extraDurationInput = document.getElementById('extraDuration');
  var extraRPEInput = document.getElementById('extraRPE');
  var extraNotesInput = document.getElementById('extraNotes');
  var extraSubmitBtn = document.getElementById('extraSubmitBtn');
  var extraCancelEditBtn = document.getElementById('extraCancelEditBtn');

  var toggleExtraBtn = document.getElementById('toggleExtraBtn');
  var extraContainer = document.getElementById('extraContainer');
  var extraListEl = document.getElementById('extraList');
  var extraCountBadge = document.getElementById('extraCountBadge');
  var extraArrow = document.getElementById('extraArrow');

  // ── Elements Infortuni ──
  var activeInjuriesBanner = document.getElementById('activeInjuriesBanner');
  var activeInjuriesList = document.getElementById('activeInjuriesList');
  var injuryForm = document.getElementById('injuryForm');
  var injuryFormTitle = document.getElementById('injuryFormTitle');
  var injuryIdInput = document.getElementById('injuryId');
  var injuryStartInput = document.getElementById('injuryStart');
  var injuryTypeInput = document.getElementById('injuryType');
  var injurySuggestions = document.getElementById('injurySuggestions');
  var injuryEndInput = document.getElementById('injuryEnd');
  var injuryNotesInput = document.getElementById('injuryNotes');
  var injurySubmitBtn = document.getElementById('injurySubmitBtn');
  var injuryCancelEditBtn = document.getElementById('injuryCancelEditBtn');

  var toggleOngoingBtn = document.getElementById('toggleOngoingBtn');
  var ongoingContainer = document.getElementById('ongoingContainer');
  var ongoingListEl = document.getElementById('ongoingList');
  var ongoingCountEl = document.getElementById('ongoingCount');
  var ongoingArrow = document.getElementById('ongoingArrow');

  var toggleResolvedBtn = document.getElementById('toggleResolvedBtn');
  var resolvedContainer = document.getElementById('resolvedContainer');
  var resolvedListEl = document.getElementById('resolvedList');
  var resolvedCountEl = document.getElementById('resolvedCount');
  var resolvedArrow = document.getElementById('resolvedArrow');

  // ── Stato Applicativo ──
  var currentEnv = 'gym';
  var activePlan = null;
  var selectedDayId = null;
  var currentWorkoutState = {};

  // ── Helper: Data odierna in formato YYYY-MM-DD ──
  function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  // Preimposta date di default
  if (injuryStartInput && !injuryStartInput.value) {
    injuryStartInput.value = getTodayDateString();
  }
  if (extraDateInput && !extraDateInput.value) {
    extraDateInput.value = getTodayDateString();
  }
  if (newPlanStartDateInput && !newPlanStartDateInput.value) {
    newPlanStartDateInput.value = getTodayDateString();
  }
  if (pdfTargetDateInput && !pdfTargetDateInput.value) {
    pdfTargetDateInput.value = getTodayDateString();
  }

  // ── Switch Ambiente (Palestra / Casa) ──
  function setEnvironment(env) {
    currentEnv = env;
    btnGym.classList.toggle('active', env === 'gym');
    btnHome.classList.toggle('active', env === 'home');
    newPlanEnvLabel.textContent = env === 'gym' ? 'Palestra' : 'Casa';
    pdfTargetEnvSelect.value = env;
    loadActivePlan();
    renderPlanBuilder();
  }

  btnGym.addEventListener('click', function () { setEnvironment('gym'); });
  btnHome.addEventListener('click', function () { setEnvironment('home'); });

  // ── Aggiorna Badge Allenamenti Ultimi 30 Giorni ──
  async function updateRecentBadge() {
    try {
      var count = await db.getRecentCount(30);
      recentCountSpan.textContent = count;
    } catch (err) {
      console.error('updateRecentBadge error:', err);
    }
  }

  // ── Popola datalist globale degli esercizi memorizzati ──
  async function updateGlobalExerciseSuggestions() {
    try {
      var exercises = await db.getAllExercises();
      exerciseSuggestionsGlobal.innerHTML = '';
      exercises.forEach(function (ex) {
        var opt = document.createElement('option');
        opt.value = ex.name;
        exerciseSuggestionsGlobal.appendChild(opt);
      });
    } catch (err) {
      console.error('updateGlobalExerciseSuggestions error:', err);
    }
  }

  // ════════════════════════════════════════════════════════════════
  // ── SEZIONE 1: LOGICA "ALLENAMENTO DI OGGI"                   ──
  // ════════════════════════════════════════════════════════════════

  async function loadActivePlan() {
    try {
      activePlan = await db.getActivePlan(currentEnv);
      currentWorkoutState = {};

      if (!activePlan || !activePlan.days || activePlan.days.length === 0) {
        planInfoSubtext.innerHTML = '<span style="color:#ff9800;">Nessuna scheda attiva per ' +
          (currentEnv === 'gym' ? 'Palestra' : 'Casa') + '. Creane una qui sotto!</span>';
        daySelectorContainer.style.display = 'none';
        daySelectorContainer.innerHTML = '';
        exerciseListDiv.innerHTML = '<div style="text-align:center; padding:1.5rem; color:#888;">' +
          'Non hai ancora inserito una scheda per questo ambiente.<br><br>' +
          '<button type="button" class="primary" onclick="window.openNewPlanSection()">' +
          '➕ Inserisci Scheda ' + (currentEnv === 'gym' ? 'Palestra' : 'Casa') + '</button></div>';
        workoutCompletionSlot.style.display = 'none';
        return;
      }

      planInfoSubtext.innerHTML = '<strong>' + escapeHtml(activePlan.name) + '</strong> (' +
        (currentEnv === 'gym' ? 'Palestra' : 'Casa') + ') - Dal: ' + (activePlan.startDate || 'N/D');

      renderDayTabs();
    } catch (err) {
      console.error('loadActivePlan error:', err);
    }
  }

  function renderDayTabs() {
    if (!activePlan || !activePlan.days || activePlan.days.length === 0) return;

    if (daySelectorContainer) {
      daySelectorContainer.style.display = 'none'; // Sostituito dalla visualizzazione a giorni collassabili
    }

    renderTodayAccordionDays();
  }

  async function renderTodayAccordionDays() {
    if (!workoutDaysAccordionContainer) return;
    workoutDaysAccordionContainer.innerHTML = '';

    if (!activePlan || !activePlan.days || activePlan.days.length === 0) return;

    // Genera un blocco collassabile per ogni giorno della scheda (Giorno 1, Giorno 2, ecc.)
    for (var dIdx = 0; dIdx < activePlan.days.length; dIdx++) {
      var day = activePlan.days[dIdx];

      var dayCard = document.createElement('div');
      dayCard.className = 'session-card';
      dayCard.style.marginBottom = '0.8rem';

      var toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'session-header-toggle';
      toggleBtn.style.padding = '0.85rem 1rem';

      var leftDiv = document.createElement('div');
      leftDiv.className = 'session-header-left';
      leftDiv.innerHTML = '<span class="session-date-badge" style="background: rgba(0, 230, 118, 0.15); color: #00e676; border: 1px solid rgba(0, 230, 118, 0.3);">' +
        escapeHtml(day.name) + '</span>' +
        '<span style="font-size:0.85rem; color:#aaa; margin-left:0.5rem;">(' + (day.exercises ? day.exercises.length : 0) + ' esercizi)</span>';

      var arrowSpan = document.createElement('span');
      arrowSpan.className = 'session-arrow';
      arrowSpan.id = 'arrow_day_' + day.id;
      // Chiuso di default come richiesto!
      arrowSpan.textContent = '▼ Apri Allenamento';

      toggleBtn.appendChild(leftDiv);
      toggleBtn.appendChild(arrowSpan);

      // Body contenitore degli esercizi del giorno
      var bodyDiv = document.createElement('div');
      bodyDiv.className = 'session-body-content';
      bodyDiv.id = 'body_day_' + day.id;
      bodyDiv.style.display = 'none'; // CHIUSO DI DEFAULT!
      bodyDiv.style.padding = '0.8rem';

      // Renderizza gli esercizi di questo giorno dentro il suo body
      await renderExercisesIntoContainer(day, bodyDiv);

      (function (dId, body, arrow) {
        toggleBtn.onclick = function () {
          var isExpanded = body.style.display !== 'none';
          body.style.display = isExpanded ? 'none' : 'block';
          arrow.textContent = isExpanded ? '▼ Apri Allenamento' : '▲ Chiudi Allenamento';
          if (!isExpanded) {
            selectedDayId = dId;
            workoutCompletionSlot.style.display = 'block';
          }
        };
      })(day.id, bodyDiv, arrowSpan);

      dayCard.appendChild(toggleBtn);
      dayCard.appendChild(bodyDiv);
      workoutDaysAccordionContainer.appendChild(dayCard);
    }

    workoutCompletionSlot.style.display = 'none'; // Si apre quando si espande un giorno
  }

  async function renderExercisesIntoContainer(currentDay, container) {
    container.innerHTML = '';
    if (!currentDay.exercises || currentDay.exercises.length === 0) {
      container.innerHTML = '<div style="color:#aaa; padding:1rem; text-align:center;">Nessun esercizio per questo giorno.</div>';
      return;
    }

    var idx = 0;
    while (idx < currentDay.exercises.length) {
      var ex = currentDay.exercises[idx];
      var nextEx = (idx + 1 < currentDay.exercises.length) ? currentDay.exercises[idx + 1] : null;

      // Superserie
      if (ex.isSuperset && nextEx) {
        var groupWrapper = document.createElement('div');
        groupWrapper.className = 'superserie-group-wrapper';

        var badgeHeader = document.createElement('div');
        badgeHeader.className = 'superserie-badge-header';
        badgeHeader.innerHTML = '⚡ SUPERSERIE (Esercizi ' + (idx + 1) + ' + ' + (idx + 2) + ' - Senza pausa)';
        groupWrapper.appendChild(badgeHeader);

        var exKey1 = currentDay.id + '_' + idx;
        var lastStats1 = await db.getLastExerciseStats(ex.name);
        var notes1 = (lastStats1 && lastStats1.notes) ? lastStats1.notes : (ex.notes || '');
        if (!currentWorkoutState[exKey1]) {
          currentWorkoutState[exKey1] = {
            done: false,
            kg: lastStats1 ? lastStats1.kg : '',
            reps: ex.prescribedReps || (lastStats1 ? lastStats1.reps : ''),
            notes: notes1
          };
        }
        var card1 = createWorkoutExerciseCard(ex, exKey1, lastStats1, notes1, idx);
        groupWrapper.appendChild(card1);

        var connector = document.createElement('div');
        connector.className = 'superserie-connector-line';
        connector.innerHTML = '<span>⚡ Passa subito a:</span>';
        groupWrapper.appendChild(connector);

        var exKey2 = currentDay.id + '_' + (idx + 1);
        var lastStats2 = await db.getLastExerciseStats(nextEx.name);
        var notes2 = (lastStats2 && lastStats2.notes) ? lastStats2.notes : (nextEx.notes || '');
        if (!currentWorkoutState[exKey2]) {
          currentWorkoutState[exKey2] = {
            done: false,
            kg: lastStats2 ? lastStats2.kg : '',
            reps: nextEx.prescribedReps || (lastStats2 ? lastStats2.reps : ''),
            notes: notes2
          };
        }
        var card2 = createWorkoutExerciseCard(nextEx, exKey2, lastStats2, notes2, idx + 1);
        groupWrapper.appendChild(card2);

        container.appendChild(groupWrapper);
        idx += 2;
      } else {
        var exKey = currentDay.id + '_' + idx;
        var lastStats = await db.getLastExerciseStats(ex.name);
        var suggestedNotes = (lastStats && lastStats.notes) ? lastStats.notes : (ex.notes || '');

        if (!currentWorkoutState[exKey]) {
          currentWorkoutState[exKey] = {
            done: false,
            kg: lastStats ? lastStats.kg : (ex.targetKg || ''),
            reps: ex.prescribedReps || (lastStats ? lastStats.reps : ''),
            notes: suggestedNotes
          };
        }

        var card = createWorkoutExerciseCard(ex, exKey, lastStats, suggestedNotes, idx);
        container.appendChild(card);
        idx++;
      }
    }
  }

  async function renderTodayExercises() {
    // Sostituito da renderTodayAccordionDays
  }

  function createWorkoutExerciseCard(ex, exKey, lastStats, suggestedNotes, idx) {
    var state = currentWorkoutState[exKey];

    var card = document.createElement('div');
    card.className = 'workout-exercise-card' + (state.done ? ' status-done' : '');
    card.id = 'card_' + exKey;

    var headerDiv = document.createElement('div');
    headerDiv.className = 'exercise-header-title';
    
    var muscleBadge = '';
    if (ex.muscle) {
      var mLower = ex.muscle.toLowerCase();
      var mClass = 'muscle-default';
      if (mLower.includes('petto')) mClass = 'muscle-chest';
      else if (mLower.includes('dorso')) mClass = 'muscle-back';
      else if (mLower.includes('gambe')) mClass = 'muscle-legs';
      else if (mLower.includes('spalle')) mClass = 'muscle-shoulders';
      else if (mLower.includes('bicipiti') || mLower.includes('tricipiti')) mClass = 'muscle-arms';
      else if (mLower.includes('addome')) mClass = 'muscle-abs';
      muscleBadge = '<span class="exercise-muscle-badge ' + mClass + '">' + escapeHtml(ex.muscle) + '</span>';
    }

    var targetSets = ex.prescribedSets || 3;
    var targetReps = ex.prescribedReps || 10;

    // Tasto OK / Fatto (posizionato nell'header accanto a Muscolo e Grafico)
    var okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.className = 'btn-exercise-ok' + (state.done ? ' active-done' : '');
    okBtn.textContent = state.done ? '✓ Fatto' : 'OK';

    var headerLeft = document.createElement('div');
    headerLeft.className = 'exercise-header-left-group';
    headerLeft.innerHTML = '<span class="exercise-name-text">' + (idx + 1) + '. ' + escapeHtml(ex.name) + '</span>' +
      muscleBadge +
      '<button type="button" class="btn-exercise-chart" title="Visualizza grafico progressi di ' + escapeHtml(ex.name) + '" onclick="window.openExerciseChart(\'' + escapeHtml(ex.name).replace(/'/g, "\\'") + '\')">' +
      '📈 Grafico</button>';
    headerLeft.appendChild(okBtn);

    var targetBadge = document.createElement('span');
    targetBadge.className = 'exercise-prescribed-badge';
    targetBadge.textContent = 'Target: ' + targetSets + ' x ' + targetReps;

    headerDiv.appendChild(headerLeft);
    headerDiv.appendChild(targetBadge);

    var hintDiv = document.createElement('div');
    hintDiv.className = 'exercise-prev-hint';
    var hintText = '💡 ';
    if (lastStats) {
      var prevSetsText = lastStats.sets ? (lastStats.sets + 's x ') : '';
      hintText += 'Ultimo carico: <strong>' + lastStats.kg + ' kg (' + prevSetsText + lastStats.reps + ' reps)</strong> (' + lastStats.date + ')';
    } else {
      hintText += 'Nessun carico precedente registrato';
    }
    if (suggestedNotes) {
      hintText += ' | Promemoria/Note: <em>"' + escapeHtml(suggestedNotes) + '"</em>';
    }
    hintDiv.innerHTML = hintText;

    var gridDiv = document.createElement('div');
    gridDiv.className = 'exercise-inputs-grid';

    // 1. Input SERIE FATTE con Stepper Rapido (- / +)
    var setsCol = document.createElement('div');
    setsCol.className = 'input-with-label';
    setsCol.innerHTML = '<label>Serie:</label>';

    var setsWrapper = document.createElement('div');
    setsWrapper.className = 'stepper-input-wrapper';

    var setsMinusBtn = document.createElement('button');
    setsMinusBtn.type = 'button';
    setsMinusBtn.className = 'stepper-btn';
    setsMinusBtn.textContent = '-';

    var setsInput = document.createElement('input');
    setsInput.type = 'number';
    setsInput.min = '1';
    setsInput.className = 'stepper-num-input';
    setsInput.placeholder = String(targetSets);
    setsInput.value = state.sets !== undefined ? state.sets : targetSets;
    setsInput.oninput = function () {
      state.sets = setsInput.value;
    };

    var setsPlusBtn = document.createElement('button');
    setsPlusBtn.type = 'button';
    setsPlusBtn.className = 'stepper-btn';
    setsPlusBtn.textContent = '+';

    setsMinusBtn.onclick = function () {
      var val = Number(setsInput.value) || 1;
      val = Math.max(1, val - 1);
      setsInput.value = val;
      state.sets = val;
    };
    setsPlusBtn.onclick = function () {
      var val = Number(setsInput.value) || 1;
      val = val + 1;
      setsInput.value = val;
      state.sets = val;
    };

    setsWrapper.appendChild(setsMinusBtn);
    setsWrapper.appendChild(setsInput);
    setsWrapper.appendChild(setsPlusBtn);
    setsCol.appendChild(setsWrapper);

    // 2. Input RIPETUTE FATTE con Stepper Rapido (- / +)
    var repsCol = document.createElement('div');
    repsCol.className = 'input-with-label';
    repsCol.innerHTML = '<label>Ripetute:</label>';

    var repsWrapper = document.createElement('div');
    repsWrapper.className = 'stepper-input-wrapper';

    var repsMinusBtn = document.createElement('button');
    repsMinusBtn.type = 'button';
    repsMinusBtn.className = 'stepper-btn';
    repsMinusBtn.textContent = '-';

    var repsInput = document.createElement('input');
    repsInput.type = 'number';
    repsInput.min = '0';
    repsInput.className = 'stepper-num-input';
    repsInput.placeholder = String(targetReps);
    repsInput.value = state.reps !== undefined ? state.reps : targetReps;
    repsInput.oninput = function () {
      state.reps = repsInput.value;
    };

    var repsPlusBtn = document.createElement('button');
    repsPlusBtn.type = 'button';
    repsPlusBtn.className = 'stepper-btn';
    repsPlusBtn.textContent = '+';

    repsMinusBtn.onclick = function () {
      var val = Number(repsInput.value) || 0;
      val = Math.max(0, val - 1);
      repsInput.value = val;
      state.reps = val;
    };
    repsPlusBtn.onclick = function () {
      var val = Number(repsInput.value) || 0;
      val = val + 1;
      repsInput.value = val;
      state.reps = val;
    };

    repsWrapper.appendChild(repsMinusBtn);
    repsWrapper.appendChild(repsInput);
    repsWrapper.appendChild(repsPlusBtn);
    repsCol.appendChild(repsWrapper);

    // 3. Input KG con Stepper Rapido (- / +)
    var kgCol = document.createElement('div');
    kgCol.className = 'input-with-label';
    kgCol.innerHTML = '<label>Kg (Carico):</label>';

    var kgWrapper = document.createElement('div');
    kgWrapper.className = 'stepper-input-wrapper';

    var kgMinusBtn = document.createElement('button');
    kgMinusBtn.type = 'button';
    kgMinusBtn.className = 'stepper-btn';
    kgMinusBtn.textContent = '-';

    var kgInput = document.createElement('input');
    kgInput.type = 'number';
    kgInput.min = '0';
    kgInput.step = '0.5';
    kgInput.className = 'stepper-num-input';
    kgInput.placeholder = lastStats ? String(lastStats.kg) : 'Kg';
    kgInput.value = state.kg !== undefined ? state.kg : (lastStats ? lastStats.kg : '');
    kgInput.oninput = function () {
      state.kg = kgInput.value;
    };

    var kgPlusBtn = document.createElement('button');
    kgPlusBtn.type = 'button';
    kgPlusBtn.className = 'stepper-btn';
    kgPlusBtn.textContent = '+';

    kgMinusBtn.onclick = function () {
      var val = Number(kgInput.value) || 0;
      val = Math.max(0, val - 2.5);
      kgInput.value = val;
      state.kg = val;
    };
    kgPlusBtn.onclick = function () {
      var val = Number(kgInput.value) || 0;
      val = val + 2.5;
      kgInput.value = val;
      state.kg = val;
    };

    kgWrapper.appendChild(kgMinusBtn);
    kgWrapper.appendChild(kgInput);
    kgWrapper.appendChild(kgPlusBtn);
    kgCol.appendChild(kgWrapper);

    // Campo Note Giornaliero (Spazioso su riga intera)
    var notesInput = document.createElement('input');
    notesInput.type = 'text';
    notesInput.className = 'exercise-notes-input';
    notesInput.placeholder = suggestedNotes ? ('Note/Promemoria: "' + suggestedNotes + '"') : 'Note seduta (es. Ultima serie ceduto a 8, aumentare carico...)';
    notesInput.value = state.notes !== undefined ? state.notes : '';
    notesInput.oninput = function () {
      state.notes = notesInput.value;
    };

    okBtn.onclick = async function () {
      state.done = !state.done;
      if (state.done) {
        okBtn.className = 'btn-exercise-ok active-done';
        okBtn.textContent = '✓ Fatto';
        card.classList.add('status-done');

        var finalSets = Number(setsInput.value) || targetSets || 1;
        var finalKg = Number(kgInput.value) || 0;
        var finalReps = Number(repsInput.value) || targetReps || 0;
        var finalNotes = notesInput.value.trim();
        state.sets = finalSets;
        state.kg = finalKg;
        state.reps = finalReps;
        state.notes = finalNotes;
      } else {
        okBtn.className = 'btn-exercise-ok';
        okBtn.textContent = 'OK';
        card.classList.remove('status-done');
      }
    };

    gridDiv.appendChild(setsCol);
    gridDiv.appendChild(repsCol);
    gridDiv.appendChild(kgCol);

    card.appendChild(headerDiv);
    card.appendChild(hintDiv);
    card.appendChild(gridDiv);
    card.appendChild(notesInput);

    return card;
  }

  // Conclusione della scheda odierna ("Scheda Completata")
  finishWorkoutBtn.addEventListener('click', async function () {
    if (!activePlan || !activePlan.days) return;
    var currentDay = activePlan.days.find(function (d) { return d.id === selectedDayId; });
    if (!currentDay || !currentDay.exercises) return;

    var logsToSave = [];
    var todayStr = getTodayDateString();
    var completedCount = 0;
    var skippedCount = 0;
    var skippedNames = [];

    // Prima passata: controlliamo quanti esercizi risultano non confermati
    currentDay.exercises.forEach(function (ex, idx) {
      var exKey = selectedDayId + '_' + idx;
      var state = currentWorkoutState[exKey] || { done: false, kg: 0, reps: 0, notes: '' };
      var isCompleted = state.done && (Number(state.reps) > 0 || Number(state.kg) > 0);
      if (!isCompleted) {
        skippedNames.push(ex.name);
      }
    });

    // Avviso di sicurezza se ci sono esercizi non confermati con "OK"
    if (skippedNames.length > 0) {
      var warningMsg = '⚠️ Attenzione: hai ' + skippedNames.length + ' esercizio/i NON confermato/i con OK:\n\n' +
        skippedNames.map(function (n, i) { return ' • ' + n; }).join('\n') +
        '\n\nVuoi davvero salvare l\'allenamento registrando questi esercizi come "Non effettuati / Saltati"?\n(Premi Annulla per tornare indietro e confermarli)';
      var confirmed = confirm(warningMsg);
      if (!confirmed) {
        return; // L'utente torna alla schermata per controllare e cliccare OK
      }
    }

    currentDay.exercises.forEach(function (ex, idx) {
      var exKey = selectedDayId + '_' + idx;
      var state = currentWorkoutState[exKey] || { done: false, kg: 0, reps: 0, notes: '' };

      var isCompleted = state.done && (Number(state.reps) > 0 || Number(state.kg) > 0);
      var finalSets = state.sets !== undefined ? (Number(state.sets) || ex.prescribedSets || 1) : (ex.prescribedSets || 3);
      var finalReps = isCompleted ? Number(state.reps) : 0;
      var finalKg = isCompleted ? Number(state.kg) : 0;
      var finalStatus = isCompleted ? 'Completato' : 'Non effettuata / Saltato';
      var finalNotes = state.notes ? String(state.notes).trim() : '';

      if (isCompleted) {
        completedCount++;
      } else {
        skippedCount++;
      }

      logsToSave.push({
        date: todayStr,
        env: currentEnv,
        planName: activePlan.name,
        dayName: currentDay.name,
        exercise: ex.name,
        muscle: ex.muscle || '',
        sets: finalSets,
        kg: finalKg,
        reps: finalReps,
        prescribedSets: ex.prescribedSets || 3,
        prescribedReps: ex.prescribedReps || 10,
        notes: finalNotes,
        status: finalStatus
      });
    });

    // Se per la stessa data, ambiente e giorno esistono già log, ripulisci quelli precedenti per evitare duplicazioni
    var existingLogs = (await db.getLogs()) || [];
    var filteredLogs = existingLogs.filter(function (l) {
      return !(l.date === todayStr && l.env === currentEnv && l.planName === activePlan.name && l.dayName === currentDay.name);
    });
    logsToSave.forEach(function (entry) {
      filteredLogs.push(entry);
    });
    await localforage.setItem('logs', filteredLogs);

    await updateRecentBadge();
    await renderRecentSessions();

    alert('🎉 Scheda Completata!\n\n' +
      'Data: ' + todayStr + '\n' +
      'Giorno: ' + currentDay.name + '\n' +
      'Esercizi completati: ' + completedCount + '\n' +
      'Esercizi saltati/non svolti: ' + skippedCount + '\n\n' +
      'Tutti i dati e le note sono stati registrati con successo nello storico!');

    currentWorkoutState = {};
    renderTodayExercises();
  });

  // ════════════════════════════════════════════════════════════════
  // ── SEZIONE 1B: ULTIME SCHEDE SVOLTE (SOLUZIONE 1 ACCORDION)  ──
  // ════════════════════════════════════════════════════════════════

  function toggleRecentSessionsAccordion(forceOpen) {
    var isHidden = recentSessionsContent.style.display === 'none';
    var shouldOpen = forceOpen !== undefined ? forceOpen : isHidden;
    recentSessionsContent.style.display = shouldOpen ? 'block' : 'none';
    recentSessionsArrow.textContent = shouldOpen ? '▲ Nascondi Ultime Schede' : '▼ Mostra Ultime Schede';
  }

  toggleRecentSessionsBtn.addEventListener('click', function () {
    toggleRecentSessionsAccordion();
  });

  async function renderRecentSessions() {
    try {
      var sessions = await db.getCompletedSessions(10);
      recentSessionsCountBadge.textContent = sessions.length;
      recentSessionsList.innerHTML = '';

      if (sessions.length === 0) {
        recentSessionsList.innerHTML = '<div style="color:#888; font-size:0.9rem; text-align:center; padding:1rem;">' +
          'Nessuna scheda svolta registrata finora. Completa la tua prima sessione in "Allenamento di Oggi"!</div>';
        return;
      }

      sessions.forEach(function (sess, sIdx) {
        var card = document.createElement('div');
        card.className = 'session-card';

        // Header collassabile della singola seduta: visibile SOLO Data, Ambiente e Tipologia Scheda / Giorno
        var toggleHeaderBtn = document.createElement('button');
        toggleHeaderBtn.type = 'button';
        toggleHeaderBtn.className = 'session-header-toggle';

        var envClass = sess.env === 'home' ? 'session-env-home' : 'session-env-gym';
        var envText = sess.env === 'home' ? 'Casa' : 'Palestra';

        var leftDiv = document.createElement('div');
        leftDiv.className = 'session-header-left';
        leftDiv.innerHTML = '<span class="session-date-badge">📅 ' + escapeHtml(sess.date) + '</span>' +
          '<span class="session-env-badge ' + envClass + '">' + envText + '</span>' +
          '<span>' + escapeHtml(sess.planName) + (sess.dayName ? (' - ' + escapeHtml(sess.dayName)) : '') + '</span>';

        var arrowSpan = document.createElement('span');
        arrowSpan.className = 'session-arrow';
        arrowSpan.textContent = '▼ Dettagli (' + sess.exercises.length + ' es.)';

        toggleHeaderBtn.appendChild(leftDiv);
        toggleHeaderBtn.appendChild(arrowSpan);

        // Body contenente gli esercizi specifici: CHIUSO DI DEFAULT
        var bodyDiv = document.createElement('div');
        bodyDiv.className = 'session-body-content';
        bodyDiv.style.display = 'none';

        sess.exercises.forEach(function (ex, eIdx) {
          var itemDiv = document.createElement('div');
          var isSkipped = String(ex.status).toLowerCase().includes('saltato') || (Number(ex.reps) === 0 && Number(ex.kg) === 0);
          itemDiv.className = 'session-exercise-item ' + (isSkipped ? 'skipped' : 'done');

          var muscleTag = ex.muscle ? (' <span style="color:#64b5f6; font-size:0.75rem;">[' + escapeHtml(ex.muscle) + ']</span>') : '';
          var notesText = ex.notes ? ('<div style="font-size:0.75rem; color:#ffa726; margin-top:2px;">💬 Nota: <em>' + escapeHtml(ex.notes) + '</em></div>') : '';

          var setsPart = ex.sets ? (ex.sets + 's × ') : '';
          var statusBadge = isSkipped
            ? '<span style="color:#bbb; font-size:0.8rem;">❌ Non effettuata</span>'
            : '<span style="color:#4caf50; font-weight:bold;">' + ex.kg + ' kg (' + setsPart + ex.reps + ' reps)</span>';

          itemDiv.innerHTML = '<div style="flex:1;">' +
            '<strong>' + (eIdx + 1) + '. ' + escapeHtml(ex.exercise) + '</strong>' + muscleTag +
            notesText +
            '</div>' +
            '<div>' + statusBadge + '</div>';

          bodyDiv.appendChild(itemDiv);
        });

        // Click sull'header della seduta: apre/chiude i dettagli degli esercizi
        toggleHeaderBtn.onclick = function () {
          var isExpanded = bodyDiv.style.display !== 'none';
          bodyDiv.style.display = isExpanded ? 'none' : 'block';
          arrowSpan.textContent = isExpanded
            ? ('▼ Dettagli (' + sess.exercises.length + ' es.)')
            : '▲ Nascondi Dettagli';
        };

        card.appendChild(toggleHeaderBtn);
        card.appendChild(bodyDiv);
        recentSessionsList.appendChild(card);
      });

    } catch (err) {
      console.error('renderRecentSessions error:', err);
    }
  }

  window.openNewPlanSection = function () {
    isEditingActivePlan = false;
    newPlanNameInput.value = '';
    newPlanStartDateInput.value = getTodayDateString();
    if (cancelEditPlanBtn) cancelEditPlanBtn.style.display = 'none';
    if (saveCompletePlanBtn) saveCompletePlanBtn.textContent = '💾 Salva e Attiva Nuova Scheda';
    renderPlanBuilder();
    toggleNewPlanAccordion(true);
    document.getElementById('newPlanSection').scrollIntoView({ behavior: 'smooth' });
  };
  goToNewPlanBtn.addEventListener('click', window.openNewPlanSection);

  window.openEditCurrentPlanSection = async function () {
    if (!activePlan || !activePlan.days || activePlan.days.length === 0) {
      alert('Nessuna scheda attiva trovata da modificare per ' + (currentEnv === 'gym' ? 'Palestra' : 'Casa') + '. Creane prima una!');
      return;
    }

    isEditingActivePlan = true;
    newPlanNameInput.value = activePlan.name || '';
    newPlanStartDateInput.value = activePlan.startDate || getTodayDateString();
    var daysCount = Math.max(1, Math.min(6, activePlan.days.length));
    newPlanNumDaysSelect.value = String(daysCount);

    // Carica i dati della scheda attiva nel builder
    renderPlanBuilderWithData(activePlan);

    if (cancelEditPlanBtn) cancelEditPlanBtn.style.display = 'inline-block';
    if (saveCompletePlanBtn) saveCompletePlanBtn.textContent = '💾 Salva Modifiche Scheda Attuale';

    toggleNewPlanAccordion(true);
    document.getElementById('newPlanSection').scrollIntoView({ behavior: 'smooth' });
  };
  if (editCurrentPlanBtn) {
    editCurrentPlanBtn.addEventListener('click', window.openEditCurrentPlanSection);
  }

  if (cancelEditPlanBtn) {
    cancelEditPlanBtn.addEventListener('click', function () {
      isEditingActivePlan = false;
      toggleNewPlanAccordion(false);
      cancelEditPlanBtn.style.display = 'none';
      if (saveCompletePlanBtn) saveCompletePlanBtn.textContent = '💾 Salva Scheda';
      document.getElementById('todayWorkout').scrollIntoView({ behavior: 'smooth' });
    });
  }

  function renderPlanBuilderWithData(planToEdit) {
    var numDays = planToEdit.days ? planToEdit.days.length : 1;
    daysBuilderContainer.innerHTML = '';
    var dayLabels = ['Giorno 1 (A)', 'Giorno 2 (B)', 'Giorno 3 (C)', 'Giorno 4 (D)', 'Giorno 5 (E)', 'Giorno 6 (F)'];

    for (var i = 0; i < numDays; i++) {
      var dData = planToEdit.days[i];
      var dayBox = document.createElement('div');
      dayBox.className = 'builder-day-box';
      dayBox.id = 'builder_day_' + i;

      var toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'builder-day-header-toggle';

      var titleSpan = document.createElement('span');
      var label = dData && dData.name ? dData.name : (dayLabels[i] || ('Giorno ' + (i + 1)));
      titleSpan.innerHTML = '📅 ' + escapeHtml(label);

      var arrowSpan = document.createElement('span');
      arrowSpan.className = 'session-arrow';
      arrowSpan.id = 'builder_arrow_' + i;
      arrowSpan.textContent = '▼ Apri Giorno';

      toggleBtn.appendChild(titleSpan);
      toggleBtn.appendChild(arrowSpan);

      var bodyContainer = document.createElement('div');
      bodyContainer.className = 'builder-day-body';
      bodyContainer.id = 'builder_body_' + i;
      bodyContainer.style.display = 'none';

      var actionRow = document.createElement('div');
      actionRow.style.cssText = 'display: flex; justify-content: flex-end; margin-bottom: 0.6rem;';
      actionRow.innerHTML = '<button type="button" class="btn-small btn-resolve" onclick="window.addExerciseToBuilderDay(' + i + ')">+ Aggiungi Esercizio</button>';

      var listContainer = document.createElement('div');
      listContainer.id = 'builder_exercises_' + i;

      bodyContainer.appendChild(actionRow);
      bodyContainer.appendChild(listContainer);

      (function (idx, body, arrow) {
        toggleBtn.onclick = function () {
          var isOpen = body.style.display !== 'none';
          body.style.display = isOpen ? 'none' : 'block';
          arrow.textContent = isOpen ? '▼ Apri Giorno' : '▲ Chiudi Giorno';
        };
      })(i, bodyContainer, arrowSpan);

      dayBox.appendChild(toggleBtn);
      dayBox.appendChild(bodyContainer);
      daysBuilderContainer.appendChild(dayBox);

      if (dData && dData.exercises && dData.exercises.length > 0) {
        dData.exercises.forEach(function (ex) {
          addExerciseCardToBuilder(i, ex.name, ex.muscle, ex.prescribedSets || 3, ex.prescribedReps || 10, ex.notes || '', Boolean(ex.isSuperset));
        });
      } else {
        addExerciseCardToBuilder(i, '', 'Petto', 3, 10, '', false);
      }
    }
  }

  // ════════════════════════════════════════════════════════════════
  // ── SEZIONE 2: INSERISCI NUOVA SCHEDA (BUILDER SEPARATO)      ──
  // ════════════════════════════════════════════════════════════════

  function toggleNewPlanAccordion(forceOpen) {
    var isHidden = newPlanContent.style.display === 'none';
    var shouldOpen = forceOpen !== undefined ? forceOpen : isHidden;
    newPlanContent.style.display = shouldOpen ? 'block' : 'none';
    newPlanArrow.textContent = shouldOpen ? '▲ Chiudi Creazione' : '▼ Apri Creazione';
  }

  toggleNewPlanAccordionBtn.addEventListener('click', function () {
    toggleNewPlanAccordion();
  });

  newPlanNumDaysSelect.addEventListener('change', function () {
    renderPlanBuilder();
  });

  function renderPlanBuilder() {
    var numDays = parseInt(newPlanNumDaysSelect.value, 10) || 1;
    daysBuilderContainer.innerHTML = '';

    var dayLabels = ['Giorno 1 (A)', 'Giorno 2 (B)', 'Giorno 3 (C)', 'Giorno 4 (D)', 'Giorno 5 (E)', 'Giorno 6 (F)'];

    for (var i = 0; i < numDays; i++) {
      var dayBox = document.createElement('div');
      dayBox.className = 'builder-day-box';
      dayBox.id = 'builder_day_' + i;

      // Header collassabile per ciascun giorno
      var toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'builder-day-header-toggle';

      var titleSpan = document.createElement('span');
      titleSpan.innerHTML = '📅 ' + (dayLabels[i] || ('Giorno ' + (i + 1)));

      var arrowSpan = document.createElement('span');
      arrowSpan.className = 'session-arrow';
      arrowSpan.id = 'builder_arrow_' + i;
      // Chiuso di default per ordine
      arrowSpan.textContent = '▼ Apri Giorno';

      toggleBtn.appendChild(titleSpan);
      toggleBtn.appendChild(arrowSpan);

      // Corpo collassabile
      var bodyContainer = document.createElement('div');
      bodyContainer.className = 'builder-day-body';
      bodyContainer.id = 'builder_body_' + i;
      bodyContainer.style.display = 'none'; // Chiuso di default!

      var actionRow = document.createElement('div');
      actionRow.style.cssText = 'display: flex; justify-content: flex-end; margin-bottom: 0.6rem;';
      actionRow.innerHTML = '<button type="button" class="btn-small btn-resolve" onclick="window.addExerciseToBuilderDay(' + i + ')">+ Aggiungi Esercizio</button>';

      var listContainer = document.createElement('div');
      listContainer.id = 'builder_exercises_' + i;

      bodyContainer.appendChild(actionRow);
      bodyContainer.appendChild(listContainer);

      // Toggle click
      (function (idx, body, arrow) {
        toggleBtn.onclick = function () {
          var isOpen = body.style.display !== 'none';
          body.style.display = isOpen ? 'none' : 'block';
          arrow.textContent = isOpen ? '▼ Apri Giorno' : '▲ Chiudi Giorno';
        };
      })(i, bodyContainer, arrowSpan);

      dayBox.appendChild(toggleBtn);
      dayBox.appendChild(bodyContainer);
      daysBuilderContainer.appendChild(dayBox);

      addExerciseCardToBuilder(i, '', 'Petto', 3, 10, '', false);
      addExerciseCardToBuilder(i, '', 'Tricipiti', 3, 10, '', false);
    }
  }

  function addExerciseCardToBuilder(dayIndex, defaultName, defaultMuscle, defaultSets, defaultReps, defaultNotes, defaultIsSuperset) {
    var container = document.getElementById('builder_exercises_' + dayIndex);
    if (!container) return;

    var card = document.createElement('div');
    card.className = 'builder-exercise-card' + (defaultIsSuperset ? ' builder-ss-active' : '');

    var topRow = document.createElement('div');
    topRow.className = 'builder-exercise-row-top';

    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'builder-input-name';
    nameInput.setAttribute('list', 'exerciseSuggestionsGlobal');
    nameInput.placeholder = 'Nome esercizio...';
    nameInput.value = defaultName || '';
    nameInput.required = true;

    var muscleSelect = document.createElement('select');
    muscleSelect.className = 'builder-muscle-select';
    MUSCLE_GROUPS.forEach(function (mg) {
      var opt = document.createElement('option');
      opt.value = mg;
      opt.textContent = mg;
      if (defaultMuscle && defaultMuscle.toLowerCase() === mg.toLowerCase()) {
        opt.selected = true;
      }
      muscleSelect.appendChild(opt);
    });

    var setsInput = document.createElement('input');
    setsInput.type = 'number';
    setsInput.min = '1';
    setsInput.className = 'builder-input-sets';
    setsInput.placeholder = 'Serie (3)';
    setsInput.value = defaultSets !== undefined ? defaultSets : '3';
    setsInput.title = 'Numero di Serie da svolgere';
    setsInput.required = true;

    var repsInput = document.createElement('input');
    repsInput.type = 'number';
    repsInput.min = '1';
    repsInput.className = 'builder-input-reps';
    repsInput.placeholder = 'Reps (10)';
    repsInput.value = defaultReps !== undefined ? defaultReps : '10';
    repsInput.title = 'Target di Ripetizioni per serie';
    repsInput.required = true;

    var delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn-small btn-delete';
    delBtn.textContent = '✕';
    delBtn.title = 'Rimuovi esercizio';
    delBtn.onclick = function () {
      container.removeChild(card);
    };

    topRow.appendChild(nameInput);
    topRow.appendChild(muscleSelect);
    topRow.appendChild(setsInput);
    topRow.appendChild(repsInput);
    topRow.appendChild(delBtn);

    var bottomRow = document.createElement('div');
    bottomRow.className = 'builder-exercise-row-bottom';
    var notesInput = document.createElement('input');
    notesInput.type = 'text';
    notesInput.className = 'builder-input-notes';
    notesInput.placeholder = 'Note esercizio (es. Aumentare carichi, pausa 90s, recupero lento...)';
    notesInput.value = defaultNotes || '';

    // Checkbox Superserie con l'esercizio successivo (su riga autonoma sotto)
    var ssLabel = document.createElement('label');
    ssLabel.className = 'builder-ss-toggle-label';
    var ssCheckbox = document.createElement('input');
    ssCheckbox.type = 'checkbox';
    ssCheckbox.className = 'builder-input-is-superset';
    ssCheckbox.checked = Boolean(defaultIsSuperset);
    ssCheckbox.onchange = function () {
      card.classList.toggle('builder-ss-active', ssCheckbox.checked);
    };
    ssLabel.appendChild(ssCheckbox);
    ssLabel.appendChild(document.createTextNode('⚡ In Superserie con successivo'));

    bottomRow.appendChild(notesInput);
    bottomRow.appendChild(ssLabel);

    card.appendChild(topRow);
    card.appendChild(bottomRow);
    container.appendChild(card);
  }

  window.addExerciseToBuilderDay = function (dayIndex) {
    addExerciseCardToBuilder(dayIndex, '', 'Petto', 3, 10, '', false);
  };

  saveCompletePlanBtn.addEventListener('click', async function () {
    var planName = newPlanNameInput.value.trim();
    if (!planName) {
      alert('Inserisci un nome per la scheda (es. "Scheda Ipertrofia A/B/C").');
      newPlanNameInput.focus();
      return;
    }

    var startDate = newPlanStartDateInput.value || getTodayDateString();
    var numDays = parseInt(newPlanNumDaysSelect.value, 10) || 1;
    var dayLabels = ['Giorno 1', 'Giorno 2', 'Giorno 3', 'Giorno 4', 'Giorno 5', 'Giorno 6'];
    var builtDays = [];

    for (var i = 0; i < numDays; i++) {
      var container = document.getElementById('builder_exercises_' + i);
      if (!container) continue;

      var exerciseCards = container.querySelectorAll('.builder-exercise-card');
      var exercises = [];

      exerciseCards.forEach(function (card) {
        var nameInp = card.querySelector('.builder-input-name');
        var muscleSel = card.querySelector('.builder-muscle-select');
        var setsInp = card.querySelector('.builder-input-sets');
        var repsInp = card.querySelector('.builder-input-reps');
        var notesInp = card.querySelector('.builder-input-notes');
        var ssCheck = card.querySelector('.builder-input-is-superset');

        var exName = nameInp ? nameInp.value.trim() : '';
        var muscle = muscleSel ? muscleSel.value : 'Petto';
        var prescribedSets = setsInp ? (parseInt(setsInp.value, 10) || 3) : 3;
        var prescribedReps = repsInp ? (parseInt(repsInp.value, 10) || 10) : 10;
        var notes = notesInp ? notesInp.value.trim() : '';
        var isSuperset = ssCheck ? Boolean(ssCheck.checked) : false;

        if (exName) {
          exercises.push({
            name: exName,
            muscle: muscle,
            prescribedSets: prescribedSets,
            prescribedReps: prescribedReps,
            notes: notes,
            isSuperset: isSuperset
          });
          db.addExercise({ name: exName, muscle: muscle, equipment: '' });
        }
      });

      if (exercises.length === 0) {
        alert('Attenzione: aggiungi almeno un esercizio a ' + dayLabels[i] + '!');
        return;
      }

      builtDays.push({
        id: 'day_' + (i + 1),
        name: dayLabels[i],
        exercises: exercises
      });
    }

    var newPlanData = {
      name: planName,
      startDate: startDate,
      days: builtDays
    };

    if (isEditingActivePlan && activePlan && activePlan.id) {
      // Modifica della scheda attiva esistente (senza archiviarla doppiamente)
      newPlanData.id = activePlan.id;
      newPlanData.env = currentEnv;
      await db.setActivePlan(currentEnv, newPlanData);

      // Sincronizza i gruppi muscolari negli esercizi e nei log storici
      for (var b = 0; b < builtDays.length; b++) {
        var dayExs = builtDays[b].exercises || [];
        for (var eIdx = 0; eIdx < dayExs.length; eIdx++) {
          await db.updateExerciseMuscleEverywhere(dayExs[eIdx].name, dayExs[eIdx].muscle);
        }
      }
      alert('✅ Modifiche alla scheda "' + planName + '" salvate con successo!\nTutti i gruppi muscolari e lo storico sedute sono stati aggiornati.');
    } else {
      // Nuova scheda: archivia la precedente e attiva la nuova
      await db.saveNewPlan(currentEnv, newPlanData);
      alert('✅ Nuova scheda "' + planName + '" salvata e attivata con successo per ' +
        (currentEnv === 'gym' ? 'Palestra' : 'Casa') + ' con data di validità ' + startDate + '!\nLa scheda precedente è stata archiviata.');
    }

    isEditingActivePlan = false;
    if (cancelEditPlanBtn) cancelEditPlanBtn.style.display = 'none';
    if (saveCompletePlanBtn) saveCompletePlanBtn.textContent = '💾 Salva Scheda';

    await updateGlobalExerciseSuggestions();
    await loadActivePlan();
    await renderRecentSessions();

    newPlanNameInput.value = '';
    toggleNewPlanAccordion(false);

    document.getElementById('todayWorkout').scrollIntoView({ behavior: 'smooth' });
  });

  // ════════════════════════════════════════════════════════════════
  // ── SEZIONE 3: ESTRAZIONE SCHEDA IN PDF DIRETTA VETTORIALE    ──
  // ════════════════════════════════════════════════════════════════

  function togglePdfAccordion(forceOpen) {
    var isHidden = pdfContent.style.display === 'none';
    var shouldOpen = forceOpen !== undefined ? forceOpen : isHidden;
    pdfContent.style.display = shouldOpen ? 'block' : 'none';
    pdfAccordionArrow.textContent = shouldOpen ? '▲ Chiudi Opzioni' : '▼ Apri Opzioni';
  }

  togglePdfAccordionBtn.addEventListener('click', function () {
    togglePdfAccordion();
  });

  openPdfExportModalBtn.addEventListener('click', function () {
    togglePdfAccordion(true);
    pdfTargetEnvSelect.value = currentEnv;
    pdfTargetDateInput.value = getTodayDateString();
    document.getElementById('pdfExportSection').scrollIntoView({ behavior: 'smooth' });
  });

  // Generazione del PDF VETTORIALE DIRETTA tramite jsPDF + AutoTable (impossibile avere fogli bianchi)
  generatePdfBtn.addEventListener('click', async function () {
    var targetDate = pdfTargetDateInput.value;
    var targetEnv = pdfTargetEnvSelect.value;

    if (!targetDate) {
      alert('Seleziona una data di riferimento per la scheda da esportare.');
      pdfTargetDateInput.focus();
      return;
    }

    pdfStatusMsg.textContent = 'Ricerca scheda per la data ' + targetDate + ' in corso...';

    try {
      var result = await db.getPlanByDate(targetEnv, targetDate);

      if (!result || !result.plan || !result.plan.days || result.plan.days.length === 0) {
        pdfStatusMsg.textContent = '❌ Nessuna scheda trovata valida alla data ' + targetDate + ' per ' + (targetEnv === 'gym' ? 'Palestra' : 'Casa') + '.';
        alert('Nessuna scheda trovata per la data inserita (' + targetDate + ').');
        return;
      }

      var plan = result.plan;
      var envLabel = targetEnv === 'gym' ? 'Palestra' : 'Casa';
      pdfStatusMsg.textContent = 'Generazione documento PDF in corso per: ' + plan.name + '...';

      // Accesso a jsPDF UMD
      var jsPDFClass = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : window.jsPDF;
      if (!jsPDFClass) {
        throw new Error('Libreria jsPDF non disponibile.');
      }

      var doc = new jsPDFClass({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      var pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      var margin = 14;

      // ── INTESTAZIONE DOCUMENTO MODERNA ED ELEGANTE ──
      // Banner superiore scuro ardesia
      doc.setFillColor(24, 32, 28);
      doc.rect(margin, 10, pageWidth - (margin * 2), 26, 'F');

      // Barra decorativa accento smeraldo
      doc.setFillColor(0, 230, 118);
      doc.rect(margin, 10, 4, 26, 'F');

      // Titolo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('SCHEDA DI ALLENAMENTO', margin + 8, 20);

      // Sottotitolo / Nome Scheda
      doc.setFontSize(12);
      doc.setTextColor(0, 230, 118);
      doc.text(plan.name, margin + 8, 28);

      // Metadati a destra
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(200, 200, 200);
      var metaX = pageWidth - margin - 4;
      doc.text('Ambiente: ' + envLabel.toUpperCase(), metaX, 18, { align: 'right' });
      doc.text('Data: ' + targetDate, metaX, 23, { align: 'right' });
      var periodText = 'Periodo: ' + (plan.startDate || '-') + (plan.endDate ? (' al ' + plan.endDate) : ' (In corso)');
      doc.text(periodText, metaX, 28, { align: 'right' });

      var currentY = 44;

      // ── TABELLE PER CIASCUN GIORNO DELLA SCHEDA ──
      plan.days.forEach(function (day, dIdx) {
        var dayTitle = (day.name || ('Giorno ' + (dIdx + 1))).toUpperCase();

        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }

        // Header Giorno con stile pulito
        doc.setFillColor(33, 43, 38);
        doc.roundedRect(margin, currentY - 4, pageWidth - (margin * 2), 8, 2, 2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(0, 230, 118);
        doc.text('▶  ' + dayTitle, margin + 4, currentY + 1.5);

        currentY += 8;

        // Dati tabella con indicazione chiara delle superserie
        var tableRows = (day.exercises || []).map(function (ex, eIdx, arr) {
          var isPrevSs = (eIdx > 0 && arr[eIdx - 1].isSuperset);
          var exNameFormatted = ex.name || '';
          if (ex.isSuperset) {
            exNameFormatted = '⚡ [SS-1] ' + exNameFormatted;
          } else if (isPrevSs) {
            exNameFormatted = '↳ [SS-2] ' + exNameFormatted;
          }

          var notesFormatted = ex.notes || '';
          if (ex.isSuperset) {
            notesFormatted = (notesFormatted ? (notesFormatted + ' • ') : '') + 'In superserie col successivo (senza recupero)';
          }

          var setsRepsText = (ex.prescribedSets ? (ex.prescribedSets + ' × ') : '') + (ex.prescribedReps || '-');

          return [
            String(eIdx + 1),
            exNameFormatted,
            (ex.muscle || '-').toUpperCase(),
            setsRepsText,
            notesFormatted,
            '[   .   ] kg'
          ];
        });

        if (tableRows.length === 0) {
          tableRows = [['-', 'Nessun esercizio impostato', '-', '-', '-', '-']];
        }

        doc.autoTable({
          startY: currentY,
          head: [['#', 'Esercizio', 'Distretto', 'Serie × Reps', 'Istruzioni & Note', 'Carico Effettivo']],
          body: tableRows,
          theme: 'striped',
          margin: { left: margin, right: margin },
          headStyles: {
            fillColor: [24, 30, 27],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 3
          },
          bodyStyles: {
            textColor: [35, 35, 35],
            fontSize: 8.5,
            cellPadding: 3.5
          },
          columnStyles: {
            0: { cellWidth: 8, halign: 'center' },
            1: { cellWidth: 52, fontStyle: 'bold' },
            2: { cellWidth: 28 },
            3: { cellWidth: 24, fontStyle: 'bold', textColor: [20, 120, 60] },
            4: { cellWidth: 'auto', fontStyle: 'italic', textColor: [80, 80, 80] },
            5: { cellWidth: 26, halign: 'center', fontStyle: 'bold', textColor: [100, 100, 100] }
          },
          alternateRowStyles: {
            fillColor: [246, 248, 246]
          },
          didDrawPage: function (data) {
            // Footer moderno in fondo ad ogni pagina
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(140, 140, 140);
            var pageNum = doc.internal.getNumberOfPages();
            doc.text('Allenatore Personale PWA • Scheda del ' + targetDate + ' • Pagina ' + pageNum, margin, doc.internal.pageSize.getHeight() - 8);
          }
        });

        // Aggiorna Y per la tabella successiva
        currentY = doc.lastAutoTable.finalY + 12;
      });

      var filename = 'Scheda_' + envLabel + '_' + targetDate + '.pdf';
      doc.save(filename);

      pdfStatusMsg.textContent = '✅ PDF generato e scaricato con successo: ' + filename;
    } catch (err) {
      console.error('PDF generation error:', err);
      pdfStatusMsg.textContent = '❌ Errore durante la generazione del PDF: ' + err.message;
      alert('Errore generazione PDF: ' + err.message);
    }
  });

  // ════════════════════════════════════════════════════════════════
  // ── SEZIONE 4: GESTIONE ATTIVITÀ EXTRA                       ──
  // ════════════════════════════════════════════════════════════════

  async function updateSportSuggestions() {
    try {
      var library = await db.getSportTypesLibrary();
      var activities = await db.getExtraActivities();
      activities.forEach(function (act) {
        if (act.sport && !library.some(function (s) { return s.toLowerCase() === act.sport.toLowerCase(); })) {
          library.push(act.sport);
        }
      });
      library.sort();

      sportSuggestions.innerHTML = '';
      library.forEach(function (sportName) {
        var opt = document.createElement('option');
        opt.value = sportName;
        sportSuggestions.appendChild(opt);
      });
    } catch (err) {
      console.error('updateSportSuggestions error:', err);
    }
  }

  function toggleExtraAccordion(forceOpen) {
    var isHidden = extraContainer.style.display === 'none';
    var shouldOpen = forceOpen !== undefined ? forceOpen : isHidden;
    extraContainer.style.display = shouldOpen ? 'block' : 'none';
    extraArrow.textContent = shouldOpen ? '▲ Nascondi' : '▼ Mostra ultimi 10';
  }

  toggleExtraBtn.addEventListener('click', function () {
    toggleExtraAccordion();
  });

  function resetExtraForm() {
    extraIdInput.value = '';
    extraForm.reset();
    extraDateInput.value = getTodayDateString();
    extraFormTitle.textContent = 'Attività Extra';
    extraSubmitBtn.textContent = 'Salva';
    extraCancelEditBtn.style.display = 'none';
  }

  extraCancelEditBtn.addEventListener('click', function () {
    resetExtraForm();
  });

  extraForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var id = extraIdInput.value;
    var activityData = {
      date: extraDateInput.value,
      sport: extraSportInput.value.trim(),
      duration: Number(extraDurationInput.value),
      rpe: Number(extraRPEInput.value),
      notes: extraNotesInput.value.trim()
    };

    if (id) {
      await db.updateExtraActivity(id, activityData);
      alert('Attività extra aggiornata con successo!');
    } else {
      await db.addExtraActivity(activityData);
      alert('Attività extra salvata!');
    }

    resetExtraForm();
    await updateSportSuggestions();
    await renderExtraActivities();
    await updateRecentBadge();
  });

  window.editExtraActivity = async function (id) {
    var activities = await db.getExtraActivities();
    var item = activities.find(function (a) { return a.id === id; });
    if (!item) return;

    extraIdInput.value = item.id;
    extraDateInput.value = item.date || '';
    extraSportInput.value = item.sport || '';
    extraDurationInput.value = item.duration || '';
    extraRPEInput.value = item.rpe || '';
    extraNotesInput.value = item.notes || '';

    extraFormTitle.textContent = 'Modifica Attività Extra';
    extraSubmitBtn.textContent = 'Aggiorna Record';
    extraCancelEditBtn.style.display = 'inline-block';

    toggleExtraAccordion(true);
    document.getElementById('extraActivity').scrollIntoView({ behavior: 'smooth' });
  };

  window.deleteExtraActivityRecord = async function (id) {
    var conf = confirm('Sei sicuro di voler eliminare questa attività extra?');
    if (conf) {
      await db.deleteExtraActivity(id);
      await renderExtraActivities();
      await updateRecentBadge();
    }
  };

  async function renderExtraActivities() {
    try {
      var extra = await db.getExtraActivities();
      extraCountBadge.textContent = extra.length;

      var recent = extra.slice(-10).reverse();
      extraListEl.innerHTML = '';

      if (recent.length === 0) {
        var emptyLi = document.createElement('li');
        emptyLi.textContent = 'Nessuna attività extra registrata finora.';
        emptyLi.style.color = '#888';
        emptyLi.style.fontSize = '0.9rem';
        extraListEl.appendChild(emptyLi);
        return;
      }

      recent.forEach(function (act) {
        var li = document.createElement('li');
        li.className = 'injury-item';
        li.style.borderLeft = '4px solid #2196f3';

        var contentDiv = document.createElement('div');
        contentDiv.style.flex = '1';

        contentDiv.innerHTML = '<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.2rem;">' +
          '<strong>' + escapeHtml(act.sport) + '</strong>' +
          '<span class="injury-status-badge" style="background:rgba(33,150,243,0.2); color:#2196f3; border:1px solid #2196f3;">' +
          escapeHtml(act.date) + '</span>' +
          '</div>' +
          '<div style="font-size:0.85rem; color:#bbb;">' +
          '⏱️ ' + act.duration + ' min | 🔥 RPE - Intensità sforzo: <strong>' + act.rpe + '/10</strong>' +
          (act.notes ? ' | <em>' + escapeHtml(act.notes) + '</em>' : '') +
          '</div>';

        var btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.gap = '0.3rem';

        var editBtn = document.createElement('button');
        editBtn.className = 'btn-small btn-edit';
        editBtn.textContent = '✏️ Modifica';
        editBtn.onclick = function () { window.editExtraActivity(act.id); };
        btnGroup.appendChild(editBtn);

        var delBtn = document.createElement('button');
        delBtn.className = 'btn-small btn-delete';
        delBtn.textContent = '🗑️';
        delBtn.title = 'Elimina';
        delBtn.onclick = function () { window.deleteExtraActivityRecord(act.id); };
        btnGroup.appendChild(delBtn);

        li.appendChild(contentDiv);
        li.appendChild(btnGroup);
        extraListEl.appendChild(li);
      });

    } catch (err) {
      console.error('renderExtraActivities error:', err);
    }
  }

  // ════════════════════════════════════════════════════════════════
  // ── SEZIONE 5: GESTIONE INFORTUNI / DOLORI                   ──
  // ════════════════════════════════════════════════════════════════

  async function updateInjurySuggestions() {
    try {
      var library = await db.getInjuryTypesLibrary();
      var list = await db.getInjuries();
      list.forEach(function (item) {
        if (item.type && !library.some(function (t) { return t.toLowerCase() === item.type.toLowerCase(); })) {
          library.push(item.type);
        }
      });
      library.sort();

      injurySuggestions.innerHTML = '';
      library.forEach(function (typeName) {
        var opt = document.createElement('option');
        opt.value = typeName;
        injurySuggestions.appendChild(opt);
      });
    } catch (err) {
      console.error('updateInjurySuggestions error:', err);
    }
  }

  function toggleOngoingAccordion(forceOpen) {
    var isHidden = ongoingContainer.style.display === 'none';
    var shouldOpen = forceOpen !== undefined ? forceOpen : isHidden;
    ongoingContainer.style.display = shouldOpen ? 'block' : 'none';
    ongoingArrow.textContent = shouldOpen ? '▲ Nascondi' : '▼ Mostra';
  }

  function toggleResolvedAccordion(forceOpen) {
    var isHidden = resolvedContainer.style.display === 'none';
    var shouldOpen = forceOpen !== undefined ? forceOpen : isHidden;
    resolvedContainer.style.display = shouldOpen ? 'block' : 'none';
    resolvedArrow.textContent = shouldOpen ? '▲ Nascondi' : '▼ Mostra';
  }

  toggleOngoingBtn.addEventListener('click', function () {
    toggleOngoingAccordion();
  });

  toggleResolvedBtn.addEventListener('click', function () {
    toggleResolvedAccordion();
  });

  function resetInjuryForm() {
    injuryIdInput.value = '';
    injuryForm.reset();
    injuryStartInput.value = getTodayDateString();
    injuryFormTitle.textContent = 'Registra Infortunio / Dolore';
    injurySubmitBtn.textContent = 'Salva';
    injuryCancelEditBtn.style.display = 'none';
  }

  injuryCancelEditBtn.addEventListener('click', function () {
    resetInjuryForm();
  });

  injuryForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var id = injuryIdInput.value;
    var injuryData = {
      start: injuryStartInput.value,
      type: injuryTypeInput.value.trim(),
      end: injuryEndInput.value || null,
      notes: injuryNotesInput.value.trim()
    };

    if (id) {
      await db.updateInjury(id, injuryData);
      alert('Infortunio aggiornato con successo!');
    } else {
      await db.addInjury(injuryData);
      alert('Infortunio/dolore registrato!');
    }

    resetInjuryForm();
    await updateInjurySuggestions();
    await renderInjuries();
  });

  window.editInjury = async function (id, fromBanner) {
    var list = await db.getInjuries();
    var item = list.find(function (i) { return i.id === id; });
    if (!item) return;

    injuryIdInput.value = item.id;
    injuryStartInput.value = item.start || '';
    injuryTypeInput.value = item.type || '';
    injuryEndInput.value = item.end || '';
    injuryNotesInput.value = item.notes || '';

    injuryFormTitle.textContent = 'Modifica Infortunio / Dolore';
    injurySubmitBtn.textContent = 'Aggiorna Record';
    injuryCancelEditBtn.style.display = 'inline-block';

    if (!item.end || fromBanner) {
      toggleOngoingAccordion(true);
    } else {
      toggleResolvedAccordion(true);
    }

    document.getElementById('injuries').scrollIntoView({ behavior: 'smooth' });
  };

  window.resolveInjuryQuick = async function (id) {
    var today = getTodayDateString();
    var conf = confirm('Confermi di chiudere questo dolore impostando la data di fine a oggi (' + today + ')?');
    if (conf) {
      await db.updateInjury(id, { end: today });
      await renderInjuries();
      alert('Dolore contrassegnato come concluso in data ' + today + '!');
    }
  };

  window.deleteInjuryRecord = async function (id) {
    var conf = confirm('Sei sicuro di voler eliminare definitivamente questo record?');
    if (conf) {
      await db.deleteInjury(id);
      await renderInjuries();
    }
  };

  async function renderInjuries() {
    try {
      var list = await db.getInjuries();

      var activeList = list.filter(function (i) { return !i.end; });
      var resolvedList = list.filter(function (i) { return !!i.end; });

      ongoingCountEl.textContent = activeList.length;
      resolvedCountEl.textContent = resolvedList.length;

      if (activeList.length > 0) {
        activeInjuriesBanner.style.display = 'block';
        activeInjuriesList.innerHTML = '';

        activeList.forEach(function (inj) {
          var card = document.createElement('div');
          card.className = 'active-injury-card';

          var infoDiv = document.createElement('div');
          infoDiv.className = 'active-injury-info';
          infoDiv.innerHTML = '<div class="active-injury-title">⚡ ' + escapeHtml(inj.type) + '</div>' +
            '<div class="active-injury-meta">Iniziato il: <strong>' + escapeHtml(inj.start) + '</strong>' +
            (inj.notes ? ' | Note: ' + escapeHtml(inj.notes) : '') + '</div>';

          var actionsDiv = document.createElement('div');
          actionsDiv.style.display = 'flex';
          actionsDiv.style.gap = '0.3rem';

          var resolveBtn = document.createElement('button');
          resolveBtn.className = 'btn-small btn-resolve';
          resolveBtn.textContent = '✓ Concludi Oggi';
          resolveBtn.onclick = function () { window.resolveInjuryQuick(inj.id); };

          var editBtn = document.createElement('button');
          editBtn.className = 'btn-small btn-edit';
          editBtn.textContent = '✏️ Modifica';
          editBtn.onclick = function () { window.editInjury(inj.id, true); };

          actionsDiv.appendChild(resolveBtn);
          actionsDiv.appendChild(editBtn);

          card.appendChild(infoDiv);
          card.appendChild(actionsDiv);
          activeInjuriesList.appendChild(card);
        });
      } else {
        activeInjuriesBanner.style.display = 'none';
        activeInjuriesList.innerHTML = '';
      }

      function createInjuryListItem(inj, isOngoing) {
        var li = document.createElement('li');
        li.className = 'injury-item ' + (isOngoing ? 'ongoing' : 'resolved');

        var contentDiv = document.createElement('div');
        contentDiv.style.flex = '1';

        var badgeClass = isOngoing ? 'status-ongoing' : 'status-resolved';
        var badgeText = isOngoing ? '⚡ IN CORSO' : '✓ Concluso: ' + escapeHtml(inj.end);

        contentDiv.innerHTML = '<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.2rem;">' +
          '<strong>' + escapeHtml(inj.type) + '</strong>' +
          '<span class="injury-status-badge ' + badgeClass + '">' + badgeText + '</span>' +
          '</div>' +
          '<div style="font-size:0.85rem; color:#bbb;">' +
          'Inizio: ' + escapeHtml(inj.start) +
          (inj.notes ? ' | <em>' + escapeHtml(inj.notes) + '</em>' : '') +
          '</div>';

        var btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.gap = '0.3rem';

        if (isOngoing) {
          var quickCloseBtn = document.createElement('button');
          quickCloseBtn.className = 'btn-small btn-resolve';
          quickCloseBtn.textContent = '✓ Concludi';
          quickCloseBtn.onclick = function () { window.resolveInjuryQuick(inj.id); };
          btnGroup.appendChild(quickCloseBtn);
        }

        var editBtn = document.createElement('button');
        editBtn.className = 'btn-small btn-edit';
        editBtn.textContent = '✏️ Modifica';
        editBtn.onclick = function () { window.editInjury(inj.id, isOngoing); };
        btnGroup.appendChild(editBtn);

        var delBtn = document.createElement('button');
        delBtn.className = 'btn-small btn-delete';
        delBtn.textContent = '🗑️';
        delBtn.title = 'Elimina';
        delBtn.onclick = function () { window.deleteInjuryRecord(inj.id); };
        btnGroup.appendChild(delBtn);

        li.appendChild(contentDiv);
        li.appendChild(btnGroup);
        return li;
      }

      ongoingListEl.innerHTML = '';
      if (activeList.length === 0) {
        ongoingListEl.innerHTML = '<li style="color:#888; font-size:0.9rem;">Nessun infortunio attualmente in corso.</li>';
      } else {
        activeList.sort(function (a, b) { return (b.start || '').localeCompare(a.start || ''); });
        activeList.forEach(function (inj) {
          ongoingListEl.appendChild(createInjuryListItem(inj, true));
        });
      }

      resolvedListEl.innerHTML = '';
      if (resolvedList.length === 0) {
        resolvedListEl.innerHTML = '<li style="color:#888; font-size:0.9rem;">Nessun infortunio concluso in archivio.</li>';
      } else {
        resolvedList.sort(function (a, b) { return (b.end || b.start || '').localeCompare(a.end || a.start || ''); });
        resolvedList.forEach(function (inj) {
          resolvedListEl.appendChild(createInjuryListItem(inj, false));
        });
      }

    } catch (err) {
      console.error('renderInjuries error:', err);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ════════════════════════════════════════════════════════════════
  // ── SEZIONE 6: EXPORT EXCEL & BACKUP JSON                    ──
  // ════════════════════════════════════════════════════════════════

  exportBtn.addEventListener('click', async function () {
    try {
      if (typeof XLSX === 'undefined') {
        alert('Libreria XLSX non disponibile.');
        return;
      }
      var logs = await db.getLogs();
      var extra = await db.getExtraActivities();
      var injuries = await db.getInjuries();
      var gymArch = await db.getArchives('gym');
      var homeArch = await db.getArchives('home');
      var archives = gymArch.concat(homeArch);

      var wb = XLSX.utils.book_new();

      var logData = logs.map(function (l) {
        var setsVal = l.sets || l.prescribedSets || 1;
        var repsVal = l.reps || 0;
        var kgVal = l.kg || 0;
        var tonnellaggio = Math.round(setsVal * repsVal * kgVal);

        return {
          Data: l.date,
          Ambiente: l.env === 'home' ? 'Casa' : 'Palestra',
          Scheda: l.planName,
          Giorno: l.dayName || '',
          Esercizio: l.exercise,
          Gruppo_Muscolare: l.muscle || '',
          Serie_Svolte: setsVal,
          Ripetute_Svolte: repsVal,
          Carico_Kg: kgVal,
          Volume_Tonnellaggio_Kg: tonnellaggio,
          Target_Serie: l.prescribedSets || 3,
          Target_Reps: l.prescribedReps || 10,
          Note: l.notes || '',
          Stato: l.status
        };
      });
      if (logData.length === 0) logData = [{ Data: '', Ambiente: '', Scheda: '', Giorno: '', Esercizio: '', Gruppo_Muscolare: '', Serie_Svolte: '', Ripetute_Svolte: '', Carico_Kg: '', Volume_Tonnellaggio_Kg: '', Target_Serie: '', Target_Reps: '', Note: '', Stato: '' }];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logData), 'Registro Pesi');

      var extraData = extra.map(function (a) {
        return {
          Data: a.date,
          Sport: a.sport,
          Durata_Minuti: a.duration,
          RPE_Intensita_Sforzo: a.rpe,
          Note: a.notes || ''
        };
      });
      if (extraData.length === 0) extraData = [{ Data: '', Sport: '', Durata_Minuti: '', RPE_Intensita_Sforzo: '', Note: '' }];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(extraData), 'Attività Extra');

      var injData = injuries.map(function (i) {
        return {
          Inizio: i.start,
          Tipo: i.type,
          Fine: i.end || 'In corso',
          Stato: i.end ? 'Concluso' : 'Attivo',
          Note: i.notes || ''
        };
      });
      if (injData.length === 0) injData = [{ Inizio: '', Tipo: '', Fine: '', Stato: '', Note: '' }];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(injData), 'Infortuni');

      var archData = archives.map(function (a) {
        return {
          Nome: a.name,
          Ambiente: a.env || '',
          Inizio: a.startDate,
          Fine: a.endDate || ''
        };
      });
      if (archData.length === 0) archData = [{ Nome: '', Ambiente: '', Inizio: '', Fine: '' }];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(archData), 'Storico Schede');

      XLSX.writeFile(wb, 'allenamenti.xlsx');
    } catch (err) {
      console.error('Export error:', err);
      alert('Errore esportazione Excel: ' + err.message);
    }
  });

  backupBtn.addEventListener('click', async function () {
    try {
      var data = {
        exercises: await db.getAllExercises(),
        logs: await db.getLogs(),
        extra: await db.getExtraActivities(),
        sport_types_library: await db.getSportTypesLibrary(),
        injuries: await db.getInjuries(),
        injury_types_library: await db.getInjuryTypesLibrary(),
        gym_activePlan: await db.getActivePlan('gym'),
        home_activePlan: await db.getActivePlan('home'),
        gym_archives: await db.getArchives('gym'),
        home_archives: await db.getArchives('home'),
        ai_chat_history: await db.getAiChatHistory()
      };
      var json = JSON.stringify(data, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'backup_allenamenti.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Backup error:', err);
      alert('Errore backup: ' + err.message);
    }
  });

  // ── Ripristino Backup JSON ──
  if (restoreBtn && restoreFileInput) {
    restoreBtn.addEventListener('click', function () {
      restoreFileInput.value = ''; // Reset selezione precedente
      restoreFileInput.click();
    });

    restoreFileInput.addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = async function (evt) {
        try {
          var content = evt.target.result;
          var parsedData = JSON.parse(content);

          if (!parsedData || typeof parsedData !== 'object') {
            throw new Error('Il file selezionato non contiene un JSON valido.');
          }

          var confirmRestore = confirm(
            'Attenzione: il ripristino sovrascriverà i dati correnti con quelli contenuti nel file di backup "' +
            file.name + '".\n\nVuoi procedere?'
          );
          if (!confirmRestore) return;

          await db.restoreBackup(parsedData);
          alert('✅ Backup ripristinato con successo!\nL\'applicazione verrà ricaricata con tutti i tuoi dati.');
          location.reload();
        } catch (err) {
          console.error('Errore ripristino backup:', err);
          alert('❌ Errore durante il ripristino del backup: ' + err.message);
        }
      };
      reader.onerror = function () {
        alert('❌ Impossibile leggere il file selezionato.');
      };
      reader.readAsText(file);
    });
  }

  // ── Gestione Modal Menu Dati & Backup ──
  if (toggleDataMenuBtn && dataMenuModal) {
    toggleDataMenuBtn.addEventListener('click', function () {
      dataMenuModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeDataMenuBtn && dataMenuModal) {
    closeDataMenuBtn.addEventListener('click', function () {
      dataMenuModal.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  if (dataMenuModal) {
    dataMenuModal.addEventListener('click', function (e) {
      if (e.target === dataMenuModal) {
        dataMenuModal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }

  if (openStatsModalBtnFooter) {
    openStatsModalBtnFooter.addEventListener('click', function () {
      openStatsModal();
    });
  }

  // ════════════════════════════════════════════════════════════════
  // ── SEZIONE: INTERAGISCI CON AI (GEMINI COACH)                ──
  // ════════════════════════════════════════════════════════════════
  var aiModal = document.getElementById('aiModal');
  var closeAiModalBtn = document.getElementById('closeAiModalBtn');
  var aiApiKeySettingsBtn = document.getElementById('aiApiKeySettingsBtn');
  var aiClearChatBtn = document.getElementById('aiClearChatBtn');
  var aiKeySetupView = document.getElementById('aiKeySetupView');
  var aiChatView = document.getElementById('aiChatView');
  var aiApiKeyInput = document.getElementById('aiApiKeyInput');
  var aiModelSelect = document.getElementById('aiModelSelect');
  var saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  var cancelApiKeyBtn = document.getElementById('cancelApiKeyBtn');
  var aiMessagesContainer = document.getElementById('aiMessagesContainer');
  var aiUserInput = document.getElementById('aiUserInput');
  var aiSendMessageBtn = document.getElementById('aiSendMessageBtn');
  var aiQuickBtns = document.querySelectorAll('.ai-quick-btn');

  var currentApiKey = '';
  var isAiGenerating = false;

  async function openAiModal() {
    if (!aiModal) return;
    currentApiKey = await db.getApiKey();
    aiModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (!currentApiKey) {
      showApiKeySetup(false);
    } else {
      showChatView();
      await renderChatMessages();
    }
  }

  function closeAiModal() {
    if (!aiModal) return;
    aiModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  async function showApiKeySetup(canCancel) {
    aiKeySetupView.style.display = 'block';
    aiChatView.style.display = 'none';
    aiApiKeyInput.value = currentApiKey || '';
    if (aiModelSelect) {
      aiModelSelect.value = await db.getAiModel();
    }
    cancelApiKeyBtn.style.display = canCancel ? 'block' : 'none';
  }

  function showChatView() {
    aiKeySetupView.style.display = 'none';
    aiChatView.style.display = 'flex';
    setTimeout(function () {
      aiUserInput.focus();
    }, 100);
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', openAiModal);
  }

  if (closeAiModalBtn) {
    closeAiModalBtn.addEventListener('click', closeAiModal);
  }

  if (aiModal) {
    aiModal.addEventListener('click', function (e) {
      if (e.target === aiModal) closeAiModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && aiModal && aiModal.style.display === 'flex') {
      closeAiModal();
    }
  });

  if (aiApiKeySettingsBtn) {
    aiApiKeySettingsBtn.addEventListener('click', function () {
      showApiKeySetup(Boolean(currentApiKey));
    });
  }

  if (cancelApiKeyBtn) {
    cancelApiKeyBtn.addEventListener('click', function () {
      if (currentApiKey) showChatView();
    });
  }

  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener('click', async function () {
      var key = aiApiKeyInput.value.trim();
      var selectedModel = aiModelSelect ? aiModelSelect.value : 'gemini-2.0-flash';
      if (!key) {
        alert('Per favore, inserisci un\'API Key valida.');
        return;
      }
      await db.setApiKey(key);
      await db.setAiModel(selectedModel);
      currentApiKey = key;
      alert('✅ Impostazioni salvate con successo sul tuo dispositivo!\nModello: ' + selectedModel);
      showChatView();
      await renderChatMessages();
    });
  }

  if (aiClearChatBtn) {
    aiClearChatBtn.addEventListener('click', async function () {
      var confirmClear = confirm('Vuoi cancellare la cronologia della conversazione con l\'IA e iniziare una nuova chat?\n(I tuoi allenamenti, carichi e schede non verranno toccati).');
      if (confirmClear) {
        await db.clearAiChatHistory();
        await renderChatMessages();
      }
    });
  }

  // Quick prompt buttons
  aiQuickBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var prompt = btn.getAttribute('data-prompt');
      if (prompt && !isAiGenerating) {
        aiUserInput.value = prompt;
        sendMessageToAi();
      }
    });
  });

  // Invio con Invio (Shift+Invio per a capo)
  if (aiUserInput) {
    aiUserInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessageToAi();
      }
    });
  }

  if (aiSendMessageBtn) {
    aiSendMessageBtn.addEventListener('click', sendMessageToAi);
  }

  async function renderChatMessages() {
    if (!aiMessagesContainer) return;
    var history = await db.getAiChatHistory();
    aiMessagesContainer.innerHTML = '';

    if (history.length === 0) {
      aiMessagesContainer.innerHTML =
        '<div style="color:#888; text-align:center; font-size:0.9rem; padding:2rem 1rem;">' +
        '<div style="font-size:2rem; margin-bottom:0.5rem;">👋</div>' +
        '<strong style="color:#ddd;">Ciao! Sono il tuo Coach Virtuale.</strong><br>' +
        'Conosco tutti i tuoi allenamenti, i carichi registrati, le tue note e i tuoi infortuni.<br>' +
        'Chiedimi consigli sulla scheda di oggi, analisi sui progressi o usa i pulsanti rapidi in basso!' +
        '</div>';
      return;
    }

    history.forEach(function (msg) {
      appendMessageBubble(msg.role, msg.text, msg.time);
    });

    scrollChatToBottom();
  }

  function appendMessageBubble(role, text, time) {
    var row = document.createElement('div');
    row.className = 'ai-message-row ' + role;

    var bubble = document.createElement('div');
    bubble.className = 'ai-message-bubble';
    
    // Semplice parsing per grassetto e ritorni a capo
    var formattedText = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    bubble.innerHTML = formattedText;

    if (time) {
      var timeDiv = document.createElement('div');
      timeDiv.className = 'ai-message-time';
      timeDiv.textContent = time;
      bubble.appendChild(timeDiv);
    }

    row.appendChild(bubble);
    aiMessagesContainer.appendChild(row);
  }

  function scrollChatToBottom() {
    aiMessagesContainer.scrollTop = aiMessagesContainer.scrollHeight;
  }

  // Costruzione del contesto completo di allenamento (Prompt di Sistema)
  async function buildComprehensiveContext() {
    var todayStr = getTodayDateString();
    var currentDay = activePlan && activePlan.days ? activePlan.days.find(function (d) { return d.id === selectedDayId; }) : null;

    // 1. Allenamento di Oggi e Scheda Attiva
    var todayWorkoutContext = {
      data_odierna: todayStr,
      ambiente_attivo: currentEnv === 'gym' ? 'Palestra' : 'Casa',
      scheda_nome: activePlan ? activePlan.name : 'Nessuna scheda attiva',
      giorno_selezionato: currentDay ? currentDay.name : 'Nessun giorno',
      esercizi_in_programma: currentDay && currentDay.exercises ? currentDay.exercises.map(function (e, idx) {
        var exKey = selectedDayId + '_' + idx;
        var st = currentWorkoutState[exKey] || {};
        return {
          nome: e.name,
          gruppo: e.muscle || '',
          target_serie: e.prescribedSets || 3,
          target_ripetute: e.prescribedReps || 10,
          note_istruzioni: e.notes || '',
          gia_fatto_oggi: Boolean(st.done),
          serie_impostate_oggi: st.sets || e.prescribedSets || 3,
          reps_impostate_oggi: st.reps || e.prescribedReps || 10,
          kg_impostati_oggi: st.kg || 0
        };
      }) : []
    };

    // 2. Infortuni (Attivi e Storici)
    var allInjuries = await db.getInjuries();
    var activeInjuries = allInjuries.filter(function (i) { return !i.end; });
    var pastInjuries = allInjuries.filter(function (i) { return Boolean(i.end); });

    // 3. Attività Extra recenti
    var extra = await db.getExtraActivities();
    var recentExtra = extra.slice(0, 15);

    // 4. Storico completo dei log di allenamento (Pesi, Ripetizioni, Note per esercizio)
    var logs = await db.getLogs();
    
    // Creiamo un riassunto cronologico ordinato degli esercizi svolti
    var exerciseHistoryMap = {};
    logs.forEach(function (l) {
      if (!l.exercise || (Number(l.kg) === 0 && Number(l.reps) === 0)) return;
      if (!exerciseHistoryMap[l.exercise]) exerciseHistoryMap[l.exercise] = [];
      exerciseHistoryMap[l.exercise].push({
        data: l.date,
        ambiente: l.env,
        serie: l.sets || l.prescribedSets || 3,
        reps: l.reps,
        kg: l.kg,
        target_serie: l.prescribedSets || 3,
        target_reps: l.prescribedReps || 10,
        note: l.notes || '',
        stato: l.status
      });
    });

    var systemInstructions = 
      "Sei Antigravity Coach, un personal trainer e preparatore atletico esperto, professionale, motivante e pragmatico.\n" +
      "Hai accesso all'intero profilo e storico di allenamento reale dell'atleta che risiede nella sua app PWA.\n\n" +
      "CONTESTO E DATI REALI DELL'ATLETA:\n" +
      "- DATA DI OGGI: " + todayWorkoutContext.data_odierna + "\n" +
      "- AMBIENTE CORRENTE: " + todayWorkoutContext.ambiente_attivo + "\n" +
      "- SCHEDA IN USO: " + todayWorkoutContext.scheda_nome + " | Giorno: " + todayWorkoutContext.giorno_selezionato + "\n" +
      "- ESERCIZI IN PROGRAMMA OGGI: " + JSON.stringify(todayWorkoutContext.esercizi_in_programma) + "\n\n" +
      "- INFORTUNI / DOLORI ATTIVI IN CORSO: " + (activeInjuries.length > 0 ? JSON.stringify(activeInjuries) : "Nessuno") + "\n" +
      "- STORICO INFORTUNI RISOLTI NEL PASSATO: " + (pastInjuries.length > 0 ? JSON.stringify(pastInjuries) : "Nessuno") + "\n\n" +
      "- ATTIVITÀ EXTRA CARDIO RECENTI (Corsa, Padel, Tennis, ecc.): " + JSON.stringify(recentExtra) + "\n\n" +
      "- STORICO CARICHI, RIPETIZIONI E NOTE NEL TEMPO PER ESERCIZIO: " + JSON.stringify(exerciseHistoryMap) + "\n\n" +
      "LINEE GUIDA PER LE TUE RISPOSTE:\n" +
      "1. Fai sempre riferimento ai dati numerici reali dell'utente (cita date, kg sollevati in passato, note scritte dall'atleta).\n" +
      "2. Quando rispondi su 'Allenamento di Oggi' o consigli sui carichi, guarda esattamente gli esercizi previsti oggi e quanto ha sollevato l'ultima volta.\n" +
      "3. Se ci sono infortuni o fastidi attivi (o recenti sullo stesso distretto), dai priorità assoluta alla sicurezza dell'articolazione, suggerendo modifiche di ROM o carichi prudenti.\n" +
      "4. Sii sintetico, chiaro ed energico. Usa elenchi puntati ed evidenzia i carichi consigliati in grassetto per una lettura rapida in palestra.";

    return systemInstructions;
  }

  async function sendMessageToAi() {
    var text = aiUserInput.value.trim();
    if (!text || isAiGenerating) return;

    if (!currentApiKey) {
      showApiKeySetup(false);
      return;
    }

    var history = await db.getAiChatHistory();
    var nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Salva messaggio utente
    var userMsg = { role: 'user', text: text, time: nowTime };
    history.push(userMsg);
    await db.saveAiChatHistory(history);

    aiUserInput.value = '';
    appendMessageBubble('user', text, nowTime);
    scrollChatToBottom();

    // Mostra indicatore di digitazione
    isAiGenerating = true;
    aiSendMessageBtn.disabled = true;
    var typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message-row assistant';
    typingDiv.id = 'aiTypingIndicator';
    typingDiv.innerHTML = '<div class="ai-typing-indicator"><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div></div>';
    aiMessagesContainer.appendChild(typingDiv);
    scrollChatToBottom();

    try {
      var systemPrompt = await buildComprehensiveContext();

      // Prepara i messaggi per Gemini API (contents format)
      var contents = [];

      // Aggiungi cronologia precedente (massimo ultimi 30 scambi per sicurezza di banda)
      var recentHistory = history.slice(-30);
      recentHistory.forEach(function (m) {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.text }]
        });
      });

      var requestBody = {
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      };

      var chosenModel = await db.getAiModel();
      var endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' + chosenModel + ':generateContent?key=' + currentApiKey;

      var response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      // Se il modello scelto (es. 2.0) restituisce 404 per via dell'account, fallback trasparente su 1.5-flash
      if (!response.ok && response.status === 404 && chosenModel !== 'gemini-1.5-flash') {
        console.warn('Fallback automatico a gemini-1.5-flash...');
        endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + currentApiKey;
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
      }

      if (!response.ok) {
        var errBody = await response.json().catch(function () { return {}; });
        var msg = (errBody.error && errBody.error.message) ? errBody.error.message : ('Errore HTTP ' + response.status);
        throw new Error(msg);
      }

      var resData = await response.json();
      var aiReply = 'Nessuna risposta generata.';
      if (resData.candidates && resData.candidates[0] && resData.candidates[0].content && resData.candidates[0].content.parts) {
        aiReply = resData.candidates[0].content.parts.map(function (p) { return p.text; }).join('\n');
      }

      // Rimuovi typing indicator
      var typingEl = document.getElementById('aiTypingIndicator');
      if (typingEl) typingEl.remove();

      var aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      var assistantMsg = { role: 'assistant', text: aiReply, time: aiTime };
      history.push(assistantMsg);
      await db.saveAiChatHistory(history);

      appendMessageBubble('assistant', aiReply, aiTime);
      scrollChatToBottom();

    } catch (err) {
      console.error('Gemini API Error:', err);
      var typingElErr = document.getElementById('aiTypingIndicator');
      if (typingElErr) typingElErr.remove();

      var errMsg = '⚠️ Errore di connessione a Gemini: ' + err.message +
        '\n\nVerifica che la tua API Key sia corretta cliccando su ⚙️ in alto a destra.';
      appendMessageBubble('assistant', errMsg, '');
      scrollChatToBottom();
    } finally {
      isAiGenerating = false;
      aiSendMessageBtn.disabled = false;
    }
  }

  // ════════════════════════════════════════════════════════════════
  // ── MODALE STATISTICHE & GRAFICI (SOLUZIONE IBRIDA)            ──
  // ════════════════════════════════════════════════════════════════
  var statsModal = document.getElementById('statsModal');
  var closeStatsModalBtn = document.getElementById('closeStatsModalBtn');
  var modalTabBtns = document.querySelectorAll('.modal-tab-btn');
  var modalTabPanels = document.querySelectorAll('.modal-tab-panel');

  var chartExerciseSelect = document.getElementById('chartExerciseSelect');
  var chartEnvFilter = document.getElementById('chartEnvFilter');
  var chartTimeRange = document.getElementById('chartTimeRange');
  var progressionStatsSummary = document.getElementById('progressionStatsSummary');

  var freqViewMode = document.getElementById('freqViewMode');
  var freqActivityFilter = document.getElementById('freqActivityFilter');
  var frequencyStatsSummary = document.getElementById('frequencyStatsSummary');

  var musclesTimeRange = document.getElementById('musclesTimeRange');
  var musclesStatsSummary = document.getElementById('musclesStatsSummary');

  var progressionChartInstance = null;
  var frequencyChartInstance = null;
  var musclesChartInstance = null;

  function openStatsModal(targetExercise) {
    if (!statsModal) return;
    statsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Se fornito un esercizio specifico, seleziona la scheda progressione e impostalo
    if (targetExercise) {
      switchStatsTab('tabProgression');
      populateExerciseSelect(targetExercise);
    } else {
      populateExerciseSelect();
      var activeTab = document.querySelector('.modal-tab-btn.active');
      var tabId = activeTab ? activeTab.getAttribute('data-tab') : 'tabProgression';
      loadCurrentTabChart(tabId);
    }
  }

  function closeStatsModal() {
    if (!statsModal) return;
    statsModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  window.openExerciseChart = function (exerciseName) {
    openStatsModal(exerciseName);
  };

  if (openStatsModalBtn) {
    openStatsModalBtn.addEventListener('click', function () {
      openStatsModal();
    });
  }

  if (closeStatsModalBtn) {
    closeStatsModalBtn.addEventListener('click', closeStatsModal);
  }

  if (statsModal) {
    statsModal.addEventListener('click', function (e) {
      if (e.target === statsModal) {
        closeStatsModal();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && statsModal && statsModal.style.display === 'flex') {
      closeStatsModal();
    }
  });

  // Switch tabs
  modalTabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tabId = btn.getAttribute('data-tab');
      switchStatsTab(tabId);
    });
  });

  function switchStatsTab(tabId) {
    modalTabBtns.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    modalTabPanels.forEach(function (p) {
      p.classList.toggle('active', p.id === tabId);
    });
    loadCurrentTabChart(tabId);
  }

  function loadCurrentTabChart(tabId) {
    setTimeout(function () {
      if (tabId === 'tabProgression') {
        renderProgressionChart();
      } else if (tabId === 'tabFrequency') {
        renderFrequencyChart();
      } else if (tabId === 'tabMuscles') {
        renderMusclesChart();
      }
    }, 50);
  }

  // Popola la select degli esercizi prendendoli da tutti i log ed esercizi registrati
  async function populateExerciseSelect(preselectExercise) {
    try {
      var logs = await db.getLogs();
      var exercises = await db.getAllExercises();
      var exSet = new Set();

      exercises.forEach(function (e) { if (e.name) exSet.add(e.name); });
      logs.forEach(function (l) { if (l.exercise) exSet.add(l.exercise); });

      var list = Array.from(exSet).sort();
      chartExerciseSelect.innerHTML = '';

      if (list.length === 0) {
        chartExerciseSelect.innerHTML = '<option value="">Nessun esercizio disponibile</option>';
        return;
      }

      list.forEach(function (ex) {
        var opt = document.createElement('option');
        opt.value = ex;
        opt.textContent = ex;
        chartExerciseSelect.appendChild(opt);
      });

      if (preselectExercise && list.includes(preselectExercise)) {
        chartExerciseSelect.value = preselectExercise;
      } else if (list.length > 0) {
        chartExerciseSelect.value = list[0];
      }

      renderProgressionChart();
    } catch (err) {
      console.error('populateExerciseSelect error:', err);
    }
  }

  // Event listeners controlli grafici
  if (chartExerciseSelect) chartExerciseSelect.addEventListener('change', renderProgressionChart);
  if (chartEnvFilter) chartEnvFilter.addEventListener('change', renderProgressionChart);
  if (chartTimeRange) chartTimeRange.addEventListener('change', renderProgressionChart);

  if (freqViewMode) freqViewMode.addEventListener('change', renderFrequencyChart);
  if (freqActivityFilter) freqActivityFilter.addEventListener('change', renderFrequencyChart);

  if (musclesTimeRange) musclesTimeRange.addEventListener('change', renderMusclesChart);

  // ── 1. GRAFICO PROGRESSIONE CARICHI (LINE CHART) ──
  async function renderProgressionChart() {
    var canvas = document.getElementById('progressionChartCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var targetEx = chartExerciseSelect.value;
    var envFilter = chartEnvFilter.value;
    var range = chartTimeRange.value;

    if (!targetEx) {
      if (progressionChartInstance) progressionChartInstance.destroy();
      progressionStatsSummary.innerHTML = '<div style="color:#888; text-align:center; grid-column:1/-1;">Seleziona un esercizio per visualizzare la progressione.</div>';
      return;
    }

    var logs = await db.getLogs();
    var now = new Date();
    var minDate = null;
    if (range === '3m') minDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    else if (range === '6m') minDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    else if (range === '1y') minDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    var filtered = logs.filter(function (l) {
      if (!l.exercise || l.exercise.toLowerCase() !== targetEx.toLowerCase()) return false;
      if (envFilter !== 'all' && l.env !== envFilter) return false;
      if (minDate && new Date(l.date) < minDate) return false;
      return Number(l.kg) > 0 || Number(l.reps) > 0;
    });

    filtered.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });

    if (filtered.length === 0) {
      if (progressionChartInstance) progressionChartInstance.destroy();
      progressionStatsSummary.innerHTML = '<div style="color:#888; text-align:center; grid-column:1/-1; padding:1rem;">Nessun dato registrato per ' + escapeHtml(targetEx) + ' con i filtri selezionati.</div>';
      return;
    }

    var labels = [];
    var dataKg = [];
    var tooltipsData = [];
    var maxKg = 0;
    var minKg = Infinity;
    var firstKg = null;
    var lastKg = 0;

    filtered.forEach(function (entry) {
      labels.push(entry.date);
      var kgVal = Number(entry.kg) || 0;
      dataKg.push(kgVal);
      tooltipsData.push({
        sets: entry.sets || entry.prescribedSets || 3,
        reps: entry.reps || 0,
        notes: entry.notes || '',
        env: entry.env === 'gym' ? 'Palestra' : 'Casa'
      });

      if (kgVal > maxKg) maxKg = kgVal;
      if (kgVal > 0 && kgVal < minKg) minKg = kgVal;
      if (firstKg === null && kgVal > 0) firstKg = kgVal;
      if (kgVal > 0) lastKg = kgVal;
    });

    if (minKg === Infinity) minKg = 0;
    if (firstKg === null) firstKg = 0;

    var diffKg = lastKg - firstKg;
    var diffPercent = firstKg > 0 ? Math.round((diffKg / firstKg) * 100) : 0;
    var diffSign = diffKg >= 0 ? '+' : '';

    progressionStatsSummary.innerHTML =
      '<div class="stat-metric-card">' +
      '<div class="stat-metric-label">🏆 Carico Record (Max)</div>' +
      '<div class="stat-metric-value">' + maxKg + ' kg</div>' +
      '<div class="stat-metric-sub">Miglior carico storico</div>' +
      '</div>' +
      '<div class="stat-metric-card">' +
      '<div class="stat-metric-label">📈 Ultimo Carico</div>' +
      '<div class="stat-metric-value">' + lastKg + ' kg</div>' +
      '<div class="stat-metric-sub">Sessione più recente</div>' +
      '</div>' +
      '<div class="stat-metric-card">' +
      '<div class="stat-metric-label">⚡ Progressione</div>' +
      '<div class="stat-metric-value" style="color:' + (diffKg >= 0 ? '#00e676' : '#e53935') + '">' + diffSign + diffKg + ' kg (' + diffSign + diffPercent + '%)</div>' +
      '<div class="stat-metric-sub">Dall\'inizio del periodo</div>' +
      '</div>' +
      '<div class="stat-metric-card">' +
      '<div class="stat-metric-label">🔢 Sessioni Totali</div>' +
      '<div class="stat-metric-value">' + filtered.length + '</div>' +
      '<div class="stat-metric-sub">Volte svolto</div>' +
      '</div>';

    if (progressionChartInstance) progressionChartInstance.destroy();

    progressionChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Carico (Kg)',
          data: dataKg,
          borderColor: '#00e676',
          backgroundColor: 'rgba(0, 230, 118, 0.12)',
          fill: true,
          tension: 0.25,
          borderWidth: 3,
          pointBackgroundColor: '#00e676',
          pointBorderColor: '#fff',
          pointHoverRadius: 7,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(20,20,20,0.95)',
            titleColor: '#00e676',
            bodyColor: '#fff',
            borderColor: '#333',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              afterLabel: function (context) {
                var extraInfo = tooltipsData[context.dataIndex];
                var lines = [];
                if (extraInfo.sets && extraInfo.reps) {
                  lines.push('Serie × Reps: ' + extraInfo.sets + ' × ' + extraInfo.reps);
                } else if (extraInfo.reps) {
                  lines.push('Ripetizioni: ' + extraInfo.reps);
                }
                if (extraInfo.env) lines.push('Ambiente: ' + extraInfo.env);
                if (extraInfo.notes) lines.push('Note: "' + extraInfo.notes + '"');
                return lines;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#2a2a2a' },
            ticks: { color: '#888', font: { size: 11 } }
          },
          y: {
            grid: { color: '#2a2a2a' },
            ticks: { color: '#888', font: { size: 11 } },
            suggestedMin: Math.max(0, minKg - 5),
            suggestedMax: maxKg + 5
          }
        }
      }
    });
  }

  // ── 2. GRAFICO FREQUENZA E CONSISTENZA (BAR CHART) ──
  async function renderFrequencyChart() {
    var canvas = document.getElementById('frequencyChartCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var viewMode = freqViewMode.value;
    var filterAct = freqActivityFilter.value;

    var logs = await db.getLogs();
    var extra = await db.getExtraActivities();

    var weightSessions = new Set();
    logs.forEach(function (l) {
      if (l.date && (Number(l.kg) > 0 || Number(l.reps) > 0)) {
        weightSessions.add(l.date + '_' + (l.env || 'gym'));
      }
    });

    var countsMap = {}; // key -> { weights: 0, extra: 0 }

    if (viewMode === 'monthly') {
      // Raggruppa per mese (ultimi 12 mesi)
      var now = new Date();
      for (var m = 11; m >= 0; m--) {
        var d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        countsMap[key] = { weights: 0, extra: 0 };
      }

      weightSessions.forEach(function (item) {
        var dateStr = item.split('_')[0];
        var ym = dateStr.substr(0, 7);
        if (countsMap[ym]) countsMap[ym].weights++;
      });

      extra.forEach(function (ex) {
        if (!ex.date) return;
        var ym = ex.date.substr(0, 7);
        if (countsMap[ym]) countsMap[ym].extra++;
      });
    } else {
      // Raggruppa per settimane (ultime 12 settimane)
      var now = new Date();
      var oneDay = 24 * 60 * 60 * 1000;
      for (var w = 11; w >= 0; w--) {
        var startWeek = new Date(now.getTime() - (w * 7 * oneDay));
        var label = 'Sett. -' + w;
        countsMap[label] = { weights: 0, extra: 0, start: startWeek.getTime() - (3.5 * oneDay), end: startWeek.getTime() + (3.5 * oneDay) };
      }

      weightSessions.forEach(function (item) {
        var dateStr = item.split('_')[0];
        var t = new Date(dateStr).getTime();
        Object.keys(countsMap).forEach(function (k) {
          if (t >= countsMap[k].start && t < countsMap[k].end) {
            countsMap[k].weights++;
          }
        });
      });

      extra.forEach(function (ex) {
        if (!ex.date) return;
        var t = new Date(ex.date).getTime();
        Object.keys(countsMap).forEach(function (k) {
          if (t >= countsMap[k].start && t < countsMap[k].end) {
            countsMap[k].extra++;
          }
        });
      });
    }

    var labels = Object.keys(countsMap);
    var datasets = [];

    var totalWeights = 0;
    var totalExtra = 0;

    labels.forEach(function (k) {
      totalWeights += countsMap[k].weights;
      totalExtra += countsMap[k].extra;
    });

    if (filterAct === 'all' || filterAct === 'weights') {
      datasets.push({
        label: 'Schede Pesi (Palestra/Casa)',
        data: labels.map(function (k) { return countsMap[k].weights; }),
        backgroundColor: '#2196f3',
        borderRadius: 4
      });
    }

    if (filterAct === 'all' || filterAct === 'extra') {
      datasets.push({
        label: 'Attività Extra (Cardio/Sport)',
        data: labels.map(function (k) { return countsMap[k].extra; }),
        backgroundColor: '#ff9800',
        borderRadius: 4
      });
    }

    frequencyStatsSummary.innerHTML =
      '<div class="stat-metric-card">' +
      '<div class="stat-metric-label">🏋️ Sedute Pesi Totali</div>' +
      '<div class="stat-metric-value">' + totalWeights + '</div>' +
      '<div class="stat-metric-sub">Sessioni completate</div>' +
      '</div>' +
      '<div class="stat-metric-card">' +
      '<div class="stat-metric-label">🏃 Attività Extra Totali</div>' +
      '<div class="stat-metric-value" style="color:#ff9800;">' + totalExtra + '</div>' +
      '<div class="stat-metric-sub">Corsa, padel, ecc.</div>' +
      '</div>' +
      '<div class="stat-metric-card">' +
      '<div class="stat-metric-label">🔥 Volume Combinato</div>' +
      '<div class="stat-metric-value" style="color:#00e676;">' + (totalWeights + totalExtra) + '</div>' +
      '<div class="stat-metric-sub">Totale allenamenti</div>' +
      '</div>';

    if (frequencyChartInstance) frequencyChartInstance.destroy();

    frequencyChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#ccc', boxWidth: 12 }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { color: '#2a2a2a' },
            ticks: { color: '#888', font: { size: 10 } }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: '#2a2a2a' },
            ticks: { color: '#888', stepSize: 1 }
          }
        }
      }
    });
  }

  // ── 3. GRAFICO GRUPPI MUSCOLARI (DOUGHNUT / PIE) ──
  async function renderMusclesChart() {
    var canvas = document.getElementById('musclesChartCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var range = musclesTimeRange.value;
    var logs = await db.getLogs();

    var now = new Date();
    var minDate = null;
    if (range === '3m') minDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    else if (range === '6m') minDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    else if (range === '1y') minDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    var muscleCounts = {};
    MUSCLE_GROUPS.forEach(function (m) { muscleCounts[m] = 0; });
    var otherCount = 0;
    var totalExercises = 0;

    logs.forEach(function (l) {
      if (minDate && new Date(l.date) < minDate) return;
      if (Number(l.reps) > 0 || Number(l.kg) > 0) {
        var m = l.muscle;
        if (m && muscleCounts[m] !== undefined) {
          muscleCounts[m]++;
          totalExercises++;
        } else if (m) {
          otherCount++;
          totalExercises++;
        }
      }
    });

    var labels = [];
    var dataVals = [];
    var palette = ['#00e676', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4', '#ffeb3b'];

    MUSCLE_GROUPS.forEach(function (m) {
      if (muscleCounts[m] > 0) {
        labels.push(m);
        dataVals.push(muscleCounts[m]);
      }
    });

    if (otherCount > 0) {
      labels.push('Altro');
      dataVals.push(otherCount);
    }

    if (totalExercises === 0) {
      if (musclesChartInstance) musclesChartInstance.destroy();
      musclesStatsSummary.innerHTML = '<div style="color:#888; text-align:center; padding:1rem;">Nessun dato registrato nel periodo selezionato. Completa degli allenamenti per visualizzare la ripartizione muscolare!</div>';
      return;
    }

    var topMuscle = '';
    var topCount = 0;
    Object.keys(muscleCounts).forEach(function (m) {
      if (muscleCounts[m] > topCount) {
        topCount = muscleCounts[m];
        topMuscle = m;
      }
    });

    musclesStatsSummary.innerHTML =
      '<div class="stat-metric-card">' +
      '<div class="stat-metric-label">🎯 Gruppo Più Allenato</div>' +
      '<div class="stat-metric-value">' + topMuscle + '</div>' +
      '<div class="stat-metric-sub">' + topCount + ' serie/esercizi svolti</div>' +
      '</div>' +
      '<div class="stat-metric-card">' +
      '<div class="stat-metric-label">📊 Serie Totali Rilevate</div>' +
      '<div class="stat-metric-value" style="color:#2196f3;">' + totalExercises + '</div>' +
      '<div class="stat-metric-sub">Distribuite sui vari gruppi</div>' +
      '</div>';

    if (musclesChartInstance) musclesChartInstance.destroy();

    musclesChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataVals,
          backgroundColor: palette.slice(0, labels.length),
          borderColor: '#181818',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#ccc', boxWidth: 12, font: { size: 11 } }
          }
        }
      }
    });
  }

  // ── INIT ──
  async function init() {
    try {
      // Pulizia definitiva di qualsiasi scheda di test creata in precedenza
      var testWipeExecuted = await localforage.getItem('manual_test_data_wipe_final_v1');
      if (!testWipeExecuted) {
        await localforage.removeItem('gym_activePlan');
        await localforage.removeItem('home_activePlan');
        await localforage.removeItem('gym_archives');
        await localforage.removeItem('home_archives');
        await localforage.removeItem('logs');
        await localforage.removeItem('exercises');
        await localforage.setItem('manual_test_data_wipe_final_v1', true);
      }

      await updateRecentBadge();
      await updateGlobalExerciseSuggestions();
      await loadActivePlan();
      await renderRecentSessions();
      renderPlanBuilder();
      await updateSportSuggestions();
      await renderExtraActivities();
      await updateInjurySuggestions();
      await renderInjuries();
    } catch (err) {
      console.error('Init error:', err);
    }
  }

  init();
})();
