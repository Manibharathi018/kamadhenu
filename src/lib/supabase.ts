import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string | number;
  name: string;
  price: number;
  mrp: number;
  image: string;
  fabric: string;
  occasion: string;
  color: string;
  category: string;
  description: string;
  quantity?: number;
  created_at?: string;
  updated_at?: string;
  images?: string[];
};

// Normalize DB row: map image_url -> image for the rest of the app
const normalizeProduct = (row: any): Product => ({
  ...row,
  image: row.image_url ?? row.image ?? '',
  images: row.images ?? [],
});

export type Order = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  items: Array<{ product_id: string; name: string; price: number; quantity: number }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  created_at: string;
  updated_at?: string;
};

// Product queries
export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('Products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return (data || []).map(normalizeProduct);
};

export const fetchProduct = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('Products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching product:', error);
    throw error;
  }

  return normalizeProduct(data);
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'> & { id?: string | number }): Promise<Product> => {
  // Map image -> image_url for DB storage
  const { image, ...rest } = product as any;
  const dbRow = { ...rest, image_url: image };
  const { data, error } = await supabase
    .from('Products')
    .insert([dbRow])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return normalizeProduct(data);
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  // Map image -> image_url if updating image field
  const dbUpdates: any = { ...updates };
  if ('image' in dbUpdates) {
    dbUpdates.image_url = dbUpdates.image;
    delete dbUpdates.image;
  }
  const { data, error } = await supabase
    .from('Products')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return normalizeProduct(data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('Products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Auth helpers
export const signUp = async (
  email: string,
  password: string,
  metadata?: {
    full_name?: string;
    phone?: string;
    address?: string;
  }
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const updateUserMetadata = async (metadata: {
  full_name?: string;
  phone?: string;
  address?: string;
}) => {
  const { data, error } = await supabase.auth.updateUser({
    data: metadata,
  });

  if (error) throw error;
  return data;
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};

// Admin functions - fetch orders
export const fetchAllOrders = async (): Promise<Order[]> => {
  // For now, returning mock orders since we don't have a real orders table
  // In production, this would fetch from a database
  return [
    {
      id: 'ORD-001',
      user_id: 'user-1',
      user_email: 'customer@example.com',
      user_name: 'Priya Iyer',
      items: [{ product_id: 'kp-001', name: 'Rani Vastra Royal Maroon', price: 28500, quantity: 1 }],
      total: 28500,
      status: 'delivered',
      created_at: new Date().toISOString(),
    },
    {
      id: 'ORD-002',
      user_id: 'user-2',
      user_email: 'user@example.com',
      user_name: 'Anjali Kumar',
      items: [
        { product_id: 'kp-002', name: 'Mayil Emerald Temple', price: 24900, quantity: 1 },
        { product_id: 'kp-003', name: 'Neelambari Royal Blue', price: 26500, quantity: 1 },
      ],
      total: 51400,
      status: 'shipped',
      created_at: new Date().toISOString(),
    },
    {
      id: 'ORD-003',
      user_id: 'user-3',
      user_email: 'buyer@example.com',
      user_name: 'Deepa Sharma',
      items: [{ product_id: 'kp-004', name: 'Swarna Mustard Festive', price: 18900, quantity: 2 }],
      total: 37800,
      status: 'processing',
      created_at: new Date().toISOString(),
    },
  ];
};

export const getTodaysOrders = async (): Promise<Order[]> => {
  const allOrders = await fetchAllOrders();
  const today = new Date().toISOString().split('T')[0];
  return allOrders.filter(order => order.created_at.startsWith(today));
};

export const updateOrderStatus = async (
  orderId: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
): Promise<void> => {
  // Mock implementation - in production, update database
  console.log(`Updating order ${orderId} to status: ${status}`);
};

export const searchProductById = async (id: string): Promise<Product | null> => {
  return fetchProduct(id);
};

export const deleteProductById = async (id: string): Promise<void> => {
  return deleteProduct(id);
};
