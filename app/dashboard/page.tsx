"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { Plus, LogOut, Settings, ArrowRight } from "lucide-react"
import { CreateGroupDialog } from "@/components/create-group-dialog"
import { SearchContacts } from "@/components/search-contacts"
import { SortFilterDialog } from "@/components/sort-filter-dialog"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [filteredGroups, setFilteredGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const filtered = groups.filter(
      (group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    // Apply sorting
    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
    }

    setFilteredGroups(filtered)
  }, [groups, searchQuery, sortBy])

  const fetchData = async () => {
    try {
      const userRes = await fetch("/api/auth/me")
      if (!userRes.ok) {
        router.push("/auth/login")
        return
      }

      const userData = await userRes.json()
      setUser(userData.user)

      const groupsRes = await fetch("/api/groups")
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json()
        setGroups(groupsData.groups)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const handleGroupCreated = (newGroup: any) => {
    setGroups([...groups, newGroup])
    setOpenDialog(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold">𝐂</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Collab</h1>
              <p className="text-xs text-muted-foreground">Shared Contacts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <>
                <Link href="/settings">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12 space-y-4">
          <div>
            <h2 className="text-4xl font-black mb-2">Hey, {user?.name?.split(" ")[0]}! 👋</h2>
            <p className="text-muted-foreground text-lg">Manage your shared contact groups and keep everyone synced</p>
          </div>
          <div className="flex gap-3">
            <CreateGroupDialog open={openDialog} onOpenChange={setOpenDialog} onGroupCreated={handleGroupCreated}>
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2">
                <Plus className="w-4 h-4" />
                New Group
              </Button>
            </CreateGroupDialog>
          </div>
        </div>

        {groups.length > 0 && (
          <div className="mb-6 space-y-4">
            <SearchContacts onSearch={setSearchQuery} placeholder="Search groups..." />
            <div className="flex gap-2 justify-end">
              <SortFilterDialog onSort={setSortBy} currentSort={sortBy} />
            </div>
          </div>
        )}

        {/* Groups Grid */}
        {filteredGroups.length === 0 && searchQuery ? (
          <Card className="border-2 border-dashed p-12 text-center">
            <div className="space-y-4">
              <div className="text-5xl">🔍</div>
              <div>
                <h3 className="font-bold text-lg mb-1">No groups found</h3>
                <p className="text-muted-foreground mb-6">Try searching with different keywords</p>
              </div>
            </div>
          </Card>
        ) : filteredGroups.length === 0 ? (
          <Card className="border-2 border-dashed p-12 text-center">
            <div className="space-y-4">
              <div className="text-5xl">📋</div>
              <div>
                <h3 className="font-bold text-lg mb-1">No groups yet</h3>
                <p className="text-muted-foreground mb-6">Create your first group to start sharing contacts</p>
                <CreateGroupDialog open={openDialog} onOpenChange={setOpenDialog} onGroupCreated={handleGroupCreated}>
                  <Button className="bg-gradient-to-r from-primary to-secondary">Create Group</Button>
                </CreateGroupDialog>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group: any) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card className="h-full p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 cursor-pointer group">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {group.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">View group</span>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <PWAInstallPrompt />
    </div>
  )
}
