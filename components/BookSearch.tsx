import React, { useState } from "react";
import { Book } from "@/interfaces/Book";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CollectionsView from "./CollectionsView";

interface BookSearchProps {
  collections: Record<string, Book[]>;
}

const BookSearch: React.FC<BookSearchProps> = ({ collections }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const handleSearch = () => {
    const allBooks = Object.values(collections).flat();
    const results = allBooks.filter((book) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        book["schema:name"].toLowerCase().includes(searchTermLower) ||
        book["schema:author"]["schema:name"]
          .toLowerCase()
          .includes(searchTermLower) ||
        book["schema:author"]["schema:nationality"]
          .toLowerCase()
          .includes(searchTermLower) ||
        book["schema:author"]["schema:gender"]
          .toLowerCase()
          .includes(searchTermLower) ||
        book["schema:datePublished"].includes(searchTerm) ||
        book["schema:numberOfPages"].toString().includes(searchTerm) ||
        book["schema:genre"].some((genre) =>
          genre.toLowerCase().includes(searchTermLower)
        ) ||
        book["schema:inLanguage"].toLowerCase().includes(searchTermLower)
      );
    });
    setSearchResults(results);
  };

  return (
    <div className="space-y-4">
      <CollectionsView collections={collections} />
      <div className="flex space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search books... (Hover for instructions)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Search for books using any field: title, author, genre,
                publication date, number of pages, language, or owner. The
                search is case-insensitive and matches partial text.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button onClick={handleSearch}>Search</Button>
      </div>
      {searchResults.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searchResults.map((book) => (
              <TableRow key={book["@id"] + book.owner}>
                <TableCell>{book["schema:name"]}</TableCell>
                <TableCell>{book["schema:author"]["schema:name"]}</TableCell>
                <TableCell>{book["schema:genre"].join(", ")}</TableCell>
                <TableCell>{book["schema:datePublished"]}</TableCell>
                <TableCell>{book["schema:numberOfPages"]}</TableCell>
                <TableCell>{book["schema:inLanguage"]}</TableCell>
                <TableCell>{book.owner}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default BookSearch;
