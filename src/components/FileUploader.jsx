import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";
import { useFile } from "@/hooks/useFiles";

function Result({ status }) {
  if (status === "success") {
    return <p>✅ File uploaded successfully!</p>;
  } else if (status === "failed") {
    return <p>❌ File upload failed!</p>;
  } else if (status === "uploading") {
    return <p>⏳ Uploading selected file...</p>;
  } else {
    return null;
  }
}

function FileDialog({file, handleFileChange, handleUpload, status}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Upload file</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Select a file</AlertDialogTitle>
          <div className="">
            <Input id="file" type="file" onChange={handleFileChange} />
          </div>
          {file && (
            <section>
              File Details:
              <ul>
                <li>Name: {file.name}</li>
                <li>Type: {file.type}</li>
                <li>Size: {file.size} bytes</li>
              </ul>
            </section>
          )}
          {file && <Button onClick={handleUpload}>Upload a file</Button>}
          <AlertDialogDescription>
            Press the Upload button to upload the file
          </AlertDialogDescription>
          <Result status={status} />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function FileUploader() {
  const [file, setFile] = useState(null);
  // initial, uploading, success, failed
  const [status, setStatus] = useState("initial");
  const { uploadFile } = useFile();

  function handleFileChange(event) {
    if (event.target.files) {
      setStatus("initial");
      setFile(event.target.files[0]);
    }
  }

  async function handleUpload() {
    if (!file) {
      return;
    }
    setStatus("uploading");
    if (await uploadFile(file)) {
      setStatus("success");
    } else {
      setStatus("failed");
    }
  }

  return (
    <div className="self-end">
      <FileDialog file={file} handleFileChange={handleFileChange} handleUpload={handleUpload} status={status}/>
    </div>
  );
}
