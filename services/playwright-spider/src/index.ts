import { createApp } from "./app";

const host = '0.0.0.0';
const port = Number(process.env.PORT) || 3000;
const app = createApp();

app.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
});
