import { Book } from "./Book";

export interface BookCollection {
  "@context": {
    schema: "http://schema.org/";
  };
  "@graph": Book[];
}
