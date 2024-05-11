import React, { useState } from "react";
import { DataGrid, GridColDef, GridRowProps } from "@mui/x-data-grid";
import { Button, Chip, CircularProgress, Icon, TextField } from "@mui/material";
import {
  collection,
  CollectionReference,
  doc,
  updateDoc,
} from "firebase/firestore";
import { DocumentReference } from "firebase/firestore";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSearchContext } from "../Context/SearchContext";

import _ from "lodash";

const debounce = _.debounce;

interface DataGridDocument {
  id: string;
  name: string;
  paid: boolean;
  docRef: DocumentReference;
}

interface Props {
  documents: DataGridDocument[];
  onCellClick: (id: string, field: string, value: boolean) => void;
  handleDelete: (id: Number) => void;
  handleRefresh: any;
  eventCollectionRef: CollectionReference;
}

export const PaidStatusDataGrid: React.FC<Props> = ({
  documents,
  onCellClick,
  handleDelete,
  handleRefresh,
  eventCollectionRef,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    {
      field: "notes",
      headerName: "Notes",
      width: 200,
      renderCell: (params: any) => (
        <TextField
          fullWidth
          value={params.value || ""}
          onChange={(e) => {
            debouncedUpdateNotes(params.id, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()} // Prevents row click event
        />
      ),
    },
  ];

  const debouncedUpdateNotes = debounce(async (id: string, notes: any) => {
    const docRef = doc(eventCollectionRef, id);
    await updateDoc(docRef, { notes });
  }, 15); // Debounce updates to every 30ms

  const { searchQuery, setSearchQuery } = useSearchContext();
  const [selectedRowId, setSelectedRowId] = useState(null);

  const filteredEntrants = documents.filter((entrant: DataGridDocument) =>
    entrant && entrant.name
      ? entrant.name.toLowerCase().includes(searchQuery.toLowerCase())
      : ""
  );

  return (
    <div className="w-full min-h0[400px] flex flex-col gap-6">
      <Button variant={"text"} onClick={handleRefresh}>
        <RefreshIcon />
      </Button>
      {searchQuery && (
        <Chip
          label={`Search: ${searchQuery}`}
          onDelete={() => setSearchQuery("")}
          className=" w-fit"
        />
      )}
      <DataGrid
        rows={filteredEntrants}
        columns={columns}
        checkboxSelection={false}
        autoHeight={true}
        onPaginationModelChange={() => setShowDeleteModal(false)}
        pageSizeOptions={[5, 10, 12, 15, 25, 50, 100]}
        onRowDoubleClick={(r) => setShowDeleteModal(!showDeleteModal)}
        onRowClick={(r) => {
          if (selectedRowId != r.id) {
            setShowDeleteModal(false);
          } //@ts-ignore
          setSelectedRowId(r.id);
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 12,
            }, //@ts-ignore
            pageSizeOptions: [5, 10, 12, 15, 25, 50, 100],
          },
        }}
      />

      <div
        className={`${
          showDeleteModal ? "flex" : "hidden"
        } bg-red-400 w-full relative top-[-119px] transition-all py-2 px-2`}
      >
        <Button
          variant="outlined"
          sx={{
            color: "white",
            borderColor: "white",
          }}
          onClick={() => {
            //@ts-ignore
            handleDelete(selectedRowId);
            setShowDeleteModal(false);
          }}
        >
          Delete Entrant
        </Button>
      </div>
    </div>
  );
};
