import { CollectionReference, DocumentData } from "firebase/firestore";

export type Props = {};

export interface FirestoreEntrant {
    id: string;
    paid: boolean;
    name?: string;
    notes?: string;
    deleted?: boolean;
}

export type EventCollectionRef = CollectionReference<DocumentData> | null;
