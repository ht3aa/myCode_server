import * as fs from "fs";
import { deleteTables, getFunctionsData, getLibFilesContent, storeFunctions } from "./lib/lib";
import { Functions } from "./entities/functions.entity";
import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


async function getFilesContent() {
  const path = "/mnt/hasanweb/programming/";

  const entries = fs.readdirSync(path);

  const folderIgnoreList = [
    ".git",
    "node_modules",
    "vendor",
    "pkg",
    ".gitignore",
    "hackthon-frontend",
    "repos",
    "ssh",
    "important_notes",
    "dist",
  ];
  const fileLanguagesList = ["js", "ts", "tsx", "jsx", "go"];
  return await getLibFilesContent(
    [],
    path,
    entries,
    folderIgnoreList,
    fileLanguagesList,
    0,
    false,
  );

}



app.get("/api", async (req, res) => {
  const content = await getFilesContent();
  await deleteTables([Functions]);
  await storeFunctions(content);

  res.send(await getFunctionsData());
});










app.listen(3000, () => {
  console.log("server is running on port 3000");
});
