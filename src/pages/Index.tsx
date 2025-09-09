// pages/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

type Img = { id: string; file: File; url: string };
type Slot = { id: string; images: Img[] };

const MAX_SLOTS = 6;
const MAX_PER_SLOT = 2;
const MAX_TOTAL = 12; // your Make scenario can accept up to 12 files

const WEBHOOK_URL =
  import.meta.env.VITE_MAKE_WEBHOOK_URL ||
  "https://hook.integromat.com/REPLACE_WITH_YOUR_MAKE_WEBHOOK"; // <-- set .env

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function Home() {
  const [slotCount, setSlotCount] = useState<5 | 6>(6);
  const [slots, setSlots] = useState<Slot[]>(
    Array.from({ length: 6 }, () => ({ id: uid(), images: [] }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // initialize slot count
  useEffect(() => {
    setSlots((prev) => {
      const n = slotCount;
      const copy = [...prev];
      if (copy.length > n) return copy.slice(0, n);
      if (copy.length < n) {
        const extra = Array.from({ length: n - copy.length }, () => ({
          id: uid(),
          images: [],
        }));
        return [...copy, ...extra];
      }
      return copy;
    });
  }, [slotCount]);

  // revoke object URLs
  useEffect(() => {
    return () => {
      slots.forEach((s) => s.images.forEach((im) => URL.revokeObjectURL(im.url)));
    };
  }, [slots]);

  const totalImages = useMemo(
    () => slots.reduce((acc, s) => acc + s.images.length, 0),
    [slots]
  );

  const canAddMore = totalImages < Math.min(MAX_TOTAL, slotCount * MAX_PER_SLOT);

  // drop or picker → add many files, auto-fill available positions (max 12, max 2 per slot)
  const handleBulkAdd = (files: FileList | null) => {
    if (!files || !files.length) return;

    const toAdd: File[] = Array.from(files).slice(
      0,
      Math.min(MAX_TOTAL - totalImages, files.length)
    );

    setSlots((prev) => {
      const next = prev.map((s) => ({ ...s, images: [...s.images] }));
      for (const f of toAdd) {
        // find first slot that has capacity
        const target = next.find((s) => s.images.length < MAX_PER_SLOT);
        if (!target) break;
        target.images.push({ id: uid(), file: f, url: URL.createObjectURL(f) });
      }
      return next;
    });
  };

  // add to specific slot
  const addToSlot = (slotIndex: number, files: FileList | null) => {
    if (!files?.length) return;
    setSlots((prev) => {
      const next = prev.map((s) => ({ ...s, images: [...s.images] }));
      for (const f of Array.from(files)) {
        if (next[slotIndex].images.length >= MAX_PER_SLOT) break;
        if (!canAddMore) break;
        next[slotIndex].images.push({ id: uid(), file: f, url: URL.createObjectURL(f) });
      }
      return next;
    });
  };

  // delete single image
  const removeImage = (slotIndex: number, imgId: string) => {
    setSlots((prev) => {
      const next = prev.map((s) => ({ ...s, images: s.images.filter((i) => i.id !== imgId) }));
      return next;
    });
  };

  // clear all
  const refreshAll = () => {
    setSlots(Array.from({ length: slotCount }, () => ({ id: uid(), images: [] })));
  };

  // basic HTML5 DnD for slots
  const dragSlotFrom = useRef<number | null>(null);
  const onSlotDragStart = (i: number) => (e: React.DragEvent) => {
    dragSlotFrom.current = i;
    e.dataTransfer.setData("text/plain", String(i));
    e.dataTransfer.effectAllowed = "move";
  };
  const onSlotDrop = (to: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragSlotFrom.current;
    dragSlotFrom.current = null;
    if (from === null || from === to || from === undefined) return;
    setSlots((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  };

  // DnD for images between slots
  const dragImgPayload = useRef<{ slot: number; imgId: string } | null>(null);
  const onImgDragStart =
    (slot: number, imgId: string) => (e: React.DragEvent<HTMLImageElement>) => {
      dragImgPayload.current = { slot, imgId };
      e.dataTransfer.setData("text/plain", imgId);
      e.dataTransfer.effectAllowed = "move";
    };
  const onSlotDragOver = (e: React.DragEvent) => e.preventDefault();
  const onSlotImgDrop = (toSlot: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragImgPayload.current) return;
    const { slot: fromSlot, imgId } = dragImgPayload.current;
    dragImgPayload.current = null;

    setSlots((prev) => {
      if (toSlot === fromSlot) return prev;
      const next = prev.map((s) => ({ ...s, images: [...s.images] }));
      const fromImgs = next[fromSlot].images;
      const imgIdx = fromImgs.findIndex((i) => i.id === imgId);
      if (imgIdx === -1) return prev;
      const img = fromImgs[imgIdx];
      if (next[toSlot].images.length >= MAX_PER_SLOT) return prev; // block if full
      fromImgs.splice(imgIdx, 1);
      next[toSlot].images.push(img);
      return next;
    });
  };

  // submit → one webhook call PER SLOT
  const submitToMake = async () => {
    setIsSubmitting(true);
    try {
      for (let sIndex = 0; sIndex < slots.length; sIndex++) {
        const s = slots[sIndex];
        if (s.images.length === 0) continue;

        const fd = new FormData();
        // put first/second image into image_0 / image_1 (your Make flow reads these)
        fd.append("image_0", s.images[0].file, s.images[0].file.name);
        if (s.images[1]) fd.append("image_1", s.images[1].file, s.images[1].file.name);

        // required text fields your scenario parses / uses
        fd.append("layout", String(slotCount)); // 5 or 6
        fd.append(
          "grouping",
          JSON.stringify({
            // Make step 2 parses this and step 3/4 uses first/second index (0 or 1)
            files: s.images.length === 2 ? [0, 1] : [0],
            slot: sIndex + 1,
          })
        );
        fd.append("total_images", String(totalImages));
        fd.append("timestamp", new Date().toISOString());
        fd.append("slot_mode_info", s.images.length === 2 ? "morph" : "single");

        // Optional: any extra fields you already send (title, price, etc.) can be appended here.

        const res = await fetch(WEBHOOK_URL, { method: "POST", body: fd });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Webhook ${sIndex + 1} failed: ${res.status} ${text}`);
        }
      }
      alert("Poslato! (po jedan zahtev po slotu)");
    } catch (e: any) {
      alert(e.message || "Greška pri slanju webhuka.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header / Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <b>Broj klipova:</b>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="slotCount"
                checked={slotCount === 5}
                onChange={() => setSlotCount(5)}
              />
              5
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="slotCount"
                checked={slotCount === 6}
                onChange={() => setSlotCount(6)}
              />
              6
            </label>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-block">
              <span className="sr-only">Otpremi fotografije</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleBulkAdd(e.target.files)}
                className="hidden"
              />
              <span className="rounded-md bg-cyan-600 px-4 py-2 text-white cursor-pointer hover:bg-cyan-700">
                Otpremi fotografije (mass)
              </span>
            </label>

            <button
              type="button"
              onClick={refreshAll}
              className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
              title="Ukloni sve slike"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={submitToMake}
              disabled={isSubmitting || totalImages === 0}
              className="rounded-md bg-emerald-600 px-4 py-2 text-white disabled:opacity-50 hover:bg-emerald-700"
            >
              {isSubmitting ? "Šaljem…" : "Generiši"}
            </button>
          </div>
        </div>

        {/* Counter */}
        <div className="mt-2 text-sm text-gray-600">
          {totalImages}/{Math.min(MAX_TOTAL, slotCount * MAX_PER_SLOT)} fotografija
        </div>

        {/* Slots grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot, i) => (
            <div
              key={slot.id}
              draggable
              onDragStart={onSlotDragStart(i)}
              onDragOver={onSlotDragOver}
              onDrop={onSlotDrop(i)}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">Slot {i + 1}</div>
                <div className="text-xs text-gray-500">
                  {slot.images.length} / {MAX_PER_SLOT}
                </div>
              </div>

              <div
                className="mb-3 grid grid-cols-2 gap-3"
                onDragOver={onSlotDragOver}
                onDrop={onSlotImgDrop(i)}
              >
                {slot.images.map((im) => (
                  <div key={im.id} className="relative">
                    <img
                      src={im.url}
                      draggable
                      onDragStart={onImgDragStart(i, im.id)}
                      className="h-28 w-full rounded-lg object-cover"
                      alt=""
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i, im.id)}
                      className="absolute right-1 top-1 rounded bg-black/70 px-2 py-1 text-xs text-white"
                      title="Obriši"
                    >
                      X
                    </button>
                  </div>
                ))}
                {/* Add box */}
                {slot.images.length < MAX_PER_SLOT && (
                  <label className="flex h-28 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-center text-xs text-gray-500 hover:bg-gray-50">
                    Dodaj 1 ili 2 fotografije
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => addToSlot(i, e.target.files)}
                    />
                  </label>
                )}
              </div>

              <p className="text-xs text-gray-500">
                Drag & drop: pomeraj slotove ili prevuci sliku u drugi slot.
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
