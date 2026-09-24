"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ContentEntry, EntryStatus, EntryType } from "@/lib/content/types";
import { mediaUrl } from "@/lib/content/types";
import { MermaidPre } from "./MermaidDiagram";
import "./ContentEditor.css";

type EditorForm = Pick<ContentEntry, "type" | "slug" | "title" | "summary" | "bodyMd" | "tags" | "coverMediaId" | "imageIds" | "publishedAt">;
type SessionResult = { authenticated: boolean; configured: boolean };
type EntriesResult = { entries: ContentEntry[] };
type EntryResult = { entry: ContentEntry };
type UploadResult = { id: string; url: string };

function blankForm(type: EntryType): EditorForm {
  return { type, slug: "", title: "", summary: "", bodyMd: "", tags: [], coverMediaId: null, imageIds: [], publishedAt: null };
}

function formFromEntry(entry: ContentEntry): EditorForm {
  return {
    type: entry.type, slug: entry.slug, title: entry.title, summary: entry.summary,
    bodyMd: entry.bodyMd, tags: entry.tags, coverMediaId: entry.coverMediaId,
    imageIds: entry.imageIds, publishedAt: entry.publishedAt,
  };
}

function dateInputValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Shanghai",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", credentials: "same-origin", ...init });
  } catch {
    throw new Error("网络连接失败，请稍后重试。");
  }
  const result = await response.json().catch(() => null) as (T & { error?: string }) | null;
  if (!response.ok) throw new Error(result?.error || `请求失败（${response.status}）。`);
  if (!result) throw new Error("服务器返回了空响应。");
  return result;
}

function dateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Shanghai",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

export default function ContentEditor() {
  const [phase, setPhase] = useState<"loading" | "login" | "editor">("loading");
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState("");
  const [type, setType] = useState<EntryType>("article");
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [form, setForm] = useState<EditorForm>(() => blankForm("article"));
  const [tagsText, setTagsText] = useState("");
  const [savedStatus, setSavedStatus] = useState<EntryStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const queryType: EntryType = params.get("type") === "moment" ? "moment" : "article";
    const rawId = params.get("id");
    const queryId = rawId && /^\d+$/.test(rawId) ? Number(rawId) : null;
    setType(queryType);
    setForm(blankForm(queryType));

    async function start() {
      let authenticated = false;
      try {
        const session = await api<SessionResult>("/api/admin/session");
        if (!active) return;
        setConfigured(session.configured);
        if (!session.authenticated) { setPhase("login"); return; }
        authenticated = true;
        const listing = await api<EntriesResult>(`/api/entries?type=${queryType}&all=1`);
        if (!active) return;
        setEntries(listing.entries);
        if (queryId && Number.isSafeInteger(queryId)) {
          const result = await api<EntryResult>(`/api/entries/${queryId}`);
          if (!active) return;
          if (result.entry.type !== queryType) throw new Error("这条记录不属于当前分类。");
          setCurrentId(result.entry.id);
          setForm(formFromEntry(result.entry));
          setTagsText(result.entry.tags.join("，"));
          setSavedStatus(result.entry.status);
        }
        setPhase("editor");
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "加载失败。");
        setPhase(authenticated ? "editor" : "login");
      }
    }
    void start();
    return () => { active = false; };
  }, []);

  async function refreshEntries(currentType: EntryType): Promise<void> {
    const result = await api<EntriesResult>(`/api/entries?type=${currentType}&all=1`);
    setEntries(result.entries);
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      await api<{ authenticated: boolean }>("/api/admin/session", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
      });
      setPassword("");
      await refreshEntries(type);
      const params = new URLSearchParams(window.location.search);
      const rawId = params.get("id");
      if (rawId && /^\d+$/.test(rawId)) {
        const result = await api<EntryResult>(`/api/entries/${rawId}`);
        if (result.entry.type !== type) throw new Error("这条记录不属于当前分类。");
        chooseEntry(result.entry);
      }
      setPhase("editor");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "登录失败。"); }
    finally { setBusy(false); }
  }

  function updateUrl(id: number | null, nextType: EntryType = type) {
    const params = new URLSearchParams({ type: nextType });
    if (id !== null) params.set("id", String(id));
    window.history.replaceState(null, "", `/write/?${params}`);
  }

  function chooseEntry(entry: ContentEntry) {
    setCurrentId(entry.id);
    setForm(formFromEntry(entry));
    setTagsText(entry.tags.join("，"));
    setSavedStatus(entry.status);
    setError(""); setNotice("");
    updateUrl(entry.id, entry.type);
  }

  function newEntry() {
    setCurrentId(null);
    setSavedStatus(null);
    setForm(blankForm(type));
    setTagsText("");
    setError(""); setNotice("");
    updateUrl(null);
  }

  function parsedTags(): string[] {
    return [...new Set(tagsText.split(/[,，\n]/).map((tag) => tag.trim()).filter(Boolean))];
  }

  async function save(status: EntryStatus) {
    if (busy || uploading) return;
    setError(""); setNotice("");
    const tags = parsedTags();
    if (!form.title.trim()) { setError("请先填写标题。"); return; }
    if (!form.bodyMd.trim()) { setError("请先填写正文。"); return; }
    if (tags.length > 12) { setError("标签最多填写 12 个。"); return; }
    setBusy(true);
    try {
      const payload = { ...form, type, tags, status };
      const result = await api<EntryResult>(currentId === null ? "/api/entries" : `/api/entries/${currentId}`, {
        method: currentId === null ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      setCurrentId(result.entry.id);
      setForm(formFromEntry(result.entry));
      setTagsText(result.entry.tags.join("，"));
      setSavedStatus(result.entry.status);
      updateUrl(result.entry.id);
      await refreshEntries(type);
      setNotice(status === "published" ? "已发布。" : "草稿已保存。");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "保存失败。"); }
    finally { setBusy(false); }
  }

  async function removeEntry() {
    if (currentId === null || busy) return;
    if (!window.confirm(`确定删除《${form.title}》吗？删除后无法恢复。`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api<{ deleted: boolean }>(`/api/entries/${currentId}`, { method: "DELETE" });
      newEntry();
      await refreshEntries(type);
      setNotice("记录已删除。");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "删除失败。"); }
    finally { setBusy(false); }
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || uploading) return;
    if (form.imageIds.length >= 12) {
      setError("每条记录最多上传 12 张图片。");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    const start = textareaRef.current?.selectionStart ?? form.bodyMd.length;
    const end = textareaRef.current?.selectionEnd ?? start;
    setUploading(true); setError(""); setNotice("");
    try {
      const data = new FormData();
      data.append("file", file);
      const result = await api<UploadResult>("/api/media", { method: "POST", body: data });
      if (type === "article") {
        const safeName = file.name.replace(/[\[\]\n\r]/g, " ");
        const markdown = `![${safeName}](${result.url})`;
        setForm((previous) => ({
          ...previous,
          bodyMd: `${previous.bodyMd.slice(0, start)}${markdown}${previous.bodyMd.slice(end)}`,
          imageIds: previous.imageIds.includes(result.id) ? previous.imageIds : [...previous.imageIds, result.id],
          coverMediaId: previous.coverMediaId ?? result.id,
        }));
        requestAnimationFrame(() => { textareaRef.current?.focus(); textareaRef.current?.setSelectionRange(start + markdown.length, start + markdown.length); });
        setNotice("图片已插入正文。");
      } else {
        setForm((previous) => ({
          ...previous,
          imageIds: [...previous.imageIds, result.id],
          coverMediaId: previous.coverMediaId ?? result.id,
        }));
        setNotice("图片已加入记录。");
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "上传失败。"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function logout() {
    setBusy(true); setError("");
    try {
      await api<{ authenticated: boolean }>("/api/admin/session", { method: "DELETE" });
      setEntries([]); setPhase("login"); setPassword("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "退出失败。"); }
    finally { setBusy(false); }
  }

  const label = type === "article" ? "技术学习" : "日常生活";
  const backHref = type === "article" ? "/moments/tech/" : "/moments/life/";

  if (phase === "loading") return <main className="content-editor content-editor--center"><p role="status">正在打开写作页…</p></main>;

  if (phase === "login") return (
    <main className="content-editor content-editor--center">
      <div className="content-editor__login">
        <a className="content-editor__back" href={backHref}>← 返回{label}记录</a>
        <p className="content-editor__eyebrow">PRIVATE DESK / 作者空间</p>
        <h1>开始记录</h1>
        <p>输入管理员密码后，可以撰写和管理{label}记录。</p>
        {!configured && <div className="content-editor__alert" role="alert">管理员密码和会话密钥尚未配置，请先在服务器环境变量中设置。</div>}
        {error && <div className="content-editor__alert" role="alert">{error}</div>}
        <form onSubmit={login}>
          <label htmlFor="content-editor-password">管理员密码</label>
          <input id="content-editor-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={!configured || busy} />
          <button type="submit" disabled={!configured || busy}>{busy ? "正在验证…" : "进入写作页"}</button>
        </form>
      </div>
    </main>
  );

  return (
    <main className="content-editor">
      <div className="content-editor__shell">
        <header className="content-editor__header">
          <div>
            <a className="content-editor__back" href={backHref}>← 返回{label}记录</a>
            <p className="content-editor__eyebrow">PRIVATE DESK / 作者空间</p>
            <h1>{label} · 记录</h1>
          </div>
          <div className="content-editor__header-actions">
            <a className={type === "article" ? "is-active" : ""} href="/write/?type=article">技术学习</a>
            <a className={type === "moment" ? "is-active" : ""} href="/write/?type=moment">日常生活</a>
            <button type="button" onClick={logout} disabled={busy}>退出</button>
          </div>
        </header>

        {error && <div className="content-editor__alert" role="alert">{error}</div>}
        {notice && <div className="content-editor__notice" role="status">{notice}</div>}

        <div className="content-editor__layout">
          <aside className="content-editor__sidebar" aria-label="记录列表">
            <div className="content-editor__sidebar-top"><h2>我的记录 <span>{entries.length}</span></h2><button type="button" onClick={newEntry}>＋ 新建</button></div>
            {entries.length === 0 ? <p className="content-editor__list-empty">还没有记录。写下第一篇吧。</p> : (
              <div className="content-editor__entry-list">
                {entries.map((entry) => (
                  <button className={entry.id === currentId ? "is-current" : ""} type="button" key={entry.id} onClick={() => chooseEntry(entry)}>
                    <span className="content-editor__entry-status">{entry.status === "published" ? "已发布" : "草稿"}</span>
                    <strong>{entry.title}</strong>
                    <small>{dateLabel(entry.updatedAt)}</small>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="content-editor__work" aria-label="编辑记录">
            <div className="content-editor__work-head">
              <div><p className="content-editor__eyebrow">{currentId === null ? "NEW ENTRY" : `ENTRY #${currentId}`}</p><h2>{currentId === null ? "新建记录" : "编辑记录"}</h2></div>
              {savedStatus && <span className={`content-editor__status content-editor__status--${savedStatus}`}>{savedStatus === "published" ? "已发布" : "草稿"}</span>}
            </div>

            <div className="content-editor__fields">
              <label>标题 <span>必填</span><input value={form.title} maxLength={180} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={type === "article" ? "这次学到了什么？" : "今天想记下什么？"} /></label>
              <label>摘要 <span>最多 600 字</span><textarea className="content-editor__summary" value={form.summary} maxLength={600} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="用一两句话概括这篇记录" /></label>
              <div className="content-editor__field-row">
                <label>链接标识 <span>可留空自动生成</span><input value={form.slug} maxLength={120} onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase() })} placeholder="my-first-post" spellCheck={false} /></label>
                <label>标签 <span>用逗号分隔，最多 12 个</span><input value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="学习笔记，Next.js" /></label>
                <label>发布日期 <span>可自定义，留空则使用发布时间</span><input type="date" value={dateInputValue(form.publishedAt)} onChange={(event) => setForm({ ...form, publishedAt: event.target.value ? `${event.target.value}T12:00:00+08:00` : null })} /></label>
              </div>

              <div className="content-editor__body-head"><label htmlFor="content-editor-body">正文 <span>Markdown · Mermaid</span></label><button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || busy}>{uploading ? "正在上传…" : "＋ 上传图片"}</button><input ref={fileRef} className="content-editor__file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadImage} /></div>
              <div className="content-editor__panes">
                <textarea ref={textareaRef} id="content-editor-body" className="content-editor__markdown" value={form.bodyMd} onChange={(event) => setForm({ ...form, bodyMd: event.target.value })} placeholder={type === "article" ? "# 开始写作\n\n用 Markdown 记录思路、代码和图片…" : "写下此刻的想法…"} spellCheck={false} />
                <div className="content-editor__preview" aria-label="Markdown 实时预览"><p className="content-editor__preview-label">实时预览</p>{form.bodyMd.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{ pre: MermaidPre }}>{form.bodyMd}</ReactMarkdown> : <p className="content-editor__preview-empty">正文预览会显示在这里。使用 ```mermaid 代码块可以插入图表。</p>}</div>
              </div>

              {type === "moment" && form.imageIds.length > 0 && (
                <div className="content-editor__images"><h3>图片 · {form.imageIds.length}/12</h3><div className="content-editor__image-grid">{form.imageIds.map((id) => <div key={id}><img src={mediaUrl(id)} alt="已上传的记录图片" /><button type="button" aria-label="移除这张图片" onClick={() => setForm((previous) => { const ids = previous.imageIds.filter((item) => item !== id); return { ...previous, imageIds: ids, coverMediaId: previous.coverMediaId === id ? (ids[0] ?? null) : previous.coverMediaId }; })}>×</button></div>)}</div></div>
              )}
            </div>

            <div className="content-editor__footer">
              <div>{currentId !== null && <button className="content-editor__delete" type="button" onClick={removeEntry} disabled={busy || uploading}>删除记录</button>}</div>
              <div className="content-editor__save-actions"><button className="content-editor__draft" type="button" onClick={() => save("draft")} disabled={busy || uploading}>{busy ? "正在保存…" : "保存草稿"}</button><button className="content-editor__publish" type="button" onClick={() => save("published")} disabled={busy || uploading}>{busy ? "正在保存…" : savedStatus === "published" ? "更新发布" : "发布记录"}</button></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
