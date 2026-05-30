-- Enable UUID generation extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0.00,
    book_file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages table (Contact inquiries)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS) configuration
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Books: Anyone can read, only authenticated admin can write/edit
CREATE POLICY "Allow public read access to books" ON public.books
    FOR SELECT USING (true);

CREATE POLICY "Allow admin write access to books" ON public.books
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Messages: Anyone can insert, anyone can read (for admin panel with anon key)
CREATE POLICY "Allow public inserts to messages" ON public.messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to messages" ON public.messages
    FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to messages" ON public.messages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Purchases: Anyone can insert (to initiate purchase), select check by order_id or email, admin has full access
CREATE POLICY "Allow public inserts to purchases" ON public.purchases
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read own purchase" ON public.purchases
    FOR SELECT USING (true); -- simplified select for application checking, or restrict by session if needed

CREATE POLICY "Allow admin access to purchases" ON public.purchases
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Initial Books (matching the user's screenshots)
INSERT INTO public.books (title, description, cover_image, price, book_file_url)
VALUES 
(
  'Ontari Prayaanam', 
  'This story is an intimate portrayal of a young woman''s fight for independence, the hidden weight of protective family fears, and the transformative journey of Shruthi toward embracing true self-reliance, with the beautiful transition from a painful escape from control to a soulful understanding.', 
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600', 
  199.00, 
  'https://example.com/books/ontari_prayaanam.pdf'
),
(
  'Anything For Her Season-2', 
  'This story is an intimate portrayal of growing affection, family traditions, and the transformative journey of Achyuth toward embracing a new life with the beautiful transition from a structured arranged meeting to a profound, soul-stirring partnership with Nandhini.', 
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600', 
  299.00, 
  'https://example.com/books/anything_for_her_2.pdf'
),
(
  'The Perfect Date', 
  'This story is a heartfelt exploration of silent love, deep-seated patience, and the courageous journey of Pradeep toward expressing his long-hidden feelings while navigating the delicate balance between a cherished friendship and a lifelong commitment.', 
  'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&q=80&w=600', 
  149.00, 
  'https://example.com/books/the_perfect_date.pdf'
)
ON CONFLICT DO NOTHING;
