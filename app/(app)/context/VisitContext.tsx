import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../../../firebaseConfig";
import { getAuth } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

export interface Visit {
  id: string;
  name: string;
  activity: string;
  date: Date;
  location: { latitude: number; longitude: number };
  userId: string;
  userName: string;
  municipio: string;
  localidade: string;
  categoria: string | null;
  zona: string;
  tipo: string | null;
  concluida: string | null;
  dataAtividade: Date;
  cicloAno: string;
  atividade: string | null;
  quarteirao: string;
  sequencia: string;
  lado: string;
  logradouro: string;
  numero: string;
  complemento: string;
  tipoImovel: string | null;
  horaEntrada: string;
  visita: string | null;
  pendencia: string | null;
  numDepositos: string;
  numAmostraInicial: string;
  numAmostraFinal: string;
  numTubitos: string;
  numDepositosEliminados: string;
  tratamentoFocal: string;
  tratamentoPerifocal: string;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Novo estado

  const LOCAL_STORAGE_KEY = "visits";

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true); // Usuário autenticado
        syncVisits(); // Sincroniza visitas após autenticação
      } else {
        setIsAuthenticated(false); // Usuário não autenticado
        console.error("User is not authenticated.");
      }
    });

    return () => unsubscribe();
  }, []);

  const syncVisits = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }
    try {
      // Puxa os dados do Firestore
      const querySnapshot = await getDocs(collection(firestore, "visits"));
      const firestoreVisits: Visit[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        firestoreVisits.push({
          id: doc.id,
          name: data.name,
          activity: data.activity,
          date: data.date.toDate(), // Converte Timestamp para Date
          location: data.location,
          userId: data.userId,
          userName: data.userName,
          municipio: data.municipio,
          localidade: data.localidade,
          categoria: data.categoria,
          zona: data.zona,
          tipo: data.tipo,
          concluida: data.concluida,
          dataAtividade: data.dataAtividade.toDate(), // Converte Timestamp para Date
          cicloAno: data.cicloAno,
          atividade: data.atividade,
          quarteirao: data.quarteirao,
          sequencia: data.sequencia,
          lado: data.lado,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          tipoImovel: data.tipoImovel,
          horaEntrada: data.horaEntrada,
          visita: data.visita,
          pendencia: data.pendencia,
          numDepositos: data.numDepositos,
          numAmostraInicial: data.numAmostraInicial,
          numAmostraFinal: data.numAmostraFinal,
          numTubitos: data.numTubitos,
          numDepositosEliminados: data.numDepositosEliminados,
          tratamentoFocal: data.tratamentoFocal,
          tratamentoPerifocal: data.tratamentoPerifocal,
        });
      });
  
      // Puxa os dados locais do AsyncStorage
      const storedVisits = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
      const localVisits: Visit[] = storedVisits ? JSON.parse(storedVisits) : [];
  
      // Mescla os dados locais e do Firestore, priorizando os locais
      const mergedVisits = [...firestoreVisits];
      localVisits.forEach((localVisit) => {
        const index = mergedVisits.findIndex((v) => v.id === localVisit.id);
        if (index === -1) {
          mergedVisits.push(localVisit); // Adiciona visitas locais que não estão no Firestore
        }
      });
  
      // Atualiza o estado local e salva no AsyncStorage
      setVisits(mergedVisits);
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedVisits));
    } catch (error) {
      console.error("Error syncing visits:", error);
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
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }
  
    try {
      // Salva no Firestore
      const docRef = await addDoc(collection(firestore, "visits"), {
        ...visit,
        userId: user.uid,
        userName: user.email || "Anonymous",
        date: Timestamp.fromDate(visit.date),
        dataAtividade: Timestamp.fromDate(visit.dataAtividade), // Converte para Timestamp
      });
  
      const newVisit = {
        ...visit,
        id: docRef.id,
        userId: user.uid,
        userName: user.email || "Anonymous",
      };
  
      // Atualiza o estado local
      setVisits((prev) => [...prev, newVisit]);
  
      // Salva no AsyncStorage
      const updatedVisits = [...visits, newVisit];
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedVisits));
    } catch (error) {
      console.error("Error adding visit to Firestore:", error);
  
      // Salva localmente mesmo sem internet
      const newVisit = {
        ...visit,
        id: `offline-${uuidv4()}`,
        userId: user.uid,
        userName: user.email || "Anonymous",
      };
      setVisits((prev) => [...prev, newVisit]);
      const updatedVisits = [...visits, newVisit];
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedVisits));
    }
  };

  const updateVisit = async (id: string, updatedVisit: Visit) => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }
  
    try {
      const visitRef = doc(firestore, "visits", id);
      await updateDoc(visitRef, {
        ...updatedVisit,
        userId: user.uid,
        userName: user.email || "Anonymous",
        date: Timestamp.fromDate(updatedVisit.date),
        dataAtividade: Timestamp.fromDate(updatedVisit.dataAtividade), // Converte para Timestamp
      });
  
      setVisits((prev) =>
        prev.map((visit) =>
          visit.id === id
            ? {
                ...updatedVisit,
                userId: user.uid,
                userName: user.email || "Anonymous",
              }
            : visit
        )
      );
  
      // Atualiza localmente
      const updatedVisits = visits.map((visit) =>
        visit.id === id
          ? {
              ...updatedVisit,
              userId: user.uid,
              userName: user.email || "Anonymous",
            }
          : visit
      );
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedVisits));
    } catch (error) {
      console.error("Error updating visit in Firestore:", error);
  
      // Atualiza localmente mesmo sem internet
      setVisits((prev) =>
        prev.map((visit) =>
          visit.id === id
            ? {
                ...updatedVisit,
                userId: user.uid,
                userName: user.email || "Anonymous",
              }
            : visit
        )
      );
      const updatedVisits = visits.map((visit) =>
        visit.id === id
          ? {
              ...updatedVisit,
              userId: user.uid,
              userName: user.email || "Anonymous",
            }
          : visit
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
