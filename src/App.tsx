import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CakeSlice,
  Feather,
  KeyRound,
  Lock,
  MapPin,
  MessageCircle,
  Orbit,
  Search,
  Sparkles,
  Tag,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import shanghaiSkyline from "./assets/shanghai-skyline.jpg";
import { classmates } from "./data/classmates";
import type { Classmate } from "./types";

const ACCESS_CODE = import.meta.env.VITE_ACCESS_CODE?.trim() ?? "";
const AUTH_KEY = "c9-classmate-book-authenticated";
const PROFILE_EXIT_MS = 500;
const SLIDE_STEP_MS = 1000;
const SLIDE_TRANSITIONS = [
  "smooth",
  "left",
  "right",
  "blind",
  "fade",
  "zoom",
  "flip",
] as const;
type SlideTransition = (typeof SLIDE_TRANSITIONS)[number];
const avatarAssets = import.meta.glob("./assets/avatar/*", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

function resolveAvatarSrc(avatar: string) {
  if (/^https?:\/\//.test(avatar) || avatar.startsWith("/")) {
    return avatar;
  }

  const fileName = avatar.split("/").pop();

  if (!fileName) {
    return avatar;
  }

  return avatarAssets[`./assets/avatar/${fileName}`] ?? avatar;
}

function App() {
  const [isAuthed, setIsAuthed] = useState(
    () => window.localStorage.getItem(AUTH_KEY) === "true",
  );
  const [selectedClassmate, setSelectedClassmate] = useState<Classmate | null>(
    null,
  );
  const [isProfileClosing, setIsProfileClosing] = useState(false);
  const [query, setQuery] = useState("");
  const [slidePlaying, setSlidePlaying] = useState(false);
  const [slideDelay, setSlideDelay] = useState(8);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideCountdownMs, setSlideCountdownMs] = useState(8000);
  const [slideTransition, setSlideTransition] = useState<SlideTransition>("smooth");
  const [slideTransitionMs, setSlideTransitionMs] = useState(1000);
  const [slideTransitionMode, setSlideTransitionMode] = useState<
    SlideTransition | "random"
  >("smooth");
  const [currentTransition, setCurrentTransition] =
    useState<SlideTransition>("smooth");
  const [playbackTransitionMode, setPlaybackTransitionMode] = useState<
    SlideTransition | "random"
  >("smooth");
  const lastRandomTransitionRef = useRef<SlideTransition>("smooth");
  const isPlayMode = useMemo(() => {
    const url = new URL(window.location.href);
    return url.searchParams.get("play") === "1";
  }, []);

  const visibleClassmates = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return classmates;
    }

    return classmates.filter((classmate) => {
      const haystack = [
        classmate.name,
        classmate.title,
        classmate.industry,
        classmate.direction3c,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [query]);

  useEffect(() => {
    if (!isPlayMode || !slidePlaying || visibleClassmates.length <= 1) {
      return undefined;
    }

    const tick = window.setInterval(() => {
      setSlideCountdownMs((current) => {
        const next = current - 100;

        if (next <= 0) {
          setSlideIndex((currentIndex) => (currentIndex + 1) % visibleClassmates.length);
          return slideDelay * SLIDE_STEP_MS;
        }

        return next;
      });
    }, 100);

    return () => window.clearInterval(tick);
  }, [isPlayMode, slideDelay, slidePlaying, visibleClassmates.length]);

  function resolveSlideTransition() {
    if (playbackTransitionMode !== "random") {
      return playbackTransitionMode;
    }

    const candidates = SLIDE_TRANSITIONS.filter(
      (transition) => transition !== lastRandomTransitionRef.current,
    );

    const nextTransition =
      candidates[Math.floor(Math.random() * candidates.length)] ?? "smooth";

    lastRandomTransitionRef.current = nextTransition;

    return nextTransition;
  }

  function handleAuthenticated() {
    window.localStorage.setItem(AUTH_KEY, "true");
    setIsAuthed(true);
  }

  function openProfile(classmate: Classmate) {
    setIsProfileClosing(false);
    setSelectedClassmate(classmate);
  }

  function closeProfile() {
    setIsProfileClosing(true);
    window.setTimeout(() => {
      setSelectedClassmate(null);
      setIsProfileClosing(false);
    }, PROFILE_EXIT_MS);
  }

  function openPlayMode() {
    if (visibleClassmates.length === 0) return;
    setSelectedClassmate(visibleClassmates[slideIndex] ?? visibleClassmates[0]);
    setSlideCountdownMs(slideDelay * SLIDE_STEP_MS);
    setPlaybackTransitionMode(slideTransitionMode);
    const initialTransition =
      slideTransitionMode === "random"
        ? (() => {
            const candidates = SLIDE_TRANSITIONS.filter(
              (transition) => transition !== lastRandomTransitionRef.current,
            );
            const nextTransition =
              candidates[Math.floor(Math.random() * candidates.length)] ??
              "smooth";
            lastRandomTransitionRef.current = nextTransition;
            return nextTransition;
          })()
        : slideTransitionMode;
    setCurrentTransition(initialTransition);
    setSlidePlaying(true);
  }

  function stopPlayMode() {
    setSlidePlaying(false);
  }

  function exitPlayMode() {
    setSlidePlaying(false);
    closeProfile();
  }

  function goToSlide(nextIndex: number) {
    if (visibleClassmates.length === 0) return;

    const total = visibleClassmates.length;
    const normalized = ((nextIndex % total) + total) % total;
    setSlideIndex(normalized);
    setSelectedClassmate(visibleClassmates[normalized]);
    setSlideCountdownMs(slideDelay * SLIDE_STEP_MS);
    setCurrentTransition(resolveSlideTransition());
  }

  const currentSlide = visibleClassmates.length
    ? visibleClassmates[slideIndex] ?? visibleClassmates[0]
    : null;
  const activeClassmate =
    isPlayMode && slidePlaying ? currentSlide : selectedClassmate;
  const effectiveTransition =
    isPlayMode && slidePlaying ? currentTransition : slideTransition;
  const countdownPercent =
    slideDelay > 0 ? Math.max(0, Math.min(100, (slideCountdownMs / (slideDelay * SLIDE_STEP_MS)) * 100)) : 0;

  if (!isAuthed) {
    return <AccessGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      {isPlayMode && slidePlaying && (
        <div className="playback-bar" aria-hidden="true">
          <div
            className="playback-bar-fill"
            style={{
              width: `${countdownPercent}%`,
            }}
          />
        </div>
      )}
      <Hero query={query} onQueryChange={setQuery} />

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-8 sm:px-8">
        {isPlayMode && (
          <div className="play-console">
            <div className="play-console-body">
              <PlayModePanel
                delay={slideDelay}
                isPlaying={slidePlaying}
                progress={`${visibleClassmates.length === 0 ? 0 : slideIndex + 1} / ${visibleClassmates.length}`}
                onDelayChange={setSlideDelay}
                onPlay={openPlayMode}
                onStop={stopPlayMode}
                onTransitionChange={setSlideTransition}
                onTransitionModeChange={setSlideTransitionMode}
                onTransitionMsChange={setSlideTransitionMs}
                slideTransition={slideTransition}
                slideTransitionMode={slideTransitionMode}
                slideTransitionMs={slideTransitionMs}
              />
            </div>
          </div>
        )}

        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--gold)]">
              Classmates
            </p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              同学名片墙
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
            搜索花名、行业、3C方向或兴趣爱好，快速找到想了解的同学。
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
          <div className="rounded-lg border border-[var(--line)] bg-[var(--paper-soft)] p-10 text-center text-[var(--muted)]">
            没有找到匹配的同学，换个关键词试试。
          </div>
        )}
      </section>

      {activeClassmate && (
        <ProfileOverlay
          key={`${activeClassmate.id}-${slideIndex}-${effectiveTransition}`}
          classmate={activeClassmate}
          isClosing={isProfileClosing}
          onClose={isPlayMode ? exitPlayMode : closeProfile}
          isPlayMode={isPlayMode}
          slideTransition={effectiveTransition}
          slideTransitionMs={slideTransitionMs}
          onNext={isPlayMode ? () => goToSlide(slideIndex + 1) : undefined}
          onPrevious={isPlayMode ? () => goToSlide(slideIndex - 1) : undefined}
          slideIndex={slideIndex}
          slideTotal={visibleClassmates.length}
        />
      )}
    </main>
  );
}

function AccessGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const isAccessCodeConfigured = ACCESS_CODE.length > 0;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAccessCodeConfigured) {
      setError("访问密码未配置，请检查 VITE_ACCESS_CODE 环境变量。");
      return;
    }

    if (code.trim() === ACCESS_CODE) {
      onAuthenticated();
      return;
    }

    setError("密码不正确，请重新输入。");
  }

  return (
    <main className="gate min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Skyline />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-12 sm:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper-soft)] px-4 py-2 text-sm text-[var(--muted)]">
              <Lock size={16} />
              私密访问
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-7xl">
              上海班9.0
              <span className="title-line text-[var(--gold)]">
                同学录
                <Sparkles size={24} />
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-[var(--muted)]">
              这里珍藏着上海班9.0每一位同学的故事与心意，愿翻开时都能想起并肩学习的温暖时光。
            </p>
          </div>

          <form className="access-panel" onSubmit={submit}>
            <div className="access-heading">
              <KeyRound className="text-[var(--gold)]" size={28} />
              <h2>输入访问密码</h2>
            </div>
            <label className="sr-only" htmlFor="code">
              访问密码
            </label>
            <input
              autoFocus
              className="mt-6 w-full rounded-md border border-[var(--line)] bg-white/65 px-4 py-3 text-lg text-[var(--ink)] outline-none transition focus:border-[var(--gold)]"
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
            {error && <p className="mt-3 text-sm text-[var(--red)]">{error}</p>}
            <button className="primary-button mt-6 w-full" type="submit">
              进入同学录
            </button>
            {!isAccessCodeConfigured && (
              <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
                本地调试请在项目根目录创建 .env.local，并配置
                VITE_ACCESS_CODE。
              </p>
            )}
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
              上海班9.0
              <span className="title-line text-[var(--gold)]">
                同学录
                <Sparkles size={24} />
              </span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              在东方明珠与外滩灯影之间，记录每位同学的行业坐标、兴趣偏好与未来方向。
            </p>
          </div>

          <label className="search-box" htmlFor="search">
            <Search size={20} />
            <input
              id="search"
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="搜索花名 / 行业 / 3C方向"
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
      <AvatarImage
        alt={`${classmate.name}头像`}
        className="classmate-photo"
        src={classmate.avatar}
      />
      <div className="classmate-card-body">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold">{classmate.name}</h3>
            <p className="nickname-line">
              <Feather size={16} />
              <span>{classmate.title}</span>
            </p>
          </div>
          <span className="direction-badge">
            <BadgeCheck size={16} />
            {classmate.direction3c}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2.5 text-sm">
          <InfoPill
            icon={<MapPin size={16} />}
            label={classmate.hometown}
            prefix="籍贯"
          />
          <InfoPill
            icon={<BriefcaseBusiness size={16} />}
            label={classmate.industry}
            prefix="行业"
          />
        </div>

        <div className="card-message mt-5">
          <MessageCircle size={17} />
          <p>{classmate.message}</p>
        </div>

        <button className="secondary-button mt-6" onClick={onOpen} type="button">
          查看同学资料
        </button>
      </div>
    </article>
  );
}

function ProfileOverlay({
  classmate,
  isClosing,
  onClose,
  isPlayMode,
  onNext,
  onPrevious,
  slideIndex,
  slideTotal,
  slideTransition,
  slideTransitionMs,
}: {
  classmate: Classmate;
  isClosing: boolean;
  onClose: () => void;
  isPlayMode: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  slideIndex: number;
  slideTotal: number;
  slideTransition: SlideTransition;
  slideTransitionMs: number;
}) {
  return (
    <div
      className={`profile-shell profile-shell-${slideTransition}${isClosing ? " is-closing" : ""}`}
    >
      <div className="profile-toolbar">
        <button
          className="ghost-button profile-back-button"
          onClick={onClose}
          type="button"
        >
          <ArrowLeft size={18} />
          {isPlayMode ? "退出播放" : "返回首页"}
        </button>
        {isPlayMode && (
          <div className="slide-nav">
            <button className="ghost-button" onClick={onPrevious} type="button">
              <ArrowLeft size={16} />
              上一位
            </button>
            <strong className="slide-counter">
              {slideIndex + 1} / {slideTotal}
            </strong>
            <button className="ghost-button" onClick={onNext} type="button">
              下一位
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
      <div
        className={`profile-content profile-content-${slideTransition}`}
        style={{ animationDuration: `${slideTransitionMs}ms` }}
      >
        <ClassicProfile classmate={classmate} />
      </div>
    </div>
  );
}

function PlayModePanel({
  delay,
  isPlaying,
  progress,
  onDelayChange,
  onPlay,
  onStop,
  onTransitionChange,
  onTransitionModeChange,
  onTransitionMsChange,
  slideTransition,
  slideTransitionMode,
  slideTransitionMs,
}: {
  delay: number;
  isPlaying: boolean;
  progress: string;
  onDelayChange: (value: number) => void;
  onPlay: () => void;
  onStop: () => void;
  onTransitionChange: (value: SlideTransition) => void;
  onTransitionModeChange: (value: SlideTransition | "random") => void;
  onTransitionMsChange: (value: number) => void;
  slideTransition: SlideTransition;
  slideTransitionMode: SlideTransition | "random";
  slideTransitionMs: number;
}) {
  return (
    <section className="play-panel">
      <div>
        <p className="play-panel-kicker">Display mode</p>
        <h3>幻灯片播放控制台</h3>
      </div>
      <div className="play-panel-grid">
        <button className="primary-button" onClick={onPlay} type="button">
          <UserRound size={18} />
          开始播放
        </button>
        <label className="play-select play-select-inline">
          <span>停留时间</span>
          <select
            value={delay}
            onChange={(event) => onDelayChange(Number(event.target.value))}
          >
            <option value={5}>5 秒</option>
            <option value={8}>8 秒</option>
            <option value={12}>12 秒</option>
            <option value={15}>15 秒</option>
          </select>
        </label>
        <label className="play-select play-select-inline">
          <span>切换方式</span>
          <select
            value={slideTransitionMode}
            onChange={(event) =>
              onTransitionModeChange(
                event.target.value as SlideTransition | "random",
              )
            }
          >
            <option value="random">随机</option>
            <option value="smooth">平滑</option>
            <option value="left">左滑</option>
            <option value="right">右滑</option>
            <option value="blind">百叶窗</option>
            <option value="fade">淡入淡出</option>
            <option value="zoom">缩放切换</option>
            <option value="flip">翻转切换</option>
          </select>
        </label>
        <label className="play-select play-select-inline">
          <span>切换时长</span>
          <select
            value={slideTransitionMs}
            onChange={(event) => onTransitionMsChange(Number(event.target.value))}
          >
            <option value={600}>0.6 秒</option>
            <option value={800}>0.8 秒</option>
            <option value={1000}>1 秒</option>
            <option value={1300}>1.3 秒</option>
            <option value={1500}>1.5 秒</option>
          </select>
        </label>
        <strong className="play-panel-progress" aria-label="当前进度">
          {progress}
        </strong>
      </div>
    </section>
  );
}

function ClassicProfile({ classmate }: { classmate: Classmate }) {
  return (
    <article className="classic-profile">
      <div className="profile-leaves profile-leaves-top" aria-hidden="true" />
      <div className="profile-leaves profile-leaves-bottom" aria-hidden="true" />
      <div className="profile-hello" aria-hidden="true">
        Hello!
      </div>
      <div className="profile-image-panel">
        <AvatarImage
          alt={`${classmate.name}头像`}
          className="classic-avatar"
          src={classmate.avatar}
        />
      </div>

      <section className="profile-info-panel">
        <div className="profile-title-block">
          <h2>{classmate.name}</h2>
          <p aria-hidden="true">Nice to meet you</p>
        </div>
        <div className="profile-line profile-nickname-line">
          <span className="profile-line-label">
            <Feather size={18} />
            花名：<strong>{classmate.title}</strong>
          </span>
          
        </div>
        <div className="profile-line profile-direction-line">
          <span className="profile-line-label">
            <BadgeCheck size={18} />
            3C方向
          </span>
          <strong>{classmate.direction3c}</strong>
        </div>
        <div className="profile-line profile-hobbies-line">
          <span className="profile-line-label">
            <Sparkles size={18} />
            兴趣爱好
          </span>
          <div className="tag-list">
            {classmate.hobbies.map((hobby) => (
              <span key={hobby}>{hobby}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="profile-message-panel">
        <h3>
          <MessageCircle size={18} />
          <span>想说的话</span>
        </h3>
        <p className="message-text">{classmate.message}</p>
      </section>
      <p className="profile-footer-note" aria-hidden="true">
        同学一场，温暖同行
      </p>
    </article>
  );
}

function PostcardProfile({ classmate }: { classmate: Classmate }) {
  return (
    <article className="postcard-profile">
      <AvatarImage
        alt={`${classmate.name}头像`}
        className="postcard-image"
        src={classmate.avatar}
      />
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
          <DetailRow
            icon={BriefcaseBusiness}
            label="行业"
            value={classmate.industry}
            light
          />
          <DetailRow
            icon={MapPin}
            label="籍贯"
            value={classmate.hometown}
            light
          />
          <DetailRow icon={Orbit} label="生肖" value={classmate.zodiac} light />
          <DetailRow
            icon={CakeSlice}
            label="星座"
            value={classmate.constellation}
            light
          />
          <DetailRow
            icon={Tag}
            label="兴趣"
            value={classmate.hobbies.join(" / ")}
            light
          />
          <DetailRow
            icon={BadgeCheck}
            label="3C方向"
            value={classmate.direction3c}
            light
          />
        </div>
        <p className="mt-7 text-base leading-8 text-slate-700">
          {classmate.message}
        </p>
      </div>
    </article>
  );
}

function AvatarImage({
  alt,
  className,
  src,
}: {
  alt: string;
  className: string;
  src: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const resolvedSrc = resolveAvatarSrc(src);

  return (
    <div
      className={`avatar-frame ${className}${isLoaded ? " is-loaded" : ""}`}
    >
      <span className="avatar-loader" aria-hidden="true" />
      <img
        alt={alt}
        className="avatar-main"
        decoding="async"
        height={420}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        src={resolvedSrc}
        width={420}
      />
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  light = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  light?: boolean;
}) {
  const trailingEmoji = getTrailingEmoji(label, value);

  return (
    <div className={light ? "detail-row light" : "detail-row"}>
      <span className="detail-row-label">
        <Icon size={15} />
        <span>{label}</span>
      </span>
      <strong className="detail-row-value">
        <span>{value}</span>
        {trailingEmoji}
      </strong>
    </div>
  );
}

function getTrailingEmoji(label: string, value: string) {
  const normalized = value.replace(/\s+/g, "");

  if (label === "生肖") {
    if (normalized.includes("鼠")) return <span className="zodiac-emoji" aria-hidden="true"><span>🐭</span></span>;
    if (normalized.includes("牛")) return <span className="zodiac-emoji" aria-hidden="true"><span>🐮</span></span>;
    if (normalized.includes("虎")) return <span className="zodiac-emoji" aria-hidden="true"><span>🐯</span></span>;
    if (normalized.includes("兔")) return <span className="zodiac-emoji" aria-hidden="true"><span>🐰</span></span>;
    if (normalized.includes("龙")) return <span className="zodiac-emoji" aria-hidden="true"><span>🐲</span></span>;
    if (normalized.includes("蛇")) return <span className="zodiac-emoji" aria-hidden="true"><span>🐍</span></span>;
    if (normalized.includes("马")) return <span className="zodiac-emoji" aria-hidden="true"><span>🐴</span></span>;
    if (normalized.includes("羊")) return <span className="zodiac-emoji" aria-hidden="true"><span>🐑</span></span>;
    if (normalized.includes("猴")) return <span className="zodiac-emoji" aria-hidden="true"><span>🐒</span></span>;
    if (normalized.includes("鸡")) return <span className="zodiac-emoji" aria-hidden="true"><span>🐔</span></span>;
    if (normalized.includes("狗")) return <span className="zodiac-emoji" aria-hidden="true"><span>🐶</span></span>;
    if (normalized.includes("猪")) return <span className="zodiac-emoji" aria-hidden="true"><span>🐷</span></span>;
  }

  if (label === "星座") {
    if (normalized.includes("白羊")) return <span className="zodiac-emoji" aria-hidden="true"><span>♈</span></span>;
    if (normalized.includes("金牛")) return <span className="zodiac-emoji" aria-hidden="true"><span>♉</span></span>;
    if (normalized.includes("双子")) return <span className="zodiac-emoji" aria-hidden="true"><span>♊</span></span>;
    if (normalized.includes("巨蟹")) return <span className="zodiac-emoji" aria-hidden="true"><span>♋</span></span>;
    if (normalized.includes("狮子")) return <span className="zodiac-emoji" aria-hidden="true"><span>♌</span></span>;
    if (normalized.includes("处女")) return <span className="zodiac-emoji" aria-hidden="true"><span>♍</span></span>;
    if (normalized.includes("天秤")) return <span className="zodiac-emoji" aria-hidden="true"><span>♎</span></span>;
    if (normalized.includes("天蝎")) return <span className="zodiac-emoji" aria-hidden="true"><span>♏</span></span>;
    if (normalized.includes("射手")) return <span className="zodiac-emoji" aria-hidden="true"><span>♐</span></span>;
    if (normalized.includes("摩羯")) return <span className="zodiac-emoji" aria-hidden="true"><span>♑</span></span>;
    if (normalized.includes("水瓶")) return <span className="zodiac-emoji" aria-hidden="true"><span>♒</span></span>;
    if (normalized.includes("双鱼")) return <span className="zodiac-emoji" aria-hidden="true"><span>♓</span></span>;
  }

  return null;
}

function InfoPill({
  icon,
  label,
  prefix,
}: {
  icon: ReactNode;
  label: string;
  prefix?: string;
}) {
  return (
    <span className="info-pill">
      {icon}
      <span className="info-pill-text">
        {prefix && <strong>{prefix}：</strong>}
        <span>{label}</span>
      </span>
    </span>
  );
}

function Skyline() {
  return (
    <div aria-hidden="true" className="skyline">
      <img alt="" decoding="async" fetchPriority="low" src={shanghaiSkyline} />
      <div className="river" />
    </div>
  );
}

export default App;
