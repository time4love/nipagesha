import { getPendingHelpRequests } from "./actions";
import { AdminHelpRequestsClient } from "./AdminHelpRequestsClient";

export const metadata = {
  title: "בקשות לוח עזרה – ניהול | ניפגשה",
  description: "אישור ודחיית בקשות לוח עזרה",
};

export default async function AdminHelpRequestsPage() {
  const requests = await getPendingHelpRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">בקשות לוח עזרה</h1>
        <p className="text-muted-foreground mt-1">
          בקשות שממתינות לאישור. אשר להצגה בלוח הציבורי או דחה.
        </p>
      </div>
      <AdminHelpRequestsClient requests={requests} />
    </div>
  );
}
