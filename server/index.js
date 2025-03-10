import express from "express";
import morgan from "morgan";
import cors from "cors";
import todosRoutes from "./routes/todos.routes.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/todos", todosRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
