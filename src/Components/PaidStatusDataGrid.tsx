import React, { useState, useCallback, useEffect, useRef } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Button, Chip, TextField } from "@mui/material";
import { CollectionReference, doc, updateDoc, getDocs, DocumentData } from "firebase/firestore";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import debounce from 'lodash/debounce';

interface DataGridDocument {
  id: string;
  name: string;
  paid: boolean;
  notes: string;
  deleted?: boolean;
}

interface Props {
  eventCollectionRef: CollectionReference<DocumentData>;
  onRefresh: () => void;
}

interface QueueItem {
  id: string;
  updates: Partial<DataGridDocument>;
}

export const PaidStatusDataGrid: React.FC<Props> = ({ eventCollectionRef, onRefresh }) => {
  const [documents, setDocuments] = useState<DataGridDocument[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const updateQueue = useRef<QueueItem[]>([]);
  const isUpdating = useRef(false);
  const localNotes = useRef<{ [key: string]: string }>({});

  const fetchDocuments = useCallback(async () => {
    const snapshot = await getDocs(eventCollectionRef);
    const docs = snapshot.docs
      .map(doc => ({
        id: doc.id,
        name: doc.data().name,
        paid: doc.data().paid,
        notes: doc.data().notes || "",
        deleted: doc.data().deleted
      }))
      .filter(doc => !doc.deleted);
    setDocuments(docs);
    // Initialize localNotes with fetched data
    docs.forEach(doc => {
      localNotes.current[doc.id] = doc.notes;
    });
  }, [eventCollectionRef]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const processQueue = useCallback(async () => {
    if (isUpdating.current || updateQueue.current.length === 0) return;

    isUpdating.current = true;
    const item = updateQueue.current.shift();

    if (item) {
      const docRef = doc(eventCollectionRef, item.id);
      try {
        await updateDoc(docRef, item.updates);
      } catch (error) {
        console.error("Error updating document:", error);
        updateQueue.current.push(item);
      }
    }

    isUpdating.current = false;
    processQueue();
  }, [eventCollectionRef]);

  const queueUpdate = useCallback((id: string, updates: Partial<DataGridDocument>) => {
    updateQueue.current.push({ id, updates });
    processQueue();
  }, [processQueue]);

  const handlePaidStatusToggle = useCallback((id: string, newPaidStatus: boolean) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? {...doc, paid: newPaidStatus} : doc));
    queueUpdate(id, { paid: newPaidStatus });
  }, [queueUpdate]);

  const handleDelete = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    queueUpdate(id, { deleted: true });
  }, [queueUpdate]);

  // Debounced function to update Firestore
  const debouncedUpdateFirestore = useCallback(
    debounce((id: string, newNotes: string) => {
      queueUpdate(id, { notes: newNotes });
    }, 300),
    [queueUpdate]
  );

  const handleNotesChange = useCallback((id: string, newNotes: string) => {
    // Update local state immediately
    localNotes.current[id] = newNotes;
    setDocuments(prev => prev.map(doc => doc.id === id ? {...doc, notes: newNotes} : doc));
    
    // Debounce the update to Firestore
    debouncedUpdateFirestore(id, newNotes);
  }, [debouncedUpdateFirestore]);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "paid",
      headerName: "Paid",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        const isPaid = params.value;
        return (
          <Button
          variant={isPaid ? "contained" : "outlined" }
            className={`
              w-full rounded-lg text-lg font-semibold py-3 transition-all duration-300
              ${isPaid ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}
              text-white
            `}
            onClick={() => handlePaidStatusToggle(params.id.toString(), !isPaid)}
            aria-label={isPaid ? "Mark event as unpaid" : "Mark event as paid"}
          >
            {isPaid ? (
              <>
                <CheckIcon className="mr-2 h-5 w-5" />
                Paid
              </>
            ) : (
              <>
                <CloseIcon className="mr-2 h-5 w-5" />
                Unpaid
              </>
            )}
          </Button>
        );
      },
    },
    {
      field: "notes",
      headerName: "Notes",
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <TextField
          fullWidth
          value={localNotes.current[params.id.toString()] || ""}
          onChange={(e) => handleNotesChange(params.id.toString(), e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  const filteredEntrants = documents.filter((entrant) =>
    entrant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-[400px] flex flex-col gap-6">
      <div className="flex">
      <TextField
      className="flex-1"
        label="Search"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
            <Button variant="text" onClick={onRefresh}>
        <RefreshIcon />
      </Button>
      </div>
      {searchQuery && (
        <Chip
          label={`Search: ${searchQuery}`}
          onDelete={() => setSearchQuery("")}
          className="w-fit"
        />
      )}
      <DataGrid
        rows={filteredEntrants}
        columns={columns}
        checkboxSelection={false}
        autoHeight={true}
        onPaginationModelChange={() => setShowDeleteModal(false)}
        pageSizeOptions={[5, 10, 12, 15, 25, 50, 100]}
        onRowDoubleClick={() => setShowDeleteModal(!showDeleteModal)}
        onRowClick={(params) => {
          if (selectedRowId !== params.id) {
            setShowDeleteModal(false);
          }
          setSelectedRowId(params.id.toString());
        }}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 12 },
          },
        }}
      />
      {showDeleteModal && (
        <div className="flex bg-red-400 w-full relative top-[-119px] transition-all py-2 px-2">
          <Button
            variant="outlined"
            sx={{ color: "white", borderColor: "white" }}
            onClick={() => {
              if (selectedRowId) {
                handleDelete(selectedRowId);
                setShowDeleteModal(false);
              }
            }}
          >
            Delete Entrant
          </Button>
        </div>
      )}
    </div>
  );
};