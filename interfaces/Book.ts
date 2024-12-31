export interface Author {
  "@type": "schema:Person";
  "@id": string;
  "schema:name": string;
  "schema:birthDate": string;
  "schema:nationality": string;
  "schema:gender": string;
}

export interface Book {
  "@type": "schema:Book";
  "@id": string;
  "schema:name": string;
  "schema:author": Author;
  "schema:numberOfPages": number;
  "schema:datePublished": string;
  "schema:genre": string[];
  "schema:inLanguage": string;
  owner?: string;
}
