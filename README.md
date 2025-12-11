# 🚶‍♂️ PassoAmigo

Um aplicativo mobile moderno para registro e acompanhamento de caminhadas com rastreamento GPS em tempo real.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📥 Download

<div align="center">

### **Baixe o arquivo (.zip)**

[![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)](https://drive.google.com/file/d/1_ALzoKUcSP2tdtDLU9ErGwbydpNd-GPX/view?usp=sharing)

</div>

---

## 📋 Sobre o Projeto

O **PassoAmigo** é um aplicativo React Native desenvolvido com Expo que permite aos usuários:

- 👤 **Gerenciar múltiplos usuários** com CRUD completo
- 🚶‍♂️ **Registrar caminhadas** com rastreamento GPS preciso
- 📊 **Visualizar estatísticas** e gráficos semanais no Dashboard
- 🗺️ **Ver rotas no mapa** com visualização completa do trajeto
- 📤 **Exportar dados** em CSV ou JSON
- ⚙️ **Configurar backend** opcional (Spring Boot)

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** 18+ 
- **Expo CLI** (`npm install -g @expo/cli`)
- **Java 17+** (opcional, apenas para backend)
- **Maven 3.6+** (opcional, apenas para backend)

### Instalação e Execução

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/passoAmigo.git
cd passoAmigo

# 2. Instale as dependências
cd mobile
npm install

# 3. Inicie o app
npx expo start --tunnel -c
```

### Executar no Dispositivo

1. Instale o **Expo Go** no seu celular (Android/iOS)
2. Escaneie o QR code exibido no terminal
3. O app será carregado no seu dispositivo

### Build para APK (EAS Build)

```bash
# Instale o EAS CLI
npm install -g eas-cli

# Configure o projeto
eas build:configure

# Faça o build
eas build --platform android
```

## 📱 Funcionalidades

### ✅ Implementadas

- **Usuários**
  - Criar, editar, excluir e buscar usuários
  - Validação completa de formulários
  - Swipe-to-delete com confirmação

- **Caminhadas**
  - Visualizar todas as caminhadas registradas
  - Ver rotas no mapa (caminhadas com GPS)
  - Estatísticas de distância total

- **Activity (GPS Tracking)**
  - Rastreamento GPS em tempo real
  - Seleção de usuário antes de iniciar
  - Timer com contagem regressiva
  - Pausar e retomar caminhadas
  - Cálculo automático de distância
  - Salvamento com confirmação

- **Dashboard**
  - Estatísticas do dia, semana e total
  - Gráfico semanal interativo
  - Barra de progresso de metas
  - Atualização automática

- **Configurações**
  - Configuração de backend opcional
  - Exportação de dados (CSV/JSON)
  - Instruções de conexão

- **Tutorial**
  - Tela de tutorial completa
  - Acessível pelo header
  - Guia passo a passo

- **Welcome Screen**
  - Tela de apresentação na primeira execução
  - Animações suaves
  - Informações sobre o app

## 🏗️ Arquitetura

### Frontend (React Native + Expo)

```
mobile/
├── src/
│   ├── api/              # Cliente REST para backend
│   ├── components/       # Componentes reutilizáveis
│   ├── data/            # Repository pattern
│   ├── screens/         # Telas da aplicação
│   ├── storage/         # AsyncStorage (persistência local)
│   ├── theme/           # Sistema de design
│   └── utils/           # Utilitários (logger, export, etc.)
├── App.js               # Entry point
└── app.json             # Configuração Expo
```

### Backend (Spring Boot) - Opcional

```
src/
├── main/java/app/caminhada/passoAmigo/
│   ├── controller/      # REST Controllers
│   ├── model/          # Entidades (User, Walk)
│   ├── repository/      # JPA Repositories
│   ├── service/         # Business logic
│   └── config/          # Configurações (CORS)
└── resources/
    └── application.properties
```

## 🎨 Sistema de Design

O app utiliza um sistema de design moderno e consistente:

- **Cores**: Paleta azul/verde moderna
- **Tipografia**: Hierarquia clara
- **Componentes**: Button, Card, LoadingStates
- **Espaçamentos**: Sistema de spacing padronizado
- **Sombras**: Elevações sutis e modernas

## 🔧 Tecnologias Utilizadas

### Frontend
- **React Native** (Expo SDK 53)
- **React Navigation** (Tabs + Stack)
- **AsyncStorage** (Persistência local)
- **expo-location** (GPS tracking)
- **react-native-maps** (Visualização de rotas)
- **Victory Charts** (Gráficos)

### Backend (Opcional)
- **Spring Boot** 3.5.5
- **Spring Data JPA** (H2 Database)
- **REST API**

## 📦 Persistência de Dados

### Modo Local (Padrão)
- Dados salvos em **AsyncStorage** (local no dispositivo)
- Funciona offline
- Não sincroniza entre dispositivos

### Modo Backend (Opcional)
- Dados salvos no servidor (H2 Database)
- Sincroniza entre dispositivos
- Requer backend rodando

**Configuração**: Vá em **Configurações → Configurações de Conexão**

## 🗺️ Estrutura do Projeto

```
passoAmigo/
├── mobile/              # Frontend React Native
│   ├── src/
│   ├── assets/
│   ├── App.js
│   └── package.json
├── src/                 # Backend Spring Boot (opcional)
│   └── main/java/...
├── pom.xml              # Maven (backend)
└── README.md
```

## 🐛 Troubleshooting

### Metro/Expo Cache
Se encontrar erros relacionados ao cache:
```bash
cd mobile
rm -rf .expo node_modules package-lock.json
npm install
npx expo start --tunnel -c
```

### Permissões GPS
- O app solicita permissão automaticamente
- Se negada, mostra tela explicativa
- Configure nas Settings do dispositivo

### Backend não conecta
- Verifique se o backend está rodando (porta 8080)
- Use o IP correto:
  - **Emulador**: `http://10.0.2.2:8080`
  - **Dispositivo/APK**: `http://[IP_DO_SERVIDOR]:8080`

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abrir um Pull Request

## 📞 Suporte

- **Issues**: Use GitHub Issues para reportar bugs
- **Documentação**: Consulte este README
- **Logs**: Verifique o console para debugging

---

**Desenvolvido com ❤️ usando React Native e Expo**
