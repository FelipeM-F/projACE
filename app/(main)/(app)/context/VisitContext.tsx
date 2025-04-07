import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../../../../firebaseConfig";
import { getAuth } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

interface Visit {
  id: string;
  name: string;
  activity: string;
  date: Date;
  location: { latitude: number; longitude: number };
}

interface VisitContextProps {
  visits: Visit[];
  addVisit: (visit: Visit) => void;
  updateVisit: (id: string, updatedVisit: Visit) => void;
  deleteVisit: (id: string) => void;
  syncVisits: () => Promise<void>;
}

const VisitContext = createContext<VisitContextProps | undefined>(undefined);

export const VisitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    syncVisits();
  }, []);

  const syncVisits = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }
  
    try {
      const querySnapshot = await getDocs(collection(firestore, "visits"));
      const fetchedVisits: Visit[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Fetched data:", data); // Log para verificar os dados brutos
        fetchedVisits.push({
          id: doc.id,
          name: data.name,
          activity: data.activity,
          date: data.date.toDate ? data.date.toDate() : new Date(data.date),
          location: data.location,
        });
      });
      console.log("Processed visits:", fetchedVisits); // Log para verificar os dados processados
      setVisits(fetchedVisits);
    } catch (error) {
      console.error("Error fetching visits from Firestore:", error);
    }
  };

  const addVisit = async (visit: Visit) => {
    try {
      const docRef = await addDoc(collection(firestore, "visits"), {
        ...visit,
        date: Timestamp.fromDate(visit.date), // Converte Date para Timestamp
      });
      setVisits((prev) => [...prev, { ...visit, id: docRef.id }]);
    } catch (error) {
      console.error("Error adding visit to Firestore:", error);
    }
  };

  const updateVisit = async (id: string, updatedVisit: Visit) => {
    try {
      const visitRef = doc(firestore, "visits", id);
      await updateDoc(visitRef, {
        ...updatedVisit,
        date: Timestamp.fromDate(updatedVisit.date), // Converte Date para Timestamp
      });
      setVisits((prev) =>
        prev.map((visit) => (visit.id === id ? updatedVisit : visit))
      );
    } catch (error) {
      console.error("Error updating visit in Firestore:", error);
    }
  };

  const deleteVisit = (id: string) => {
    setVisits((prev) => prev.filter((visit) => visit.id !== id));
  };

  return (
    <VisitContext.Provider
      value={{ visits, addVisit, updateVisit, deleteVisit, syncVisits }}
    >
      {children}
    </VisitContext.Provider>
  );
};

export const useVisitContext = () => {
  const context = useContext(VisitContext);
  if (!context) {
    throw new Error("useVisitContext must be used within a VisitProvider");
  }
  return context;
};

export default VisitProvider;
