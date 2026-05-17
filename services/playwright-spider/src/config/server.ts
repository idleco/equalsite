const serverHost = '0.0.0.0';
const serverPort = Number(process.env.CRAWLER_PORT) || 3000;

export default {
    serverHost,
    serverPort
}
