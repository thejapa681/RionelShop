import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) {
    redirect("/admin/login")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex">
        <AdminSidebar />
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <button className="fixed left-4 top-4 z-50 md:hidden">
            <Menu />
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="z-50 p-0 md:hidden">
          <AdminSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <AdminHeader admin={profile} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}