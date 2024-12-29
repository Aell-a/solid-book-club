// "use client";

// import React, { useState } from "react";
// import { Book } from "@/interfaces/Book";

// interface AddBookModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onAddBook: (book: Book) => void;
// }

// const AddBookModal: React.FC<AddBookModalProps> = ({
//   isOpen,
//   onClose,
//   onAddBook,
// }) => {
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [searchResults, setSearchResults] = useState<any[]>([]);
//   const [selectedBook, setSelectedBook] = useState<Book | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");

//   function parseWikidataDate(dateString: string): Date | null {
//     if (!dateString) return null;

//     try {
//       const sanitizedDate = dateString.startsWith("+")
//         ? dateString.slice(1)
//         : dateString;
//       const normalizedDate = sanitizedDate.replace(/-00/g, "-01");
//       const parsedDate = new Date(normalizedDate);

//       if (isNaN(parsedDate.getTime())) {
//         throw new Error("Invalid Date");
//       }
//       return parsedDate;
//     } catch (error) {
//       console.error("Error parsing date:", error);
//       return null;
//     }
//   }

//   const searchWikidata = async (query: string) => {
//     const endpoint = "https://www.wikidata.org/w/api.php";

//     try {
//       // Step 1: Search for entities matching the query
//       const searchResponse = await fetch(
//         `${endpoint}?action=wbsearchentities&format=json&language=en&type=item&continue=0&limit=10&search=${encodeURIComponent(
//           query
//         )}&origin=*`
//       );
//       const searchData = await searchResponse.json();
//       const searchResults = searchData.search;

//       // Step 2: Fetch detailed data for each entity and filter by types
//       const detailedResults = await Promise.all(
//         searchResults.map(async (item: any) => {
//           try {
//             const detailResponse = await fetch(
//               `${endpoint}?action=wbgetentities&format=json&ids=${item.id}&props=claims&origin=*`
//             );
//             const detailData = await detailResponse.json();

//             const claims = detailData.entities[item.id].claims;
//             const instanceOfClaims = claims?.P31?.map(
//               (claim: any) => claim.mainsnak.datavalue.value.id
//             );

//             // Check if the entity is a book or novel
//             if (
//               instanceOfClaims &&
//               (instanceOfClaims.includes("Q7725634") ||
//                 instanceOfClaims.includes("Q47461344"))
//             ) {
//               return {
//                 wikidataId: item.id,
//                 title: item.label,
//                 description: item.description || "",
//               };
//             }
//             return null;
//           } catch (error) {
//             console.error(`Error fetching details for ${item.id}:`, error);
//             return null;
//           }
//         })
//       );

//       // Filter out null results (non-matching items)
//       return detailedResults.filter((result) => result !== null);
//     } catch (error) {
//       console.error("Search error:", error);
//       return [];
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) return;
//     setLoading(true);
//     setError("");
//     setSearchResults([]);
//     setSelectedBook(null);

//     try {
//       const results = await searchWikidata(searchQuery);
//       setSearchResults(results);
//     } catch (error) {
//       console.error("Error fetching book data from Wikidata:", error);
//       setError("Failed to fetch book data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAuthorDetails = async (authorId: string) => {
//     const sparqlQuery = `
//       SELECT ?birthDate ?deathDate ?nationality ?nationalityLabel ?gender ?genderLabel WHERE {
//         wd:${authorId} wdt:P569 ?birthDate.
//         OPTIONAL { wd:${authorId} wdt:P570 ?deathDate. }
//         OPTIONAL {
//           wd:${authorId} wdt:P27 ?nationality.
//           ?nationality rdfs:label ?nationalityLabel.
//           FILTER(LANG(?nationalityLabel) = "en")
//         }
//         OPTIONAL {
//           wd:${authorId} wdt:P21 ?gender.
//           ?gender rdfs:label ?genderLabel.
//           FILTER(LANG(?genderLabel) = "en")
//         }
//       }
//     `;

//     const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
//     const response = await fetch(url);
//     const data = await response.json();

//     if (data.results.bindings.length > 0) {
//       const authorDetails = data.results.bindings[0];
//       return {
//         birthDate: authorDetails.birthDate?.value,
//         deathDate: authorDetails.deathDate?.value,
//         nationality: authorDetails.nationalityLabel?.value || "Unknown",
//         gender: authorDetails.genderLabel?.value || "Unknown",
//       };
//     }

//     return null;
//   };

//   const fetchEntityDetails = async (entityId: string) => {
//     const response = await fetch(
//       `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&format=json&origin=*&props=claims|labels`
//     );
//     const data = await response.json();
//     return data.entities[entityId];
//   };

//   const handleSelectBook = async (item: any) => {
//     setLoading(true);
//     try {
//       const bookEntity: any = await fetchEntityDetails(item.wikidataId);
//       const authorDetails = await fetchAuthorDetails(
//         bookEntity.claims.P50?.[0]?.mainsnak?.datavalue?.value?.id
//       );

//       const getLabel = async (entityId: string) => {
//         const entity = await fetchEntityDetails(entityId);
//         return entity.labels.en?.value || entityId;
//       };

//       const genres = await Promise.all(
//         (bookEntity.claims.P136 || []).map((claim: any) =>
//           getLabel(claim.mainsnak?.datavalue?.value?.id)
//         )
//       );

//       const language = await getLabel(
//         bookEntity.claims.P407?.[0]?.mainsnak?.datavalue?.value?.id
//       );

//       const book: Book = {
//         "@type": "schema:Book",
//         "@id": `urn:wikidata:${item.wikidataId}`,
//         "schema:name": item.title,
//         "schema:author": {
//           "@type": "schema:Person",
//           "@id": `author:${bookEntity.claims.P50?.[0]?.mainsnak?.datavalue?.value?.id}`,
//           "schema:name": await getLabel(
//             bookEntity.claims.P50?.[0]?.mainsnak?.datavalue?.value?.id
//           ),
//           "schema:birthDate": authorDetails?.birthDate
//             ? parseWikidataDate(authorDetails.birthDate) || new Date()
//             : new Date(),
//           "schema:deathDate": authorDetails?.deathDate
//             ? parseWikidataDate(authorDetails.deathDate) || new Date()
//             : new Date(),
//           "schema:nationality": authorDetails?.nationality || "Unknown",
//           "schema:gender": authorDetails?.gender || "Unknown",
//         },
//         "schema:numberOfPages": parseInt(
//           bookEntity.claims.P1104?.[0]?.mainsnak?.datavalue?.value?.amount.replace(
//             "+",
//             ""
//           ) || "0",
//           10
//         ),
//         "schema:datePublished":
//           parseWikidataDate(
//             bookEntity.claims.P577?.[0]?.mainsnak?.datavalue?.value?.time
//           ) || new Date(),
//         "schema:genre": genres,
//         "schema:inLanguage": language,
//       };

//       setSelectedBook(book);
//       setSearchResults([]);
//     } catch (error) {
//       console.error("Error fetching detailed book data:", error);
//       setError("Failed to fetch detailed book data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBook = () => {
//     if (selectedBook) {
//       onAddBook(selectedBook);
//       setSelectedBook(null);
//       setSearchQuery("");
//       onClose();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-lg">
//         <h2 className="text-lg font-semibold mb-4">Add a New Book</h2>

//         <div className="space-y-4">
//           <div className="flex items-center space-x-2">
//             <input
//               type="text"
//               placeholder="Search by title"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="border border-gray-300 rounded p-2 flex-grow"
//             />
//             <button
//               onClick={handleSearch}
//               disabled={loading || !searchQuery.trim()}
//               className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
//             >
//               Search
//             </button>
//           </div>

//           {loading && <p className="text-gray-600">Searching...</p>}
//           {error && <p className="text-red-600">{error}</p>}

//           {searchResults.length > 0 && !selectedBook && (
//             <ul className="bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto">
//               {searchResults.map((item) => (
//                 <li
//                   key={item.wikidataId}
//                   onClick={() => handleSelectBook(item)}
//                   className="p-2 hover:bg-gray-100 cursor-pointer"
//                 >
//                   <div className="font-semibold">{item.title}</div>
//                   <div className="text-sm text-gray-600">
//                     {item.description}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}

//           {selectedBook && (
//             <div className="border border-gray-200 rounded p-4">
//               <h3 className="text-lg font-semibold mb-2">
//                 {selectedBook["schema:name"]}
//               </h3>
//               <p className="mb-1">
//                 <strong>Author:</strong>{" "}
//                 {selectedBook["schema:author"]["schema:name"]}
//               </p>
//               <p className="mb-1">
//                 <strong>Published:</strong>{" "}
//                 {selectedBook["schema:datePublished"]?.toLocaleDateString() ||
//                   "Unknown"}
//               </p>
//               <p className="mb-1">
//                 <strong>Language:</strong> {selectedBook["schema:inLanguage"]}
//               </p>
//               <p className="mb-1">
//                 <strong>Pages:</strong> {selectedBook["schema:numberOfPages"]}
//               </p>
//               <p className="mb-1">
//                 <strong>Genre:</strong>{" "}
//                 {selectedBook["schema:genre"].join(", ")}
//               </p>
//               <p className="mb-1">
//                 <strong>Author Nationality:</strong>{" "}
//                 {selectedBook["schema:author"]["schema:nationality"]}
//               </p>
//               <p className="mb-1">
//                 <strong>Author Gender:</strong>{" "}
//                 {selectedBook["schema:author"]["schema:gender"]}
//               </p>
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end mt-4">
//           <button
//             onClick={onClose}
//             className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleAddBook}
//             disabled={!selectedBook}
//             className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
//           >
//             Add Book
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddBookModal;
