# Supabase Integration Complete ✅

Your Vasthra Silks project is now set up with Supabase for product storage and authentication!

## What Was Added

### 1. **Installed Dependencies**
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/auth-helpers-react` - Auth helpers for React

### 2. **New Files Created**

#### Core Integration
- [.env.local](.env.local) - Environment variables configuration
- [src/lib/supabase.ts](src/lib/supabase.ts) - Supabase client and database queries
- [src/lib/auth-context.tsx](src/lib/auth-context.tsx) - React Context for auth state management
- [src/lib/hooks.ts](src/lib/hooks.ts) - React Query hooks for data fetching and mutations
- [src/routes/signup.tsx](src/routes/signup.tsx) - New signup page component

#### Documentation
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Detailed setup instructions

### 3. **Updated Files**

- [src/routes/__root.tsx](src/routes/__root.tsx) - Added AuthProvider wrapper
- [src/routes/login.tsx](src/routes/login.tsx) - Integrated Supabase authentication
- [src/routes/shop.tsx](src/routes/shop.tsx) - Updated to fetch products from Supabase
- [src/lib/products.ts](src/lib/products.ts) - Added comment about fallback data

## Quick Start

### Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to be provisioned
4. Go to **Settings → API** to get your credentials

### Step 2: Update Environment Variables

Edit [.env.local](.env.local):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Create Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and paste the SQL from the **Database Setup** section below
3. Execute each script

### Step 4: Start Developing

```bash
bun run dev
```

## Database Setup

### Products Table

Run this SQL in Supabase SQL Editor:

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

-- Create indexes for better query performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_occasion ON products(occasion);

-- Create trigger to auto-update timestamp
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

### Insert Sample Products

```sql
INSERT INTO products (id, name, price, mrp, image, fabric, occasion, color, category, description) VALUES
('kp-001', 'Rani Vastra Royal Maroon Kanchipuram', 28500, 34000, 'saree-2.jpg', 'Pure Silk', 'Wedding', 'Maroon', 'Kanchipuram', 'An heirloom maroon Kanchipuram silk saree, woven with traditional peacock motifs and a rich gold zari pallu, certified by the Silk Mark of India.'),
('kp-002', 'Mayil Emerald Temple Kanchipuram', 24900, 29500, 'saree-3.jpg', 'Pure Silk', 'Festive', 'Green', 'Kanchipuram', 'Lush emerald green silk with intricate temple border, hand-woven in Kanchipuram by master weavers.'),
('kp-003', 'Neelambari Royal Blue Silk', 26500, 31000, 'saree-4.jpg', 'Pure Silk', 'Wedding', 'Blue', 'Kanchipuram', 'Deep royal blue Kanchipuram silk with elaborate gold mango motif border and pallu.'),
('kp-004', 'Swarna Mustard Festive Silk', 18900, 22500, 'saree-5.jpg', 'Pure Silk', 'Festive', 'Yellow', 'Arani', 'Sun-kissed mustard silk saree with classic Arani weave and golden zari accents.'),
('kp-005', 'Gulabi Blush Pink Kanchipuram', 22000, 26000, 'saree-6.jpg', 'Pure Silk', 'Reception', 'Pink', 'Kanchipuram', 'Soft blush pink Kanchipuram with delicate gold floral border — a modern bride''s heirloom.'),
('kp-006', 'Raja Rani Royal Purple Silk', 32500, 38000, 'saree-1.jpg', 'Pure Silk', 'Wedding', 'Purple', 'Kanchipuram', 'The crown of our wedding collection — deep royal purple silk with ornate temple zari border.');
```

### User Profiles Table (Optional)

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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

## Features Implemented

### Authentication
- ✅ Sign up with email/password
- ✅ Sign in with email/password
- ✅ Auth state management with React Context
- ✅ Protected routes ready (use `useAuth()` hook)
- ✅ Sign out functionality

### Product Management
- ✅ Fetch all products from Supabase
- ✅ Fetch single product by ID
- ✅ Create product (API ready)
- ✅ Update product (API ready)
- ✅ Delete product (API ready)
- ✅ Filter by occasion
- ✅ Sort by price/date

### Data Management
- ✅ React Query integration for caching
- ✅ Automatic cache invalidation
- ✅ Loading states
- ✅ Error handling

## Key Files Reference

### Authentication
- **Context**: [src/lib/auth-context.tsx](src/lib/auth-context.tsx)
- **Login Route**: [src/routes/login.tsx](src/routes/login.tsx)
- **Signup Route**: [src/routes/signup.tsx](src/routes/signup.tsx)
- **Auth Hooks**: [src/lib/hooks.ts](src/lib/hooks.ts) - `useSignIn()`, `useSignUp()`, `useSignOut()`

### Data
- **Supabase Client**: [src/lib/supabase.ts](src/lib/supabase.ts)
- **Products Hook**: `useProducts()` from [src/lib/hooks.ts](src/lib/hooks.ts)
- **Shop Page**: [src/routes/shop.tsx](src/routes/shop.tsx) (uses Supabase)

## Usage Examples

### Using Auth
```tsx
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Welcome {user.email}</div>;
}
```

### Fetching Products
```tsx
import { useProducts, useProduct } from '@/lib/hooks';

function ProductList() {
  const { data: products, isLoading } = useProducts();
  
  return products?.map(p => <div key={p.id}>{p.name}</div>);
}
```

### Sign In
```tsx
import { useSignIn } from '@/lib/hooks';

function LoginForm() {
  const { mutate: signIn } = useSignIn();
  
  const handleLogin = () => {
    signIn({ email: 'user@example.com', password: 'password' });
  };
}
```

## Next Steps

### 1. **Row Level Security (RLS)** - Recommended
Enable RLS policies on your tables for data protection:

```sql
-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can read products
CREATE POLICY "Public can read products"
ON products FOR SELECT
USING (true);

-- Create policy: Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage products"
ON products FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

### 2. **Product Image Storage** - Using Supabase Storage
```tsx
import { supabase } from '@/lib/supabase';

// Upload image
const { data, error } = await supabase.storage
  .from('products')
  .upload(`public/${fileName}`, file);
```

### 3. **Admin Dashboard** - Protected Routes
```tsx
import { useAuth } from '@/lib/auth-context';

function AdminRoute() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  // Check if user is admin (requires admin flag in user_profiles)
  return <Dashboard />;
}
```

### 4. **Email Confirmation** - Auth Configuration
Go to Supabase Dashboard → Authentication → Email Settings to configure:
- Email templates
- Confirmation requirements
- Password recovery

## Troubleshooting

### "Environment variables missing" error
- Make sure `.env.local` exists with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after updating `.env.local`

### Products not loading
- Verify products table exists in Supabase
- Check that sample data was inserted
- Check browser console for API errors

### Auth not working
- Ensure Email provider is enabled in Supabase Authentication
- Check `.env.local` has correct credentials
- Test with Supabase Studio directly

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Auth Guide](https://supabase.com/docs/guides/auth/overview)
- [Database Guide](https://supabase.com/docs/guides/database/overview)
- [React Query Docs](https://tanstack.com/query/latest)

## Support

For issues or questions:
1. Check Supabase logs in Dashboard
2. Review browser console errors
3. Test queries in Supabase SQL Editor
4. Check environment variables are set correctly

---

**Setup Complete!** Your Vasthra Silks store is now powered by Supabase. 🎉
