import React, { useState, useEffect } from "react";
import { Button, Alert, ScrollView,KeyboardAvoidingView, Text, FlatList } from "react-native";
import TextInputWithLabel from "../../components/TextInputWithLabel";
import DropdownWithLabel from "../../components/dropdownWithLabel";
import DateTimePickerWithLabel from "../../components/dateTimePickerWithLabel";
import LocationInfo from "../../components/location-info";
import { z } from "zod";
import { useVisitContext } from "./context/VisitContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "firebase/auth";
import formStyles from "../styles/form.styles";
import RadioButton from "../../components/RadioButton";
import DepositsInput from "../../components/DepositsInput";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";
import { TratamentoInput } from "@/components/TratamentoInput";

interface Deposit {
  sigla: string;
  quantidade: string;
}

const Form = () => {
  const formatTimeToHHMM = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Novo estado
  const { visits, addVisit, updateVisit } = useVisitContext();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [municipio, setMunicipio] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [zona, setZona] = useState("");
  const [tipo, setTipo] = useState<string | null>(null);
  const [concluida, setConcluida] = useState<string | null>(null);
  const [dataAtividade, setDataAtividade] = useState(new Date());
  const [cicloAno, setCicloAno] = useState("");
  const [cicloNumero, setCicloNumero] = useState("");
  const [atividade, setAtividade] = useState<string | null>(null);
  const [quarteirao, setQuarteirao] = useState("");
  const [sequencia, setSequencia] = useState("");
  const [lado, setLado] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [tipoImovel, setTipoImovel] = useState<string | null>(null);
  const [horaEntrada, setHoraEntrada] = useState(
    formatTimeToHHMM(dataAtividade)
  );
  const [visita, setVisita] = useState<string | null>(null);
  const [pendencia, setPendencia] = useState<string | null>(null);
  const [numDepositos, setNumDepositos] = useState<Deposit[]>([]);
  const [numAmostraInicial, setNumAmostraInicial] = useState("");
  const [numAmostraFinal, setNumAmostraFinal] = useState("");
  const [numTubitos, setNumTubitos] = useState("");
  const [numDepositosEliminados, setNumDepositosEliminados] = useState("");
  const [tratamentoFocal, setTratamentoFocal] = useState({
    tipo: "",
    quantidadeGramas: "",
    quantidadeDepTrat: "",
  });
  const [tratamentoPerifocal, setTratamentoPerifocal] = useState({
    tipo: "",
    quantidadeCargas: "",
  });

  const atividadeSchema = z.enum(["1", "2", "3", "4", "5", "6"], {
    errorMap: () => ({ message: "Please select a valid activity" }),
  });

  const formSchema = z.object({
    municipio: z
      .string()
      .min(2, { message: "Município deve ter pelo menos 2 caracteres" }),
    localidade: z
      .string()
      .min(2, { message: "Localidade deve ter pelo menos 2 caracteres" }),
    categoria: z.enum(["BIR", "PV"], {
      errorMap: () => ({ message: "Selecione uma categoria válida" }),
    }),
    zona: z
      .string()
      .regex(/^\d*$/, { message: "Zona deve conter apenas números" }),
    tipo: z.enum(["1", "2"], {
      errorMap: () => ({ message: "Selecione um tipo válido" }),
    }),
    concluida: z.enum(["S", "N"], {
      errorMap: () => ({ message: "Selecione se a atividade foi concluída" }),
    }),
    cicloAno: z.string().regex(/^\d{2}-\d{4}$/, {
      message: "Ciclo/Ano deve estar no formato 01-2023",
    }),
    quarteirao: z.string().regex(/^\d*$/, {
      message: "Número do quarteirão deve conter apenas números",
    }),
    sequencia: z
      .string()
      .regex(/^\d*$/, { message: "Sequência deve conter apenas números" }),
    lado: z
      .string()
      .regex(/^\d*$/, { message: "Lado deve conter apenas números" }),
    logradouro: z
      .string()
      .min(2, { message: "Logradouro deve ter pelo menos 2 caracteres" }),
    numero: z.string(),
    complemento: z.string().optional(),
    tipoImovel: z.enum(["R", "C", "TB", "PE", "O"], {
      errorMap: () => ({ message: "Selecione um tipo de imóvel válido" }),
    }),
    horaEntrada: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Hora de entrada deve estar no formato HH:mm (00:00 a 23:59)",
    }),
    visita: z.enum(["N", "R"]).optional(),
    pendencia: z.enum(["R", "F", ""]).nullable().optional(),
    numDepositos: z
      .array(
        z.object({
          sigla: z.string(),
          quantidade: z.string(),
        })
      )
      .optional(),
    numAmostraInicial: z
      .string()
      .regex(/^\d*$/, {
        message: "Número da amostra inicial deve conter apenas números",
      })
      .optional(),
    numAmostraFinal: z
      .string()
      .regex(/^\d*$/, {
        message: "Número da amostra final deve conter apenas números",
      })
      .optional(),
    numTubitos: z
      .string()
      .regex(/^\d*$/, {
        message: "Quantidade de tubitos deve conter apenas números",
      })
      .optional(),
    numDepositosEliminados: z
      .string()
      .regex(/^\d*$/, {
        message: "Número de depósitos eliminados deve conter apenas números",
      })
      .optional(),
    tratamentoFocal: z.string().optional(),
    tratamentoPerifocal: z.string().optional(),
  });

  useEffect(() => {
    const fetchMunicipio = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setMunicipio(userData.municipio || "");
        }
      }
    };

    if (id) {
      const visit = visits.find((v) => v.id === id);
      if (visit) {
        setDate(new Date(visit.date));
        setLocation(visit.location);
        setMunicipio(visit.municipio);
        setLocalidade(visit.localidade);
        setCategoria(visit.categoria);
        setZona(visit.zona);
        setTipo(visit.tipo);
        setConcluida(visit.concluida);
        setDataAtividade(new Date(visit.dataAtividade));
        setCicloAno(visit.cicloAno);
        setCicloNumero(visit.cicloAno ? visit.cicloAno.split("-")[0] : "");
        setAtividade(visit.atividade);
        setQuarteirao(visit.quarteirao);
        setSequencia(visit.sequencia);
        setLado(visit.lado);
        setLogradouro(visit.logradouro);
        setNumero(visit.numero);
        setComplemento(visit.complemento);
        setTipoImovel(visit.tipoImovel);
        setHoraEntrada(visit.horaEntrada);
        setVisita(visit.visita);
        setPendencia(visit.pendencia);
        setNumDepositos(visit.numDepositos);
        setNumAmostraInicial(visit.numAmostraInicial);
        setNumAmostraFinal(visit.numAmostraFinal);
        setNumTubitos(visit.numTubitos);
        setNumDepositosEliminados(visit.numDepositosEliminados);
        setTratamentoFocal(() => {
          if (typeof visit.tratamentoFocal === "string") {
            try {
              const parsed = JSON.parse(visit.tratamentoFocal);
              return parsed;
            } catch {
              return {
                tipo: visit.tratamentoFocal,
                quantidadeGramas: "",
                quantidadeDepTrat: "",
              };
            }
          }
          return visit.tratamentoFocal;
        });
        setTratamentoPerifocal(() => {
          if (typeof visit.tratamentoPerifocal === "string") {
            try {
              const parsed = JSON.parse(visit.tratamentoPerifocal);
              return parsed;
            } catch {
              return {
                tipo: visit.tratamentoPerifocal,
                quantidadeCargas: "",
              };
            }
          }
          return visit.tratamentoPerifocal;
        });
      }
    } else {
      fetchMunicipio();
    }
  }, [id, visits]);

  useEffect(() => {
    setHoraEntrada(formatTimeToHHMM(dataAtividade));
  }, [dataAtividade]);

  useEffect(() => {
    if (cicloNumero && dataAtividade) {
      const ano = dataAtividade.getFullYear();
      setCicloAno(`${cicloNumero.padStart(2, "0")}-${ano}`);
    } else {
      setCicloAno("");
    }
  }, [cicloNumero, dataAtividade]);

  const handleHoraEntradaChange = (text: string) => {
    setHoraEntrada(text);

    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(text)) {
      const [hours, minutes] = text.split(":");
      const newDate = new Date(dataAtividade);
      newDate.setHours(parseInt(hours, 10));
      newDate.setMinutes(parseInt(minutes, 10));
      setDataAtividade(newDate);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      console.log("Submit button is disabled because isSubmitting is true.");
      return; // Evita múltiplos cliques
    }

    console.log("Submit button clicked.");
    setIsSubmitting(true); // Ativa o estado de submitting

    try {
      const formData = {
        municipio,
        localidade,
        categoria,
        zona,
        tipo,
        concluida,
        cicloAno,
        quarteirao,
        sequencia,
        lado,
        logradouro,
        numero,
        complemento,
        tipoImovel,
        horaEntrada,
        visita,
        pendencia,
        numDepositos,
        numAmostraInicial,
        numAmostraFinal,
        numTubitos,
        numDepositosEliminados,
        tratamentoFocal: JSON.stringify(tratamentoFocal),
        tratamentoPerifocal: JSON.stringify(tratamentoPerifocal),
      };

      formSchema.parse(formData);

      console.log("Validation passed. Preparing data...");
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erro", "Usuário não autenticado.");
        setIsSubmitting(false);
        return;
      }
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      const nomeUsuario = userDoc.exists()
        ? userDoc.data().nome
        : user.displayName || user.email || "unknown";

      const visitData = {
        id: Array.isArray(id) ? id[0] : id || uuidv4(),
        date,
        location,
        userId: user?.uid || "unknown",
        userEmail: user?.displayName || "unknown",
        userName: nomeUsuario,
        dataAtividade,
        atividade,
        ...formData,
      };

      console.log("Sending data:", visitData);

      if (id) {
        await updateVisit(id as string, visitData);
        Alert.alert("Success", "Visit updated successfully!");
      } else {
        await addVisit(visitData);
        Alert.alert("Success", "Visit saved successfully!");
      }

      router.push("/main");
    } catch (e) {
      console.error("Error during submission:", e);
      const newErrors: { [key: string]: string } = {};
      if (e instanceof z.ZodError) {
        e.errors.forEach((error) => {
          newErrors[error.path[0]] = error.message;
        });
      } else {
        newErrors.general = (e as Error).message;
      }
      setErrors(newErrors);
    } finally {
      console.log("Submission process completed.");
      setIsSubmitting(false); // Desativa o estado de submitting
    }
  };
  const formFields = [
    {
      key: "location",
      component: <LocationInfo onLocationUpdate={setLocation} />,
    },
    {
      key: "municipio",
      component: (
        <TextInputWithLabel
          label="Município"
          placeholder="Digite o nome do município"
          value={municipio}
          onChangeText={setMunicipio}
          error={errors.municipio}
          validationSchema={formSchema.shape.municipio}
        />
      ),
    },
    {
      key: "atividade",
      component: (
        <>
          <Text style={formStyles.label}>Atividade</Text>
          <RadioButton
            options={[
              { label: "1- LI", value: "1" },
              { label: "2- LI+T", value: "2" },
              { label: "3- PE", value: "3" },
              { label: "4- T", value: "4" },
              { label: "5- DF", value: "5" },
              { label: "6- PVE", value: "6" },
            ]}
            selectedValue={atividade ?? undefined}
            onSelect={(value: string | null) => {
              setAtividade(value);
              setErrors((prev) => ({ ...prev, atividade: "" }));
            }}
          />
          {errors.atividade && (
            <Text style={formStyles.errorText}>{errors.atividade}</Text>
          )}
        </>
      ),
    },
    {
      key: "localidade",
      component: (
        <TextInputWithLabel
          label="Código e nome da Localidade"
          placeholder="Digite o nome da localidade"
          value={localidade}
          onChangeText={setLocalidade}
          error={errors.localidade}
          validationSchema={formSchema.shape.localidade}
        />
      ),
    },
    {
      key: "categoria",
      component: (
        <>
          <Text style={formStyles.label}>Categoria da Localidade</Text>
          <RadioButton
            options={[
              { label: "Bairro (BIR)", value: "BIR" },
              { label: "Povoado (PV)", value: "PV" },
            ]}
            selectedValue={categoria ?? undefined}
            onSelect={(value: string | null) => {
              setCategoria(value);
              setErrors((prev) => ({ ...prev, categoria: "" }));
            }}
          />
          {errors.categoria && (
            <Text style={formStyles.errorText}>{errors.categoria}</Text>
          )}
        </>
      ),
    },
    {
      key: "zona",
      component: (
        <TextInputWithLabel
          label="Zona"
          placeholder="Digite o número da zona"
          value={zona}
          onChangeText={setZona}
          validationSchema={formSchema.shape.zona}
          error={errors.zona}
        />
      ),
    },
    {
      key: "tipo",
      component: (
        <>
          <Text style={formStyles.label}>Tipo</Text>
          <RadioButton
            options={[
              { label: "1 - Sede", value: "1" },
              { label: "2 - Outros", value: "2" },
            ]}
            selectedValue={tipo ?? undefined}
            onSelect={(value: string | null) => {
              setTipo(value);
              setErrors((prev) => ({ ...prev, tipo: "" }));
            }}
          />
          {errors.concluida && (
            <Text style={formStyles.errorText}>{errors.tipo}</Text>
          )}
        </>
      ),
    },
    // {
    //   key: "concluida",
    //   component: (
    //     <DropdownWithLabel
    //       label="Concluída"
    //       options={[
    //         { label: "Sim (S)", value: "S" },
    //         { label: "Não (N)", value: "N" },
    //       ]}
    //       value={concluida}
    //       onChangeValue={setConcluida}
    //       validationSchema={formSchema.shape.concluida}
    //       error={errors.concluida}
    //     />
    //   ),
    // },
    {
      key: "concluidaRadio",
      component: (
        <>
          <Text style={formStyles.label}>Concluída</Text>
          <RadioButton
            options={[
              { label: "Sim (S)", value: "S" },
              { label: "Não (N)", value: "N" },
            ]}
            selectedValue={concluida ?? undefined}
            onSelect={(value: string | null) => {
              setConcluida(value);
              setErrors((prev) => ({ ...prev, concluida: "" }));
            }}
          />
          {errors.concluida && (
            <Text style={formStyles.errorText}>{errors.concluida}</Text>
          )}
        </>
      ),
    },
    {
      key: "dataAtividade",
      component: (
        <DateTimePickerWithLabel
          label="Data da Atividade"
          value={dataAtividade}
          onChange={setDataAtividade}
        />
      ),
    },
    {
      key: "cicloNumero",
      component: (
        <TextInputWithLabel
          label="Número do Ciclo"
          placeholder="Digite o número do ciclo"
          value={cicloNumero}
          onChangeText={setCicloNumero}
          validationSchema={z.string().regex(/^\d+$/, {
            message: "O ciclo deve conter apenas números",
          })}
          error={errors.cicloAno}
        />
      ),
    },
    {
      key: "cicloAnoInfo",
      component: (
        <Text style={{ color: "#888", marginBottom: 10 }}>
          Ciclo/Ano gerado:{" "}
          <Text style={{ fontWeight: "bold" }}>{cicloAno || "--"}</Text>
        </Text>
      ),
    },
    {
      key: "quarteirao",
      component: (
        <TextInputWithLabel
          label="Número do Quarteirão"
          placeholder="Digite o número do quarteirão"
          value={quarteirao}
          onChangeText={setQuarteirao}
          validationSchema={formSchema.shape.quarteirao}
          error={errors.quarteirao}
        />
      ),
    },
    {
      key: "sequencia",
      component: (
        <TextInputWithLabel
          label="Sequência"
          placeholder="Digite a sequência"
          value={sequencia}
          onChangeText={setSequencia}
          validationSchema={formSchema.shape.sequencia}
          error={errors.sequencia}
        />
      ),
    },
    {
      key: "lado",
      component: (
        <TextInputWithLabel
          label="Lado"
          placeholder="Digite o lado"
          value={lado}
          onChangeText={setLado}
          validationSchema={formSchema.shape.lado}
          error={errors.lado}
        />
      ),
    },
    {
      key: "logradouro",
      component: (
        <TextInputWithLabel
          label="Nome do Logradouro"
          placeholder="Digite o nome do logradouro"
          value={logradouro}
          onChangeText={setLogradouro}
          validationSchema={formSchema.shape.logradouro}
          error={errors.logradouro}
        />
      ),
    },
    {
      key: "numero",
      component: (
        <TextInputWithLabel
          label="Número"
          placeholder="Digite o número"
          keyboardType="numeric"
          value={numero}
          onChangeText={setNumero}
          validationSchema={formSchema.shape.numero}
          error={errors.numero}
        />
      ),
    },
    {
      key: "complemento",
      component: (
        <TextInputWithLabel
          label="Complemento"
          placeholder="Digite o complemento"
          value={complemento}
          onChangeText={setComplemento}
          validationSchema={formSchema.shape.complemento}
          error={errors.complemento}
        />
      ),
    },
    {
      key: "tipoImovelRadio",
      component: (
        <>
          <Text style={formStyles.label}>Tipo de Imóvel</Text>

          <RadioButton
            options={[
              { label: "Residência (R)", value: "R" },
              { label: "Comércio (C)", value: "C" },
              { label: "Terreno Baldio (TB)", value: "TB" },
              { label: "Ponto Estratégico (PE)", value: "PE" },
              { label: "Outro (O)", value: "O" },
            ]}
            selectedValue={tipoImovel ?? undefined}
            onSelect={(value: string | null) => {
              setTipoImovel(value);
              setErrors((prev) => ({ ...prev, tipoImovel: "" }));
            }}
          />
          {errors.tipoImovel && (
            <Text style={formStyles.errorText}>{errors.tipoImovel}</Text>
          )}
        </>
      ),
    },
    {
      key: "visita",
      component: (
        <>
          <Text style={formStyles.label}>Tipo de Visita</Text>

          <RadioButton
            options={[
              { label: "Normal (N)", value: "N" },
              { label: "Recuperação (R)", value: "R" },
            ]}
            selectedValue={visita ?? undefined}
            onSelect={(value: string | null) => {
              setVisita(value);
              setErrors((prev) => ({ ...prev, visita: "" }));
            }}
          />
          {errors.visita && (
            <Text style={formStyles.errorText}>{errors.visita}</Text>
          )}
        </>
      ),
    },
    {
      key: "pendencia",
      component: (
        <DropdownWithLabel
          label="Pendência"
          options={[
            { label: "Recusado (R)", value: "R" },
            { label: "Fechado (F)", value: "F" },
            { label: "Sem Pendência", value: null },
          ]}
          value={pendencia}
          onChangeValue={setPendencia}
          validationSchema={formSchema.shape.pendencia}
          error={errors.pendencia}
        />
      ),
    },
    {
      key: "depositsInput",
      component: (
        <DepositsInput
          value={numDepositos}
          onChange={(deposits) => {
            setNumDepositos(deposits);
            setErrors((prev) => ({ ...prev, numDepositos: "" })); // Limpa o erro
          }}
          error={errors.numDepositos}
        />
      ),
    },
    {
      key: "numAmostraInicial",
      component: (
        <TextInputWithLabel
          label="Número da Amostra Inicial"
          placeholder="Digite o número da amostra inicial"
          value={numAmostraInicial}
          onChangeText={setNumAmostraInicial}
          validationSchema={formSchema.shape.numAmostraInicial}
          error={errors.numAmostraInicial}
        />
      ),
    },
    {
      key: "numAmostraFinal",
      component: (
        <TextInputWithLabel
          label="Número da Amostra Final"
          placeholder="Digite o número da amostra final"
          value={numAmostraFinal}
          onChangeText={setNumAmostraFinal}
          validationSchema={formSchema.shape.numAmostraFinal}
          error={errors.numAmostraFinal}
        />
      ),
    },
    {
      key: "numTubitos",
      component: (
        <TextInputWithLabel
          label="Quantidade de Tubitos"
          placeholder="Digite a quantidade de tubitos"
          value={numTubitos}
          onChangeText={setNumTubitos}
          validationSchema={formSchema.shape.numTubitos}
          error={errors.numTubitos}
        />
      ),
    },
    {
      key: "numDepositosEliminados",
      component: (
        <TextInputWithLabel
          label="Depósitos Eliminados"
          placeholder="Digite o número de depósitos eliminados"
          value={numDepositosEliminados}
          onChangeText={setNumDepositosEliminados}
          validationSchema={formSchema.shape.numDepositosEliminados}
          error={errors.numDepositosEliminados}
        />
      ),
    },
    {
      key: "tratamentoFocalPerifocal",
      component: (
        <TratamentoInput
          label="Tratamento"
          focal={tratamentoFocal}
          setFocal={setTratamentoFocal}
          perifocal={tratamentoPerifocal}
          setPerifocal={setTratamentoPerifocal}
        />
      ),
    },

    {
      key: "submit",
      component: (
        <Button
          title={isSubmitting ? "Enviando..." : "Enviar"}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      ),
    },
  ];

  return (
      <KeyboardAvoidingView
    style={{ flex: 1 }}
  >
    <ScrollView
      contentContainerStyle={formStyles.container}
      keyboardShouldPersistTaps="handled"
    >
      {formFields.map((field) => (
        <React.Fragment key={field.key}>{field.component}</React.Fragment>
      ))}
    </ScrollView>
  </KeyboardAvoidingView>
  );
};

export default Form;
