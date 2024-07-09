import express, { Express, Request, Response } from "express";
import apiRoutes from './routes/api';
import errorHandler from './middleware/errorHandler';


const app: Express = express();
const port = process.env.PORT || 3000;

app.use('', apiRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});