import app from "./routes";
import config from './config/server'

app.listen(config.serverPort, config.serverHost, () => {
    console.log(`Server listening on http://${config.serverHost}:${config.serverPort}`);
});
