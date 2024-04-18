import * as fs from "fs";
import * as ts from "typescript";
import { myDataSource } from "../typeorm.config";
import escodegen from "escodegen";
import { Functions } from "../entities/functions.entity";

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
  content: Array<string>,
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

      content.push(fileContent.toString());

      // fs.copyFile(
      //   path + item,
      //   "./files/" + fileLanguage + "/" + randomsStr + "." + fileLanguage,
      //   (err) => {
      //     if (err) {
      //       console.error(err);
      //       return;
      //     }
      //   },
      // );
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

export async function storeFunctions(content: Array<string>) {
  if (!myDataSource.isInitialized) {
    await myDataSource.initialize();
  }

  const node = ts.createSourceFile("x.ts", content[3], ts.ScriptTarget.Latest);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const result = printer.printNode(ts.EmitHint.Unspecified, node.statements[5], node);
  // console.log(node.statements[5]);
  console.log(ts.isFunctionLike(node.statements[0]))
  return content;
}

export async function storeLibFilesContent() {
  if (!myDataSource.isInitialized) {
    await myDataSource.initialize();
  }
}
