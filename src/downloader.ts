import * as https from "https";
import * as fs from "fs";
import * as request from "request";
import { IncomingMessage } from "http";
const MaxRedirects = 10;
export interface DownloadProgress {
  (progress: number): void;
}
/**
 *  https://repl.it/@lordproud/Downloading-file-in-nodejs
 * @param url
 * @param path
 * @param progress
 */
export async function download(
  url: string,
  path: string,
  progress?: DownloadProgress
): Promise<any> {
  const fileStream = fs.createWriteStream(path);

  return new Promise((resolve, reject) => {
    const download = request
      .get(url, { followAllRedirects: true }, (error, rsp) => {
        if (rsp.statusCode >= 400) {
          fileStream.close();
          reject(
            `download failed, status code :[${rsp.statusCode} , ${
              rsp.statusMessage
            }] `
          );
        } else if (rsp.statusCode === 302 || rsp.statusCode === 301) {
          console.log(`may be request bugs`);
        } else if (rsp.statusCode < 300) {
          const len = parseInt(rsp.headers["content-length"], 10);
          let downloaded = 0;

          const rst: fs.WriteStream = rsp.pipe(fileStream);
          rst
            .on("error", err => {
              fs.unlink(path, err => reject(err));
              reject(err);
            })
            .on("finish", () => {
              fileStream.close();
              resolve(true);
            });
          if (progress) {
            rst.on("data", (chunk: Buffer) => {
              downloaded += chunk.length;
              fileStream.write(chunk);
              progress((downloaded * 1.0) / len);
            });
          }
        }
      })
      .on("error", err => {
        fs.unlink(path, err => reject(err));
        reject(`download error : ${err}`);
      });
  });
}

export async function download2(
  srcUrl: string,
  destPath: string,
  progress?: (downloaded: number, contentLength?: number) => void
) {
  return new Promise(async (resolve, reject) => {
    let response;
    for (let i = 0; i < MaxRedirects; ++i) {
      response = await new Promise<IncomingMessage>(resolve =>
        https.get(srcUrl, resolve)
      );
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        srcUrl = response.headers.location;
      } else {
        break;
      }
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      reject(
        new Error(
          `HTTP status ${response.statusCode} : ${response.statusMessage}`
        )
      );
    }
    if (response.headers["content-type"] != "application/octet-stream") {
      reject(new Error("HTTP response does not contain an octet stream"));
    } else {
      let stm = fs.createWriteStream(destPath);
      let pipeStm = response.pipe(stm);
      if (progress) {
        let contentLength = response.headers["content-length"]
          ? Number.parseInt(response.headers["content-length"])
          : null;
        let downloaded = 0;
        response.on("data", chunk => {
          downloaded += chunk.length;
          progress(downloaded, contentLength);
        });
      }
      pipeStm.on("finish", resolve);
      pipeStm.on("error", reject);
      response.on("error", reject);
    }
  });
}
