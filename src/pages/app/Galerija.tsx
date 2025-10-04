import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── Supabase client (inline, safe) ─────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnon);

// ── Types ─────────────────────────────────────────────────────────────────────
type Asset = {
  id: string;
  user_id: string;
  kind: "image" | "video";
  status: "processing" | "ready" | "failed";
  src_url: string | null;
  thumb_url: string | null;
  // legacy/compat (videos table etc.)
  thumbnail_url?: string | null;
  prompt: string | null;
  inputs: any | null;
  posted_to: string[] | any;
  created_at: string;
};

type FilterTab = "all" | "image" | "video";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function StatusChip({ status }: { status: Asset["status"] }) {
  const color =
    status === "ready" ? "bg-emerald-500" : status === "failed" ? "bg-rose-500" : "bg-amber-500";
  const label =
    status === "ready" ? "Spremno" : status === "failed" ? "Neuspešno" : "Obrada u toku…";
  return (
    <span className={`text-[11px] text-white px-2 py-[2px] rounded ${color}`}>{label}</span>
  );
}

function PlatformChips({ posted_to }: { posted_to: Asset["posted_to"] }) {
  const arr: string[] = Array.isArray(posted_to)
    ? posted_to
    : typeof posted_to === "object" && posted_to !== null
    ? Object.entries(posted_to)
        .filter(([, v]) => v)
        .map(([k]) => k)
    : [];
  if (!arr.length) return null;
  return (
    <div className="flex gap-1 flex-wrap">
      {arr.map((p) => (
        <span
          key={p}
          className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-100 px-2 py-[1px] rounded"
        >
          {p}
        </span>
      ))}
    </div>
  );
}

// Choose the best preview source; this is the critical fix.
const pickImgSrc = (item: Asset) =>
  item.thumb_url || item.thumbnail_url || item.src_url || "";

// ── Card ──────────────────────────────────────────────────────────────────────
function GalleryCard({ item, onOpen }: { item: Asset; onOpen: (id: string) => void }) {
  const imgSrc = useMemo(() => pickImgSrc(item), [item]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
        {item.kind === "video" ? (
          item.src_url ? (
            <video
              src={item.src_url}
              poster={item.thumb_url ?? undefined}
              className="w-full h-full object-cover"
              muted
              controls
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-xs text-slate-500">
              Nema videa
            </div>
          )
        ) : imgSrc ? (
          <img src={imgSrc} alt={item.prompt ?? "Asset"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-xs text-slate-500">
            Nema pregleda
          </div>
        )}

        {item.status !== "ready" && (
          <div className="absolute inset-0 bg-black/45 text-white flex flex-col items-center justify-center text-sm">
            <div className="text-[11px] mb-1 bg-amber-500 px-2 py-[2px] rounded">
              Obrada u toku…
            </div>
            <div className="animate-spin h-5 w-5 border-2 border-white/70 border-t-transparent rounded-full" />
          </div>
        )}

        <div className="absolute left-2 top-2">
          <StatusChip status={item.status} />
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="text-[11px] text-slate-500">{fmtDate(item.created_at)}</div>
        <div className="text-sm line-clamp-2">
          {item.kind === "image"
            ? item.prompt || "—"
            : (item.inputs && JSON.stringify(item.inputs).slice(0, 100)) || "—"}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <PlatformChips posted_to={item.posted_to} />
          <div className="flex items-center gap-1">
            <a
              className={`text-xs px-2 py-1 rounded border ${
                item.status === "ready"
                  ? "border-slate-300 hover:bg-slate-50"
                  : "border-slate-200 text-slate-400 pointer-events-none opacity-60"
              }`}
              href={item.src_url || imgSrc || undefined}
              target="_blank"
              rel="noreferrer"
            >
              Preuzmi
            </a>
            <button
              className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
              onClick={() => onOpen(item.id)}
            >
              Detalji
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GalerijaPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const perPage = 24;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
    });
  }, []);

  // Initial fetch + pagination
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function fetchPage(p = 0) {
      setLoading(true);
      const from = p * perPage;
      const to = from + perPage - 1;

      let q = supabase
        .from("assets")
        .select(
          "id,user_id,kind,status,src_url,thumb_url,thumbnail_url,prompt,inputs,posted_to,created_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filter === "image") q = q.eq("kind", "image");
      if (filter === "video") q = q.eq("kind", "video");

      const { data, error } = await q;
      if (cancelled) return;

      if (error) {
        console.error(error);
      } else {
        setItems((prev) => (p === 0 ? (data as Asset[]) : [...prev, ...(data as Asset[])]));
        setHasMore((data?.length ?? 0) === perPage);
      }
      setLoading(false);
    }

    fetchPage(0);
    setPage(0);

    return () => {
      cancelled = true;
    };
  }, [userId, filter]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return;
    const el = loadMoreRef.current;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        const next = page + 1;
        setPage(next);
        (async () => {
          const from = next * perPage;
          const to = from + perPage - 1;

          let q = supabase
            .from("assets")
            .select(
              "id,user_id,kind,status,src_url,thumb_url,thumbnail_url,prompt,inputs,posted_to,created_at",
            )
            .eq("user_id", userId!)
            .order("created_at", { ascending: false })
            .range(from, to);

          if (filter === "image") q = q.eq("kind", "image");
          if (filter === "video") q = q.eq("kind", "video");

          const { data, error } = await q;
          if (error) {
            console.error(error);
          } else {
            setItems((prev) => [...prev, ...(data as Asset[])]);
            setHasMore((data?.length ?? 0) === perPage);
          }
        })();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [page, hasMore, loading, filter, userId]);

  // Realtime (if enabled)
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("assets-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assets", filter: `user_id=eq.${userId}` },
        (payload) => {
          setItems((prev) => {
            const row = payload.new as Asset;
            const idx = prev.findIndex((p) => p.id === row.id);
            if (idx === -1) return [row, ...prev]; // prepend new
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...row };
            return copy;
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const filtered = items; // server-side filtered already

  const onOpen = (id: string) => {
    // Basic navigation without knowing your router:
    window.location.assign(`/app/galerija/${id}`);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Moja galerija</h1>
        <div className="flex gap-2">
          {(["all", "image", "video"] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-sm px-3 py-1 rounded border ${
                filter === t ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : ""
              }`}
            >
              {t === "all" ? "Svi" : t === "image" ? "Fotografije" : "Video"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
        {filtered.map((it) => (
          <GalleryCard key={it.id} item={it} onOpen={onOpen} />
        ))}
      </div>

      <div ref={loadMoreRef} className="h-8" />
      {loading && <div className="text-center text-sm text-slate-500 my-4">Učitavanje…</div>}
    </div>
  );
}
