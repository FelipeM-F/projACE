# projACE

Aplicativo mobile para registro, acompanhamento e exportação de visitas de agentes de saúde em atividades de campo, desenvolvido com [Expo](https://expo.dev), React Native e Firebase.

## Funcionalidades

- Cadastro e autenticação de usuários (Cadastrador e Digitador)
- Registro de visitas com localização, dados do imóvel, depósitos, tratamentos e pendências
- Visualização das visitas agrupadas por mês, semana e dia
- Exportação de relatórios em PDF e XLSX (Excel)
- Relatório semanal (FAD-07) por usuário
- Sincronização online/offline com Firebase e armazenamento local
- Permissões diferenciadas por perfil:
  - **Cadastrador:** pode criar, editar e visualizar apenas suas próprias visitas
  - **Digitador:** pode visualizar e exportar todas as visitas do município, mas não pode editar/excluir

## Estrutura do Projeto

```
app/
  _layout.tsx
  index.tsx
  signUp.tsx
  (app)/
    main.tsx
    form.tsx
    context/
    styles/
components/
  CustomButton.tsx
  DepositsInput.tsx
  TratamentoInput.tsx
  exportToPDF.tsx
  exportToXLSX.tsx
  exportWeekToPdf.tsx
  ...
utils/
  dateUtils.ts
firebaseConfig.js
...
```

## Instalação

1. Clone o repositório:
   ```sh
   git clone https://github.com/seu-usuario/projACE.git
   cd projACE
   ```

2. Instale as dependências:
   ```sh
   npm install
   ```

3. Configure o Firebase:
   - Edite o arquivo `firebaseConfig.js` com suas credenciais do Firebase.
   - Adicione seu arquivo `google-services.json` para Android.

4. Inicie o projeto:
   ```sh
   npx expo start
   ```

## Scripts

- `npm start` — inicia o projeto Expo
- `npm run android` — executa no emulador Android
- `npm run ios` — executa no simulador iOS
- `npm run web` — executa no navegador
- `npm run lint` — executa o linter

## Tecnologias

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Firebase (Auth & Firestore)](https://firebase.google.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/) (validação)
- [xlsx](https://www.npmjs.com/package/xlsx) (exportação Excel)
- [expo-print](https://docs.expo.dev/versions/latest/sdk/print/) (PDF)

