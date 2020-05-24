export interface User {
  id: number;
  name: string;
}

export interface Article {
  id: number;
  title: string;
  views: number;
  authorId: number;
}

export interface Blog {
  posts: Article[];
  authors: User[];
}

export const blog: Blog = {
  posts: [
    {
      id: 1,
      title: "Color Me Addams",
      views: 62,
      authorId: 666,
    },
    {
      id: 2,
      title: "Hand Delivered",
      views: 505,
      authorId: 5,
    },
    {
      id: 3,
      title: "Little Doll Lost",
      views: 646,
      authorId: 3,
    },
  ],
  authors: [
    {
      id: 666,
      name: "Morticia Addams",
    },
    {
      id: 5,
      name: "Thing",
    },
    {
      id: 3,
      name: "Wednesday Addams",
    },
  ],
};
