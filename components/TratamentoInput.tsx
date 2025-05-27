import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import theme from "../app/styles/theme";

interface TratamentoFocal {
  tipo: string; // L1 ou L2
  quantidadeGramas: string;
  quantidadeDepTrat: string;
}
interface TratamentoPerifocal {
  tipo: string; // Ex: AD1, AD2, etc
  quantidadeCargas: string;
}

export const TratamentoInput: React.FC<{
  label: string;
  focal: TratamentoFocal;
  setFocal: (f: TratamentoFocal) => void;
  perifocal: TratamentoPerifocal;
  setPerifocal: (p: TratamentoPerifocal) => void;
}> = ({ label, focal, setFocal, perifocal, setPerifocal }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label} - Focal</Text>
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        placeholder="Tipo (L1/L2)"
        value={focal.tipo}
        onChangeText={(text) => setFocal({ ...focal, tipo: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Qtde. (g)"
        keyboardType="numeric"
        value={focal.quantidadeGramas}
        onChangeText={(text) => setFocal({ ...focal, quantidadeGramas: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Qtde. dep. trat."
        keyboardType="numeric"
        value={focal.quantidadeDepTrat}
        onChangeText={(text) => setFocal({ ...focal, quantidadeDepTrat: text })}
      />
    </View>
    <Text style={styles.label}>{label} - Perifocal</Text>
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        placeholder="Tipo Adulticida"
        value={perifocal.tipo}
        onChangeText={(text) => setPerifocal({ ...perifocal, tipo: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Qtde. cargas"
        keyboardType="numeric"
        value={perifocal.quantidadeCargas}
        onChangeText={(text) => setPerifocal({ ...perifocal, quantidadeCargas: text })}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontWeight: "bold", marginBottom: 4, color: theme.colors.primary },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.muted,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: 8,
    height: 40,
    backgroundColor: "#fff",
  },
});