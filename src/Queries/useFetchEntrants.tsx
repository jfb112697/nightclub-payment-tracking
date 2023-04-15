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

  const fetchPage = useCallback(
    async (page: number) => {
      getEntrants({ variables: { id, page, perPage: 50 } });
    },
    [id, getEntrants]
  );

  useEffect(() => {
    if (!id || id === "0") {
      return;
    }

    fetchPage(1);
  }, [id, fetchPage]);

  useEffect(() => {
    if (data) {
      const entrantsData = data.event.entrants.nodes.map(
        (entrant: Entrant) => ({
          id: entrant.id,
          name: entrant.name,
        })
      );

      const pageInfo = data.event.entrants.pageInfo;

      if (pageInfo.page < pageInfo.totalPages) {
        fetchPage(pageInfo.page + 1);
      } else {
        setEntrants((prevEntrants) => [...prevEntrants, ...entrantsData]);
      }
    }
  }, [data, fetchPage]);

  return { entrants, loading, error };
};

export default useFetchEntrants;
