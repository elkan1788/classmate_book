import {
  ArrowLeft,
  Building2,
  Compass,
  KeyRound,
  Lock,
  Search,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { classmates } from "./data/classmates";
import type { Classmate, ProfileTemplate } from "./types";

const ACCESS_CODE = "202606066";
const AUTH_KEY = "c9-classmate-book-authenticated";

function App() {
  const [isAuthed, setIsAuthed] = useState(
    () => window.localStorage.getItem(AUTH_KEY) === "true",
  );
  const [selectedClassmate, setSelectedClassmate] = useState<Classmate | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [template, setTemplate] = useState<ProfileTemplate>("classic");

  const visibleClassmates = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return classmates;
    }

    return classmates.filter((classmate) => {
      const haystack = [
        classmate.name,
        classmate.industry,
        classmate.direction3c,
        classmate.hometown,
        ...classmate.hobbies,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [query]);

  function handleAuthenticated() {
    window.localStorage.setItem(AUTH_KEY, "true");
    setIsAuthed(true);
  }

  function openProfile(classmate: Classmate) {
    setSelectedClassmate(classmate);
    setTemplate(classmate.template);
  }

  if (!isAuthed) {
    return <AccessGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--ink)] text-[var(--paper)]">
      <Hero query={query} onQueryChange={setQuery} />

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--gold)]">
              Classmates
            </p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              同学名片墙
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/64">
            搜索姓名、行业、3C方向或兴趣爱好，快速找到想了解的同学。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleClassmates.map((classmate) => (
            <ClassmateCard
              classmate={classmate}
              key={classmate.id}
              onOpen={() => openProfile(classmate)}
            />
          ))}
        </div>

        {visibleClassmates.length === 0 && (
          <div className="rounded-lg border border-white/12 bg-white/6 p-10 text-center text-white/72">
            没有找到匹配的同学，换个关键词试试。
          </div>
        )}
      </section>

      {selectedClassmate && (
        <ProfileOverlay
          classmate={selectedClassmate}
          template={template}
          onTemplateChange={setTemplate}
          onClose={() => setSelectedClassmate(null)}
        />
      )}
    </main>
  );
}

function AccessGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (code.trim() === ACCESS_CODE) {
      onAuthenticated();
      return;
    }

    setError("密码不正确，请重新输入。");
  }

  return (
    <main className="gate min-h-screen bg-[var(--ink)] text-white">
      <Skyline />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-12 sm:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/72">
              <Lock size={16} />
              私密访问
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-7xl">
              上海班9.0
              <span className="block text-[var(--gold)]">同学录</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-white/68">
              以海派城市天际线为封面，收藏每一位同学的经历、志趣与未来想象。
            </p>
          </div>

          <form className="access-panel" onSubmit={submit}>
            <KeyRound className="text-[var(--gold)]" size={28} />
            <h2 className="mt-5 text-2xl font-semibold">输入访问密码</h2>
            <label className="mt-6 block text-sm text-white/66" htmlFor="code">
              同学录访问码
            </label>
            <input
              autoFocus
              className="mt-2 w-full rounded-md border border-white/14 bg-white/10 px-4 py-3 text-lg text-white outline-none transition focus:border-[var(--gold)]"
              id="code"
              inputMode="numeric"
              onChange={(event) => {
                setCode(event.target.value);
                setError("");
              }}
              placeholder="请输入密码"
              type="password"
              value={code}
            />
            {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
            <button className="primary-button mt-6 w-full" type="submit">
              进入同学录
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Hero({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <section className="hero relative px-5 pb-10 pt-10 sm:px-8">
      <Skyline />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-4 py-2 text-sm text-[var(--gold)]">
              <Building2 size={16} />
              Shanghai Class 9.0
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight sm:text-7xl">
              上海班9.0同学录
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
              在东方明珠与外滩灯影之间，记录每位同学的行业坐标、兴趣偏好与未来方向。
            </p>
          </div>

          <label className="search-box" htmlFor="search">
            <Search size={20} />
            <input
              id="search"
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="搜索姓名 / 行业 / 3C方向"
              value={query}
            />
          </label>
        </div>
      </div>
    </section>
  );
}

function ClassmateCard({
  classmate,
  onOpen,
}: {
  classmate: Classmate;
  onOpen: () => void;
}) {
  return (
    <article className="classmate-card">
      <img alt={`${classmate.name}头像`} src={classmate.avatar} />
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--gold)]">{classmate.title}</p>
            <h3 className="mt-1 text-2xl font-semibold">{classmate.name}</h3>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/72">
            {classmate.direction3c}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/72">
          <InfoPill icon={<Compass size={16} />} label={classmate.industry} />
          <InfoPill icon={<Star size={16} />} label={classmate.constellation} />
        </div>

        <p className="mt-5 line-clamp-3 text-sm leading-7 text-white/64">
          {classmate.message}
        </p>

        <button className="secondary-button mt-6" onClick={onOpen} type="button">
          查看同学资料
        </button>
      </div>
    </article>
  );
}

function ProfileOverlay({
  classmate,
  template,
  onTemplateChange,
  onClose,
}: {
  classmate: Classmate;
  template: ProfileTemplate;
  onTemplateChange: (template: ProfileTemplate) => void;
  onClose: () => void;
}) {
  return (
    <div className="profile-shell">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <button className="ghost-button" onClick={onClose} type="button">
            <ArrowLeft size={18} />
            返回首页
          </button>
          <div className="template-switcher" aria-label="详情模板切换">
            <button
              className={template === "classic" ? "active" : ""}
              onClick={() => onTemplateChange("classic")}
              type="button"
            >
              档案馆
            </button>
            <button
              className={template === "postcard" ? "active" : ""}
              onClick={() => onTemplateChange("postcard")}
              type="button"
            >
              明信片
            </button>
          </div>
        </div>

        {template === "classic" ? (
          <ClassicProfile classmate={classmate} />
        ) : (
          <PostcardProfile classmate={classmate} />
        )}
      </div>
    </div>
  );
}

function ClassicProfile({ classmate }: { classmate: Classmate }) {
  return (
    <article className="classic-profile">
      <aside>
        <img alt={`${classmate.name}头像`} src={classmate.avatar} />
        <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[var(--gold)]">
          {classmate.title}
        </p>
        <h2 className="mt-2 text-4xl font-semibold">{classmate.name}</h2>
        <div className="mt-6 grid gap-3">
          <DetailRow label="行业" value={classmate.industry} />
          <DetailRow label="籍贯" value={classmate.hometown} />
          <DetailRow label="属相" value={classmate.zodiac} />
          <DetailRow label="星座" value={classmate.constellation} />
          <DetailRow label="3C方向" value={classmate.direction3c} />
        </div>
      </aside>

      <section>
        <div className="profile-section">
          <h3>人物典故</h3>
          <p>{classmate.story}</p>
        </div>
        <div className="profile-section">
          <h3>兴趣爱好</h3>
          <div className="tag-list">
            {classmate.hobbies.map((hobby) => (
              <span key={hobby}>{hobby}</span>
            ))}
          </div>
        </div>
        <div className="profile-section">
          <h3>想说的话</h3>
          <p className="message-text">{classmate.message}</p>
        </div>
      </section>
    </article>
  );
}

function PostcardProfile({ classmate }: { classmate: Classmate }) {
  return (
    <article className="postcard-profile">
      <div className="postcard-image">
        <img alt={`${classmate.name}头像`} src={classmate.avatar} />
      </div>
      <div className="postcard-content">
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--gold)]">
          City Postcard
        </p>
        <h2 className="mt-3 text-4xl font-semibold text-[var(--ink)]">
          {classmate.name}
        </h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          {classmate.story}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <DetailRow label="行业" value={classmate.industry} light />
          <DetailRow label="籍贯" value={classmate.hometown} light />
          <DetailRow label="属相" value={classmate.zodiac} light />
          <DetailRow label="星座" value={classmate.constellation} light />
          <DetailRow label="兴趣" value={classmate.hobbies.join(" / ")} light />
          <DetailRow label="3C方向" value={classmate.direction3c} light />
        </div>
        <p className="mt-7 text-base leading-8 text-slate-700">
          {classmate.message}
        </p>
      </div>
    </article>
  );
}

function DetailRow({
  label,
  value,
  light = false,
}: {
  label: string;
  value: string;
  light?: boolean;
}) {
  return (
    <div className={light ? "detail-row light" : "detail-row"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoPill({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="info-pill">
      {icon}
      {label}
    </span>
  );
}

function Skyline() {
  return (
    <div aria-hidden="true" className="skyline">
      <Sparkles className="sparkle" size={22} />
      <div className="tower pearl" />
      <div className="building small" />
      <div className="building medium" />
      <div className="tower needle" />
      <div className="building wide" />
      <div className="building tall" />
      <div className="river" />
    </div>
  );
}

export default App;
