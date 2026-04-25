require("dotenv").config();
const app = require("./app");
const { env } = require("./configs/env");

const PORT = env.SERVER_PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`DEBUG: NODE_ENV = ${env.NODE_ENV}`);
    console.log(`✅ Local Backend URL: ${env.BACKEND_LOCAL_URL}`);
    console.log(`✅ Deployed Backend URL: ${env.BACKEND_SERVER_URL}`);
});