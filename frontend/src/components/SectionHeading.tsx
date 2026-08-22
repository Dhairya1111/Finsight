import { cn } from "../utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
