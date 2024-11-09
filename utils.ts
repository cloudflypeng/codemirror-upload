const getLoadingText = (file: File) => {
  const loadingText = `![loading...](${file.name})`;
  return loadingText;
}

const isUrl = (url: string) => {
  return /^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/.test(url)
}

const fileToBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result);
    }
    reader.onerror = (error) => {
      reject(error);
    }
  })
}

export {
  getLoadingText,
  isUrl,
  fileToBase64
}
