import { isUrl } from "../utils.ts";
import type { UploadExtensionOptionsCustom, UploadExtensionOptions } from "../main.ts";

async function defaultUpload(file: File, {
  storageServer,
  callback,
}: {
  storageServer: string,
  callback: (response: object) => string;
}): Promise<string> {

  const formData = new FormData();
  formData.append("file", file);

  const result = await fetch(storageServer, {
    method: 'POST',
    body: formData
  }).then(res => res.json())

  const url = callback(result)

  if (typeof result !== 'string' || result === '') {
    console.error('callback function should return a not empty string')
  }

  return url
}

async function getStragedUrl(file: File, options: UploadExtensionOptions | UploadExtensionOptionsCustom): Promise<string> {
  let url: string

  if ('upload' in options && typeof options.upload === 'function') {

    const { upload } = options as UploadExtensionOptionsCustom

    url = await upload(file)
  } else {
    const { storageServer, callback } = options as UploadExtensionOptions
    url = await defaultUpload(file, {
      storageServer,
      callback
    })
  }

  return new Promise((resolve, reject) => {
    if (isUrl(url)) {
      resolve(url)
    } else {
      reject(new Error('上传失败'))
    }
  })
}

export { getStragedUrl }
