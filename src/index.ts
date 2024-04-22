import app from "./app";
import config from "./config";
import { waitForDBConnection } from "./db";
import logger from "./utils/logger.util";

(async () => {
    const PORT = config.PORT;
    await waitForDBConnection();

    app.listen(PORT, () => {
        logger.info(`Server is running at http://localhost:${PORT}`);
    });
})();