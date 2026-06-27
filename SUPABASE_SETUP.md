# Supabase Integration Guide

This guide will help you set up Supabase for product storage and authentication.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project" and fill in the details
3. Wait for the project to be created
4. Go to Project Settings → API to get your credentials

## 2. Get Your Credentials

From your Supabase project dashboard:
- **Project URL**: Settings → API → Project URL (looks like `https://your-project.supabase.co`)
- **Anon Key**: Settings → API → Project API keys → `anon` key

## 3. Update Environment Variables

Update `.env.local` with your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Create Database Schema

Run the following SQL in Supabase's SQL Editor:

### Create Products Table

```sql
-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  mrp DECIMAL NOT NULL,
  image TEXT NOT NULL,
  fabric TEXT NOT NULL,
  occasion TEXT NOT NULL,
  color TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on category for faster filtering
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_occasion ON products(occasion);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_timestamp();
```

### Insert Sample Data

```sql
INSERT INTO products (id, name, price, mrp, image, fabric, occasion, color, category, description) VALUES
('kp-001', 'Rani Vastra Royal Maroon Kanchipuram', 28500, 34000, 'saree-2.jpg', 'Pure Silk', 'Wedding', 'Maroon', 'Kanchipuram', 'An heirloom maroon Kanchipuram silk saree, woven with traditional peacock motifs and a rich gold zari pallu, certified by the Silk Mark of India.'),
('kp-002', 'Mayil Emerald Temple Kanchipuram', 24900, 29500, 'saree-3.jpg', 'Pure Silk', 'Festive', 'Green', 'Kanchipuram', 'Lush emerald green silk with intricate temple border, hand-woven in Kanchipuram by master weavers.'),
('kp-003', 'Neelambari Royal Blue Silk', 26500, 31000, 'saree-4.jpg', 'Pure Silk', 'Wedding', 'Blue', 'Kanchipuram', 'Deep royal blue Kanchipuram silk with elaborate gold mango motif border and pallu.'),
('kp-004', 'Swarna Mustard Festive Silk', 18900, 22500, 'saree-5.jpg', 'Pure Silk', 'Festive', 'Yellow', 'Arani', 'Sun-kissed mustard silk saree with classic Arani weave and golden zari accents.'),
('kp-005', 'Gulabi Blush Pink Kanchipuram', 22000, 26000, 'saree-6.jpg', 'Pure Silk', 'Reception', 'Pink', 'Kanchipuram', 'Soft blush pink Kanchipuram with delicate gold floral border — a modern bride''s heirloom.'),
('kp-006', 'Raja Rani Royal Purple Silk', 32500, 38000, 'saree-1.jpg', 'Pure Silk', 'Wedding', 'Purple', 'Kanchipuram', 'The crown of our wedding collection — deep royal purple silk with ornate temple zari border.');
```

## 5. Set Up Authentication

### Enable Auth Providers

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Optionally enable other providers (Google, GitHub, etc.)

### Create Users Table (Optional - for additional user info)

```sql
-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_profiles_timestamp
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_timestamp();
```

## 6. Update Your Application

The project is already configured to use Supabase via:
- `src/lib/supabase.ts` - Client setup and queries
- `src/routes/login.tsx` - Login route (to be created)

## 7. Testing

1. Start the dev server: `bun run dev`
2. Test product fetching from Supabase
3. Test authentication (sign up/login)

## Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client Library](https://supabase.com/docs/reference/javascript/introduction)
- [Authentication Docs](https://supabase.com/docs/guides/auth/overview)
- [Realtime Docs](https://supabase.com/docs/guides/realtime/overview)

## Next Steps

1. Create authentication context for your app
2. Add user login/signup routes
3. Create protected routes for admin/dashboard
4. Add product image storage using Supabase Storage
5. Set up Row Level Security (RLS) policies for data protection
