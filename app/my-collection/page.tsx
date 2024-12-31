"use client";

import { useEffect, useState } from "react";
import { fetchBooks, removeBook } from "@/api/booksApi";
import { useAuth } from "@/context/AuthContext";
import { Book } from "@/interfaces/Book";
import { Button } from "@/components/ui/button";
import AddFileModal from "@/components/AddFileModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MyCollection = () => {
  const { session, isLoggedIn } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [datapodStatus, setDatapodStatus] = useState<string>("Checking...");
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const loadBooks = async () => {
    if (!isLoggedIn || !session.info.webId) return;

    const podBaseUrl = session.info.webId.split("profile/card#me")[0];

    try {
      const userBooks = await fetchBooks(podBaseUrl, session);
      const flattenedBooks = userBooks["@graph"].reduce(
        (uniqueBooks: Book[], book: Book) => {
          const exists = uniqueBooks.some(
            (b: Book) => b["@id"] === book["@id"]
          );
          return exists ? uniqueBooks : [...uniqueBooks, book];
        },
        []
      );

      setBooks(flattenedBooks);
      console.log(flattenedBooks);
      setDatapodStatus("Public");
    } catch (error: any) {
      if (error.statusCode === 403) {
        setDatapodStatus("Private");
      } else {
        console.error("Error fetching books:", error);
      }
    }
  };

  useEffect(() => {
    loadBooks();
  }, [isLoggedIn, session]);

  const handleRemoveBook = async (bookId: string) => {
    if (session.info.webId) {
      try {
        const podBaseUrl = session.info.webId.split("profile/card#me")[0];
        await removeBook(podBaseUrl, bookId, session);
        await loadBooks();
      } catch (error) {
        console.error("Error removing book:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">My Book Collection</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold">Collection Visibility</h2>
        <p>
          Your collection is currently:{" "}
          <span
            className={
              datapodStatus === "Public" ? "text-green-600" : "text-red-600"
            }
          >
            {datapodStatus}
          </span>
        </p>
        {datapodStatus === "Private" && (
          <p className="text-sm text-gray-600">
            Make your collection public from your Solid pod settings to allow
            others to view it.
          </p>
        )}
      </div>

      <div className="mb-6">
        <Button onClick={() => setShowAddBookModal(true)}>Add New Book</Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Your Books</h2>
        {books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <h3 className="font-semibold">{book["schema:name"]}</h3>
                <p>Author: {book["schema:author"]["schema:name"]}</p>
                <Button className="mr-1" onClick={() => setSelectedBook(book)}>
                  View Details
                </Button>
                <Button
                  onClick={() => handleRemoveBook(book["@id"])}
                  variant="destructive"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p>No books in your collection yet.</p>
        )}
      </div>

      <AddFileModal
        isOpen={showAddBookModal}
        onClose={() => setShowAddBookModal(false)}
        onBookAdded={loadBooks}
      />

      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBook?.["schema:name"]}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>
              <strong>Author:</strong>{" "}
              {selectedBook?.["schema:author"]["schema:name"]}
            </p>
            <p>
              <strong>Author Birth Date:</strong>{" "}
              {selectedBook?.["schema:author"]["schema:birthDate"]}
            </p>
            <p>
              <strong>Author Nationality:</strong>{" "}
              {selectedBook?.["schema:author"]["schema:nationality"]}
            </p>
            <p>
              <strong>Author Gender:</strong>{" "}
              {selectedBook?.["schema:author"]["schema:gender"]}
            </p>
            <p>
              <strong>Number of Pages:</strong>{" "}
              {selectedBook?.["schema:numberOfPages"]}
            </p>
            <p>
              <strong>Date Published:</strong>{" "}
              {selectedBook?.["schema:datePublished"]}
            </p>
            <p>
              <strong>Genre:</strong>{" "}
              {selectedBook?.["schema:genre"].join(", ")}
            </p>
            <p>
              <strong>Language:</strong> {selectedBook?.["schema:inLanguage"]}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyCollection;
