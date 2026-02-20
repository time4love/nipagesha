"use server";

import {
  getPublishedArticles,
  type PublicArticle,
  type GetPublishedArticlesResult,
} from "@/lib/articles";

export type { PublicArticle };

export async function getArticles(
  offset: number = 0,
  limit: number = 10
): Promise<GetPublishedArticlesResult> {
  return getPublishedArticles(offset, limit);
}
