import React from "react";
import { DataGrid, GridColDef, GridRowProps } from "@mui/x-data-grid";
import { Button } from "@mui/material";

interface DataGridDocument {
  id: string;
  name: string;
  paid: boolean;
}

interface Props {
  documents: DataGridDocument[];
}

export const PaidStatusDataGrid: React.FC<Props> = ({ documents }) => {
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "paid", headerName: "Paid", flex: 1, type: "boolean" },
    {
      field: "markAsPaid",
      headerName: "Mark As Paid",
      flex: 1,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => {
        const onClick = () => {
          console.log(`Mark as paid for document with ID: ${params.id}`);
          // Implement the logic to mark the document as paid.
        };

        return (
          <Button variant="outlined" onClick={onClick}>
            Mark As Paid
          </Button>
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
