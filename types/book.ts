export interface Author {
  "@type": string;
  name: string;
  birthDate?: string;
  nationality?: string;
}

export interface Publisher {
  "@type": string;
  name: string;
  location?: string;
}

export interface Book {
  "@type": string;
  "@id": string;
  name: string;
  author: Author;
  datePublished?: string;
  publisher?: Publisher;
  isbn?: string;
  genre?: string[];
  numberOfPages?: number;
}
