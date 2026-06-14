"use client";

import { useState, useTransition } from "react";
import { Card } from "./ui";
import { inputClass, labelClass } from "./Sheet";
import { updateProfile } from "@/app/actions";

const AVATARS = ["🙂", "😎", "🦊", "🐼", "🚀", "🌱", "💼", "🧑‍💻", "👑", "🐯", "🍀", "⭐"];

export function ProfileView({
  fullName,
  nickname,
  avatarEmoji,
  email,
}: {
  fullName: string;
  nickname: string;
  avatarEmoji: string;
  email: string;
}) {
  const [name, setName] = useState(fullName);
  const [nick, setNick] = useState(nickname);
  const [emoji, setEmoji] = useState(avatarEmoji);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function save() {
    if (!name.trim() || !nick.trim()) return;
    start(async () => {
      await updateProfile({ fullName: name.trim(), nickname: nick.trim(), avatarEmoji: emoji });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <>
      <div className="flex flex-col items-center py-2">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-soft text-5xl shadow-[var(--shadow-card)]">
          {emoji}
        </div>
        <p className="mt-3 text-lg font-bold">{nick || name}</p>
        <p className="text-sm text-text-muted">{email}</p>
      </div>

      <Card>
        <label className={labelClass}>Avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setEmoji(a)}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${emoji === a ? "bg-accent/15 ring-2 ring-accent" : "bg-surface-2"}`}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className={labelClass}>Full name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mt-4">
          <label className={labelClass}>Nickname (used in greetings)</label>
          <input className={inputClass} value={nick} onChange={(e) => setNick(e.target.value)} />
        </div>
        <div className="mt-4">
          <label className={labelClass}>Currency</label>
          <input className={`${inputClass} opacity-60`} value="LKR (Sri Lankan Rupee)" disabled />
        </div>

        <button
          onClick={save}
          disabled={pending}
          className="mt-5 w-full rounded-2xl bg-accent py-3.5 font-semibold text-on-hero shadow-[var(--shadow-hero)] transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? "Saving…" : saved ? "Saved ✓" : "Save Profile"}
        </button>
      </Card>
    </>
  );
}
