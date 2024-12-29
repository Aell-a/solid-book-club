"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Session } from "@inrupt/solid-client-authn-browser";
import {
  getSolidDataset,
  createSolidDataset,
  saveSolidDatasetAt,
  getThing,
  getStringNoLocale,
} from "@inrupt/solid-client";
import { useRouter } from "next/navigation"; // To navigate to My Collection page
import Link from "next/link";

const Header = () => {
  const { session, login, logout, isLoggedIn } = useAuth();
  const [userName, setUserName] = useState<string | null>("Loading...");
  const [collectionExists, setCollectionExists] = useState<boolean | null>(
    null
  );
  const router = useRouter();

  // Extract the base URL of the pod from webId
  const userPodUrl = session.info.webId?.split("/profile")[0];

  useEffect(() => {
    const loadUserProfile = async () => {
      if (isLoggedIn && session.info.webId) {
        const profileName = await fetchUserProfile(session.info.webId, session);
        setUserName(profileName || "Unknown User");
        await checkCollectionExists();
      } else {
        setUserName(null);
      }
    };

    loadUserProfile();
  }, [isLoggedIn, session]);

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

  // Function to check if the collection folder exists
  const checkCollectionExists = async () => {
    if (userPodUrl) {
      const booksFolderUrl = `${userPodUrl}/solidbookclub/books/`;

      try {
        // Try to fetch the folder to check if it exists
        await getSolidDataset(booksFolderUrl, { fetch: session.fetch });
        setCollectionExists(true);
      } catch (error) {
        setCollectionExists(false);
      }
    }
  };

  // Function to create the collection folder
  const createCollection = async () => {
    if (userPodUrl) {
      const booksFolderUrl = `${userPodUrl}/solidbookclub/books/`;

      const newDataset = createSolidDataset();
      await saveSolidDatasetAt(booksFolderUrl, newDataset, {
        fetch: session.fetch,
      });
      setCollectionExists(true); // After creating, set the state to true
    }
  };

  // Function to handle button click - either create collection or navigate to my collection
  const handleButtonClick = () => {
    if (collectionExists) {
      // Navigate to the My Collection page
      router.push("/my-collection");
    } else {
      // Create collection
      createCollection();
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <img
              src="/solid.png"
              alt="Solid Logo"
              className="w-10 h-10 rounded-full"
            />
            <h1 className="text-2xl font-bold text-gray-800">
              Solid Book Club
            </h1>
          </div>
        </Link>
        <div>
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {userName ? `Logged in as ${userName}` : "Loading..."}
              </span>

              {collectionExists === null ? (
                <button
                  onClick={checkCollectionExists}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                >
                  Checking Collection...
                </button>
              ) : (
                <button
                  onClick={handleButtonClick}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  {collectionExists ? "My Collection" : "Create Collection"}
                </button>
              )}
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const issuer = prompt(
                  "Enter your Solid Issuer",
                  "https://solidweb.me"
                );
                if (!issuer) return;
                login(issuer);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
