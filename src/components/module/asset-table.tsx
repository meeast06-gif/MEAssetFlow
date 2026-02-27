import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Asset } from "@/lib/definitions";
import { formatCurrency } from "@/lib/utils";
import { format } from 'date-fns';
import { AssetIcon } from "@/components/icons";
import { AssetTableActions } from "./asset-table-actions";

export default function AssetTable({ assets }: { assets: Asset[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Assets</CardTitle>
        <CardDescription>A comprehensive list of your tracked assets.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Icon</span>
              </TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden md:table-cell">Acquisition</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length > 0 ? (
              assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="hidden sm:table-cell">
                    <AssetIcon type={asset.type} className="h-6 w-6 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{asset.type}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(asset.acquisitionDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(asset.currentValue)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <AssetTableActions asset={asset} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No assets found. Get started by adding a new asset.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
