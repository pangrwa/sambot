import { DataTable } from "@/components/DataTable";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { useFile } from "@/hooks/useFiles";
import { CircleX, Download } from "lucide-react";
import { useEffect } from "react";
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
} from "@/components/ui/alert-dialog";


function DeleteDialog({ handleDelete }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
          <Button>
            <CircleX className="mx-auto"/>
          </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete a file</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the file? 
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const columns = [
  {
    accessorKey: "filename",
    header: "Filename",
  },
  {
    accessorKey: "lastModified",
    header: "Last modified"
  },
  {
    header: "Download",
    cell: function CellComponent({ row }) {
      // Move the hook inside the functional component
      const { downloadFile } = useFile();
  
      async function handleDownload() { 
          await downloadFile(row.getValue("filename"));
      }
  
      return (

        <Button onClick={handleDownload}>
          <Download className="mx-auto"/>
        </Button>
      );
    }
  },
  {
    header: "Delete",
    cell: function CellComponent({ row }) {
        const { deleteFile } = useFile();

        async function handleDelete() {
            console.log("Deleting")
            await deleteFile(row.getValue("filename"));
        }

        return (
            <DeleteDialog handleDelete={handleDelete} />
          );
    }
  }
];

export default function FilePage() { 
  const { fileNames, getFileNames } = useFile();

  useEffect(() => {
    getFileNames();
  },[]);
  
  return (
    <div className="flex flex-col gap-2 mx-auto p-10">
      <FileUploader />
      <DataTable columns={columns} data={fileNames} />
    </div>
  );
}
