import Link from "next/link";
import { getAllArticles } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, ImageIcon, Video } from "lucide-react";
import { DeleteArticleButton } from "./DeleteArticleButton";

export const metadata = {
  title: "ניהול מאמרים | ניפגשה",
  description: "הוספה, עריכה ומחיקה של מאמרים",
};

export default async function AdminArticlesPage() {
  const articles = await getAllArticles();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">ניהול מאמרים</h1>
        <Button asChild>
          <Link href="/admin/articles/new" className="inline-flex items-center gap-2">
            <Plus className="size-4" aria-hidden />
            מאמר חדש
          </Link>
        </Button>
      </div>

      {articles.length === 0 ? (
        <p className="text-muted-foreground">אין מאמרים. הוסף מאמר חדש.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>כותרת</TableHead>
                <TableHead>מדיה</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead className="w-[100px]">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>
                    {a.media_type === "video" ? (
                      <span className="inline-flex items-center gap-1">
                        <Video className="size-4" aria-hidden />
                        וידאו
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <ImageIcon className="size-4" aria-hidden />
                        תמונה
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {a.is_published ? (
                      <span className="text-green-600">פורסם</span>
                    ) : (
                      <span className="text-muted-foreground">טיוטה</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link
                          href={`/admin/articles/${a.id}`}
                          aria-label="ערוך מאמר"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Link>
                      </Button>
                      <DeleteArticleButton
                        articleId={a.id}
                        articleTitle={a.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
