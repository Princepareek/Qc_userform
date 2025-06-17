import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pkg from "pg";
import dotenv from "dotenv";

// Load .env variables
dotenv.config();

const { Client } = pkg;
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL Client using .env
const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

client.connect().then(() => {
  console.log("✅ Connected to PostgreSQL");
}).catch((err) => {
  console.error("❌ PostgreSQL connection error:", err.stack);
});

// Save form data
app.post("/submit-form", async (req, res) => {
  const {
    pcsChecked, allAccepted, overCook, underCook, foreignMaterial,
    clay, coaldebris, sizeshape, broken, thick, batch, seni, under, other,
    department, productName, process, date, time, correctiveAction,
    overCookOption, underCookOption, ForeignMaterialoption, Clayoption,
    CoalDebrisoption, SizeShapeoption, Brokenoption, ThickEdgesoption,
    Batchcodeoption, Senitizeroption, Proofoption, Otheroption, username
  } = req.body;

  try {
    await client.query(
      `INSERT INTO qc (
        Pcs_checked, All_accepted, Overcook, Undercook, Foreignmaterial, Clay,
        Coaldebris, Size_shape, Broken, Thick_edges, Batchcode_Printed, Sanitizer_Con,
        OverUnderProof, Other, Department, Product_Name, Process, Date, Time,
        CorrectiveAction, OverCook_Option, UnderCook_Option, ForeignMaterial_option,
        Clay_option, CoalDebris_option, SizeShape_option, Broken_option, ThickEdges_option,
        Batchcode_option, Senitizer_option, OverUnderProof_option, Other_option, username
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33
      )`,
      [
        pcsChecked, allAccepted, overCook, underCook, foreignMaterial,
        clay, coaldebris, sizeshape, broken, thick, batch, seni, under, other,
        department, productName, process, date, time, correctiveAction,
        overCookOption, underCookOption, ForeignMaterialoption, Clayoption,
        CoalDebrisoption, SizeShapeoption, Brokenoption, ThickEdgesoption,
        Batchcodeoption, Senitizeroption, Proofoption, Otheroption, username
      ]
    );

    res.status(200).json({ message: "✅ Data saved successfully!" });
  } catch (err) {
    console.error("❌ Insert error:", err.stack);
    res.status(500).json({ message: "Error saving data!" });
  }
});

// Fetch all form data
app.get("/fetch-data", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM qc");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Fetch error:", err.stack);
    res.status(500).json({ message: "Error fetching data!" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
