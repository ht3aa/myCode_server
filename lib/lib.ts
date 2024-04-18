import * as fs from "fs";

function generateRandomString(len: number) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charsLen = chars.length;

  let str = "";
  for (let i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * charsLen));
  }

  return str;
}

export async function getLibFilesContentAndStoreItInDb(
  path: string,
  entries: Array<string>,
  folderIgnoreList: Array<string>,
  fileLanguagesList: Array<string>,
  index: number,
  libCall: boolean,
) {
  if (index >= entries.length) {
    return;
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
        getLibFilesContentAndStoreItInDb(newPath, subEntries, folderIgnoreList, fileLanguagesList, 0, true);
      }

      getLibFilesContentAndStoreItInDb(newPath, subEntries, folderIgnoreList, fileLanguagesList, 0, false);
    } else if (libCall && fileLanguagesList.includes(fileLanguage)) {
      if (!fs.existsSync("./files/" + fileLanguage + "/")) {
        fs.mkdirSync("./files/" + fileLanguage + "/", { recursive: true });
      }

      const randomsStr = generateRandomString(10);
      fs.copyFile(
        path + item,
        "./files/" + fileLanguage + "/" + randomsStr + "." + fileLanguage,
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
        },
      );
    }
  }
  getLibFilesContentAndStoreItInDb(path, entries, folderIgnoreList, fileLanguagesList, index + 1, libCall);
}
