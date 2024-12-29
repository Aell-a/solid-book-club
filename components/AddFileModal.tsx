import React, { useState } from "react";
import { useSession } from "@inrupt/solid-ui-react";
import { addBook } from "@/api/booksApi";
import { Book } from "@/interfaces/Book";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: () => void;
}

const AddFileModal: React.FC<AddFileModalProps> = ({
  isOpen,
  onClose,
  onBookAdded,
}) => {
  const { session } = useSession();
  const [bookData, setBookData] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!bookData) {
      setError("Please provide the book data.");
      return;
    }

    try {
      const newBook: Book = JSON.parse(bookData);
      if (session.info.webId) {
        const podBaseUrl = session.info.webId.split("profile/card#me")[0];
        await addBook(podBaseUrl, newBook, session);
        setError("");
        setBookData("");
        onBookAdded();
        onClose();
      } else {
        throw new Error("WebID not found");
      }
    } catch (error) {
      console.error("Error saving book:", error);
      setError(
        "Failed to save book. Please check your JSON-LD format and try again."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={bookData}
            onChange={(e) => setBookData(e.target.value)}
            placeholder="Paste your JSON-LD book data here"
            rows={10}
          />
          {error && <p className="text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave}>Add Book</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFileModal;
