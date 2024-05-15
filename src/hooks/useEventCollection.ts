import { useState, useEffect } from "react";
import { collection } from "firebase/firestore";
import db from "../firebase";
import { EventCollectionRef } from "../types";

export const useEventCollection = (selectedEventId: string | null): EventCollectionRef => {
    const [eventCollectionRef, setEventCollectionRef] = useState<EventCollectionRef>(null);

    useEffect(() => {
        if (selectedEventId) {
            setEventCollectionRef(collection(db, selectedEventId));
        } else {
            setEventCollectionRef(null);
        }
    }, [selectedEventId]);

    return eventCollectionRef;
};
