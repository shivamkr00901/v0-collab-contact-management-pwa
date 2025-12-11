"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { ArrowLeft, Plus, Mail, Trash2 } from "lucide-react"
import { AddContactDialog } from "@/components/add-contact-dialog"
import { ExportContactsButton } from "@/components/export-contacts-button"
import { ImportContactsButton } from "@/components/import-contacts-button"
import { SearchContacts } from "@/components/search-contacts"
import { SortFilterDialog } from "@/components/sort-filter-dialog"
import { useToast } from "@/hooks/use-toast"
import { DeleteGroupDialog } from "@/components/delete-group-dialog"
import { DialerButton } from "@/components/dialer-button"
import { ImportPhoneContactsButton } from "@/components/import-phone-contacts-button"

interface Contact {
  id: string
  name: string
  phone_number?: string
  email?: string
  notes?: string
  added_by_name?: string
}

interface Group {
  id: string
  name: string
  description?: string
}

export default function GroupPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string
  const { toast } = useToast()

  const [group, setGroup] = useState<Group | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchGroupAndContacts()
    const interval = setInterval(fetchGroupAndContacts, 2000)
    return () => clearInterval(interval)
  }, [groupId])

  useEffect(() => {
    const filtered = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.phone_number && contact.phone_number.includes(searchQuery)) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.notes && contact.notes.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.id || 0).getTime() - new Date(a.id || 0).getTime())
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.id || 0).getTime() - new Date(b.id || 0).getTime())
    }

    setFilteredContacts(filtered)
  }, [contacts, searchQuery, sortBy])

  const fetchGroupAndContacts = async () => {
    try {
      const groupsRes = await fetch("/api/groups")
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json()
        const foundGroup = groupsData.groups.find((g: any) => g.id === groupId)
        if (foundGroup) {
          setGroup(foundGroup)
        }
      }

      const contactsRes = await fetch(`/api/groups/${groupId}/contacts`)
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json()
        setContacts(contactsData.contacts)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Delete this contact?")) return

    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setContacts(contacts.filter((c) => c.id !== contactId))
        toast({ title: "Contact deleted" })
      }
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({ title: "Failed to delete contact", variant: "destructive" })
    }
  }

  const handleContactCreated = (newContact: Contact) => {
    setContacts([...contacts, newContact])
  }

  const handleContactsImported = (importedContacts: Contact[]) => {
    setContacts([...contacts, ...importedContacts])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="text-5xl">🤔</div>
        <p className="text-muted-foreground">Group not found</p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1 ml-4">
            <h1 className="font-bold text-xl">{group.name}</h1>
            <p className="text-xs text-muted-foreground">{filteredContacts.length} contacts</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive hover:text-destructive/90"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Group Info */}
        <Card className="mb-8 p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div className="flex-1">
              <h2 className="text-2xl font-black mb-2">{group.name}</h2>
              <p className="text-muted-foreground">{group.description || "No description"}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <AddContactDialog
                groupId={groupId}
                onContactAdded={handleContactCreated}
                open={openDialog}
                onOpenChange={setOpenDialog}
              >
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Contact
                </Button>
              </AddContactDialog>
              <ImportPhoneContactsButton groupId={groupId} onImported={handleContactsImported} />
              <ImportContactsButton groupId={groupId} onImported={handleContactsImported} />
              <ExportContactsButton groupId={groupId} groupName={group.name} />
            </div>
          </div>
        </Card>

        {/* Contacts List */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black mb-2">Contacts</h2>
              <p className="text-muted-foreground">{filteredContacts.length} contacts</p>
            </div>
            <div className="flex gap-2">
              <AddContactDialog
                groupId={groupId}
                open={openDialog}
                onOpenChange={setOpenDialog}
                onContactAdded={handleContactCreated}
              >
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </AddContactDialog>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <ImportPhoneContactsButton groupId={groupId} onImported={handleContactsImported} />
            <ImportContactsButton groupId={groupId} onImported={handleContactsImported} />
            <ExportContactsButton groupId={groupId} groupName={group.name} />
            {contacts.length > 0 && <SortFilterDialog onSort={setSortBy} currentSort={sortBy} />}
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </div>

          {contacts.length > 0 && <SearchContacts onSearch={setSearchQuery} placeholder="Search contacts..." />}
        </div>

        {filteredContacts.length === 0 && searchQuery ? (
          <Card className="border-2 border-dashed p-12 text-center">
            <div className="space-y-4">
              <div className="text-5xl">🔍</div>
              <div>
                <h3 className="font-bold text-lg mb-1">No contacts found</h3>
                <p className="text-muted-foreground mb-6">Try searching with different keywords</p>
              </div>
            </div>
          </Card>
        ) : filteredContacts.length === 0 ? (
          <Card className="border-2 border-dashed p-12 text-center">
            <div className="space-y-4">
              <div className="text-5xl">👥</div>
              <div>
                <h3 className="font-bold text-lg mb-1">No contacts yet</h3>
                <p className="text-muted-foreground mb-6">Add your first contact to get started</p>
                <AddContactDialog
                  groupId={groupId}
                  open={openDialog}
                  onOpenChange={setOpenDialog}
                  onContactAdded={handleContactCreated}
                >
                  <Button className="bg-gradient-to-r from-primary to-secondary">Add Contact</Button>
                </AddContactDialog>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="p-4 hover:border-primary/50 transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{contact.name}</h3>
                      <p className="text-xs text-muted-foreground">Added by {contact.added_by_name}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    {contact.phone_number && <p className="font-mono">{contact.phone_number}</p>}
                    {contact.email && <p className="font-mono text-blue-500">{contact.email}</p>}
                    {contact.notes && <p className="text-muted-foreground">{contact.notes}</p>}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    {contact.phone_number && (
                      <DialerButton phoneNumber={contact.phone_number} contactName={contact.name} />
                    )}
                    {contact.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => (window.location.href = `mailto:${contact.email}`)}
                        className="gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteContact(contact.id)}
                      className="gap-2 text-destructive hover:text-destructive ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DeleteGroupDialog
        groupId={groupId}
        groupName={group.name}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  )
}
