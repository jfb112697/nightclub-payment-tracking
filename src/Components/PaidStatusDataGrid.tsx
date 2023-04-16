import React, { useState } from "react";
import { DataGrid, GridColDef, GridRowProps } from "@mui/x-data-grid";
import { CircularProgress } from "@mui/material";
import { collection, doc, updateDoc } from "firebase/firestore";
import { DocumentReference } from "firebase/firestore";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useSearchContext } from "../Context/SearchContext";

interface DataGridDocument {
  id: string;
  name: string;
  paid: boolean;
  docRef: DocumentReference; // Add this line
}

interface Props {
  documents: DataGridDocument[];
  onCellClick: (id: string, field: string, value: boolean) => void;
}

export const PaidStatusDataGrid: React.FC<Props> = ({
  documents,
  onCellClick,
}) => {
  const [page, setPage] = useState(0);
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "paid",
      headerName: "Paid",
      flex: 1,
      type: "boolean",
      renderCell: (params) => {
        return (
          <div
            onClick={() =>
              onCellClick(params.id.toString(), params.field, !params.value)
            }
          >
            {params.value ? (
              <CheckIcon
                style={{
                  color: "#32a852",
                }}
              />
            ) : (
              <CloseIcon
                style={{
                  color: "#a83255",
                }}
              />
            )}
          </div>
        );
      },
    },
  ];

  const { searchQuery } = useSearchContext();

  const filteredEntrants = documents.filter((entrant: DataGridDocument) =>
    entrant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ width: "100%", minHeight: 400 }}>
      <DataGrid
        rows={filteredEntrants}
        columns={columns}
        checkboxSelection={false}
        autoHeight={true}
        pageSizeOptions={[10, 15, 25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 12,
            }, //@ts-ignore
            pageSizeOptions: [5, 10, 15, 25, 50, 100],
          },
        }}
      />
    </div>
  );
};
