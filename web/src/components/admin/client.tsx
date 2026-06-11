import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Customer = {
  id: string;
  name: string;
  email: string;
  created: string;
};

const FAKE_CUSTOMERS: Customer[] = [
  {
    id: "usr1",
    name: "Marie Dupont",
    email: "marie.dupont@email.com",
    created: "2024-01-15T08:00:00Z",
  },
  {
    id: "usr2",
    name: "Jean Martin",
    email: "jean.martin@email.com",
    created: "2024-02-20T10:30:00Z",
  },
  {
    id: "usr3",
    name: "Sophie Leblanc",
    email: "sophie.leblanc@email.com",
    created: "2024-03-05T14:00:00Z",
  },
  {
    id: "usr4",
    name: "Thomas Bernard",
    email: "thomas.bernard@email.com",
    created: "2024-04-11T09:45:00Z",
  },
];

export default function AdminClient() {
  const customers = FAKE_CUSTOMERS;

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-6">Clients</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom du Client</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Membre depuis</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">
                {customer.name || "N/A"}
              </TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>
                {new Date(customer.created).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
