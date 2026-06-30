import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
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

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Product> => {
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

// Order functions
export const createOrder = async (order: {
  user_id: string;
  user_email: string;
  user_name: string;
  items: Array<{ product_id: string; name: string; price: number; quantity: number }>;
  total: number;
  status: string;
  shipping_address?: string;
  phone?: string;
}): Promise<Order> => {
  const { data, error } = await supabase
    .from('Orders')
    .insert([order])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return data;
};

export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('Orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }

  return data || [];
};

// Admin functions - fetch all orders
export const fetchAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('Orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
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

export const updateProductQuantity = async (
  productId: string,
  quantityOrdered: number
): Promise<void> => {
  // Fetch current quantity first
  const { data, error: fetchError } = await supabase
    .from('Products')
    .select('quantity')
    .eq('id', productId)
    .single();

  if (fetchError) { console.error('updateProductQuantity fetch error:', fetchError); return; }

  const current = data?.quantity ?? 0;
  const newQty = Math.max(0, current - quantityOrdered);

  const { error } = await supabase
    .from('Products')
    .update({ quantity: newQty })
    .eq('id', productId);

  if (error) console.error('updateProductQuantity update error:', error);
};


// ===== Cart DB operations =====
export const fetchUserCart = async (
  userId: string
): Promise<Array<{ product_id: string; quantity: number; product_data: any }>> => {
  const { data, error } = await supabase
    .from('Cart')
    .select('product_id, quantity, product_data')
    .eq('user_id', userId);
  if (error) { console.error('fetchUserCart error:', error); return []; }
  return data || [];
};

export const upsertCartItem = async (
  userId: string,
  productId: string,
  quantity: number,
  productData: any
): Promise<void> => {
  const { error } = await supabase.from('Cart').upsert(
    {
      user_id: userId,
      product_id: String(productId),
      quantity,
      product_data: productData,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,product_id' }
  );
  if (error) console.error('upsertCartItem error:', error);
};

export const removeCartItem = async (userId: string, productId: string): Promise<void> => {
  const { error } = await supabase
    .from('Cart')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', String(productId));
  if (error) console.error('removeCartItem error:', error);
};

export const clearUserCart = async (userId: string): Promise<void> => {
  const { error } = await supabase.from('Cart').delete().eq('user_id', userId);
  if (error) console.error('clearUserCart error:', error);
};

// ===== Wishlist DB operations =====
export const fetchUserWishlist = async (
  userId: string
): Promise<Array<{ product_id: string; product_data: any }>> => {
  const { data, error } = await supabase
    .from('Wishlist')
    .select('product_id, product_data')
    .eq('user_id', userId);
  if (error) { console.error('fetchUserWishlist error:', error); return []; }
  return data || [];
};

export const upsertWishlistItem = async (
  userId: string,
  productId: string,
  productData: any
): Promise<void> => {
  const { error } = await supabase.from('Wishlist').upsert(
    {
      user_id: userId,
      product_id: String(productId),
      product_data: productData,
    },
    { onConflict: 'user_id,product_id' }
  );
  if (error) console.error('upsertWishlistItem error:', error);
};

export const removeWishlistItem = async (userId: string, productId: string): Promise<void> => {
  const { error } = await supabase
    .from('Wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', String(productId));
  if (error) console.error('removeWishlistItem error:', error);
};
