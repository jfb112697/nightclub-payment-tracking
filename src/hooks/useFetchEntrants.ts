import { useEffect, useState, useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import { gql } from "@apollo/client";

const ENTRANTS_QUERY = gql`
  query EventQuery($id: ID, $page: Int!, $perPage: Int!) {
    event(id: $id) {
      entrants(query: { page: $page, perPage: $perPage }) {
        pageInfo {
          page
          totalPages
          perPage
        }
        nodes {
          id
          name
        }
      }
    }
  }
`;

type Entrant = {
  id: string;
  name: string;
  paid: boolean;
};

const useFetchEntrants = (id: string | null) => {
  const [entrants, setEntrants] = useState<Entrant[]>([]);
  const [getEntrants, { data, loading, error }] = useLazyQuery(ENTRANTS_QUERY);

  const fetchAllPages = useCallback(
    async (page: number, accumulator: Entrant[] = []) => {
      getEntrants({
        variables: { id, page, perPage: 50 },
        onCompleted: (data) => {
          const entrantsData = data.event.entrants.nodes.map(
            (entrant: Entrant) => ({
              id: entrant.id,
              name: entrant.name,
            })
          );

          const pageInfo = data.event.entrants.pageInfo;

          const newAccumulator = [...accumulator, ...entrantsData];

          if (pageInfo.page < pageInfo.totalPages) {
            fetchAllPages(page + 1, newAccumulator);
          } else {
            setEntrants(newAccumulator);
          }
        },
      });
    },
    [id, getEntrants]
  );

  useEffect(() => {
    if (!id || id === "0") {
      return;
    }

    fetchAllPages(1);
  }, [id, fetchAllPages]);

  const refreshEntrants: () => void = () => {
    fetchAllPages(1);
  };

  return { entrants, loading, error, refreshEntrants };
};

export default useFetchEntrants;
