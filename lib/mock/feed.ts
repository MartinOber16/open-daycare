export type PostType = "milestone" | "activity" | "announcement";
export type AvatarPalette = "child" | "staff" | "system";

export interface Author {
  name: string;
  meta: string;
  initial?: string;
  icon?: "megaphone";
  palette: AvatarPalette;
}

export interface Post {
  id: string;
  type: PostType;
  author: Author;
  audience: string;
  body: string;
  photo?: { alt: string };
  likes: number;
  liked: boolean;
  comments: number;
}

export interface Session {
  name: string;
  role: string;
  initial: string;
  classroom: string;
  childrenCount: number;
  date: string;
}

export const session: Session = {
  name: "Caro Giménez",
  role: "Maestra · Soles",
  initial: "C",
  classroom: "Sala Soles",
  childrenCount: 12,
  date: "martes 17 jun",
};

export const posts: Post[] = [
  {
    id: "logro-orinal",
    type: "milestone",
    author: {
      name: "Mateo",
      meta: "14:20 · publicado por vos",
      initial: "M",
      palette: "child",
    },
    audience: "Para: familia de Mateo",
    body: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    likes: 3,
    liked: true,
    comments: 1,
  },
  {
    id: "actividad-temperas",
    type: "activity",
    author: {
      name: "Mateo",
      meta: "09:40 · publicado por vos",
      initial: "M",
      palette: "child",
    },
    audience: "Para: familia de Mateo",
    body: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photo: { alt: "Foto · pintando con témperas" },
    likes: 5,
    liked: true,
    comments: 2,
  },
  {
    id: "anuncio-parque",
    type: "announcement",
    author: {
      name: "Anuncio general",
      meta: "07:50 · publicado por vos",
      icon: "megaphone",
      palette: "system",
    },
    audience: "Para: toda la sala",
    body: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    likes: 8,
    liked: true,
    comments: 0,
  },
];
