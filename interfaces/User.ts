import { BookCollection } from "./BookCollection";

export interface User {
  userId: string;
  name: string;
  collection: BookCollection;
}
