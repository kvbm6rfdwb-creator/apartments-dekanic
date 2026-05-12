export interface GuestProfile {
  id: string                  // unique, generated on creation
  name: string
  email: string
  phone?: string
  country?: string            // 2-letter ISO code e.g. "DE"
  tags: ('vip' | 'blacklist' | 'repeat')[]
  notes: string
  createdAt: string           // ISO date
  source: 'Airbnb' | 'Booking.com' | 'Direct' | 'Phone' | 'Walk-in' | string
}

export interface Inquiry {
  id: string
  guestId?: string            // linked GuestProfile id if matched
  guestName: string
  guestEmail: string
  guestPhone?: string
  apartmentId: string
  checkIn: string             // YYYY-MM-DD
  checkOut: string            // YYYY-MM-DD
  guests: number
  message?: string
  status: 'inquiry' | 'confirmed' | 'checked-in' | 'checked-out' | 'reviewed' | 'declined'
  source: string
  totalPrice?: number
  createdAt: string
  notes: string
  locale?: string
}

export interface SiteData {
  guests: GuestProfile[]
  inquiries: Inquiry[]
  // ... existing properties
}
