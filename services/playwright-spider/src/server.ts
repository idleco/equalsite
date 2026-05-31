import app from "./app";

const HOST = '0.0.0.0';
const PORT = Number(process.env.CRAWLER_PORT) || 3000;

app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
});
