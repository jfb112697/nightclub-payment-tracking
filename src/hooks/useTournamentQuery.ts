import { useLazyQuery } from "@apollo/client";
import { TOURNAMENT_QUERY } from "../Queries/TournamentQuery";

export const useTournamentQuery = () => {
    const [getTournament, { data, loading, error }] = useLazyQuery(TOURNAMENT_QUERY);
    return { getTournament, data, loading, error };
};
