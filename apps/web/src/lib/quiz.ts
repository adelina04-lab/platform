/**
 * Содержимое подбора поездки.
 *
 * Здесь только вопросы, варианты ответов и координаты точек на глобусе —
 * никаких цен. Как только появятся настоящие витрины партнёров (эпики E3–E4),
 * ответы отсюда пойдут в запрос, а карточки перестанут быть макетом.
 */

export type QuizStepId = "destination" | "travellers" | "budget" | "season" | "priority";

export interface QuizOption {
  value: string;
  label: string;
  /** Короткая подпись под вариантом — где это помогает выбрать. */
  note?: string;
}

export interface QuizStep {
  id: QuizStepId;
  question: string;
  hint: string;
  options: readonly QuizOption[];
}

/** Куда смотрит глобус. Координаты — курортная часть страны, не столица. */
export const QUIZ_PLACES: Record<string, { lon: number; lat: number; spot: string }> = {
  turciya: { lon: 30.7, lat: 36.9, spot: "Анталья" },
  egipet: { lon: 33.8, lat: 27.9, spot: "Хургада" },
  oae: { lon: 55.3, lat: 25.2, spot: "Дубай" },
  tailand: { lon: 98.3, lat: 7.9, spot: "Пхукет" },
  gruziya: { lon: 41.6, lat: 41.6, spot: "Батуми" },
  sochi: { lon: 39.7, lat: 43.6, spot: "Сочи" },
  abhaziya: { lon: 40.2, lat: 43.0, spot: "Гагра" },
  vietnam: { lon: 109.2, lat: 12.2, spot: "Нячанг" },
};

/** Сколько ориентировочно денег стоит за каждым вариантом бюджета. */
export const BUDGET_MIDPOINTS: Record<string, number> = {
  "to-100": 80_000,
  "100-200": 150_000,
  "200-400": 300_000,
  "from-400": 550_000,
};

/** Месяцы, попадающие в сезон, — по ним поворачивается кольцо. */
export const SEASON_MONTHS: Record<string, readonly number[]> = {
  winter: [12, 1, 2],
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  autumn: [9, 10, 11],
};

export const QUIZ_STEPS: readonly QuizStep[] = [
  {
    id: "destination",
    question: "Куда бы вы хотели отправиться?",
    hint: "Глобус повернётся к выбранной точке",
    options: [
      { value: "turciya", label: "Турция", note: "Анталья" },
      { value: "egipet", label: "Египет", note: "Хургада" },
      { value: "oae", label: "ОАЭ", note: "Дубай" },
      { value: "tailand", label: "Таиланд", note: "Пхукет" },
      { value: "gruziya", label: "Грузия", note: "Батуми" },
      { value: "sochi", label: "Сочи", note: "без перелёта" },
      { value: "abhaziya", label: "Абхазия", note: "Гагра" },
      { value: "vietnam", label: "Вьетнам", note: "Нячанг" },
    ],
  },
  {
    id: "travellers",
    question: "Сколько человек едет?",
    hint: "Считаем перелёт и питание на каждого, номер — на двоих",
    options: [
      { value: "1", label: "Один" },
      { value: "2", label: "Двое" },
      { value: "3", label: "Трое" },
      { value: "4", label: "Четверо" },
      { value: "5", label: "Пятеро и больше" },
    ],
  },
  {
    id: "budget",
    question: "Какой бюджет на всю поездку?",
    hint: "Вместе с перелётом, питанием, трансфером и страховкой",
    options: [
      { value: "to-100", label: "До 100 000 ₽" },
      { value: "100-200", label: "100–200 тысяч" },
      { value: "200-400", label: "200–400 тысяч" },
      { value: "from-400", label: "Больше 400 тысяч" },
    ],
  },
  {
    id: "season",
    question: "Когда планируете поехать?",
    hint: "Сдвиг на месяц часто меняет сумму сильнее, чем звёздность отеля",
    options: [
      { value: "winter", label: "Зимой", note: "декабрь — февраль" },
      { value: "spring", label: "Весной", note: "март — май" },
      { value: "summer", label: "Летом", note: "июнь — август" },
      { value: "autumn", label: "Осенью", note: "сентябрь — ноябрь" },
    ],
  },
  {
    id: "priority",
    question: "Что для вас важнее всего?",
    hint: "От этого зависит, на чём можно сэкономить, а на чём нельзя",
    options: [
      { value: "beach", label: "Пляж и ничего не делать" },
      { value: "sights", label: "Экскурсии и города" },
      { value: "food", label: "Еда и вино" },
      { value: "price", label: "Цена важнее всего" },
    ],
  },
];

export type QuizAnswers = Partial<Record<QuizStepId, string>>;

export interface Partner {
  name: string;
  kind: string;
  /** Шаг, на котором колода останавливается именно на этой витрине. */
  settlesOn: QuizStepId;
}

/**
 * Витрины, к которым ведём человека после расчёта. Пока это макет: ни одна
 * из программ ещё не подключена, поэтому в карточках нет ни цен, ни ссылок.
 */
export const PARTNERS: readonly Partner[] = [
  { name: "Яндекс Путешествия", kind: "Отели и туры", settlesOn: "destination" },
  { name: "Aviasales", kind: "Авиабилеты", settlesOn: "season" },
  { name: "Travelata", kind: "Пакетные туры", settlesOn: "budget" },
  { name: "Level.Travel", kind: "Пакетные туры", settlesOn: "travellers" },
  { name: "Островок", kind: "Отели", settlesOn: "travellers" },
  { name: "Kiwitaxi", kind: "Трансферы", settlesOn: "priority" },
  { name: "Черехапа", kind: "Страховки", settlesOn: "priority" },
];
