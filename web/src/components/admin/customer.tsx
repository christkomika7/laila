// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../ui/table";

// export default function AdminCustomersTab() {
//   return (
//     <div className="bg-card rounded-md p-6 shadow-sm border border-border overflow-x-auto">
//       <h2 className="text-2xl font-semibold mb-6">Clients</h2>
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Nom du Client</TableHead>
//             <TableHead>E-mail</TableHead>
//             <TableHead>Membre depuis</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {customers.map((customer) => (
//             <TableRow key={customer.id}>
//               <TableCell className="font-medium">
//                 {customer.name || "N/A"}
//               </TableCell>
//               <TableCell>{customer.email}</TableCell>
//               <TableCell>
//                 {new Date(customer.created).toLocaleDateString()}
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }
