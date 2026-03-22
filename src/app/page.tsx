"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "personal-todo-mvp";

export type TaskStatus = "未着手" | "完了";

export type TaskCategory = "就活" | "修論/課題" | "事務" | "遊び";

export type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  deadline: string;
  isPriority: boolean;
  memo: string;
  status: TaskStatus;
};

const CATEGORIES: TaskCategory[] = ["就活", "修論/課題", "事務", "遊び"];

function categoryBadgeClass(category: TaskCategory): string {
  switch (category) {
    case "就活":
      return "bg-sky-100 text-sky-900 ring-sky-200/80";
    case "修論/課題":
      return "bg-violet-100 text-violet-900 ring-violet-200/80";
    case "事務":
      return "bg-amber-100 text-amber-950 ring-amber-200/80";
    case "遊び":
      return "bg-emerald-100 text-emerald-900 ring-emerald-200/80";
    default:
      return "bg-slate-100 text-slate-800 ring-slate-200/80";
  }
}

function createInitialTasks(): Task[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "サン佐藤財団の企画応募",
      category: "就活",
      deadline: "3/31",
      isPriority: true,
      memo: "直接応募みてみる",
      status: "未着手",
    },
    {
      id: crypto.randomUUID(),
      title: "旅行精算額確定と振込催促",
      category: "事務",
      deadline: "なるはや",
      isPriority: true,
      memo: "",
      status: "未着手",
    },
    {
      id: crypto.randomUUID(),
      title: "量子情報の修論の関連論文まとめ",
      category: "修論/課題",
      deadline: "未定",
      isPriority: false,
      memo: "",
      status: "未着手",
    },
  ];
}

function loadFromStorage(): Task[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as Task[];
  } catch {
    return null;
  }
}

function TaskCard({
  task,
  onToggleStatus,
  onDelete,
}: {
  task: Task;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const priorityRing = task.isPriority
    ? "ring-2 ring-amber-400/90 shadow-md shadow-amber-200/50"
    : "ring-1 ring-slate-200/80";

  return (
    <article
      className={`rounded-xl bg-white p-4 transition-shadow ${priorityRing} ${
        task.isPriority ? "bg-gradient-to-br from-amber-50/80 to-white" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {task.isPriority && (
            <span
              className="inline-flex shrink-0 items-center justify-center rounded-md bg-amber-400 px-1.5 py-0.5 text-sm text-amber-950 shadow-sm"
              aria-label="優先タスク"
              title="優先"
            >
              ★
            </span>
          )}
          <h3 className="min-w-0 flex-1 text-base font-semibold text-slate-900">
            {task.title}
          </h3>
          <span
            className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${categoryBadgeClass(task.category)}`}
          >
            {task.category}
          </span>
        </div>
      </div>
      <dl className="mt-3 space-y-1 text-sm text-slate-600">
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-medium text-slate-500">期限</dt>
          <dd>{task.deadline || "—"}</dd>
        </div>
        {task.memo ? (
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 font-medium text-slate-500">メモ</dt>
            <dd className="whitespace-pre-wrap break-words">{task.memo}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onToggleStatus(task.id)}
          className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          {task.status === "未着手" ? "完了にする" : "未着手に戻す"}
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          削除
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("就活");
  const [deadline, setDeadline] = useState("");
  const [isPriority, setIsPriority] = useState(false);
  const [memo, setMemo] = useState("");

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored && stored.length > 0) {
      setTasks(stored);
    } else {
      const initial = createInitialTasks();
      setTasks(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  }, []);

  useEffect(() => {
    if (tasks === null) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const { incomplete, complete } = useMemo(() => {
    if (!tasks) return { incomplete: [] as Task[], complete: [] as Task[] };
    const incomplete = tasks.filter((t) => t.status === "未着手");
    const complete = tasks.filter((t) => t.status === "完了");
    return { incomplete, complete };
  }, [tasks]);

  const addTask = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = title.trim();
      if (!trimmed) return;
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: trimmed,
        category,
        deadline: deadline.trim(),
        isPriority,
        memo: memo.trim(),
        status: "未着手",
      };
      setTasks((prev) => (prev ? [...prev, newTask] : [newTask]));
      setTitle("");
      setDeadline("");
      setIsPriority(false);
      setMemo("");
      setCategory("就活");
    },
    [title, category, deadline, isPriority, memo]
  );

  const toggleStatus = useCallback((id: string) => {
    setTasks((prev) =>
      prev
        ? prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === "未着手" ? "完了" : "未着手",
                }
              : t
          )
        : prev
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
  }, []);

  if (tasks === null) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-slate-100/80 px-4 py-16">
        <p className="text-sm font-medium text-slate-600">読み込み中…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full flex-1 bg-gradient-to-b from-slate-100 to-slate-200/90 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            マイToDo
          </h1>
          <p className="text-sm text-slate-600">
            就活・修論・事務などを1ページで管理（ブラウザに保存）
          </p>
        </header>

        <section
          aria-labelledby="add-form-heading"
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2
            id="add-form-heading"
            className="text-lg font-semibold text-slate-900"
          >
            タスクを追加
          </h2>
          <form onSubmit={addTask} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="task-title"
                className="block text-sm font-medium text-slate-700"
              >
                タスク名 <span className="text-red-600">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="やること"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="task-category"
                  className="block text-sm font-medium text-slate-700"
                >
                  カテゴリー
                </label>
                <select
                  id="task-category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as TaskCategory)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="task-deadline"
                  className="block text-sm font-medium text-slate-700"
                >
                  期限（自由記述）
                </label>
                <input
                  id="task-deadline"
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="例: 3/31 / なるはや / 未定"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>
            <div>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isPriority}
                  onChange={(e) => setIsPriority(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500/40"
                />
                <span>優先（★で強調）</span>
              </label>
            </div>
            <div>
              <label
                htmlFor="task-memo"
                className="block text-sm font-medium text-slate-700"
              >
                メモ（任意）
              </label>
              <textarea
                id="task-memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                placeholder="詳細やリンクなど"
                className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 sm:w-auto"
            >
              追加する
            </button>
          </form>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section aria-labelledby="incomplete-heading">
            <h2
              id="incomplete-heading"
              className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900"
            >
              <span className="inline-block size-2 rounded-full bg-amber-500" />
              未着手
              <span className="text-sm font-normal text-slate-500">
                （{incomplete.length}）
              </span>
            </h2>
            {incomplete.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
                未着手のタスクはありません
              </p>
            ) : (
              <ul className="space-y-3">
                {incomplete.map((task) => (
                  <li key={task.id}>
                    <TaskCard
                      task={task}
                      onToggleStatus={toggleStatus}
                      onDelete={deleteTask}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="complete-heading">
            <h2
              id="complete-heading"
              className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900"
            >
              <span className="inline-block size-2 rounded-full bg-emerald-500" />
              完了済み
              <span className="text-sm font-normal text-slate-500">
                （{complete.length}）
              </span>
            </h2>
            {complete.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
                完了したタスクはまだありません
              </p>
            ) : (
              <ul className="space-y-3">
                {complete.map((task) => (
                  <li key={task.id}>
                    <TaskCard
                      task={task}
                      onToggleStatus={toggleStatus}
                      onDelete={deleteTask}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
