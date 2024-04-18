import * as fs from "fs";
import * as ts from "typescript";
import { myDataSource } from "../typeorm.config";
import escodegen from "escodegen";
import { Functions } from "../entities/functions.entity";
import { FileContent } from "./types";
import { EntityTarget, ObjectLiteral } from "typeorm";

function generateRandomString(len: number) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charsLen = chars.length;

  let str = "";
  for (let i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * charsLen));
  }

  return str;
}

export async function getLibFilesContent(
  content: Array<FileContent>,
  path: string,
  entries: Array<string>,
  folderIgnoreList: Array<string>,
  fileLanguagesList: Array<string>,
  index: number,
  libCall: boolean,
) {
  if (index >= entries.length) {
    return content;
  }

  const item = entries[index];
  const parts = item.split(".");
  const fileLanguage = parts[parts.length - 1];

  if (!folderIgnoreList.includes(item)) {
    const itemStatus: fs.Stats = await new Promise((resolve, reject) => {
      fs.stat(path + item, (err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(stats);
      });
    });

    if (itemStatus.isDirectory()) {
      const newPath = path + item + "/";

      const subEntries: Array<string> = await new Promise((resolve, reject) => {
        fs.readdir(newPath, (err, files) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(files);
        });
      });

      if (item === "lib" || libCall) {
        getLibFilesContent(
          content,
          newPath,
          subEntries,
          folderIgnoreList,
          fileLanguagesList,
          0,
          true,
        );
      }

      getLibFilesContent(
        content,
        newPath,
        subEntries,
        folderIgnoreList,
        fileLanguagesList,
        0,
        false,
      );
    } else if (libCall && fileLanguagesList.includes(fileLanguage)) {
      if (!fs.existsSync("./files/" + fileLanguage + "/")) {
        fs.mkdirSync("./files/" + fileLanguage + "/", { recursive: true });
      }

      const randomsStr = generateRandomString(10);

      const fileContent = fs.readFileSync(path + item);

      content.push({
        path: path + item,
        code: fileContent.toString(),
      });
    }
  }
  return getLibFilesContent(
    content,
    path,
    entries,
    folderIgnoreList,
    fileLanguagesList,
    index + 1,
    libCall,
  );
}

export async function storeFunctions(content: Array<FileContent>) {
  if (!myDataSource.isInitialized) {
    await myDataSource.initialize();
  }

  content.forEach((item) => {
    const node = ts.createSourceFile("x.ts", item.code, ts.ScriptTarget.Latest);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    node.statements.forEach(async (statement) => {
      if (ts.isFunctionLike(statement)) {
        const functionCode = printer.printNode(ts.EmitHint.Unspecified, statement, node);
        const matchingName = functionCode.match(/(?<=function\s).*(?=\()/gm);
        if(matchingName&&matchingName.length > 0) {
          const functionName = matchingName[0];

          const newFunctionData = new Functions();

          newFunctionData.name = functionName;
          newFunctionData.body = functionCode;
          newFunctionData.path = item.path;
          await myDataSource.getRepository(Functions).save(newFunctionData);
        }
      }
    });
  });

  return content;
}

export async function deleteTables(tables: Array<EntityTarget<ObjectLiteral>>) {
  if (!myDataSource.isInitialized) {
    await myDataSource.initialize();
  }

  tables.forEach(async (item) => {
    await myDataSource.getRepository(item).delete({});
  });

}

export async function getFunctionsData() {
  if (!myDataSource.isInitialized) {
    await myDataSource.initialize();
  }

  return myDataSource.getRepository(Functions).find();
}
