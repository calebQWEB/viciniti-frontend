import { Suspense } from "react";
import PaymentCallbackContent from "./PaymentCallbackContent";
import MainLayout from "@/components/layout/MainLayout";
import { Loader2 } from "lucide-react";

export default function PaymentCallbackPage() {
  return (
    <MainLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          }
        >
          <PaymentCallbackContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}
