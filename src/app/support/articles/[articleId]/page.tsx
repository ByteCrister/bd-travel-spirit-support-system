// /articles/[articleId]/page.tsx

import ArticleDetailPage from "@/components/support/articles/article-detail/ArticleDetailPage";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";

interface PageProps {
  params: Promise<{ articleId: string }>;
}
export default async function Page({ params }: PageProps) {
  const { articleId } = await params;

  const decodedId = decodeId(decodeURIComponent(articleId));

  return (
    <ArticleDetailPage articleId={decodedId ?? '-'} />
  )
}
