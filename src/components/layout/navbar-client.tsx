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
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export function NavbarClient({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  const NavLinks = () => (
    <>
      <Link href="/about" className="text-sm font-medium hover:text-primary">אודות</Link>
      <Link href="/articles" className="text-sm font-medium hover:text-primary">מאמרים</Link>
      <Link href="/songs" className="text-sm font-medium hover:text-primary">שירים</Link>
      <Link href="/help" className="text-sm font-medium hover:text-primary">לוח עזרה</Link>
      <Link href="/contact" className="text-sm font-medium hover:text-primary">צור קשר</Link>
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
              <div className="flex flex-col gap-4 mt-8">
                <NavLinks />
                {user ? (
                   <Button onClick={() => router.push('/dashboard')}>לוח בקרה</Button>
                ) : (
                   <Button onClick={() => router.push('/login')}>התחברות</Button>
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
                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-muted">
                  <span className="font-bold text-lg">{user.email?.[0].toUpperCase()}</span>
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
