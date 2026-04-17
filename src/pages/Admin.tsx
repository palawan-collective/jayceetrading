import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminSpecials from "@/components/admin/AdminSpecials";
import AdminTestimonials from "@/components/admin/AdminTestimonials";
import AdminNewsletter from "@/components/admin/AdminNewsletter";
import AdminContacts from "@/components/admin/AdminContacts";
import AdminPages from "@/components/admin/AdminPages";
import AdminHeaderFooter from "@/components/admin/AdminHeaderFooter";
import AdminLoyalty from "@/components/admin/AdminLoyalty";
import AdminReports from "@/components/admin/AdminReports";

const PASSKEY = "5309";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === PASSKEY) setAuthenticated(true);
  };

  if (!authenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Lock className="h-8 w-8 mx-auto text-primary mb-2" />
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="password" placeholder="Enter passkey" value={passkey} onChange={e => setPasskey(e.target.value)} className="text-center text-lg tracking-widest" />
              <Button type="submit" className="w-full">Unlock</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Button variant="outline" size="sm" onClick={() => setAuthenticated(false)}>Logout</Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <div className="relative">
          <TabsList className="flex overflow-x-auto gap-1 p-1 h-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
            <TabsTrigger value="dashboard" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Dashboard</TabsTrigger>
            <TabsTrigger value="products" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Products</TabsTrigger>
            <TabsTrigger value="orders" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Orders</TabsTrigger>
            <TabsTrigger value="reports" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Reports</TabsTrigger>
            <TabsTrigger value="specials" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Specials</TabsTrigger>
            <TabsTrigger value="payments" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Payments</TabsTrigger>
            <TabsTrigger value="pages" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Pages</TabsTrigger>
            <TabsTrigger value="testimonials" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Reviews</TabsTrigger>
            <TabsTrigger value="newsletter" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Newsletter</TabsTrigger>
            <TabsTrigger value="contacts" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Contacts</TabsTrigger>
            <TabsTrigger value="loyalty" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Loyalty</TabsTrigger>
            <TabsTrigger value="header-footer" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Header/Footer</TabsTrigger>
            <TabsTrigger value="settings" className="text-[13px] md:text-sm whitespace-nowrap min-h-[44px] px-4">Settings</TabsTrigger>
          </TabsList>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted to-transparent pointer-events-none" />
        </div>

        <TabsContent value="dashboard"><AdminDashboard /></TabsContent>
        <TabsContent value="products"><AdminProducts /></TabsContent>
        <TabsContent value="orders"><AdminOrders /></TabsContent>
        <TabsContent value="reports"><AdminReports /></TabsContent>
        <TabsContent value="specials"><AdminSpecials /></TabsContent>
        <TabsContent value="payments"><AdminPayments /></TabsContent>
        <TabsContent value="pages"><AdminPages /></TabsContent>
        <TabsContent value="testimonials"><AdminTestimonials /></TabsContent>
        <TabsContent value="newsletter"><AdminNewsletter /></TabsContent>
        <TabsContent value="contacts"><AdminContacts /></TabsContent>
        <TabsContent value="header-footer"><AdminHeaderFooter /></TabsContent>
        <TabsContent value="loyalty"><AdminLoyalty /></TabsContent>
        <TabsContent value="settings"><AdminSettings /></TabsContent>
      </Tabs>
    </div>
  );
}
