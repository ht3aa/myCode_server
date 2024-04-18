import * as fs from "fs";
import { getFunctions, getLibFilesContent } from "./lib/lib";

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

async function app() {
  const content =  await getLibFilesContent([], path, entries, folderIgnoreList, fileLanguagesList, 0, false)
  const functions =   getFunctions(content)



}
app();
