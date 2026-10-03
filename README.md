# telemetry-dashboard

Live dashboard for a simulated sensor device, built with Next.js and TypeScript. The server streams readings to the browser over Server-Sent Events, and the page charts them in real time.

## Features

- Live charts for temperature, humidity, and battery voltage over a rolling 5-minute window
- Current, minimum, and maximum for each reading
- Connection status with automatic reconnect
- Every incoming event is validated before it reaches the UI
- Simulated device on the server, so it runs without hardware

## Requirements

Node.js LTS.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
```

## Test

```bash
npm test
npm run lint && npm run type-check
```

## Layout

```
app/          page and the /api/telemetry event stream
components/   charts, stat tiles, connection status
lib/          device simulator, event schema, rolling-window stats
tests/        Vitest unit tests
```

## License

MIT
