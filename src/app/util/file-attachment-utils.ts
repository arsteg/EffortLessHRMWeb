import { attachments } from '../tasks/task';

// TM-022: reads every selected file as base64 and resolves only once ALL
// reads have actually completed, regardless of the order in which their
// FileReader.onload callbacks fire. The previous implementation (duplicated
// independently in edit-task.component.ts and task-comment-list.component.ts)
// decided "all files are ready" by checking `i === files.length - 1` inside
// the callback for that specific index — but FileReader callbacks for
// different files are not guaranteed to resolve in index order, so a
// smaller file finishing before a larger earlier one could fire the
// callback with an incomplete attachment list and silently drop files from
// the upload.
export function readFilesAsAttachments(files: File[]): Promise<attachments[]> {
  const readOne = (file: File): Promise<attachments> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        const fileNameParts = file.name.split('.');
        const extention = fileNameParts[fileNameParts.length - 1];
        resolve({
          attachmentName: file.name,
          attachmentType: file.type,
          attachmentSize: file.size,
          extention,
          file: base64String
        });
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  return Promise.all(files.map(readOne));
}
