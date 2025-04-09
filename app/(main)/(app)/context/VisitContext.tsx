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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";


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

  const LOCAL_STORAGE_KEY = "visits";

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
        fetchedVisits.push({
          id: doc.id,
          name: data.name,
          activity: data.activity,
          date: data.date.toDate ? data.date.toDate() : new Date(data.date),
          location: data.location,
        });
      });

      // Atualiza o estado local e salva no AsyncStorage
      setVisits(fetchedVisits);
      await AsyncStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(fetchedVisits)
      );
    } catch (error) {
      console.error("Error fetching visits from Firestore:", error);
    }
  };

  const loadVisitsFromLocalStorage = async () => {
    try {
      const storedVisits = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedVisits) {
        const parsedVisits: Visit[] = JSON.parse(storedVisits);
        setVisits(parsedVisits);
      }
    } catch (error) {
      console.error("Error loading visits from local storage:", error);
    }
  };

  useEffect(() => {
    // Carrega os dados do armazenamento local ao inicializar
    loadVisitsFromLocalStorage();

    // Sincroniza com o Firestore quando possível
    syncVisits();
  }, []);

  const addVisit = async (visit: Visit) => {
    try {
      const docRef = await addDoc(collection(firestore, "visits"), {
        ...visit,
        date: Timestamp.fromDate(visit.date), // Converte Date para Timestamp
      });
      const newVisit = { ...visit, id: docRef.id };

      setVisits((prev) => [...prev, newVisit]);
      const updatedVisits = [...visits, newVisit];
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedVisits));
    } catch (error) {
      console.error("Error adding visit to Firestore:", error);
  
      // Salva localmente mesmo sem internet
      const newVisit = { ...visit, id: uuidv4() };
      setVisits((prev) => [...prev, newVisit]);
      const updatedVisits = [...visits, newVisit];
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedVisits));
    }
  };
  

  const updateVisit = async (id: string, updatedVisit: Visit) => {
    try {
      const visitRef = doc(firestore, "visits", id);
      await updateDoc(visitRef, {
        ...updatedVisit,
        date: Timestamp.fromDate(updatedVisit.date),
      });
  
      setVisits((prev) =>
        prev.map((visit) => (visit.id === id ? updatedVisit : visit))
      );
  
      // Atualiza localmente
      const updatedVisits = visits.map((visit) =>
        visit.id === id ? updatedVisit : visit
      );
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedVisits));
    } catch (error) {
      console.error("Error updating visit in Firestore:", error);
  
      // Atualiza localmente mesmo sem internet
      setVisits((prev) =>
        prev.map((visit) => (visit.id === id ? updatedVisit : visit))
      );
      const updatedVisits = visits.map((visit) =>
        visit.id === id ? updatedVisit : visit
      );
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedVisits));
    }
  };
  const deleteVisit = async (id: string) => {
    try {
      const visitRef = doc(firestore, "visits", id);
      await deleteDoc(visitRef);
      setVisits((prev) => prev.filter((visit) => visit.id !== id));
    } catch (error) {
      console.error("Error deleting visit from Firestore:", error);
    }
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
