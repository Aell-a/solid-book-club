import {
  getSolidDataset,
  getThing,
  getStringNoLocale,
  overwriteFile,
  getFile,
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import { Book } from "../interfaces/Book";
import pods from "@/lib/pods";

const BOOKS_FILE = "books.jsonld";

interface BookCollection {
  "@context": string;
  "@graph": Book[];
}

const fetchUserProfile = async (
  webId: string,
  session: Session
): Promise<string | null> => {
  const VCARD = "http://www.w3.org/2006/vcard/ns#";
  try {
    const dataset = await getSolidDataset(webId, { fetch: session.fetch });
    const profile = dataset && getThing(dataset, webId);

    if (!profile) {
      console.warn("Profile not found.");
      return null;
    }
    const name = getStringNoLocale(profile, `${VCARD}fn`);
    return name || "Anonymous User";
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export async function fetchAllBooks(
  session: Session
): Promise<{ owner: string; books: Book[] }[]> {
  const collections: { owner: string; books: Book[] }[] = [];

  for (const pod of pods) {
    const podUrl = `https://solidweb.me/${pod}/`;
    const bookFileUrl = `${podUrl}/solidbookclub/${BOOKS_FILE}`;
    const webId = `${podUrl}profile/card#me`;

    try {
      const ownerName = await fetchUserProfile(webId, session);

      const file = await getFile(bookFileUrl, { fetch: session.fetch });
      const text = await file.text();
      const bookCollection: BookCollection = JSON.parse(text);

      collections.push({
        owner: ownerName || "Unknown Owner",
        books: bookCollection["@graph"],
      });
    } catch (error) {
      console.error(`Error fetching books from ${podUrl}:`, error);
    }
  }

  return collections;
}

export async function fetchBooks(
  podUrl: string,
  session: Session
): Promise<Book[]> {
  try {
    const bookFileUrl = `${podUrl}solidbookclub/${BOOKS_FILE}`;
    const file = await getFile(bookFileUrl, { fetch: session.fetch });
    const text = await file.text();
    const bookCollection: BookCollection = JSON.parse(text);
    return bookCollection["@graph"];
  } catch (error) {
    console.error("Error fetching books:", error);
    if (error instanceof Error && error.name === "NotFoundError") {
      return [];
    }
    throw new Error("Failed to fetch books.");
  }
}

export async function addBook(
  podUrl: string,
  newBook: Book,
  session: Session
): Promise<void> {
  try {
    const bookFileUrl = `${podUrl}solidbookclub/${BOOKS_FILE}`;
    let bookCollection: BookCollection;

    try {
      const file = await getFile(bookFileUrl, { fetch: session.fetch });
      const text = await file.text();
      bookCollection = JSON.parse(text);
    } catch (error) {
      // If the file doesn't exist, create a new collection
      bookCollection = {
        "@context": "http://schema.org/",
        "@graph": [],
      };
    }

    // Add the new book to the collection
    bookCollection["@graph"].push(newBook);

    // Save the updated collection
    await overwriteFile(
      bookFileUrl,
      new Blob([JSON.stringify(bookCollection, null, 2)], {
        type: "application/ld+json",
      }),
      { contentType: "application/ld+json", fetch: session.fetch }
    );
  } catch (error) {
    console.error("Error adding book:", error);
    throw error;
  }
}

export async function removeBook(
  podUrl: string,
  bookId: string,
  session: Session
): Promise<void> {
  try {
    const bookFileUrl = `${podUrl}solidbookclub/${BOOKS_FILE}`;
    const file = await getFile(bookFileUrl, { fetch: session.fetch });
    const text = await file.text();
    const bookCollection: BookCollection = JSON.parse(text);

    // Remove the book with the matching ID
    bookCollection["@graph"] = bookCollection["@graph"].filter(
      (book) => book["@id"] !== bookId
    );

    // Save the updated collection
    await overwriteFile(
      bookFileUrl,
      new Blob([JSON.stringify(bookCollection, null, 2)], {
        type: "application/ld+json",
      }),
      { contentType: "application/ld+json", fetch: session.fetch }
    );
  } catch (error) {
    console.error("Error removing book:", error);
    throw error;
  }
}