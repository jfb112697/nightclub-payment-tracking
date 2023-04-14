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
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import db from "../firebase";
import { PaidStatusDataGrid } from "./PaidStatusDataGrid";

type Props = {};

export default function EventSearch({}: Props) {
  const [ggSlug, setGgSlug] = useState("");
  const [getTournament, { data, loading, error }] =
    useLazyQuery(TOURNAMENT_QUERY);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventCollectionRef, setEventCollectionRef] =
    useState<CollectionReference<DocumentData> | null>(null);

  const [snapshot, loadingDocuments, errorDocuments] =
    useCollection(eventCollectionRef);

  useEffect(() => {
    if (selectedEventId) {
      console.log(`Fetching documents for collection "${selectedEventId}"`);
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

  return (
    <Paper className="bg-slate-100 flex flex-col flex-[.5] p-8 justify-center gap-4">
      {!eventCollectionRef ? (
        <div>
          <h2>Enter the slug of the tournament</h2>
          <form className="flex flex-col gap-4 " onSubmit={handleSubmit}>
            <TextField
              label="Tournament Slug"
              variant="filled"
              value={ggSlug}
              onChange={(c) => setGgSlug(c.target.value)}
            ></TextField>
            <Button variant="contained" type="submit">
              Get Events
            </Button>
          </form>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
          {data && (
            <div>
              <h2>{data.tournament.name}</h2>
              <ul className="flex gap-3">
                {data.tournament.events.map(
                  (event: { id: string; name: string }) => {
                    console.log(event.id);
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
          <h3>Documents in the "{selectedEventId}" collection:</h3>
          {loadingDocuments || !snapshot ? (
            <p>Loading documents...</p>
          ) : errorDocuments ? (
            <p>Error fetching documents: {errorDocuments.message}</p>
          ) : (
            <PaidStatusDataGrid //@ts-ignore
              documents={snapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name,
                paid: doc.data().paid,
              }))}
            />
          )}
        </div>
      )}
    </Paper>
  );
}
