import React, { useState } from "react";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CollectionsViewProps {
  collections: Record<string, Book[]>;
}

const CollectionsView: React.FC<CollectionsViewProps> = ({ collections }) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(collections).map(([owner, books]) => (
        <Dialog key={owner}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-32 flex flex-col items-center justify-center"
            >
              <span className="text-lg font-semibold">
                {owner}'s Collection
              </span>
              <span className="text-sm">{books.length} books</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{owner}'s Collection</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {books.map((book) => (
                  <Dialog key={book["@id"]}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-32 flex flex-col items-center justify-center"
                        onClick={() => setSelectedBook(book)}
                      >
                        <span className="text-sm font-semibold text-center">
                          {book["schema:name"]}
                        </span>
                        <span className="text-xs">
                          {book["schema:author"]["schema:name"]}
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{book["schema:name"]}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <p>
                          <strong>Author:</strong>{" "}
                          {book["schema:author"]["schema:name"]}
                        </p>
                        <p>
                          <strong>Genre:</strong>{" "}
                          {book["schema:genre"].join(", ")}
                        </p>
                        <p>
                          <strong>Published:</strong>{" "}
                          {book["schema:datePublished"]}
                        </p>
                        <p>
                          <strong>Pages:</strong> {book["schema:numberOfPages"]}
                        </p>
                        <p>
                          <strong>Language:</strong> {book["schema:inLanguage"]}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};

export default CollectionsView;
