/**
 * ВРЕМЕННЫЙ расчёт на условных ценах — только чтобы показать интерфейс.
 *
 * Настоящий движок появится в `packages/core` (эпик E6), когда в базе будут
 * реальные цены из партнёрских API (E3–E4). До тех пор здесь живут
 * правдоподобные, но выдуманные коэффициенты, а интерфейс честно помечает
 * результат как демонстрационный.
 *
 * Типы берутся из `@platform/core`, поэтому контракт уже настоящий: когда
 * появится реальный движок, интерфейс переключится на него без переписывания.
 */

import type { ComfortTier, CostComponent, TripInput } from "@platform/core";

export interface DemoDestination {
  slug: string;
  /** Именительный падеж: «Турция». */
  name: string;
  /** Винительный падеж для фразы «Хочу в Турцию». */
  accusative: string;
  visaRequired: boolean;
  /** Перелёт туда-обратно на взрослого, в копейках. */
  flightMinor: number;
  /** Ночь в номере 4★, в копейках. */
  hotelNightMinor: number;
  /** Питание вне отеля на человека в день. */
  foodDayMinor: number;
  /** Трансфер аэропорт — отель и обратно, на группу. */
  transferMinor: number;
  /** Страховка на человека в день. */
  insuranceDayMinor: number;
  /** Экскурсии на человека за поездку. */
  excursionsMinor: number;
  /** Виза или сбор на человека. */
  visaMinor: number;
  /** Сезонные коэффициенты, январь → декабрь. */
  monthFactor: readonly number[];
}

const R = (rubles: number) => rubles * 100;

export const DEMO_DESTINATIONS: readonly DemoDestination[] = [
  {
    slug: "turciya",
    name: "Турция",
    accusative: "Турцию",
    visaRequired: false,
    flightMinor: R(42_000),
    hotelNightMinor: R(9_500),
    foodDayMinor: R(1_800),
    transferMinor: R(4_500),
    insuranceDayMinor: R(180),
    excursionsMinor: R(12_000),
    visaMinor: 0,
    monthFactor: [0.72, 0.72, 0.78, 0.88, 1.05, 1.25, 1.4, 1.38, 1.12, 0.92, 0.75, 0.85],
  },
  {
    slug: "egipet",
    name: "Египет",
    accusative: "Египет",
    visaRequired: true,
    flightMinor: R(38_000),
    hotelNightMinor: R(8_200),
    foodDayMinor: R(1_500),
    transferMinor: R(4_000),
    insuranceDayMinor: R(180),
    excursionsMinor: R(11_000),
    visaMinor: R(2_800),
    monthFactor: [1.05, 1.02, 1.0, 0.98, 0.95, 0.88, 0.85, 0.9, 1.0, 1.12, 1.18, 1.25],
  },
  {
    slug: "oae",
    name: "ОАЭ",
    accusative: "ОАЭ",
    visaRequired: false,
    flightMinor: R(46_000),
    hotelNightMinor: R(14_000),
    foodDayMinor: R(3_200),
    transferMinor: R(5_500),
    insuranceDayMinor: R(200),
    excursionsMinor: R(18_000),
    visaMinor: 0,
    monthFactor: [1.2, 1.18, 1.1, 0.98, 0.85, 0.72, 0.7, 0.72, 0.85, 1.05, 1.18, 1.3],
  },
  {
    slug: "tailand",
    name: "Таиланд",
    accusative: "Таиланд",
    visaRequired: false,
    flightMinor: R(78_000),
    hotelNightMinor: R(7_800),
    foodDayMinor: R(1_900),
    transferMinor: R(5_000),
    insuranceDayMinor: R(220),
    excursionsMinor: R(14_000),
    visaMinor: 0,
    monthFactor: [1.25, 1.2, 1.05, 0.92, 0.8, 0.75, 0.8, 0.82, 0.78, 0.95, 1.15, 1.35],
  },
  {
    slug: "gruziya",
    name: "Грузия",
    accusative: "Грузию",
    visaRequired: false,
    flightMinor: R(32_000),
    hotelNightMinor: R(6_500),
    foodDayMinor: R(1_700),
    transferMinor: R(3_500),
    insuranceDayMinor: R(180),
    excursionsMinor: R(9_000),
    visaMinor: 0,
    monthFactor: [0.85, 0.82, 0.85, 0.95, 1.1, 1.15, 1.25, 1.25, 1.15, 1.05, 0.85, 0.95],
  },
  {
    slug: "sochi",
    name: "Сочи",
    accusative: "Сочи",
    visaRequired: false,
    flightMinor: R(16_000),
    hotelNightMinor: R(6_800),
    foodDayMinor: R(2_100),
    transferMinor: R(2_500),
    insuranceDayMinor: R(120),
    excursionsMinor: R(8_000),
    visaMinor: 0,
    monthFactor: [0.75, 0.72, 0.7, 0.78, 0.95, 1.25, 1.45, 1.45, 1.1, 0.85, 0.7, 0.95],
  },
  {
    slug: "abhaziya",
    name: "Абхазия",
    accusative: "Абхазию",
    visaRequired: false,
    flightMinor: R(14_000),
    hotelNightMinor: R(4_200),
    foodDayMinor: R(1_300),
    transferMinor: R(3_000),
    insuranceDayMinor: R(120),
    excursionsMinor: R(6_000),
    visaMinor: 0,
    monthFactor: [0.6, 0.6, 0.65, 0.75, 0.95, 1.2, 1.4, 1.42, 1.1, 0.8, 0.62, 0.7],
  },
  {
    slug: "vietnam",
    name: "Вьетнам",
    accusative: "Вьетнам",
    visaRequired: false,
    flightMinor: R(74_000),
    hotelNightMinor: R(6_900),
    foodDayMinor: R(1_500),
    transferMinor: R(4_800),
    insuranceDayMinor: R(220),
    excursionsMinor: R(12_000),
    visaMinor: 0,
    monthFactor: [1.2, 1.22, 1.1, 0.95, 0.82, 0.75, 0.78, 0.8, 0.78, 0.92, 1.1, 1.3],
  },
];

export const MONTHS_PREPOSITIONAL = [
  "январе",
  "феврале",
  "марте",
  "апреле",
  "мае",
  "июне",
  "июле",
  "августе",
  "сентябре",
  "октябре",
  "ноябре",
  "декабре",
] as const;

export const COMPONENT_LABELS: Record<CostComponent, string> = {
  flight: "Перелёт",
  accommodation: "Проживание",
  packageTour: "Пакетный тур",
  transfer: "Трансфер",
  insurance: "Страховка",
  food: "Питание вне отеля",
  excursions: "Экскурсии",
  visa: "Виза и сборы",
};

export const TIER_LABELS: Record<ComfortTier, string> = {
  economy: "Эконом",
  standard: "Средний",
  comfort: "Комфорт",
};

/** Множители уровня комфорта по компонентам. */
const TIER_FACTORS: Record<ComfortTier, { flight: number; hotel: number; food: number; excursions: number }> = {
  economy: { flight: 0.85, hotel: 0.7, food: 0.65, excursions: 0.5 },
  standard: { flight: 1, hotel: 1, food: 1, excursions: 1 },
  comfort: { flight: 1.25, hotel: 1.55, food: 1.6, excursions: 1.7 },
};

const STAR_FACTOR: Record<3 | 4 | 5, number> = { 3: 0.68, 4: 1, 5: 1.85 };

export interface DemoComponentCost {
  component: CostComponent;
  amountMinor: number;
  included: boolean;
  /** Из чего сложилась сумма — показывается под строкой. */
  note: string;
}

export interface DemoTierBreakdown {
  tier: ComfortTier;
  components: DemoComponentCost[];
  totalMinor: number;
}

export interface DemoSaving {
  change: string;
  savesMinor: number;
}

export interface DemoEstimate {
  destination: DemoDestination;
  tiers: DemoTierBreakdown[];
  savings: DemoSaving[];
}

/** Упрощённый ввод из интерфейса: взрослые и дети вместо списка путешественников. */
export interface DemoInput extends Pick<TripInput, "month" | "nights" | "hotelStars" | "allInclusive"> {
  destinationSlug: string;
  adults: number;
  children: number;
}

function findDestination(slug: string): DemoDestination {
  return DEMO_DESTINATIONS.find((d) => d.slug === slug) ?? DEMO_DESTINATIONS[0]!;
}

function buildTier(dest: DemoDestination, input: DemoInput, tier: ComfortTier): DemoTierBreakdown {
  const f = TIER_FACTORS[tier];
  const season = dest.monthFactor[input.month - 1] ?? 1;
  const people = input.adults + input.children;
  const rooms = Math.max(1, Math.ceil(input.adults / 2));
  const stars = STAR_FACTOR[input.hotelStars];

  // Дети до 12 лет считаются с понижающими коэффициентами.
  const flightPax = input.adults + input.children * 0.75;
  const mealPax = input.adults + input.children * 0.6;

  const flight = dest.flightMinor * flightPax * f.flight * season;
  const accommodation =
    dest.hotelNightMinor * input.nights * rooms * stars * f.hotel * season * (input.allInclusive ? 1.35 : 1);
  const food = dest.foodDayMinor * mealPax * input.nights * f.food * (input.allInclusive ? 0.35 : 1);
  const transfer = dest.transferMinor * Math.max(1, Math.ceil(people / 4));
  const insurance = dest.insuranceDayMinor * people * (input.nights + 1);
  const excursions = dest.excursionsMinor * mealPax * f.excursions;
  const visa = dest.visaRequired ? dest.visaMinor * people : 0;

  const components: DemoComponentCost[] = [
    {
      component: "flight",
      amountMinor: flight,
      included: true,
      note: `туда-обратно, ${people} ${plural(people, "человек", "человека", "человек")}`,
    },
    {
      component: "accommodation",
      amountMinor: accommodation,
      included: true,
      note: `${input.nights} ${plural(input.nights, "ночь", "ночи", "ночей")}, ${input.hotelStars}★${
        input.allInclusive ? ", всё включено" : ""
      }`,
    },
    {
      component: "food",
      amountMinor: food,
      included: true,
      note: input.allInclusive ? "кафе вне отеля, вода, перекусы" : "завтраки, обеды и ужины вне отеля",
    },
    { component: "transfer", amountMinor: transfer, included: true, note: "аэропорт — отель и обратно" },
    {
      component: "insurance",
      amountMinor: insurance,
      included: true,
      note: `${input.nights + 1} ${plural(input.nights + 1, "день", "дня", "дней")} покрытия`,
    },
    { component: "excursions", amountMinor: excursions, included: true, note: "2–3 поездки на группу" },
    {
      component: "visa",
      amountMinor: visa,
      included: dest.visaRequired,
      note: dest.visaRequired ? "сбор по прилёте" : "не нужна",
    },
  ];

  const totalMinor = components.reduce((sum, c) => sum + (c.included ? c.amountMinor : 0), 0);

  return { tier, components, totalMinor };
}

export function estimateDemo(input: DemoInput): DemoEstimate {
  const dest = findDestination(input.destinationSlug);
  const tiers: DemoTierBreakdown[] = (["economy", "standard", "comfort"] as const).map((tier) =>
    buildTier(dest, input, tier),
  );

  const base = tiers[1]!.totalMinor;
  const savings: DemoSaving[] = [];

  // 1. Соседний месяц, в котором дешевле всего.
  let bestMonth = input.month;
  let bestTotal = base;
  for (let shift = -2; shift <= 2; shift++) {
    if (shift === 0) continue;
    const month = ((input.month - 1 + shift + 12) % 12) + 1;
    const total = buildTier(dest, { ...input, month }, "standard").totalMinor;
    if (total < bestTotal) {
      bestTotal = total;
      bestMonth = month;
    }
  }
  if (bestMonth !== input.month) {
    savings.push({
      change: `Поехать в ${MONTHS_PREPOSITIONAL[bestMonth - 1]}`,
      savesMinor: base - bestTotal,
    });
  }

  // 2. Отель на звезду ниже.
  if (input.hotelStars > 3) {
    const lower = (input.hotelStars - 1) as 3 | 4;
    const total = buildTier(dest, { ...input, hotelStars: lower }, "standard").totalMinor;
    if (total < base) {
      savings.push({ change: `Отель ${lower}★ вместо ${input.hotelStars}★`, savesMinor: base - total });
    }
  }

  // 3. Поездка на две ночи короче.
  if (input.nights > 4) {
    const total = buildTier(dest, { ...input, nights: input.nights - 2 }, "standard").totalMinor;
    if (total < base) {
      savings.push({ change: "На две ночи короче", savesMinor: base - total });
    }
  }

  savings.sort((a, b) => b.savesMinor - a.savesMinor);

  return { destination: dest, tiers, savings: savings.slice(0, 3) };
}

/** Русское склонение по числу: 1 ночь, 2 ночи, 5 ночей. */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const rubles = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

/** Копейки → «187 400 ₽». Округляем до сотен рублей: точность тут ложная. */
export function formatMoney(minor: number): string {
  return `${rubles.format(Math.round(minor / 100 / 100) * 100)} ₽`;
}

/** Копейки → «187 400» без символа валюты. */
export function formatAmount(minor: number): string {
  return rubles.format(Math.round(minor / 100 / 100) * 100);
}

/**
 * Цвета долей в полосе расходов. Взяты из шкалы Laguna: самые крупные
 * компоненты — самые светлые, мелкие получают бледные оттенки, чтобы узкая
 * полоска всё равно читалась на тёмном фоне.
 */
export const SEGMENT_COLORS: Record<CostComponent, { bg: string; fg: string }> = {
  accommodation: { bg: "#7de2df", fg: "#12414a" },
  flight: { bg: "#35acbe", fg: "#f9fafb" },
  food: { bg: "#2a8a98", fg: "#f9fafb" },
  excursions: { bg: "#1f6874", fg: "#f9fafb" },
  insurance: { bg: "#52c6cc", fg: "#12414a" },
  transfer: { bg: "#b0edeb", fg: "#12414a" },
  packageTour: { bg: "#d8f6f5", fg: "#12414a" },
  visa: { bg: "#eafbfa", fg: "#12414a" },
};
