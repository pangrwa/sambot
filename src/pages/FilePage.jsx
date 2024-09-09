import { DataTable } from "@/components/DataTable";
import FileUploader from "@/components/FileUploader";

const columns = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];

const data = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  // ...
];

export default function FilePage() {
  return (
    <>
      <FileUploader />
      <DataTable columns={columns} data={data} />
    </>
  );
}
