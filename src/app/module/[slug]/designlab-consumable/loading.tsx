import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Header Skeleton */}
        <div className="flex items-center">
          <Skeleton className="h-9 w-48" />
        </div>

        {/* Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center">
              <Skeleton className="h-8 w-48" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
