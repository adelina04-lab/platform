export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-5 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-teal-700 dark:text-teal-400">
        Эпик E1 · каркас
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Калькулятор отпуска</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        Приложение поднято, база и Redis подключены. Следующий шаг — эпик E3:
        сборщик цен на перелёт через Travelpayouts Flight Data API.
      </p>
    </main>
  );
}
