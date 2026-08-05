import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { activity } from "@/lib/badgeActivity";
import { getRandomQuote } from "@/lib/dailyQuote";
import { haptic } from "@/lib/native/haptics";
import { cn } from "@/lib/utils";

const DURATION = 60;
const TINTS = ["bg-bubble-1", "bg-bubble-2", "bg-bubble-3", "bg-bubble-4", "bg-bubble-5"];
const ENCOURAGEMENT_KEYS = [
  "popit.encouragement1",
  "popit.encouragement2",
  "popit.encouragement3",
  "popit.encouragement4",
  "popit.encouragement5",
];

/** Calming, non-competitive pop-it. Full-screen, ~60 seconds. */
export function PopIt({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [left, setLeft] = useState(DURATION);
  const [popped, setPopped] = useState<Record<number, boolean>>({});
  const [count, setCount] = useState(0);
  const [affirmation, setAffirmation] = useState(() => getRandomQuote());
  const [affirmationKey, setAffirmationKey] = useState(0);

  const cells = useMemo(
    () => Array.from({ length: 36 }, (_, i) => TINTS[i % TINTS.length] as string),
    [],
  );

  useEffect(() => {
    const id = window.setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const finished = left === 0;
  const recorded = useRef(false);
  useEffect(() => {
    if (!finished || recorded.current) return;
    recorded.current = true;
    activity.popItCompleted();
  }, [finished]);
  const messageKey = ENCOURAGEMENT_KEYS[Math.floor((DURATION - left) / 12) % ENCOURAGEMENT_KEYS.length] as string;
  const message = t(messageKey);

  const pop = (index: number) => {
    if (finished) return;
    haptic.light();
    setPopped((prev) => {
      if (prev[index]) return prev;
      return { ...prev, [index]: true };
    });
    setCount((c) => c + 1);
    window.setTimeout(() => setPopped((prev) => ({ ...prev, [index]: false })), 900);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center animate-fade-in">
        <p className="text-2xl font-semibold">{t("popit.madeThrough")}</p>
        <p className="text-sm text-muted-foreground">
          {count} {count === 1 ? t("popit.pop") : t("popit.popsPlural")} — {t("popit.quieter")}
        </p>
        <Button className="press mt-2 h-12 rounded-2xl px-8" onClick={onDone}>
          {t("popit.returnHome")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-2">
      <div className="flex w-full items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">{t("popit.popped")}</p>
        <p className="text-sm font-medium tabular-nums">
          0:{String(left).padStart(2, "0")}
        </p>
      </div>
      <p className="w-full px-1 text-left text-2xl font-semibold tabular-nums">{count}</p>

      <div className="mt-4 grid w-full grid-cols-6 gap-2 rounded-3xl bg-muted/40 p-3">
        {cells.map((tint, index) => (
          <button
            key={index}
            type="button"
            aria-label={t("popit.popAria")}
            onPointerDown={() => pop(index)}
            className={cn(
              "aspect-square rounded-full ring-1 ring-black/5 transition-transform duration-200 ease-out",
              tint,
              popped[index]
                ? "scale-90 opacity-50 shadow-inner"
                : "scale-100 shadow-md hover:scale-105",
            )}
          />
        ))}
      </div>

      <p className="mt-5 text-sm text-muted-foreground animate-fade-in" key={message}>
        {message}
      </p>

      <div className="mt-4 w-full">
        <p
          key={affirmationKey}
          className="animate-fade-in rounded-2xl bg-lavender p-4 text-center text-sm text-on-tint"
        >
          {affirmation}
        </p>
        <Button
          variant="secondary"
          className="press mt-3 h-11 w-full rounded-2xl"
          onClick={() => {
            haptic.select();
            setAffirmation((prev) => getRandomQuote(prev));
            setAffirmationKey((k) => k + 1);
          }}
        >
          {t("popit.tapToAffirm")}
        </Button>
      </div>
    </div>
  );
}
