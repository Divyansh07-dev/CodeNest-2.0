import { useState, useMemo, useEffect } from "react";
import { Flame, Trophy } from "lucide-react";
import axiosClient from "../utils/axiosClient";

// Formats a Date using LOCAL year/month/day — never use toISOString() for this,
// since it converts to UTC first and silently shifts the date back by one day
// for anyone in a positive UTC-offset timezone (e.g. IST, UTC+5:30).
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const LEVEL_COLOR = {
  0: "bg-[#161b22] border border-[#21262d]",
  1: "bg-[#1b4d2e]",
  2: "bg-[#2f8f4e]",
  3: "bg-[#4fd671]",
  4: "bg-[#8bffa8]",
};

function levelFor(count) {
  if (!count) return 0;
  if (count >= 4) return 4;
  if (count === 3) return 3;
  if (count === 2) return 2;
  return 1;
}

function computeStreaks(activity) {
  const days = Object.keys(activity).sort();
  if (days.length === 0) return { current: 0, longest: 0, totalActive: 0 };

  const daySet = new Set(days);
  let longest = 0;
  let run = 0;
  let prev = null;

  for (const day of days) {
    const d = new Date(day);
    if (prev) {
      const diff = Math.round((d - prev) / 86400000);
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }

  // Current streak: walk backward from today (or yesterday) while days exist
  let current = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  let key = toDateKey(cursor);
  if (!daySet.has(key)) {
    cursor.setDate(cursor.getDate() - 1);
    key = toDateKey(cursor);
  }
  while (daySet.has(key)) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
    key = toDateKey(cursor);
  }

  return { current, longest, totalActive: days.length };
}

function buildWeeks(activity) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = 371; // pad to full weeks
  const start = new Date(today);
  start.setDate(start.getDate() - (totalDays - 1));
  // Align start to a Sunday
  start.setDate(start.getDate() - start.getDay());

  const weeks = [];
  let week = [];
  const cursor = new Date(start);
  const monthLabels = [];
  let lastMonth = -1;

  while (cursor <= today || week.length) {
    if (cursor > today && week.length === 0) break;
    const key = toDateKey(cursor);
    const inRange = cursor <= today;
    const count = inRange ? activity[key] || 0 : null;

    if (cursor.getDay() === 0 && week.length === 7) {
      weeks.push(week);
      week = [];
    }

    if (cursor.getDate() <= 7 && cursor.getMonth() !== lastMonth && inRange) {
      lastMonth = cursor.getMonth();
      monthLabels.push({ weekIndex: weeks.length, month: cursor.toLocaleString("default", { month: "short" }) });
    }

    week.push({ date: key, count, inRange });
    cursor.setDate(cursor.getDate() + 1);

    if (cursor > today && week.length > 0) {
      while (week.length < 7) week.push({ date: null, count: null, inRange: false });
      weeks.push(week);
      week = [];
      break;
    }
  }
  if (week.length) weeks.push(week);

  return { weeks, monthLabels };
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export default function StreakHeatmap() {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    let cancelled = false;
    axiosClient
      .get("/submission/activity")
      .then(({ data }) => {
        if (!cancelled) setActivity(data || {});
      })
      .catch((err) => {
        console.error("Error fetching activity:", err);
        if (!cancelled) setError("Couldn't load your activity.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const { current, longest, totalActive } = useMemo(
    () => computeStreaks(activity || {}),
    [activity]
  );
  const { weeks, monthLabels } = useMemo(
    () => buildWeeks(activity || {}),
    [activity]
  );

  if (loading) {
    return (
      <div className="w-full bg-[#0d1117] text-[#c9d1d9] rounded-xl border border-[#21262d] p-6 font-sans">
        <div className="h-24 flex items-center justify-center text-sm text-[#8b949e]">
          Loading your activity…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#0d1117] text-[#c9d1d9] rounded-xl border border-[#21262d] p-6 font-sans">
        <div className="h-24 flex items-center justify-center text-sm text-[#8b949e]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] rounded-xl border border-[#21262d] p-6 font-sans">
      {/* Header: stats row */}
      <div className="flex flex-wrap items-end gap-8 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#1b4d2e]/40">
            <Flame className="w-6 h-6 text-[#4fd671]" strokeWidth={2} />
          </div>
          <div>
            <div className="text-3xl font-bold tabular-nums leading-none text-[#e6edf3]">
              {current}
              <span className="text-sm font-normal text-[#8b949e] ml-1">day{current !== 1 ? "s" : ""}</span>
            </div>
            <div className="text-xs text-[#8b949e] mt-1 tracking-wide uppercase">Current streak</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#8b949e]/10">
            <Trophy className="w-6 h-6 text-[#e3b341]" strokeWidth={2} />
          </div>
          <div>
            <div className="text-3xl font-bold tabular-nums leading-none text-[#e6edf3]">{longest}</div>
            <div className="text-xs text-[#8b949e] mt-1 tracking-wide uppercase">Longest streak</div>
          </div>
        </div>

        <div className="ml-auto text-right">
          <div className="text-3xl font-bold tabular-nums leading-none text-[#e6edf3]">{totalActive}</div>
          <div className="text-xs text-[#8b949e] mt-1 tracking-wide uppercase">Active days / 365</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels — placed on the SAME grid as the squares below, so they
              can never drift out of alignment regardless of week count. */}
          <div
            className="grid mb-1 ml-8"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, 14px)`,
            }}
          >
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.weekIndex === wi);
              return (
                <span key={wi} className="text-[11px] text-[#8b949e] whitespace-nowrap">
                  {label ? label.month : ""}
                </span>
              );
            })}
          </div>

          <div className="flex gap-[3px]">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-[3px] mr-2">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="h-[11px] text-[10px] leading-[11px] text-[#8b949e] w-6 text-right pr-1">
                  {label}
                </div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => {
                  const level = day.inRange ? levelFor(day.count) : null;
                  return (
                    <div
                      key={di}
                      onMouseEnter={() => day.inRange && setHovered(day)}
                      onMouseLeave={() => setHovered(null)}
                      className={`w-[11px] h-[11px] rounded-[2px] ${
                        day.inRange ? LEVEL_COLOR[level] : "bg-transparent"
                      } ${day.inRange ? "cursor-pointer hover:ring-1 hover:ring-[#4fd671]/60" : ""} transition-all`}
                      title={
                        day.inRange
                          ? `${day.count || 0} submission${day.count === 1 ? "" : "s"} on ${day.date}`
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: legend + hover detail */}
      <div className="flex items-center justify-between mt-4 text-xs text-[#8b949e]">
        <div className="h-4">
          {hovered && (
            <span>
              <span className="text-[#e6edf3] font-medium">{hovered.count || 0}</span>
              {" submission"}
              {hovered.count === 1 ? "" : "s"}
              {" on "}
              {new Date(hovered.date).toLocaleDateString("default", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-1">Less</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <div key={lvl} className={`w-[11px] h-[11px] rounded-[2px] ${LEVEL_COLOR[lvl]}`} />
          ))}
          <span className="ml-1">More</span>
        </div>
      </div>
    </div>
  );
}