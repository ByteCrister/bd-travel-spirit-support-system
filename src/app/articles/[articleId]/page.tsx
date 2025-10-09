// /articles/[articleId]/page.tsx

import ArticleDetailPage from "@/components/articles/article-detail/ArticleDetailPage";

interface PageProps {
  params: { articleId: string };
}
export default async function Page({ params }: PageProps) {
  const { articleId } = await params;

  return (
    <ArticleDetailPage articleId={articleId} />
  )
}
