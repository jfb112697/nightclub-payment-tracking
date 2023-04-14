import React from "react";
import { DataGrid, GridColDef, GridRowProps } from "@mui/x-data-grid";
import { CircularProgress } from "@mui/material";
import { collection, doc, updateDoc } from "firebase/firestore";
import { DocumentReference } from "firebase/firestore";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

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

  return (
    <div style={{ width: "100%", height: 400 }}>
      <DataGrid rows={documents} columns={columns} checkboxSelection={false} />
    </div>
  );
};
