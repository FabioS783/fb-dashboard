# Facebook Ads Dashboard

Una dashboard React per analizzare le performance delle campagne Facebook Ads, con supporto per il monitoraggio di diversi network pubblicitari (Facebook, Instagram, Audience Network).

## Caratteristiche

- 📊 Visualizzazione dati in tempo reale
- 📈 Grafici interattivi per metriche chiave (CPC, CTR, CPM)
- 🔍 Filtro per piattaforma pubblicitaria
- 💡 Insights automatici sulle performance
- 📱 Design responsive
- 🌍 Supporto per la localizzazione italiana
- 📅 Selezione periodo di analisi

## Metriche Monitorate

- CPC (Costo per Click)
- CTR (Click-Through Rate)
- CPM (Costo per Mille Impressioni)
- Conversioni
- Spesa
- ROI
- Impression
- Acquisti

## Tecnologie Utilizzate

- React
- TypeScript
- Tailwind CSS
- Recharts
- date-fns
- Lodash

## Requisiti

- Node.js >= 14
- npm >= 6

## Installazione

1. Clona il repository
```bash
git clone <url-repository>
cd facebook-ads-dashboard
```

2. Installa le dipendenze
```bash
npm install
```

3. Avvia l'ambiente di sviluppo
```bash
npm start
```

L'applicazione sarà disponibile all'indirizzo `http://localhost:3003`

## Struttura del Progetto

```
src/
  ├── components/         # Componenti React
  ├── types/             # Type definitions
  ├── utils/             # Utility functions
  └── config/            # Configurazioni
```

## Configurazione

Crea un file `.env` nella root del progetto:

```env
REACT_APP_API_URL=<url-api>
REACT_APP_CLIENT_ID=<client-id>
```

## License

MIT