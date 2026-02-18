import Link from "next/link";
import { getAllSongs } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DeleteSongButton } from "./DeleteSongButton";

export const metadata = {
  title: "ניהול שירים | ניפגשה",
  description: "הוספה, עריכה ומחיקה של שירים",
};

export default async function AdminSongsPage() {
  const songs = await getAllSongs();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">ניהול שירים</h1>
        <Button asChild>
          <Link href="/admin/songs/new" className="inline-flex items-center gap-2">
            <Plus className="size-4" aria-hidden />
            שיר חדש
          </Link>
        </Button>
      </div>

      {songs.length === 0 ? (
        <p className="text-muted-foreground">אין שירים. הוסיפו שיר חדש.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>כותרת</TableHead>
                <TableHead>אמן</TableHead>
                <TableHead>פורסם</TableHead>
                <TableHead className="w-[120px]">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {songs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell className="font-medium">{song.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {song.artist_name ?? "—"}
                  </TableCell>
                  <TableCell>{song.is_published ? "כן" : "לא"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild aria-label="עריכה">
                        <Link href={`/admin/songs/${song.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteSongButton songId={song.id} songTitle={song.title} />
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
