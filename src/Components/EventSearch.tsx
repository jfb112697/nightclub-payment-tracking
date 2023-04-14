import { Button, Paper, TextField } from "@mui/material";
import React, { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { TOURNAMENT_QUERY } from "../Queries/TournamentQuery";

type Props = {};

export default function EventSearch({}: Props) {
  const [ggSlug, setGgSlug] = useState("");
  const [getTournament, { data, loading, error }] =
    useLazyQuery(TOURNAMENT_QUERY);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getTournament({ variables: { slug: ggSlug } });
  };

  return (
    <Paper className="bg-slate-100 flex flex-col flex-[.5] p-8 justify-center gap-4">
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
              (event: { id: string; name: string }) => (
                <Button variant="outlined" key={event.id}>
                  {event.name}
                </Button>
              )
            )}
          </ul>
        </div>
      )}
    </Paper>
  );
}
