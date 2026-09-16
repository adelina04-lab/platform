import { z } from "zod";

/** Компоненты, из которых складывается полная стоимость поездки. */
export const COST_COMPONENTS = [
  "flight",
  "accommodation",
  "packageTour",
  "transfer",
  "insurance",
  "food",
  "excursions",
  "visa",
] as const;

export type CostComponent = (typeof COST_COMPONENTS)[number];

/** Уровень поездки. Результат всегда показывается диапазоном, а не точкой. */
export const COMFORT_TIERS = ["economy", "standard", "comfort"] as const;

export type ComfortTier = (typeof COMFORT_TIERS)[number];

/** Один путешественник: взрослый или ребёнок с возрастом на дату вылета. */
export const travellerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("adult") }),
  z.object({ kind: z.literal("child"), age: z.number().int().min(0).max(17) }),
]);

export type Traveller = z.infer<typeof travellerSchema>;

/**
 * Вход калькулятора. Эта же схема разбирает параметры из URL, поэтому
 * состояние расчёта всегда выражается ссылкой, которой можно поделиться.
 */
export const tripInputSchema = z.object({
  /** Слаг направления: `turciya`, `egipet`, `sochi`. */
  destination: z.string().min(1),
  /** Месяц поездки, 1–12. Точные даты не нужны: цены усредняются по месяцу. */
  month: z.number().int().min(1).max(12),
  /** Длительность в ночах. */
  nights: z.number().int().min(1).max(30),
  /** IATA-код города вылета: `MOW`, `LED`, `KZN`. */
  originCity: z.string().length(3).toUpperCase(),
  travellers: z.array(travellerSchema).min(1).max(8),
  hotelStars: z.union([z.literal(3), z.literal(4), z.literal(5)]),
  allInclusive: z.boolean().default(false),
});

export type TripInput = z.infer<typeof tripInputSchema>;

/** Стоимость одного компонента. Деньги — всегда в копейках, никогда во float. */
export interface ComponentCost {
  component: CostComponent;
  /** Стоимость в копейках на всю группу за всю поездку. */
  amountMinor: number;
  /** Дата, на которую собрана цена: показывается пользователю. */
  collectedAt: Date;
  /** Компонента может не быть: виза не нужна, трансфер включён в тур. */
  included: boolean;
}

/** Результат расчёта по одному уровню комфорта. */
export interface TierBreakdown {
  tier: ComfortTier;
  components: ComponentCost[];
  totalMinor: number;
}

/** Сценарий экономии: «сдвиньте вылет на 10 дней — минус 47 000» (эпик E7). */
export interface SavingScenario {
  /** Что изменить, человекочитаемо. */
  change: string;
  /** Насколько дешевле станет поездка, в копейках. */
  savesMinor: number;
  /** Изменённый вход, чтобы предложение можно было применить одним кликом. */
  input: TripInput;
}

export interface TripEstimate {
  input: TripInput;
  tiers: TierBreakdown[];
  savings: SavingScenario[];
  /** Самая старая из использованных цен — по ней показывается «обновлено». */
  oldestPriceAt: Date;
}
