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

type EditDraft = {
  title: string;
  category: TaskCategory;
  deadline: string;
  isPriority: boolean;
  memo: string;
};

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

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
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
          onClick={() => onEdit(task)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-800 hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          <PencilIcon className="shrink-0 opacity-90" />
          編集
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
  const [editModal, setEditModal] = useState<{
    id: string;
    draft: EditDraft;
  } | null>(null);

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

  useEffect(() => {
    if (!editModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setEditModal(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [editModal]);

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

  const openEdit = useCallback((task: Task) => {
    setEditModal({
      id: task.id,
      draft: {
        title: task.title,
        category: task.category,
        deadline: task.deadline,
        isPriority: task.isPriority,
        memo: task.memo,
      },
    });
  }, []);

  const updateEditDraft = useCallback((patch: Partial<EditDraft>) => {
    setEditModal((m) =>
      m ? { ...m, draft: { ...m.draft, ...patch } } : null
    );
  }, []);

  const saveEdit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!editModal) return;
      const trimmed = editModal.draft.title.trim();
      if (!trimmed) return;
      const { id, draft } = editModal;
      setTasks((prev) =>
        prev
          ? prev.map((t) =>
              t.id === id
                ? {
                    ...t,
                    title: trimmed,
                    category: draft.category,
                    deadline: draft.deadline.trim(),
                    isPriority: draft.isPriority,
                    memo: draft.memo.trim(),
                  }
                : t
            )
          : prev
      );
      setEditModal(null);
    },
    [editModal]
  );

  const cancelEdit = useCallback(() => {
    setEditModal(null);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
    setEditModal((m) => (m?.id === id ? null : m));
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
                      onEdit={openEdit}
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
                      onEdit={openEdit}
                      onDelete={deleteTask}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {editModal ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) cancelEdit();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-task-dialog-title"
            className="flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2
                id="edit-task-dialog-title"
                className="text-lg font-semibold text-slate-900"
              >
                タスクを編集
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                内容を更新して保存するか、キャンセルで元に戻します
              </p>
            </div>
            <form
              onSubmit={saveEdit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="edit-task-title"
                      className="block text-sm font-medium text-slate-700"
                    >
                      タスク名 <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="edit-task-title"
                      type="text"
                      value={editModal.draft.title}
                      onChange={(e) =>
                        updateEditDraft({ title: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      autoComplete="off"
                      autoFocus
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="edit-task-category"
                        className="block text-sm font-medium text-slate-700"
                      >
                        カテゴリー
                      </label>
                      <select
                        id="edit-task-category"
                        value={editModal.draft.category}
                        onChange={(e) =>
                          updateEditDraft({
                            category: e.target.value as TaskCategory,
                          })
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
                        htmlFor="edit-task-deadline"
                        className="block text-sm font-medium text-slate-700"
                      >
                        期限（自由記述）
                      </label>
                      <input
                        id="edit-task-deadline"
                        type="text"
                        value={editModal.draft.deadline}
                        onChange={(e) =>
                          updateEditDraft({ deadline: e.target.value })
                        }
                        placeholder="例: 3/31 / なるはや"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={editModal.draft.isPriority}
                        onChange={(e) =>
                          updateEditDraft({ isPriority: e.target.checked })
                        }
                        className="size-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500/40"
                      />
                      <span>優先（★で強調）</span>
                    </label>
                  </div>
                  <div>
                    <label
                      htmlFor="edit-task-memo"
                      className="block text-sm font-medium text-slate-700"
                    >
                      メモ（任意）
                    </label>
                    <textarea
                      id="edit-task-memo"
                      value={editModal.draft.memo}
                      onChange={(e) =>
                        updateEditDraft({ memo: e.target.value })
                      }
                      rows={3}
                      className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    />
                  </div>
                </div>
              </div>
              <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex sm:justify-end sm:gap-3 sm:px-6">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:mt-0 sm:w-auto sm:min-w-[7rem]"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 sm:w-auto sm:min-w-[7rem]"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
