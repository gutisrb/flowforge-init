// Moja galerija – drop-in page for /app/library
// Paste this into the file that currently renders /app/library.
// No router changes needed.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/** ───────────────────────────────────────────────────────────────────────────
 *  Minimal inline Supabase client (uses your existing env values)
 *  If your project already exports a supabase client, you can swap this for:
 *    import { supabase } from "@/lib/supabaseClient";
 *  but this inline client is safe and self-contained.
 *  ────────────────────────────────────────────────────────────────────────── */
const SUPABASE_URL = import.meta?.env?.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta?.env?.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

/** Data shape from public.assets (kept loose to avoid TS friction) */
type Asset = {
  id: string;
  user_id: string;
  kind: "image" | "video";
  status: "processing" | "ready" | "failed";
  src_url: string | null;
  thumb_url: string | null;
  thumbnail_url?: string | null; // legacy (videos table)
  prompt: string | null;
  inputs: any | null;
  posted_to: any;
  created_at: string;
};

type Tab = "all" | "image" | "video";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const pickImgSrc = (a: Asset) =>
  a?.thumb_url || a?.thumbnail_url || a?.src_url || "";

/** Small chips */
function StatusChip({ status }: { status: Asset["status"] }) {
  const color =
    status === "ready" ? "bg-emerald-500" : status === "failed" ? "bg-rose-500" : "bg-amber-500";
  const label =
    status === "ready" ? "Spremno" : status === "failed" ? "Neuspešno" : "Obrada u toku…";
  return <span className={`text-[11px] text-white px-2 py-[2px] rounded ${color}`}>{label}</span>;
}

function PlatformChips({ posted_to }: { posted_to: any }) {
  const arr: string[] = Array.isArray(posted_to)
    ? posted_to
    : typeof posted_to === "object" && posted_to
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

/** One card */
function GalleryCard({ item, onOpen }: { item: Asset; onOpen: (x: Asset) => void }) {
  const imgSrc = useMemo(() => pickImgSrc(item), [item]);
  const canDownload = item.status === "ready" && (item.src_url || imgSrc);

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
            <div className="text-[11px] mb-1 bg-amber-500 px-2 py-[2px] rounded">Obrada u toku…</div>
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
                canDownload
                  ? "border-slate-300 hover:bg-slate-50"
                  : "border-slate-200 text-slate-400 pointer-events-none opacity-60"
              }`}
              href={(item.src_url || imgSrc) || undefined}
              target="_blank"
              rel="noreferrer"
            >
              Preuzmi
            </a>
            <button
              className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
              onClick={() => onOpen(item)}
            >
              Detalji
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Detail modal (no routing changes) */
function DetailModal({
  item,
  onClose,
}: {
  item: Asset | null;
  onClose: () => void;
}) {
  if (!item) return null;
  const imgSrc = pickImgSrc(item);
  const posted =
    Array.isArray(item.posted_to)
      ? (item.posted_to as string[])
      : typeof item.posted_to === "object" && item.posted_to
      ? Object.entries(item.posted_to)
          .filter(([, v]) => v)
          .map(([k]) => k)
      : [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-5xl w-full overflow-hidden" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="font-semibold">Detalji</div>
          <button onClick={onClose} className="text-sm">Zatvori</button>
        </div>
        <div className="grid md:grid-cols-2 gap-6 p-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="relative bg-slate-100 dark:bg-slate-800 aspect-[4/3]">
              {item.kind === "video" ? (
                item.src_url ? (
                  <video
                    src={item.src_url}
                    poster={item.thumb_url ?? undefined}
                    className="w-full h-full object-contain bg-black"
                    controls
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-xs text-slate-500">
                    Nema videa
                  </div>
                )
              ) : imgSrc ? (
                <img src={imgSrc} alt={item.prompt ?? "Asset"} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full grid place-items-center text-xs text-slate-500">
                  Nema pregleda
                </div>
              )}
              {item.status !== "ready" && (
                <div className="absolute inset-0 bg-black/45 text-white flex flex-col items-center justify-center text-sm">
                  <div className="text-[11px] mb-1 bg-amber-500 px-2 py-[2px] rounded">
                    Obrada u toku… obično par minuta.
                  </div>
                  <div className="animate-spin h-5 w-5 border-2 border-white/70 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs text-slate-500">Kreirano: {fmtDate(item.created_at)}</div>

            {item.kind === "image" && (
              <div>
                <div className="text-sm font-medium mb-1">Prompt</div>
                <pre className="text-xs p-3 rounded bg-slate-100 dark:bg-slate-800 overflow-auto whitespace-pre-wrap">
                  {item.prompt || "—"}
                </pre>
              </div>
            )}

            {item.kind === "video" && (
              <div>
                <div className="text-sm font-medium mb-1">Ulazi (inputs)</div>
                <pre className="text-xs p-3 rounded bg-slate-100 dark:bg-slate-800 overflow-auto">
                  {item.inputs ? JSON.stringify(item.inputs, null, 2) : "—"}
                </pre>
              </div>
            )}

            {!!posted.length && (
              <div>
                <div className="text-sm font-medium mb-1">Objavljeno na</div>
                <div className="flex gap-1 flex-wrap">
                  {posted.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-100 px-2 py-[1px] rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <a
                className={`text-sm px-3 py-1 rounded border ${
                  item.status === "ready" && (item.src_url || imgSrc)
                    ? "border-slate-300 hover:bg-slate-50"
                    : "border-slate-200 text-slate-400 pointer-events-none opacity-60"
                }`}
                href={(item.src_url || imgSrc) || undefined}
                target="_blank"
                rel="noreferrer"
              >
                Preuzmi
              </a>
              <button
                className="text-sm px-3 py-1 rounded border border-slate-300 hover:bg-slate-50"
                onClick={() => {
                  if (!item.src_url && !imgSrc) return;
                  navigator.clipboard.writeText(item.src_url || imgSrc);
                }}
              >
                Kopiraj URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Main page */
export default function LibraryPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [rows, setRows] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const perPage = 24;
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Asset | null>(null);

  // auth
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setError(error.message);
      }
      setUid(data.user?.id ?? null);
      setAuthChecked(true);
    })();
  }, []);

  // initial + tab change
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const from = 0;
      const to = perPage - 1;

      let q = supabase
        .from("assets")
        .select(
          "id,user_id,kind,status,src_url,thumb_url,thumbnail_url,prompt,inputs,posted_to,created_at",
        )
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (tab === "image") q = q.eq("kind", "image");
      if (tab === "video") q = q.eq("kind", "video");

      const { data, error } = await q;

      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setRows((data as Asset[]) || []);
        setHasMore((data?.length ?? 0) === perPage);
        setPage(0);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [uid, tab]);

  // infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return;
    const el = loadMoreRef.current;

    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      (async () => {
        const next = page + 1;
        const from = next * perPage;
        const to = from + perPage - 1;

        let q = supabase
          .from("assets")
          .select(
            "id,user_id,kind,status,src_url,thumb_url,thumbnail_url,prompt,inputs,posted_to,created_at",
          )
          .eq("user_id", uid!)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (tab === "image") q = q.eq("kind", "image");
        if (tab === "video") q = q.eq("kind", "video");

        const { data, error } = await q;
        if (error) {
          setError(error.message);
          return;
        }
        setRows((prev) => [...prev, ...((data as Asset[]) || [])]);
        setHasMore((data?.length ?? 0) === perPage);
        setPage(next);
      })();
    });

    io.observe(el);
    return () => io.disconnect();
  }, [page, hasMore, loading, tab, uid]);

  // realtime updates (safe if disabled)
  useEffect(() => {
    if (!uid) return;
    const ch = supabase
      .channel("assets_realtime_client")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assets", filter: `user_id=eq.${uid}` },
        (payload) => {
          const row = payload.new as Asset;
          setRows((prev) => {
            const idx = prev.findIndex((p) => p.id === row.id);
            if (idx === -1) return [row, ...prev];
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...row };
            return copy;
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [uid]);

  if (!authChecked) return <div className="p-4">Učitavanje…</div>;
  if (!uid) return <div className="p-4">Morate biti prijavljeni.</div>;
  if (error) return <div className="p-4 text-rose-600">Greška: {error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Moja galerija</h1>
        <div className="flex gap-2">
          {(["all", "image", "video"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm px-3 py-1 rounded border ${
                tab === t ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : ""
              }`}
            >
              {t === "all" ? "Svi" : t === "image" ? "Fotografije" : "Video"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
        {rows.map((item) => (
          <GalleryCard key={item.id} item={item} onOpen={(it) => setDetail(it)} />
        ))}
      </div>

      <div ref={loadMoreRef} className="h-8" />
      {loading && <div className="text-center text-sm text-slate-500 my-4">Učitavanje…</div>}

      <DetailModal item={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
