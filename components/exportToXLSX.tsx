import XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { Visit } from "../app/(app)/context/VisitContext";

export const exportToXLSX = async (date: string, visits: Visit[]) => {
  const worksheetData = [
    ["Name", "Activity", "Location", "Registered By"],
    ...visits.map((visit) => [
      visit.cicloAno,
      `${visit.location.latitude}, ${visit.location.longitude}`,
      visit.userName,
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Visits");

  const fileUri = `${FileSystem.documentDirectory}Visits_${date.replace(
    /\//g,
    "-"
  )}.xlsx`;

  try {
    const excelData = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
    await FileSystem.writeAsStringAsync(fileUri, excelData, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error("Error exporting to XLSX:", error);
    Alert.alert("Error", "Failed to export to XLSX.");
  }
};