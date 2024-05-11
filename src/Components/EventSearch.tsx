import { Button, Paper, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { TOURNAMENT_QUERY } from "../Queries/TournamentQuery";
import {
  CollectionReference,
  DocumentData,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import db from "../firebase";
import { PaidStatusDataGrid } from "./PaidStatusDataGrid";
import useFetchEntrants from "../Queries/useFetchEntrants";
import refreshEntrants from "../Queries/useFetchEntrants";

type Props = {};

export default function EventSearch({}: Props) {
  const [ggSlug, setGgSlug] = useState("");
  const [getTournament, { data, loading, error }] =
    useLazyQuery(TOURNAMENT_QUERY);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventCollectionRef, setEventCollectionRef] = useState(null);

  const [snapshot, loadingDocuments, errorDocuments] =
    useCollection(eventCollectionRef);
  const {
    entrants,
    loading: entrantsLoading,
    error: entrantsError,
    refreshEntrants,
  } = useFetchEntrants(selectedEventId);

  //end hooks

  useEffect(() => {
    if (selectedEventId) {
      console.log(`Fetching documents for collection "${selectedEventId}"`); //@ts-ignore
      setEventCollectionRef(collection(db, selectedEventId.toString()));
    } else {
      setEventCollectionRef(null);
    }
  }, [selectedEventId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getTournament({ variables: { slug: ggSlug } });
  };

  async function checkAndCreateCollection(eventId: string) {
    const eventCollectionRef = collection(db, eventId.toString());
    const eventCollectionSnapshot = await getDocs(eventCollectionRef);

    if (eventCollectionSnapshot.empty) {
      await addDoc(eventCollectionRef, { placeholder: true });
      console.log(`Collection with name "${eventId}" created.`);
    } else {
      console.log(`Collection with name "${eventId}" already exists.`);
    }
    setSelectedEventId(eventId);
  }

  const updateFirestoreCollection = async () => {
    if (entrants && eventCollectionRef) {
      // Fetch the current documents in Firestore
      const snapshot = await getDocs(eventCollectionRef);
      const firestoreEntrants: { [id: string]: boolean } = {};
      snapshot.forEach((doc) => {
        console.log(doc.data());
        //@ts-ignore
        firestoreEntrants[doc.data().id] = true;
      });

      // Add new entrants and update existing ones
      await Promise.all(
        entrants.map(async (entrant) => {
          delete firestoreEntrants[entrant.id];
          const docRef = doc(eventCollectionRef, entrant.id.toString());
          const docSnapshot = await getDoc(docRef);

          if (docSnapshot.exists()) {
            // Update the document without overwriting the 'paid' value
            //return updateDoc(docRef, { name: entrant.name });
          } else {
            // Add a new document with the 'paid' value set to false
            return setDoc(docRef, { ...entrant, paid: false });
          }
        })
      );

      // Remove entrants that are not in the API result
      console.log(entrants);
      await Promise.all(
        Object.keys(firestoreEntrants).map((id) => {
          const docRef = doc(eventCollectionRef, id);
          deleteDoc(docRef);
          console.log(`Deleted ${id}`);
        })
      );

      console.log("Firestore collection updated.");
    }
  };

  useEffect(() => {
    if (entrants.length > 0) {
      updateFirestoreCollection();
    }
  }, [entrants, eventCollectionRef]);

  const handlePaidStatusToggle = async (
    id: string,
    field: string,
    value: boolean
  ) => {
    if (eventCollectionRef) {
      const entrantDocRef = doc(eventCollectionRef, id);
      await updateDoc(entrantDocRef, { [field]: value });
      console.log(
        `Updated entrant with ID "${id}", set "${field}" to "${value}".`
      );
    }
  };

  const handleDelete = async (id: Number) => {
    if (eventCollectionRef) {
      const entrantDocRef = doc(eventCollectionRef, id.toString());
      await updateDoc(entrantDocRef, { id: id, paid: false, deleted: true });
      console.log(`"Deleted" ${id}.`);
    }
  };

  return (
    <Paper className="bg-slate-100 flex flex-col flex-1 p-8 max-w-[800px] justify-center gap-4">
      {!eventCollectionRef ? (
        <div>
          <h2>Enter the slug of the tournament</h2>
          <form className="flex flex-col gap-4 " onSubmit={handleSubmit}>
            <TextField
              label={
                data && !data.tournament
                  ? "Tournament Not Found"
                  : "Tournament Slug"
              }
              variant="filled"
              color={data && !data.tournament && "warning"}
              value={ggSlug}
              onChange={(c) => setGgSlug(c.target.value)}
            ></TextField>
            <Button variant="contained" type="submit">
              Get Events
            </Button>
          </form>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
          {data && data.tournament && (
            <div>
              <h2>{data.tournament.name}</h2>
              <ul className="flex gap-3">
                {data.tournament.events.map(
                  (event: { id: string; name: string }) => {
                    return (
                      <Button
                        onClick={() => checkAndCreateCollection(event.id)}
                        variant="outlined"
                        key={event.id}
                      >
                        {event.name}
                      </Button>
                    );
                  }
                )}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div>
          {loadingDocuments || !snapshot ? (
            <p>Loading documents...</p>
          ) : errorDocuments ? (
            <p>Error fetching documents: {errorDocuments.message}</p>
          ) : (
            <PaidStatusDataGrid //@ts-ignore
              documents={snapshot.docs.map((doc) => {
                if (!doc.data().deleted) {
                  return {
                    id: doc.id,
                    name: doc.data().name,
                    paid: doc.data().paid,
                    notes: doc.data().notes || "",
                  };
                }
              })}
              eventCollectionRef={eventCollectionRef}
              onCellClick={handlePaidStatusToggle}
              handleDelete={handleDelete}
              handleRefresh={refreshEntrants}
            />
          )}
        </div>
      )}
    </Paper>
  );
}
