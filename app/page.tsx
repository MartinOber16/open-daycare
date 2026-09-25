import { PostCard } from "@/components/post-card";
import { Sidebar } from "@/components/sidebar";
import { CameraIcon } from "@/components/icons";
import { posts, session } from "@/lib/mock/feed";

export default function Home() {
  const firstName = session.name.split(" ")[0];

  return (
    <div className="flex min-h-[100vh]">
      <Sidebar session={session} />

      <main className="h-[100vh] min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-[40px] pt-[34px] pb-[80px]">
          <div className="mb-[24px]">
            <div className="mb-[4px] text-[12.5px] font-extrabold tracking-[0.8px] text-terracotta">
              GUARDERÍA · SALA SOLES
            </div>
            <h1 className="font-fredoka text-[30px] font-semibold text-brown">
              Buenas, {firstName}
            </h1>
            <p className="mt-[5px] text-[14.5px] text-text-faint">
              {session.childrenCount} niños · {session.date}
            </p>
          </div>

          <span className="mb-[24px] flex items-center gap-[14px] rounded-[18px] border border-border bg-card px-[18px] py-[14px] shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]">
            <div className="flex size-[40px] flex-none items-center justify-center rounded-full bg-orange font-fredoka text-[16px] font-semibold text-white">
              {session.initial}
            </div>
            <span className="flex-1 text-[15px] text-text-soft">
              Compartí un momento…
            </span>
            <span className="flex size-[38px] flex-none items-center justify-center rounded-[12px] bg-coral-soft text-heart">
              <CameraIcon className="size-[19px]" />
            </span>
          </span>

          <div className="mb-[14px] flex items-center gap-[14px]">
            <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-text-today">
              PUBLICADO HOY
            </span>
            <span className="h-px flex-1 bg-divider" />
          </div>

          <div className="flex flex-col gap-[16px]">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
