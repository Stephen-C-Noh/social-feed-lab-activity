/*
TODO: Create the following functions:
- login
- getFeed (with optional authors argument added to it if you have time)
- createPost
- createComment
*/

type LoginResponse = {
  token: string;
  user: User;
};

type FeedResponse = {
  posts: Post[];
};

import { Post, User } from "../types";
import { api } from "./api";

export async function login(username: string): Promise<LoginResponse> {
  const response = await api.post("/login", { username });
  return response.data;
}

export async function getFeed(authors?: string[]): Promise<FeedResponse> {
  const params = authors ? { authors: authors.join(",") } : {};
  const response = await api.get("/feed", { params });
  return response.data;
}

export async function createPost(text: string): Promise<Post> {
  const response = await api.post("/posts", { text });
  return response.data;
}

export async function createComment(
  postId: string,
  text: string,
): Promise<Comment> {
  const response = await api.post(`/posts/${postId}/comments`, { text });
  return response.data;
}
