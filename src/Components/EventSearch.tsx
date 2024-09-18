import { Button, Paper, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { TOURNAMENT_QUERY } from "../Queries/TournamentQuery";
import {
  CollectionReference,
  addDoc,
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import db from "../firebase";
import { PaidStatusDataGrid } from "./PaidStatusDataGrid";
import useFetchEntrants from "../Queries/useFetchEntrants";

export default function EventSearch() {
  const [ggSlug, setGgSlug] = useState("");
  const [getTournament, { data, loading, error }] = useLazyQuery(TOURNAMENT_QUERY);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventCollectionRef, setEventCollectionRef] = useState<CollectionReference | null>(null);

  const {
    entrants,
    loading: entrantsLoading,
    error: entrantsError,
    refreshEntrants,
  } = useFetchEntrants(selectedEventId);

  useEffect(() => {
    if (selectedEventId) {
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
      const snapshot = await getDocs(eventCollectionRef);
      const firestoreEntrants: { [id: string]: boolean } = {};
      snapshot.forEach((doc) => {
        firestoreEntrants[doc.id] = true;
      });

      await Promise.all(
        entrants.map(async (entrant) => {
          delete firestoreEntrants[entrant.id];
          const docRef = doc(eventCollectionRef, entrant.id.toString());
          return setDoc(docRef, { ...entrant, paid: false }, { merge: true });
        })
      );

      await Promise.all(
        Object.keys(firestoreEntrants).map((id) => {
          const docRef = doc(eventCollectionRef, id);
          return deleteDoc(docRef);
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

  return (
    <Paper className="bg-slate-100 flex flex-col flex-1 p-8 max-w-[800px] justify-center gap-4">
      {!eventCollectionRef ? (
        <div>
          <h2>Enter the slug of the tournament</h2>
          <form className="flex flex-col gap-4 " onSubmit={handleSubmit}>
            <TextField
              label={data && !data.tournament ? "Tournament Not Found" : "Tournament Slug"}
              variant="filled"
              color={data && !data.tournament ? "warning" : "primary"}
              value={ggSlug}
              onChange={(c) => setGgSlug(c.target.value)}
            />
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
                  (event: { id: string; name: string }) => (
                    <Button
                      onClick={() => checkAndCreateCollection(event.id)}
                      variant="outlined"
                      key={event.id}
                    >
                      {event.name}
                    </Button>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div>
          {entrantsLoading ? (
            <p>Loading documents...</p>
          ) : entrantsError ? (
            <p>Error fetching documents: {entrantsError.message}</p>
          ) : (
            eventCollectionRef && (
              <PaidStatusDataGrid
                eventCollectionRef={eventCollectionRef}
                onRefresh={refreshEntrants}
              />
            )
          )}
        </div>
      )}
    </Paper>
  );
}