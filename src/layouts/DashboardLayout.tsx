import { Sidebar } from "@/components/Sidebar";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { NotificationsPopover } from "@/components/NotificationsPopover";

export const DashboardLayout = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-background flex w-full">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 fixed h-full z-50 print:hidden">
                <Sidebar className="h-full border-r" />
            </div>

            {/* Mobile Sidebar (Sheet) */}
            <div className="md:hidden print:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetContent side="left" className="p-0 w-64">
                        <Sidebar onNavigate={() => setOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            <main className="flex-1 md:ml-64 w-full relative min-h-screen transition-all duration-300">
                {/* Deskop Header (Only visible on MD+) */}
                <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 items-center justify-between sticky top-0 z-40 print:hidden hidden md:flex">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Avalie.PTAM
                    </h1>
                    <div className="flex items-center gap-4">
                        <NotificationsPopover />
                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                            <LogOut className="h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </header>

                {/* Mobile Header (Hidden on MD+) */}
                <header className="h-14 border-b bg-background/95 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-40 md:hidden print:hidden">
                    <div className="flex items-center gap-3">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                        </Sheet>
                        <span className="font-bold text-lg text-primary">Avalie.PTAM</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <NotificationsPopover />
                        {/* Mobile Sign Out (Optional, or put in Sidebar) */}
                    </div>
                </header>

                <div className="p-4 md:p-8 print:p-0 w-full overflow-x-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
