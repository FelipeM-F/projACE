import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import theme from "../app/styles/theme";

interface Deposit {
  sigla: string;
  quantidade: string;
}

interface DepositsInputProps {
  onChange: (deposits: Deposit[]) => void;
  error?: string;
}

const DepositsInput: React.FC<DepositsInputProps> = ({ onChange, error }) => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [selectedSigla, setSelectedSigla] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState("");

  const siglas = ["A1", "A2", "B", "C", "D1", "D2", "E"];

  const handleAddDeposit = () => {
    if (selectedSigla && quantidade) {
      const updatedDeposits = [...deposits];
      const existingIndex = updatedDeposits.findIndex((d) => d.sigla === selectedSigla);

      if (existingIndex !== -1) {
        updatedDeposits[existingIndex].quantidade = quantidade; // Atualiza a quantidade se a sigla já existir
      } else {
        updatedDeposits.push({ sigla: selectedSigla, quantidade }); // Adiciona uma nova sigla
      }

      setDeposits(updatedDeposits);
      onChange(updatedDeposits); // Envia os dados para o formulário
      setSelectedSigla(null);
      setQuantidade("");
    }
  };

  const renderDepositItem = ({ item }: { item: Deposit }) => (
    <View style={styles.depositItem}>
      <Text style={styles.depositText}>{item.sigla}: {item.quantidade}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Número de Depósitos</Text>
      <View style={styles.siglaContainer}>
        {siglas.map((sigla) => (
          <TouchableOpacity
            key={sigla}
            style={[
              styles.siglaButton,
              selectedSigla === sigla && styles.siglaButtonSelected,
            ]}
            onPress={() => setSelectedSigla(sigla)}
          >
            <Text
              style={[
                styles.siglaText,
                selectedSigla === sigla && styles.siglaTextSelected,
              ]}
            >
              {sigla}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedSigla && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={`Quantidade para ${selectedSigla}`}
            keyboardType="numeric"
            value={quantidade}
            onChangeText={setQuantidade}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddDeposit}>
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={deposits}
        keyExtractor={(item) => item.sigla}
        renderItem={renderDepositItem}
        style={styles.depositList}
        nestedScrollEnabled={true} 
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  siglaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  siglaButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.small,
    paddingVertical: theme.spacing.tiny,
    paddingHorizontal: theme.spacing.medium,
    margin: theme.spacing.tiny,
    backgroundColor: theme.colors.light,
  },
  siglaButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  siglaText: {
    color: theme.colors.primary,
  },
  siglaTextSelected: {
    color: theme.colors.white,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.muted,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: theme.spacing.medium,
    height: 40,
    marginRight: theme.spacing.small,
  },
  addButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.small,
  },
  addButtonText: {
    color: theme.colors.white,
    fontWeight: "bold",
  },
  depositList: {
    marginTop: 10,
  },
  depositItem: {
    padding: theme.spacing.small,
    borderWidth: 1,
    borderColor: theme.colors.muted,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.tiny,
  },
  depositText: {
    fontSize: theme.fontSizes.medium,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    marginTop: theme.spacing.tiny,
  },
});

export default DepositsInput;