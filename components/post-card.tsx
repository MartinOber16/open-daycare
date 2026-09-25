"use client";

import { useState } from "react";
import type { AvatarPalette, Post, PostType } from "@/lib/mock/feed";
import {
  CommentIcon,
  HeartIcon,
  ImageIcon,
  MegaphoneIcon,
} from "@/components/icons";

const badgeStyles: Record<PostType, { label: string; className: string }> = {
  milestone: { label: "LOGRO", className: "bg-green-soft text-green" },
  activity: { label: "ACTIVIDAD", className: "bg-sky-soft text-sky" },
  announcement: { label: "ANUNCIO", className: "bg-indigo-soft text-indigo" },
};

const avatarStyles: Record<AvatarPalette, string> = {
  child: "bg-avatar-child text-avatar-child-text",
  staff: "bg-orange text-white",
  system: "bg-indigo-soft text-indigo",
};

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const badge = badgeStyles[post.type];

  function toggleLike() {
    if (liked) {
      setLikes(likes - 1);
      setLiked(false);
    } else {
      setLikes(likes + 1);
      setLiked(true);
    }
  }

  return (
    <article className="rounded-[20px] border border-border bg-card px-[22px] py-[20px] shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
      <div className="mb-[14px] flex items-center gap-[12px]">
        <div
          className={`flex size-[44px] flex-none items-center justify-center rounded-full font-fredoka text-[17px] font-semibold ${avatarStyles[post.author.palette]}`}
        >
          {post.author.icon === "megaphone" ? (
            <MegaphoneIcon className="size-[20px]" />
          ) : (
            post.author.initial
          )}
        </div>
        <div className="flex-1">
          <div className="font-fredoka text-[16.5px] font-semibold text-brown">
            {post.author.name}
          </div>
          <div className="text-[12.5px] text-text-soft">{post.author.meta}</div>
        </div>
        <div
          className={`flex items-center gap-[7px] rounded-[999px] px-[12px] py-[6px] ${badge.className}`}
        >
          <span className="size-[8px] rounded-full bg-current" />
          <span className="text-[12px] font-extrabold tracking-[0.5px]">
            {badge.label}
          </span>
        </div>
      </div>

      <div className="mb-[10px] text-[12.5px] text-text-soft">
        {post.audience}
      </div>

      <p className="text-[15.5px] leading-[1.55] text-brown-body">{post.body}</p>

      {post.photo && (
        <div className="mt-[14px] flex h-[200px] flex-col items-center justify-center gap-[8px] rounded-[16px] border-[1.5px] border-dashed border-photo-frame bg-amber text-photo-text">
          <ImageIcon className="size-[30px]" />
          <span className="text-[13.5px]">{post.photo.alt}</span>
        </div>
      )}

      <div className="mt-[16px] flex items-center gap-[18px] border-t border-border-soft pt-[14px]">
        <button
          type="button"
          onClick={toggleLike}
          className="flex items-center gap-[7px] text-[14px] font-bold text-heart"
        >
          <HeartIcon
            className={`size-[19px] ${liked ? "fill-heart" : "fill-none"}`}
          />
          {likes}
        </button>
        <span className="flex items-center gap-[7px] text-[14px] font-bold text-text-faint">
          <CommentIcon className="size-[18px]" />
          {post.comments}
        </span>
        <span className="flex-1" />
        <span className="text-[14px] font-extrabold text-terracotta-strong">
          Editar
        </span>
      </div>
    </article>
  );
}
