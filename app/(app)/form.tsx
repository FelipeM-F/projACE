import React, { useState, useEffect } from "react";
import { Button, Alert, ScrollView } from "react-native";
import TextInputWithLabel from "../../components/textInputWithLabel";
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
  const [numDepositos, setNumDepositos] = useState("");
  const [numAmostraInicial, setNumAmostraInicial] = useState("");
  const [numAmostraFinal, setNumAmostraFinal] = useState("");
  const [numTubitos, setNumTubitos] = useState("");
  const [numDepositosEliminados, setNumDepositosEliminados] = useState("");
  const [tratamentoFocal, setTratamentoFocal] = useState("");
  const [tratamentoPerifocal, setTratamentoPerifocal] = useState("");

  const atividadeSchema = z.enum(["1", "2", "3", "4", "5", "6"], {
    errorMap: () => ({ message: "Please select a valid activity" }),
  });

  const municipioSchema = z
    .string()
    .min(2, { message: "Município deve ter pelo menos 2 caracteres" });

  const localidadeSchema = z
    .string()
    .min(2, { message: "Localidade deve ter pelo menos 2 caracteres" });

  const categoriaSchema = z.enum(["BIR", "PV"], {
    errorMap: () => ({ message: "Selecione uma categoria válida" }),
  });

  const zonaSchema = z
    .string()
    .regex(/^\d*$/, { message: "Zona deve conter apenas números" });

  const tipoSchema = z.enum(["1", "2"], {
    errorMap: () => ({ message: "Selecione um tipo válido" }),
  });

  const concluidaSchema = z.enum(["S", "N"], {
    errorMap: () => ({ message: "Selecione se a atividade foi concluída" }),
  });

  const cicloAnoSchema = z.string().regex(/^\d{2}-\d{4}$/, {
    message: "Ciclo/Ano deve estar no formato 01-2023",
  });

  const quarteiraoSchema = z.string().regex(/^\d*$/, {
    message: "Número do quarteirão deve conter apenas números",
  });

  const sequenciaSchema = z
    .string()
    .regex(/^\d*$/, { message: "Sequência deve conter apenas números" });

  const ladoSchema = z
    .string()
    .regex(/^\d*$/, { message: "Lado deve conter apenas números" });

  const logradouroSchema = z
    .string()
    .min(2, { message: "Logradouro deve ter pelo menos 2 caracteres" });

  const numeroSchema = z
    .string()
    .regex(/^\d*$/, { message: "Número deve conter apenas números" });

  const complementoSchema = z.string().optional();

  const tipoImovelSchema = z.enum(["R", "C", "TB", "PE", "O"], {
    errorMap: () => ({ message: "Selecione um tipo de imóvel válido" }),
  });

  const horaEntradaSchema = z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Hora de entrada deve estar no formato HH:mm (00:00 a 23:59)",
    });

  const visitaSchema = z
    .enum(["N", "R"], {
      errorMap: () => ({ message: "Selecione o tipo de visita" }),
    })
    .optional();

  const pendenciaSchema = z
    .enum(["R", "F"], {
      errorMap: () => ({ message: "Selecione o tipo de pendência" }),
    })
    .optional();

  const numDepositosSchema = z
    .string()
    .regex(/^\d*$/, {
      message: "Número de depósitos deve conter apenas números",
    })
    .optional();

  const numAmostraInicialSchema = z
    .string()
    .regex(/^\d*$/, {
      message: "Número da amostra inicial deve conter apenas números",
    })
    .optional();

  const numAmostraFinalSchema = z
    .string()
    .regex(/^\d*$/, {
      message: "Número da amostra final deve conter apenas números",
    })
    .optional();

  const numTubitosSchema = z
    .string()
    .regex(/^\d*$/, {
      message: "Quantidade de tubitos deve conter apenas números",
    })
    .optional();

  const numDepositosEliminadosSchema = z
    .string()
    .regex(/^\d*$/, {
      message: "Número de depósitos eliminados deve conter apenas números",
    })
    .optional();

  const tratamentoFocalSchema = z.string().optional();

  const tratamentoPerifocalSchema = z.string().optional();

  useEffect(() => {
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
        setTratamentoFocal(visit.tratamentoFocal);
        setTratamentoPerifocal(visit.tratamentoPerifocal);
      }
    }
  }, [id, visits]);

  useEffect(() => {
    setHoraEntrada(formatTimeToHHMM(dataAtividade));
  }, [dataAtividade]);

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
      municipioSchema.parse(municipio);
      localidadeSchema.parse(localidade);
      categoriaSchema.parse(categoria);
      zonaSchema.parse(zona);
      tipoSchema.parse(tipo);
      concluidaSchema.parse(concluida);
      cicloAnoSchema.parse(cicloAno);
      quarteiraoSchema.parse(quarteirao);
      sequenciaSchema.parse(sequencia);
      ladoSchema.parse(lado);
      logradouroSchema.parse(logradouro);
      numeroSchema.parse(numero);
      tipoImovelSchema.parse(tipoImovel);
      horaEntradaSchema.parse(horaEntrada);
      visitaSchema.parse(visita);
      pendenciaSchema.parse(pendencia);
      numDepositosSchema.parse(numDepositos);
      numAmostraInicialSchema.parse(numAmostraInicial);
      numAmostraFinalSchema.parse(numAmostraFinal);
      numTubitosSchema.parse(numTubitos);
      numDepositosEliminadosSchema.parse(numDepositosEliminados);
      tratamentoFocalSchema.parse(tratamentoFocal);
      tratamentoPerifocalSchema.parse(tratamentoPerifocal);

      console.log("Validation passed. Preparing data...");
      const auth = getAuth();
      const user = auth.currentUser;

      const visitData = {
        id: Array.isArray(id) ? id[0] : id || uuidv4(),
        date,
        location,
        userId: user?.uid || "unknown",
        userName: user?.displayName || "unknown",
        municipio,
        localidade,
        categoria,
        zona,
        tipo,
        concluida,
        dataAtividade,
        cicloAno,
        atividade,
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
        tratamentoFocal,
        tratamentoPerifocal,
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

  return (
    <ScrollView contentContainerStyle={formStyles.container}>
      <LocationInfo onLocationUpdate={setLocation} />
      <TextInputWithLabel
        label="Município"
        placeholder="Digite o nome do município"
        value={municipio}
        validationSchema={municipioSchema}
        onChangeText={setMunicipio}
      />
      <TextInputWithLabel
        label="Código e Nome da Localidade"
        placeholder="Digite o código e nome da localidade"
        value={localidade}
        validationSchema={localidadeSchema}
        onChangeText={setLocalidade}
      />
      <DropdownWithLabel
        label="Atividade"
        options={[
          { label: "1- LI", value: "1" },
          { label: "2- LI+T", value: "2" },
          { label: "3- PE", value: "3" },
          { label: "4- T", value: "4" },
          { label: "5- DF", value: "5" },
          { label: "6- PVE", value: "6" },
        ]}
        validationSchema={atividadeSchema}
        onChangeValue={(value) => {
          setAtividade(value);
          setErrors((prev) => ({ ...prev, activity: "" }));
        }}
        value={atividade}
      />
      <DropdownWithLabel
        label="Categoria da Localidade"
        options={[
          { label: "Bairro (BIR)", value: "BIR" },
          { label: "Povoado (PV)", value: "PV" },
        ]}
        value={categoria}
        onChangeValue={setCategoria}
        validationSchema={categoriaSchema}
      />
      <TextInputWithLabel
        label="Zona"
        placeholder="Digite o número da zona"
        value={zona}
        onChangeText={setZona}
        validationSchema={zonaSchema}
      />
      <DropdownWithLabel
        label="Tipo"
        options={[
          { label: "1 - Sede", value: "1" },
          { label: "2 - Outros", value: "2" },
        ]}
        value={tipo}
        onChangeValue={setTipo}
        validationSchema={tipoSchema}
      />
      <DropdownWithLabel
        label="Concluída"
        options={[
          { label: "Sim (S)", value: "S" },
          { label: "Não (N)", value: "N" },
        ]}
        value={concluida}
        onChangeValue={setConcluida}
        validationSchema={concluidaSchema}
      />
      <DateTimePickerWithLabel
        label="Data da Atividade"
        value={dataAtividade}
        onChange={setDataAtividade}
      />
      <TextInputWithLabel
        label="Hora de Entrada"
        placeholder="Ex: 08:20"
        value={horaEntrada}
        onChangeText={handleHoraEntradaChange}
        validationSchema={horaEntradaSchema}
      />
      <TextInputWithLabel
        label="Ciclo/Ano"
        placeholder="Digite o ciclo e ano"
        value={cicloAno}
        onChangeText={setCicloAno}
        validationSchema={cicloAnoSchema}
      />

      {/* Entomological Research/Treatment */}
      <TextInputWithLabel
        label="Número do Quarteirão"
        placeholder="Digite o número do quarteirão"
        value={quarteirao}
        onChangeText={setQuarteirao}
        validationSchema={quarteiraoSchema}
      />
      <TextInputWithLabel
        label="Sequência"
        placeholder="Digite a sequência"
        value={sequencia}
        onChangeText={setSequencia}
        validationSchema={sequenciaSchema}
      />
      <TextInputWithLabel
        label="Lado"
        placeholder="Digite o lado"
        value={lado}
        onChangeText={setLado}
        validationSchema={ladoSchema}
      />
      <TextInputWithLabel
        label="Nome do Logradouro"
        placeholder="Digite o nome do logradouro"
        value={logradouro}
        onChangeText={setLogradouro}
        validationSchema={logradouroSchema}
      />
      <TextInputWithLabel
        label="Número"
        placeholder="Digite o número"
        value={numero}
        onChangeText={setNumero}
        validationSchema={numeroSchema}
      />
      <TextInputWithLabel
        label="Complemento"
        placeholder="Digite o complemento"
        value={complemento}
        onChangeText={setComplemento}
        validationSchema={complementoSchema}
      />
      <DropdownWithLabel
        label="Tipo do Imóvel"
        options={[
          { label: "Residência (R)", value: "R" },
          { label: "Comércio (C)", value: "C" },
          { label: "Terreno Baldio (TB)", value: "TB" },
          { label: "Ponto Estratégico (PE)", value: "PE" },
          { label: "Outro (O)", value: "O" },
        ]}
        value={tipoImovel}
        onChangeValue={setTipoImovel}
        validationSchema={tipoImovelSchema}
      />
      <DropdownWithLabel
        label="Visita"
        options={[
          { label: "Normal (N)", value: "N" },
          { label: "Recuperação (R)", value: "R" },
        ]}
        value={visita}
        onChangeValue={setVisita}
        validationSchema={visitaSchema}
      />
      <DropdownWithLabel
        label="Pendência"
        options={[
          { label: "Recusado (R)", value: "R" },
          { label: "Fechado (F)", value: "F" },
        ]}
        value={pendencia}
        onChangeValue={setPendencia}
        validationSchema={pendenciaSchema}
      />
      <TextInputWithLabel
        label="Número de Depósitos Inspecionados"
        placeholder="Digite o número de depósitos inspecionados"
        value={numDepositos}
        onChangeText={setNumDepositos}
        validationSchema={numDepositosSchema}
      />
      <TextInputWithLabel
        label="Número da Amostra Inicial"
        placeholder="Digite o número da amostra inicial"
        value={numAmostraInicial}
        onChangeText={setNumAmostraInicial}
        validationSchema={numAmostraInicialSchema}
      />
      <TextInputWithLabel
        label="Número da Amostra Final"
        placeholder="Digite o número da amostra final"
        value={numAmostraFinal}
        onChangeText={setNumAmostraFinal}
        validationSchema={numAmostraFinalSchema}
      />
      <TextInputWithLabel
        label="Quantidade de Tubitos"
        placeholder="Digite a quantidade de tubitos"
        value={numTubitos}
        onChangeText={setNumTubitos}
        validationSchema={numTubitosSchema}
      />
      <TextInputWithLabel
        label="Depósitos Eliminados"
        placeholder="Digite o número de depósitos eliminados"
        value={numDepositosEliminados}
        onChangeText={setNumDepositosEliminados}
        validationSchema={numDepositosEliminadosSchema}
      />
      <TextInputWithLabel
        label="Tratamento Focal"
        placeholder="Digite os detalhes do tratamento focal"
        value={tratamentoFocal}
        onChangeText={setTratamentoFocal}
        validationSchema={tratamentoFocalSchema}
      />
      <TextInputWithLabel
        label="Tratamento Perifocal"
        placeholder="Digite os detalhes do tratamento perifocal"
        value={tratamentoPerifocal}
        onChangeText={setTratamentoPerifocal}
        validationSchema={tratamentoPerifocalSchema}
      />
      <Button
        title={isSubmitting ? "Processing..." : "Submit"}
        onPress={handleSubmit}
        disabled={isSubmitting}
      />
    </ScrollView>
  );
};



export default Form;
