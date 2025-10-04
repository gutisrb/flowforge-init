import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);

type Asset = {
  id: string;
  kind: "image" | "video";
  status: "processing" | "ready" | "failed";
  src_url: string | null;
  thumb_url: string | null;
  thumbnail_url?: string | null; // legacy
  prompt: string | null;
  inputs: any | null;
  posted_to: string[] | any;
  created_at: string;
  width: number | null;
  height: number | null;
  duration: number | null;
};

const pickImgSrc = (a: Asset) => a.thumb_url || a.thumbnail_url || a.src_url || "";

export default function GalerijaDetalj() {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  // naive id extraction from path: /app/galerija/:id
  const id = decodeURIComponent(window.location.pathname.split("/").pop() || "");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select(
          "id,kind,status,src_url,thumb_url,thumbnail_url,prompt,inputs,posted_to,created_at,width,height,duration",
        )
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error(error);
      } else {
        setAsset((data as Asset) || null);
      }
      setLoading(false);
    }
    load();

    // while processing, auto-refresh
    const t = setInterval(() => {
      if (asset?.status === "processing") load();
    }, 7000);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, asset?.status]);

  if (loading && !asset) {
    return <div className="p-4">Učitavanje…</div>;
  }

  if (!asset) {
    return <div className="p-4">Nije pronađeno.</div>;
  }

  const imgSrc = pickImgSrc(asset);

  const posted =
    Array.isArray(asset.posted_to)
      ? (asset.posted_to as string[])
      : typeof asset.posted_to === "object" && asset.posted_to !== null
      ? Object.entries(asset.posted_to)
          .filter(([, v]) => v)
          .map(([k]) => k)
      : [];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <button className="mb-4 text-sm underline" onClick={() => window.history.back()}>
        ← Nazad
      </button>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="relative bg-slate-100 dark:bg-slate-800 aspect-[4/3]">
            {asset.kind === "video" ? (
              asset.src_url ? (
                <video
                  src={asset.src_url}
                  poster={asset.thumb_url ?? undefined}
                  className="w-full h-full object-contain bg-black"
                  controls
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-xs text-slate-500">
                  Nema videa
                </div>
              )
            ) : imgSrc ? (
              <img src={imgSrc} alt={asset.prompt ?? "Asset"} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full grid place-items-center text-xs text-slate-500">
                Nema pregleda
              </div>
            )}

            {asset.status !== "ready" && (
              <div className="absolute inset-0 bg-black/45 text-white flex flex-col items-center justify-center text-sm">
                <div className="text-[11px] mb-1 bg-amber-500 px-2 py-[2px] rounded">
                  Obrada u toku… obično par minuta.
                </div>
                <div className="animate-spin h-5 w-5 border-2 border-white/70 border-t-transparent rounded-full" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Kreirano: {new Date(asset.created_at).toLocaleString()}
          </div>

          {asset.kind === "image" && (
            <div>
              <div className="text-sm font-medium mb-1">Prompt</div>
              <pre className="text-xs p-3 rounded bg-slate-100 dark:bg-slate-800 overflow-auto">
                {asset.prompt || "—"}
              </pre>
            </div>
          )}

          {asset.kind === "video" && (
            <div>
              <div className="text-sm font-medium mb-1">Ulazi (inputs)</div>
              <pre className="text-xs p-3 rounded bg-slate-100 dark:bg-slate-800 overflow-auto">
                {asset.inputs ? JSON.stringify(asset.inputs, null, 2) : "—"}
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

          <div className="flex gap-2 pt-2">
            <button
              className={`text-sm px-3 py-1 rounded border ${
                asset.status === "ready"
                  ? "border-slate-300 hover:bg-slate-50"
                  : "border-slate-200 text-slate-400 pointer-events-none opacity-60"
              }`}
              onClick={() => {
                if (!asset.src_url && !imgSrc) return;
                window.open(asset.src_url || imgSrc, "_blank", "noopener,noreferrer");
              }}
            >
              Preuzmi
            </button>
            <button
              className="text-sm px-3 py-1 rounded border border-slate-300 hover:bg-slate-50"
              onClick={() => {
                if (!asset.src_url && !imgSrc) return;
                navigator.clipboard.writeText(asset.src_url || imgSrc);
              }}
            >
              Kopiraj URL
            </button>
          </div>

          <div className="text-xs text-slate-500">
            {asset.width && asset.height ? `Rezolucija: ${asset.width}×${asset.height}` : null}
            {asset.duration ? ` • Trajanje: ${asset.duration}s` : null}
          </div>
        </div>
      </div>
    </div>
  );
}
