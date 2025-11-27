import { Sidebar } from "@/components/Sidebar";
import { Outlet } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

import { NotificationsPopover } from "@/components/NotificationsPopover";

export const DashboardLayout = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden md:flex" />

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-40">
                <div className="flex items-center">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-2">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <Sidebar className="flex w-full h-full static border-r-0" />
                        </SheetContent>
                    </Sheet>
                    <span className="font-semibold text-lg">Menu</span>
                </div>
                <NotificationsPopover />
            </div>

            {/* Main Content */}
            <main className="pl-0 md:pl-64 min-h-screen transition-all duration-300">
                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-end h-16 px-8 border-b bg-background">
                    <NotificationsPopover />
                </header>

                <div className="p-4 md:p-8 pt-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
