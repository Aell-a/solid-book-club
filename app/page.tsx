"use client";

import { useState, useEffect } from "react";
import BookSearch from "@/components/BookSearch";
import { fetchAllBooks } from "@/api/booksApi";
import { useAuth } from "@/context/AuthContext";
import { Book } from "@/types/book";

export default function Home() {
  const { isLoggedIn, session } = useAuth();
  const [collections, setCollections] = useState<Record<string, Book[]>>({});

  useEffect(() => {
    const loadBooks = async () => {
      if (isLoggedIn) {
        const rawBooks = await fetchAllBooks(session);

        // Flatten and process the data
        const allBooks = rawBooks.flatMap((item) =>
          item.books.flatMap((book) =>
            book["@graph"].map((b) => ({ ...b, owner: item.owner }))
          )
        );

        // Group books by owner
        const groupedBooks = allBooks.reduce((acc, book) => {
          if (!acc[book.owner]) {
            acc[book.owner] = [];
          }
          acc[book.owner].push(book);
          return acc;
        }, {});

        setCollections(groupedBooks);
      }
    };

    loadBooks();
  }, [isLoggedIn, session]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-semibold mb-4">Book Collections</h2>
        {!isLoggedIn ? (
          <p>Please login with solid to view collections</p>
        ) : (
          <BookSearch collections={collections} />
        )}
      </div>
    </main>
  );
}
