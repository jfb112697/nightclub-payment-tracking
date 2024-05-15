import { doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc, DocumentSnapshot } from "firebase/firestore";
import { FirestoreEntrant, EventCollectionRef } from "../types";

// Check if a collection exists and create it if not
export async function checkAndCreateCollection(eventId: string, db: any) {
    const eventCollectionRef = doc(db, eventId);
    const snapshot = await getDoc(eventCollectionRef);

    if (!snapshot.exists()) {
        await setDoc(eventCollectionRef, { placeholder: true });
        console.log(`Collection with name "${eventId}" created.`);
    } else {
        console.log(`Collection with name "${eventId}" already exists.`);
    }
    return eventCollectionRef;
}

// Update the Firestore collection with new entrants
export async function updateFirestoreCollection(entrants: FirestoreEntrant[], eventCollectionRef: EventCollectionRef) {
    if (!entrants || !eventCollectionRef) {
        return;
    }

    const snapshot = await getDocs(eventCollectionRef);
    const firestoreEntrants: { [id: string]: boolean } = {};
    snapshot.docs.forEach((doc) => {
        firestoreEntrants[doc.id] = true;
    });

    await Promise.all(entrants.map(async (entrant) => {
        const docRef = doc(eventCollectionRef, entrant.id);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
            // Update document
            await updateDoc(docRef, { ...entrant });
        } else {
            // Add new document
            await setDoc(docRef, { ...entrant, paid: false });
        }
        delete firestoreEntrants[entrant.id];
    }));

    // Remove entrants no longer present
    Object.keys(firestoreEntrants).forEach(async (id) => {
        const docRef = doc(eventCollectionRef, id);
        await deleteDoc(docRef);
    });

    console.log("Firestore collection updated.");
}

// Handle status toggling of an entrant
export async function handlePaidStatusToggle(eventCollectionRef: EventCollectionRef, id: string, field: string, value: boolean) {
    if (!eventCollectionRef) {
        return;
    }
    const entrantDocRef = doc(eventCollectionRef, id);
    await updateDoc(entrantDocRef, { [field]: value });
    console.log(`Updated entrant with ID "${id}", set "${field}" to "${value}".`);
}

// Handle deletion of an entrant
export async function handleDelete(eventCollectionRef: EventCollectionRef, id: string) {
    if (!eventCollectionRef) {
        return;
    }
    const entrantDocRef = doc(eventCollectionRef, id);
    await deleteDoc(entrantDocRef);
    console.log(`Deleted entrant with ID "${id}".`);
}
