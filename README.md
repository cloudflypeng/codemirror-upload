This is an image upload plugin for CodeMirror that supports pasting or dragging and dropping images and uploading them to a server. The plugin allows using either a default fetch upload logic or custom upload logic.

## Usage

```ts
import { EditorView } from "codemirror";
import { UploadExtension } from "codemirror-plugin-upload";

const uploadExt = createUploadExtension({ accept: ["image/png", "image/jpeg"],
  storageServer: "https://your-storage-server.com",
  callback: (result) => {
    return result
  }
 })

const view = new EditorView({
  extensions: [uploadExt],
});
```

•	accept: The file types that the plugin will accept, default is empty.
•	storageServer: The URL of the storage server, default is empty.
•	upload: Custom upload function that returns an image URL. This function should accept a File object and return a Promise<string>.
•	callback: A callback function to process the upload response and return the image URL.
