import { gql } from "@apollo/client";

export const TOURNAMENT_QUERY = gql`
  query TournamentQuery($slug: String) {
    tournament(slug: $slug) {
      id
      name
      events {
        id
        name
      }
    }
  }
`;
