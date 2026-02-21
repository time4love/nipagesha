'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export function NavbarClient({ user, avatarUrl }: { user: User | null; avatarUrl?: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Full redirect so the server sees cleared session (avoids stale RSC/cache)
    window.location.href = '/'
  }

  const closeSheet = () => setIsOpen(false)

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <Link href="/about" className="flex cursor-pointer select-none items-center rounded-sm px-3 py-3 text-base min-h-[44px] outline-none transition-colors hover:bg-accent hover:text-accent-foreground md:min-h-0 md:py-0 md:inline-flex md:px-0 md:text-sm md:font-medium md:hover:bg-transparent md:hover:text-primary" onClick={onNavigate}>אודות</Link>
      <Link href="/articles" className="flex cursor-pointer select-none items-center rounded-sm px-3 py-3 text-base min-h-[44px] outline-none transition-colors hover:bg-accent hover:text-accent-foreground md:min-h-0 md:py-0 md:inline-flex md:px-0 md:text-sm md:font-medium md:hover:bg-transparent md:hover:text-primary" onClick={onNavigate}>מאמרים</Link>
      <Link href="/songs" className="flex cursor-pointer select-none items-center rounded-sm px-3 py-3 text-base min-h-[44px] outline-none transition-colors hover:bg-accent hover:text-accent-foreground md:min-h-0 md:py-0 md:inline-flex md:px-0 md:text-sm md:font-medium md:hover:bg-transparent md:hover:text-primary" onClick={onNavigate}>שירים</Link>
      <Link href="/help" className="flex cursor-pointer select-none items-center rounded-sm px-3 py-3 text-base min-h-[44px] outline-none transition-colors hover:bg-accent hover:text-accent-foreground md:min-h-0 md:py-0 md:inline-flex md:px-0 md:text-sm md:font-medium md:hover:bg-transparent md:hover:text-primary" onClick={onNavigate}>לוח עזרה</Link>
      <Link href="/contact" className="flex cursor-pointer select-none items-center rounded-sm px-3 py-3 text-base min-h-[44px] outline-none transition-colors hover:bg-accent hover:text-accent-foreground md:min-h-0 md:py-0 md:inline-flex md:px-0 md:text-sm md:font-medium md:hover:bg-transparent md:hover:text-primary" onClick={onNavigate}>צור קשר</Link>
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">

        {/* מובייל */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">תפריט ניווט</SheetTitle>
              <div className="flex flex-col gap-1 mt-8">
                <NavLinks onNavigate={closeSheet} />
                {!user && (
                   <Button className="min-h-[44px] text-base mt-4 rounded-sm px-3 font-normal" variant="ghost" onClick={() => { closeSheet(); router.push('/login'); }}>התחברות</Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* דסקטופ */}
        <div className="hidden md:flex items-center gap-6"><NavLinks /></div>

        {/* לוגו */}
        <Link href="/" className="flex items-center">
            <Image src="/logo.avif" alt="ניפגשה" width={160} height={50} className="h-10 w-auto object-contain" priority />
        </Link>

        {/* אזור אישי - מבוסס נטו על ה-Prop שמגיע מהשרת */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl ?? undefined} alt="" />
                    <AvatarFallback className="bg-muted text-lg font-bold text-muted-foreground">
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>הורה מחובר</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>לוח בקרה</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile')}>פרופיל</DropdownMenuItem>
                {['jodagm@gmail.com'].includes(user.email || '') && (
                   <DropdownMenuItem onClick={() => router.push('/admin')}>ניהול</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">התנתק</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex">
              <Button onClick={() => router.push('/login')}>התחבר / הרשם</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
