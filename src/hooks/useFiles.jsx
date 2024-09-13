import { createContext, useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";

const FileContext = createContext();

function cleanPrefixFilename(filename) {
  const fileArr = filename.split("/");
  return fileArr[fileArr.length - 1];
}

function convertDate(isoDate) {
  let date = new Date(isoDate);

  // Use toLocaleDateString with options to format the date as Day Month Year
  let formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long", // or 'numeric' for numbers
    year: "numeric",
  });
  return formattedDate;
}
export const FileProvider = ({ children }) => {
  const [fileNames, setFileNames] = useState([]);

  async function getFileNames() {
    try {
      console.log("Getting files....");
      const fileResponse = await fetch("/api/file-info/1");
      let fileNamesData = await fileResponse.json();
      if (!fileResponse.ok) {
        console.error("Server something wrong...");
        return;
      }
      fileNamesData = fileNamesData.map((f) => ({
        filename: cleanPrefixFilename(f.key),
        lastModified: convertDate(f.lastModified),
      }));
      setFileNames(fileNamesData);
    } catch (error) {
      console.error("Failed to get files: ", error.message);
    }
  }

  async function downloadFile(filename) {
    try {
      console.log("Donwloading file");
      const params = new URLSearchParams({
        filename: filename,
      });
      const dlResponse = await fetch(`/api/file/1?${params.toString()}`, {
        method: "GET",
      });
      // idk how to handle file object
      const base64Data = await dlResponse.text();
      const binaryData = atob(base64Data); 
      const len = binaryData.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/octet-stream' });

      const file = new File([blob], filename, {
        type: "application/pdf",
      });

      // Example: Create a download link and trigger a download
      const url = window.URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename; // Use the filename you want
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download file: ", error.message);
    }
  }

  async function deleteFile(filename) {
    try {
      console.log("Deleting file")
      const params = new URLSearchParams({
        filename: filename,
      });
      const deleteResponse = await fetch(`/api/file/1?${params.toString()}`, {
        method: "DELETE",
      });

      const data = await deleteResponse.text();
      setFileNames(fileNames.filter((f) => f.filename != filename));
    } catch (error) {
      console.error("Failed to delete file: ", error.message)
    }
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      // fetch POST api to lambda to store in S3 bucket
      const fileResponse = await fetch("api/file/1", {
        method: "POST",
        body: formData,
      });
      if (!fileResponse.ok) {
        return false;
      }
      const responseData = await fileResponse.json()
      console.log(responseData)
      if (responseData.fileExists) {
        // do something here
        // probably need to do something here to notify the user that
        // this filename already exists in the s3 bucket
        return false;
      } else {
        setFileNames([{
          filename: file.name,
          lastModified: convertDate(new Date()),
        }, ...fileNames]);
        return true;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  return (
    <FileContext.Provider value={{ fileNames, setFileNames, getFileNames, downloadFile, deleteFile, uploadFile }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFile = () => {
  const context = useContext(FileContext);
  return context;
};
