import { getLoadingText } from "./utils.ts";
import { getStragedUrl } from "./src/upload.ts";

import { EditorView } from "npm:codemirror@6.0.1";
import type { Extension } from 'npm:@codemirror/state@6.4.1';

type MimeType =
  | "image/png"
  | "image/jpeg"
  | "application/pdf"
  | "text/plain"
  | "application/x-typescript"
  | string;

// TODO: 增加一个access 控制 drop 和 paste 事件是否启用
// 初始化时自定义上传的文件类型, 文件类型是 drop 事件能识别到的文件类型 也就是 mimeType
export interface UploadExtensionOptions {
  accept: MimeType[];
  storageServer: string;
  callback: (response: object) => string;
}

export interface UploadExtensionOptionsCustom {
  accept: MimeType[];
  upload: (file: File) => Promise<string>;
}

let cursorPos: null | number = null;

function createUploadExtension(options: UploadExtensionOptions | UploadExtensionOptionsCustom): Extension {
  const { accept } = options;

  return EditorView.domEventHandlers({
    paste: (event: ClipboardEvent, view) => {
      // 获取数据
      const clipboardData = event.clipboardData
      if (!clipboardData) return
      // 循环获取剪切板的文件
      for (let i = 0; i < clipboardData.items.length; i++) {
        const clipBoardItem = clipboardData.items[i];
        if (clipBoardItem.kind === "file" && accept.includes(clipBoardItem.type)) {
          const fileAccessed = clipBoardItem.getAsFile()!;
          const loadingText = getLoadingText(fileAccessed);

          // 获取位置, 插入替换文本
          const { from, to } = view.state.selection.ranges[0];
          view.dispatch({
            changes: {
              from,
              to,
              insert: loadingText,
            },
          });
          // 计算方向替换的文本位置
          const needToReplace = to + loadingText.length;
          getStragedUrl(fileAccessed, options).then((url) => {
            const fileInMd = `![${fileAccessed.name}](${url})`;
            view.dispatch({
              changes: {
                from,
                to: needToReplace,
                insert: fileInMd,
              },
              selection: {
                anchor: from + fileInMd.length,
                head: from + fileInMd.length,
              },
            })
          }).catch((error) => {
            console.error(error)
          })
        }
      }
    },
    drop: (event, view) => {
      // 阻止浏览器默认行为
      event.preventDefault();
      // 获取拖拽的文件
      const file = event.dataTransfer?.files?.[0];

      if (!file || !accept.includes(file.type)) {
        return console.error('file is required or file type is not in accept')
      }

      const pos = cursorPos;
      const loadingText = getLoadingText(file);

      if (!pos) return

      view.dispatch({
        changes: {
          from: pos,
          to: pos,
          insert: loadingText,
        },
      });

      getStragedUrl(file, options).then((url) => {
        const fileInMd = `![${file.name}](${url})`;
        // 替换结果
        view.dispatch({
          changes: {
            from: pos,
            to: pos + loadingText.length,
            insert: fileInMd,
          },
          selection: {
            anchor: pos + fileInMd.length,
            head: pos + fileInMd.length,
          },
        });
      }).catch((error) => {
        console.error(error)
      })
    },
    dragover(event, view) {
      const { clientX, clientY } = event;
      // 根据鼠标坐标获取文档中的位置
      const pos = view.posAtCoords({ x: clientX, y: clientY });
      cursorPos = pos
    }
  })
}

// 通过accept 定义那些文件类型可以被插件响应
// 通过生成id 来区分多个上传事件
// 通过全局增加loading 来避免上传时候的抖动
export { createUploadExtension };
