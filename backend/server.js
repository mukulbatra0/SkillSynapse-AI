import dotenv from "dotenv"
dotenv.config();
import app from "./src/app.js";
import connectToDb from "./src/config/database.js";

const PORT = process.env.PORT || 3000;

connectToDb()
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})