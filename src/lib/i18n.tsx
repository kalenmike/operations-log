/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSettings, saveSettings, type Language } from "./settings";

export type { Language };

type Entry = Record<Language, string>;
type Dictionary = Record<string, Entry>;

const dict: Dictionary = {
  // App shell
  "app.loading": { en: "Opening the log...", es: "Abriendo el registro..." },
  "app.noWeek": { en: "No active week.", es: "No hay semana activa." },
  "nav.jump.past": { en: "Jump to Current Week ►", es: "Ir a la Semana Actual ►" },
  "nav.jump.future": { en: "◀ Jump to Current Week", es: "◀ Ir a la Semana Actual" },
  "nav.backToOps": { en: "Back to Operations Log", es: "Volver al Registro de Operaciones" },
  "common.weekShort": { en: "WK", es: "S" },
  "nav.jumpAria": { en: "Jump to week, month, or year", es: "Ir a semana, mes o año" },
  "tab.plan": { en: "Plan", es: "Planificar" },
  "tab.execute": { en: "Execute", es: "Ejecutar" },
  "tab.evaluate": { en: "Evaluate", es: "Evaluar" },
  "footer.localOnly": { en: "Local only · Your device · Your data", es: "Solo local · Tu dispositivo · Tus datos" },
  "footer.lastExported": { en: "Last exported:", es: "Última exportación:" },
  "footer.neverExported": { en: "Never exported", es: "Nunca exportado" },
  "footer.backupDue": { en: "Remember to back up your data.", es: "Recuerda hacer una copia de seguridad de tus datos." },

  // Menu / archive tabs
  "menu.menu": { en: "Menu", es: "Menú" },
  "menu.metrics": { en: "Metrics", es: "Métricas" },
  "menu.settings": { en: "Settings", es: "Ajustes" },
  "menu.data": { en: "Data", es: "Datos" },

  // Units
  "unit.week": { en: "week", es: "semana" },
  "unit.weeks": { en: "weeks", es: "semanas" },

  // Months (for picker) & weekdays
  "month.0": { en: "Jan", es: "Ene" },
  "month.1": { en: "Feb", es: "Feb" },
  "month.2": { en: "Mar", es: "Mar" },
  "month.3": { en: "Apr", es: "Abr" },
  "month.4": { en: "May", es: "May" },
  "month.5": { en: "Jun", es: "Jun" },
  "month.6": { en: "Jul", es: "Jul" },
  "month.7": { en: "Aug", es: "Ago" },
  "month.8": { en: "Sep", es: "Sep" },
  "month.9": { en: "Oct", es: "Oct" },
  "month.10": { en: "Nov", es: "Nov" },
  "month.11": { en: "Dec", es: "Dic" },
  "settings.day.0": { en: "Sunday", es: "Domingo" },
  "settings.day.1": { en: "Monday", es: "Lunes" },
  "settings.day.2": { en: "Tuesday", es: "Martes" },
  "settings.day.3": { en: "Wednesday", es: "Miércoles" },
  "settings.day.4": { en: "Thursday", es: "Jueves" },
  "settings.day.5": { en: "Friday", es: "Viernes" },
  "settings.day.6": { en: "Saturday", es: "Sábado" },

  // Domains
  "domain.assessment": { en: "Domain Assessment", es: "Evaluación de Dominios" },
  "domain.spiritual": { en: "Spiritual", es: "Espiritual" },
  "domain.physical": { en: "Physical", es: "Físico" },
  "domain.intellectual": { en: "Intellectual", es: "Intelectual" },
  "domain.emotional": { en: "Emotional", es: "Emocional" },
  "domain.social": { en: "Social", es: "Social" },
  "rating.aria": { en: "{label} rating {star} of 5", es: "{label}, calificación {star} de 5" },

  // Shared week labels
  "week.goal": { en: "Weekly Goal", es: "Objetivo Semanal" },
  "week.objectives": { en: "Objectives", es: "Objetivos" },
  "energy.givers": { en: "Gave Energy", es: "Di Energía" },
  "energy.drainers": { en: "Drained Energy", es: "Energía Drenada" },
  "carry.words": { en: "Words to Carry Over", es: "Palabras para Llevar" },

  // Settings panel
  "settings.preferences": { en: "Preferences", es: "Preferencias" },
  "settings.language": { en: "Language", es: "Idioma" },
  "settings.weekStartDay": { en: "Week Start Day", es: "Día de Inicio de Semana" },
  "settings.weekStartHint": {
    en: "Controls how weekly rotations are calculated. Saved to local storage.",
    es: "Controla cómo se calculan las rotaciones semanales. Guardado en el almacenamiento local.",
  },
  "settings.appUpdate": { en: "App Update", es: "Actualización de la App" },
  "settings.updateNow": { en: "Update Now", es: "Actualizar Ahora" },
  "settings.versionCurrent": { en: "Current Version", es: "Versión Actual" },
  "settings.versionAvailable": { en: "Available Version", es: "Versión Disponible" },
  "settings.update.available": {
    en: "A new version is available below. Update Now to install it.",
    es: "Hay una nueva versión disponible abajo. Pulsa Actualizar Ahora para instalarla.",
  },
  "settings.update.idle": {
    en: "Checks for and installs the latest version of this app.",
    es: "Comprueba e instala la última versión de esta aplicación.",
  },
  "settings.update.working": { en: "Checking for updates…", es: "Comprobando actualizaciones…" },
  "settings.update.updated": { en: "Updating — reloading…", es: "Actualizando — recargando…" },
  "settings.update.fresh": { en: "You're up to date.", es: "Estás al día." },
  "settings.update.none": { en: "Not available in this preview.", es: "No disponible en esta vista previa." },

  // Update notice
  "update.available": { en: "▲ Update available", es: "▲ Actualización disponible" },
  "update.availableSub": {
    en: "A new version of this log is ready to install.",
    es: "Hay una nueva versión de este registro lista para instalar.",
  },
  "update.reload": { en: "Reload & Update", es: "Recargar y Actualizar" },
  "update.later": { en: "Later", es: "Después" },
  "update.offlineReady": { en: "Ready to work offline", es: "Listo para trabajar sin conexión" },
  "update.dismiss": { en: "Dismiss", es: "Descartar" },

  // Last week recap
  "recap.title": { en: "Last Week Recap", es: "Resumen de la Semana Pasada" },
  "recap.collapse": { en: "collapse", es: "contraer" },
  "recap.expand": { en: "expand", es: "expandir" },
  "recap.noneSet": { en: "None set.", es: "Ninguno establecido." },
  "recap.carryHint": {
    en: "Carry unfinished objectives forward in the Evaluate tab.",
    es: "Lleva los objetivos sin terminar a la pestaña Evaluar.",
  },
  "recap.lowestDomain": { en: "Lowest Domain", es: "Dominio Más Bajo" },

  // Plan view
  "plan.bestWorst": { en: "Best & Worst Assessment", es: "Evaluación de Mejor y Peor" },
  "plan.best": { en: "Best Area", es: "Mejor Área" },
  "plan.worst": { en: "Worst Area", es: "Peor Área" },
  "plan.whyBest": { en: "Why Best", es: "Por qué Mejor" },
  "plan.whyWorst": { en: "Why Worst", es: "Por qué Peor" },
  "plan.rateHint": {
    en: "Rate your domains above to auto-compute.",
    es: "Califica tus dominios arriba para calcular automáticamente.",
  },
  "plan.best.single": {
    en: "Is there a specific action or habit making a difference? What action is making this domain the best?",
    es: "¿Hay una acción o hábito específico marcando la diferencia? ¿Qué acción está haciendo que este dominio sea el mejor?",
  },
  "plan.best.plural": {
    en: "Is there a specific action or habit making a difference? What action is making these domains the best?",
    es: "¿Hay una acción o hábito específico marcando la diferencia? ¿Qué acción está haciendo que estos dominios sean los mejores?",
  },
  "plan.worst.single": {
    en: "What small step can improve this domain? Can you apply insights from the best domain?",
    es: "¿Qué pequeño paso puede mejorar este dominio? ¿Puedes aplicar lo aprendido del mejor dominio?",
  },
  "plan.worst.plural": {
    en: "What small step can improve these domains? Can you apply insights from the best domains?",
    es: "¿Qué pequeño paso puede mejorar estos dominios? ¿Puedes aplicar lo aprendido de los mejores dominios?",
  },
  "plan.weeklyGoalPh": {
    en: "One clear mission objective for the week",
    es: "Un objetivo de misión claro para la semana",
  },

  // Goal manager
  "goal.overLimit": {
    en: "Over recommended limit. 3 or fewer objectives keeps focus sharp.",
    es: "Límite recomendado superado. 3 o menos objetivos mantiene el enfoque.",
  },
  "goal.noneSet": {
    en: "No objectives set. Add a few to define the week.",
    es: "No hay objetivos establecidos. Añade algunos para definir la semana.",
  },
  "goal.carriedTitle": { en: "Carried over from the previous week", es: "Trasladado de la semana anterior" },
  "goal.add": { en: "Add", es: "Añadir" },
  "goal.addPh": { en: "Add objective...", es: "Añadir objetivo..." },
  "goal.objectiveAria": { en: "Objective {n}", es: "Objetivo {n}" },
  "goal.addAria": { en: "Add new objective", es: "Añadir nuevo objetivo" },

  // Objective tracker
  "tracker.hitRate": { en: "{pct}% hit rate", es: "Precisión del {pct}%" },
  "tracker.none": { en: "No objectives set for this week.", es: "No hay objetivos establecidos para esta semana." },
  "tracker.objectiveCol": { en: "Objective", es: "Objetivo" },
  "tracker.carried": { en: "↻ carried", es: "↻ trasladado" },
  "tracker.carry": { en: "↻ carry", es: "↻ trasladar" },
  "tracker.pushedTitle": { en: "Pushed to next week", es: "Trasladado a la próxima semana" },
  "tracker.carryAria": { en: 'Carry "{text}" to next week', es: 'Trasladar "{text}" a la próxima semana' },
  "tracker.carryTitle": { en: "Carry this objective to next week", es: "Traslada este objetivo a la próxima semana" },
  "tracker.doneTitle": { en: "Completed — nothing to carry", es: "Completado — nada que trasladar" },

  // Execute / Day log
  "exec.missionBrief": { en: "Mission Brief", es: "Resumen de Misión" },
  "exec.noneThisWeek": { en: "None set for this week.", es: "Ninguno establecido para esta semana." },
  "exec.executionDays": { en: "Execution Days", es: "Días de Ejecución" },
  "daylog.day": { en: "Day {n}", es: "Día {n}" },
  "daylog.moodOnly": { en: "Mood only", es: "Solo ánimo" },
  "daylog.clear": { en: "Clear", es: "Borrar" },
  "daylog.reflections": { en: "Daily Reflections", es: "Reflexiones Diarias" },
  "daylog.reflectionsPh": { en: "Log your reflections for the day...", es: "Registra tus reflexiones del día..." },
  "checklist.todays": { en: "Today's Objectives", es: "Objetivos de Hoy" },
  "checklist.none": {
    en: "No objectives set for this week. Set them in the Plan tab.",
    es: "No hay objetivos establecidos para esta semana. Establécelos en la pestaña Planificar.",
  },

  // Mood
  "mood.dailyMood": { en: "Daily Mood", es: "Ánimo Diario" },
  "mood.1": { en: "Struggling", es: "Luchando" },
  "mood.2": { en: "Low", es: "Bajo" },
  "mood.3": { en: "Steady", es: "Estable" },
  "mood.4": { en: "Good", es: "Bien" },
  "mood.5": { en: "Strong", es: "Fuerte" },
  "mood.aria": { en: "Mood {level} of 5 — {label}", es: "Ánimo {level} de 5 — {label}" },
  "daymood.title": { en: "Daily Mood Log", es: "Registro de Ánimo Diario" },
  "daymood.noRating": { en: "No Rating", es: "Sin calificación" },
  "daymood.noNotes": { en: "No notes logged.", es: "No hay notas registradas." },

  // Week review
  "review.weekSummary": { en: "Week Summary", es: "Resumen de la Semana" },
  "review.weekSummaryPh": {
    en: "Overall summary of the week's operations...",
    es: "Resumen general de las operaciones de la semana...",
  },
  "review.wins": { en: "Wins", es: "Victorias" },
  "review.winsPh": { en: "Victories, big or small", es: "Victorias, grandes o pequeñas" },
  "review.review": { en: "Review", es: "Revisión" },
  "review.reviewPh": { en: "Honest assessment of execution", es: "Evaluación honesta de la ejecución" },
  "review.thingOne": { en: "Thing one", es: "Cosa uno" },
  "review.thingTwo": { en: "Thing two", es: "Cosa dos" },
  "review.quoteLabel": { en: "Quote / Affirmation for Next Week", es: "Cita / Afirmación para la Próxima Semana" },
  "review.quotePh": { en: "Words to carry forward...", es: "Palabras para llevar adelante..." },

  // Evaluate
  "eval.weekResults": { en: "Week Results", es: "Resultados de la Semana" },
  "eval.wrapUp": { en: "Wrap Up", es: "Cierre" },
  "eval.closeWeek": { en: "Close the Week", es: "Cerrar la Semana" },
  "eval.weekClosed": { en: "Week closed", es: "Semana cerrada" },
  "eval.closeWeekBtn": { en: "Close Week", es: "Cerrar Semana" },
  "eval.cancel": { en: "Cancel", es: "Cancelar" },
  "eval.reviewed": { en: "Reviewed {date}. Ready for next week.", es: "Revisado el {date}. Listo para la próxima semana." },
  "eval.downloadReport": { en: "Download Report", es: "Descargar Informe" },
  "eval.goNext": { en: "Go to Next Week ►", es: "Ir a la Próxima Semana ►" },
  "eval.avgMood": { en: "Avg Mood", es: "Ánimo Promedio" },
  "eval.objectiveHit": { en: "Objective Hit", es: "Objetivos Cumplidos" },
  "eval.lowestDomain": { en: "Lowest Domain", es: "Dominio Más Bajo" },
  "eval.carryForward": { en: "One thing to carry forward", es: "Una cosa para llevar adelante" },
  "eval.carryPh": { en: "Words for next week...", es: "Palabras para la próxima semana..." },
  "eval.closeNext": { en: "Close & Start Next Week ►", es: "Cerrar e Iniciar la Próxima Semana ►" },

  // Week picker
  "picker.week": { en: "Week", es: "Semana" },
  "picker.month": { en: "Month", es: "Mes" },
  "picker.year": { en: "Year", es: "Año" },
  "picker.today": { en: "Today", es: "Hoy" },
  "picker.todayLabel": { en: "today", es: "hoy" },
  "picker.jumpAria": { en: "Jump to week", es: "Ir a la semana" },
  "picker.closeAria": { en: "Close", es: "Cerrar" },

  // Year overview
  "year.annualLog": { en: "Annual Log", es: "Registro Anual" },
  "year.complete": { en: "{n} of {total} weeks complete", es: "{n} de {total} semanas completadas" },
  "year.missing": { en: "Missing", es: "Faltantes" },
  "year.incomplete": { en: "Incomplete", es: "Incompletas" },
  "year.complete2": { en: "Complete", es: "Completadas" },
  "status.missing": { en: "missing", es: "faltante" },
  "status.incomplete": { en: "incomplete", es: "incompleta" },
  "status.complete": { en: "complete", es: "completada" },

  // Performance
  "perf.title": { en: "Performance Overview", es: "Resumen de Rendimiento" },
  "perf.prevYear": { en: "Previous year", es: "Año anterior" },
  "perf.nextYear": { en: "Next year", es: "Año siguiente" },
  "perf.logCompletion": { en: "Log Completion", es: "Registro Completado" },
  "perf.weeksSub": { en: "{done}/{total} weeks", es: "{done}/{total} semanas" },
  "perf.objCompletion": { en: "Objective Completion", es: "Objetivos Completados" },
  "perf.noObjectives": { en: "No objectives", es: "Sin objetivos" },
  "perf.avgPerObjective": { en: "avg per objective", es: "promedio por objetivo" },
  "perf.streak": { en: "Week Streak", es: "Racha de Semanas" },
  "perf.avgMood": { en: "Average Mood", es: "Ánimo Promedio" },
  "perf.noCheckins": { en: "No check-ins", es: "Sin registros" },
  "perf.of5": { en: "of 5.0", es: "de 5.0" },
  "perf.moodTrend": { en: "Mood Trend", es: "Tendencia de Ánimo" },
  "perf.svgAria": { en: "Weekly average mood with trend line", es: "Ánimo promedio semanal con línea de tendencia" },
  "perf.noData": { en: "NO MOOD DATA", es: "SIN DATOS DE ÁNIMO" },
  "perf.moodLegend": { en: "Week mood", es: "Ánimo semanal" },
  "perf.trendLegend": { en: "Trend", es: "Tendencia" },
  "perf.slope": { en: "{arrow} {v}/10 wks", es: "{arrow} {v}/10 sem" },
  "perf.focusHint": { en: "Focus Hint", es: "Sugerencia de Enfoque" },
  "perf.focusBody": {
    en: "{domain} was your lowest-rated domain in {n} of the last {of} logged weeks. Consider aiming this week's goal there.",
    es: "{domain} fue tu dominio con menor calificación en {n} de las últimas {of} semanas registradas. Considera apuntar el objetivo de esta semana hacia allí.",
  },
  "perf.heatmap": { en: "Domain Heatmap", es: "Mapa de Calor de Dominios" },
  "perf.noDataCell": { en: "no data", es: "sin datos" },
  "perf.legendNone": { en: "none", es: "ninguno" },
  "perf.weeksLabel": { en: "weeks 1–{n}", es: "semanas 1–{n}" },
  "perf.themes": { en: "Repeated Energy Themes", es: "Temas de Energía Repetidos" },
  "perf.noThemes": {
    en: "No repeat themes yet. Log energy givers & drainers each week to spot patterns.",
    es: "Aún no hay temas repetidos. Registra energías que dan y drenan cada semana para detectar patrones.",
  },

  // Export / import
  "data.export": { en: "Export Backup", es: "Exportar Copia de Seguridad" },
  "data.import": { en: "Import Backup", es: "Importar Copia de Seguridad" },
  "data.nothing": { en: "Nothing to export yet.", es: "Aún no hay nada que exportar." },
  "data.exported": { en: "Backup exported.", es: "Copia de seguridad exportada." },
  "data.imported": {
    en: "Imported {n} week(s) (backup v{v}). Existing records were merged.",
    es: "Se importaron {n} semana(s) (copia v{v}). Los registros existentes se fusionaron.",
  },
  "data.importFailed": { en: "Import failed: {msg}", es: "Error al importar: {msg}" },
  "data.invalidFile": { en: "invalid file", es: "archivo inválido" },
  "data.hint": {
    en: "All data is stored locally in your browser (IndexedDB). Export regularly to keep your own backups. Nothing ever leaves this device.",
    es: "Todos los datos se almacenan localmente en tu navegador (IndexedDB). Exporta regularmente para mantener tus propias copias. Nada sale nunca de este dispositivo.",
  },

  // Print report
  "report.operationsLog": { en: "Operations Log", es: "Registro de Operaciones" },
  "report.week": { en: "Week {n}", es: "Semana {n}" },
  "report.closedOn": { en: "Closed on {date}", es: "Cerrado el {date}" },
  "report.weeklyGoal": { en: "Weekly Goal", es: "Objetivo Semanal" },
  "report.objectives": { en: "Objectives", es: "Objetivos" },
  "report.carried": { en: "[carried]", es: "[trasladado]" },
  "report.assessmentNotes": { en: "Assessment Notes", es: "Notas de Evaluación" },
  "report.best": { en: "Best: ", es: "Mejor: " },
  "report.worst": { en: "Worst: ", es: "Peor: " },
  "report.dailyCheckins": { en: "Daily Check-ins", es: "Registros Diarios" },
  "report.mood": { en: "Mood {n}/5", es: "Ánimo {n}/5" },
  "report.reflection": { en: "Reflection", es: "Reflexión" },
  "report.summary": { en: "Summary: ", es: "Resumen: " },
  "report.wins": { en: "Wins: ", es: "Victorias: " },
  "report.review": { en: "Review: ", es: "Revisión: " },
  "report.energy": { en: "Energy", es: "Energía" },
  "report.givers": { en: "Givers: ", es: "Que dan energía: " },
  "report.drainers": { en: "Drainers: ", es: "Que drenan: " },
  "report.nextWeekQuote": { en: "Next Week Quote", es: "Cita de la Próxima Semana" },
  "report.carryForward": { en: "One Thing to Carry Forward", es: "Una Cosa para Llevar Adelante" },
};

interface I18nValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => getSettings().language);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Language) => {
    saveSettings({ ...getSettings(), language: next });
    setLangState(next);
  };

  const t = useMemo(
    () =>
      (key: string, vars?: Record<string, string | number>): string => {
        const entry = dict[key];
        let str = entry ? entry[lang] : key;
        if (vars) {
          str = str.replace(/\{(\w+)\}/g, (m, name: string) => {
            const v = vars[name];
            return v === undefined ? m : String(v);
          });
        }
        return str;
      },
    [lang]
  );

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLang(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}