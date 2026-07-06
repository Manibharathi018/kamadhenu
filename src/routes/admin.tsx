import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/admin-context";
import { fetchAllOrders, getTodaysOrders, searchProductById, deleteProductById, uploadProductImage } from "@/lib/supabase";
import { useAddProduct, useDeleteProduct } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Order, Product } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Kamadhenu Silks" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState("sales");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const getSixtyDaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 60);
    return d.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState<string>(getSixtyDaysAgo());
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const handleShowAllOrders = () => {
    setStartDate("2020-01-01");
    setEndDate(new Date().toISOString().split("T")[0]);
  };

  // Product management state
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    category: "",
    occasion: "",
    image: "",
    quantity: 0,
    price: 0,
    mrp: 0,
    fabric: "",
    color: "",
    description: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchProductId, setSearchProductId] = useState("");
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);

  const { mutate: addProduct, isPending: isAddingProduct } = useAddProduct();
  const { mutate: deleteProduct, isPending: isDeletingProduct } = useDeleteProduct();

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate({ to: "/login" });
    }
  }, [isAdmin, navigate]);

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const allOrders = await fetchAllOrders();
        setOrders(allOrders);
        setFilteredOrders(allOrders);
      } catch (error) {
        console.error("Failed to load orders:", error);
      }
    };

    loadOrders();
  }, []);

  // Filter orders by date range
  useEffect(() => {
    const filtered = orders.filter((order) => {
      const orderDate = order.created_at.substring(0, 10);
      return orderDate >= startDate && orderDate <= endDate;
    });
    setFilteredOrders(filtered);
  }, [startDate, endDate, orders]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productForm.name || !productForm.category || (!productForm.image && imageFiles.length === 0)) {
      alert("Please fill in all required fields and select at least one image");
      return;
    }

    let finalImageUrl = productForm.image.trim();
    let finalImages: string[] = [];

    if (imageFiles.length > 0) {
      setIsUploading(true);
      try {
        finalImages = await Promise.all(imageFiles.map(file => uploadProductImage(file)));
        finalImageUrl = finalImages[0]; // Set the first image as the main image
      } catch (error) {
        setIsUploading(false);
        alert("Failed to upload images. Please ensure the 'product-images' bucket is created and public in Supabase Storage.\nError: " + (error as Error).message);
        return;
      }
      setIsUploading(false);
    } else {
      // Validate image URL is a direct image link if no file is selected
      const isDirectImage = /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(finalImageUrl);
      if (!isDirectImage) {
        alert("Please use a direct image URL ending in .jpg, .png, .webp, etc.\n\nTip: On Google Images, right-click the image → 'Copy image address'.");
        return;
      }
      finalImages = [finalImageUrl];
    }

    const newProduct = {
      id: productForm.id.trim(),
      name: productForm.name,
      category: productForm.category,
      image: finalImageUrl,
      quantity: productForm.quantity,
      price: productForm.price,
      mrp: productForm.mrp || productForm.price,
      fabric: productForm.fabric,
      occasion: productForm.occasion,
      color: productForm.color,
      description: productForm.description,
      images: finalImages,
    };

    addProduct(newProduct, {
      onSuccess: () => {
        alert("Product added successfully!");
        setProductForm({ id: "", name: "", category: "", occasion: "", image: "", quantity: 0, price: 0, mrp: 0, fabric: "", color: "", description: "" });
        setImageFiles([]);
      },
      onError: (error) => {
        alert("Failed to add product: " + (error instanceof Error ? error.message : "Unknown error"));
      },
    });
  };

  const handleSearchProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchProductId.trim()) {
      alert("Please enter a product ID");
      return;
    }

    try {
      const product = await searchProductById(searchProductId);
      if (product) {
        setFoundProduct(product);
      } else {
        setFoundProduct(null);
        alert("Product not found");
      }
    } catch (error) {
      alert("Failed to search product: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm(`Are you sure you want to delete product ${productId}?`)) {
      deleteProduct(productId, {
        onSuccess: () => {
          alert("Product deleted successfully!");
          setFoundProduct(null);
          setSearchProductId("");
        },
        onError: (error) => {
          alert("Failed to delete product: " + (error instanceof Error ? error.message : "Unknown error"));
        },
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="border-b border-neutral-700 bg-neutral-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-neutral-600 text-neutral-200 hover:bg-neutral-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-neutral-800 border border-neutral-700">
            <TabsTrigger
              value="sales"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-neutral-900"
            >
              Sales Orders
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-neutral-900"
            >
              Product Management
            </TabsTrigger>
          </TabsList>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <Card className="bg-neutral-800 border-neutral-700 p-6">
              <h2 className="text-2xl font-bold text-amber-400 mb-6">Sales Orders</h2>

              {/* Date Filter */}
              <div className="flex gap-4 mb-6 items-end flex-wrap">
                <div className="min-w-[150px] flex-1">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-neutral-700 border-neutral-600 text-neutral-100"
                  />
                </div>
                <div className="min-w-[150px] flex-1">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-neutral-700 border-neutral-600 text-neutral-100"
                  />
                </div>
                <Button
                  onClick={handleShowAllOrders}
                  variant="outline"
                  className="border-neutral-600 text-neutral-200 hover:bg-neutral-800"
                >
                  Show All Orders
                </Button>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left py-3 px-4 text-amber-400">Order ID</th>
                      <th className="text-left py-3 px-4 text-amber-400">Customer</th>
                      <th className="text-left py-3 px-4 text-amber-400">Email</th>
                      <th className="text-left py-3 px-4 text-amber-400">Products</th>
                      <th className="text-right py-3 px-4 text-amber-400">Total</th>
                      <th className="text-left py-3 px-4 text-amber-400">Status</th>
                      <th className="text-left py-3 px-4 text-amber-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b border-neutral-700 hover:bg-neutral-700/50">
                          <td className="py-3 px-4 text-neutral-200">{order.id}</td>
                          <td className="py-3 px-4 text-neutral-200">{order.user_name}</td>
                          <td className="py-3 px-4 text-neutral-300 text-xs">{order.user_email}</td>
                          <td className="py-3 px-4 text-neutral-300 text-xs">
                            {order.items.map((item) => `${item.name} (x${item.quantity})`).join(", ")}
                          </td>
                          <td className="py-3 px-4 text-right text-amber-400 font-semibold">
                            ₹{order.total.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === "delivered"
                                  ? "bg-green-900/30 text-green-400"
                                  : order.status === "shipped"
                                    ? "bg-blue-900/30 text-blue-400"
                                    : order.status === "processing"
                                      ? "bg-yellow-900/30 text-yellow-400"
                                      : "bg-neutral-700/30 text-neutral-400"
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-300 text-xs">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-400">
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Add Product Form */}
            <Card className="bg-neutral-800 border-neutral-700 p-6">
              <h2 className="text-2xl font-bold text-amber-400 mb-6">Add New Product</h2>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Product ID *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., KP-001"
                      value={productForm.id}
                      onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                      className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Product Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Rani Vastra Royal Maroon"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-neutral-700 border border-neutral-600 text-neutral-100 rounded px-3 py-2"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Butta Sarees">Butta Sarees</option>
                      <option value="Pure Brocade">Pure Brocade</option>
                      <option value="Pure Jakkad">Pure Jakkad</option>
                      <option value="Korvai Sarees">Korvai Sarees</option>
                      <option value="Pure Checked Butta">Pure Checked Butta</option>
                      <option value="Border Butta">Border Butta</option>
                      <option value="Body Butta">Body Butta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Collection / Occasion *
                    </label>
                    <select
                      value={productForm.occasion}
                      onChange={(e) => setProductForm({ ...productForm, occasion: e.target.value })}
                      className="w-full bg-neutral-700 border border-neutral-600 text-neutral-100 rounded px-3 py-2"
                      required
                    >
                      <option value="">Select collection</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Festive">Festive</option>
                      <option value="Traditional">Traditional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Quantity *
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      value={productForm.quantity}
                      onChange={(e) =>
                        setProductForm({ ...productForm, quantity: parseInt(e.target.value) || 0 })
                      }
                      className="bg-neutral-700 border-neutral-600 text-neutral-100"
                      required
                    />
                  </div>

                   <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Price (₹) *
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 28500"
                      value={productForm.price || ""}
                      onChange={(e) =>
                        setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })
                      }
                      className="bg-neutral-700 border-neutral-600 text-neutral-100"
                      required
                      min={0}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      MRP (₹) <span className="text-neutral-500 text-xs">(leave blank to match price)</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 34000"
                      value={productForm.mrp || ""}
                      onChange={(e) =>
                        setProductForm({ ...productForm, mrp: parseFloat(e.target.value) || 0 })
                      }
                      className="bg-neutral-700 border-neutral-600 text-neutral-100"
                      min={0}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Fabric
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Pure Silk"
                      value={productForm.fabric}
                      onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                      className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Colour
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Maroon, Green, Blue"
                      value={productForm.color}
                      onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                      className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Product Image *
                    </label>
                    
                    <div className="flex flex-col gap-3">
                      {/* Option 1: File Upload */}
                      <div className="border border-dashed border-neutral-600 rounded-lg p-4 text-center hover:bg-neutral-700/50 transition-colors">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setImageFiles(Array.from(e.target.files));
                              setProductForm({ ...productForm, image: "" }); // clear URL if file picked
                            }
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                          <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          <span className="text-sm text-amber-400 font-medium">Click to upload image files</span>
                          <span className="text-xs text-neutral-500 mt-1">{imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'PNG, JPG, WEBP up to 5MB'}</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-px bg-neutral-700 flex-1"></div>
                        <span className="text-xs text-neutral-500 uppercase">OR PASTE URL</span>
                        <div className="h-px bg-neutral-700 flex-1"></div>
                      </div>

                      {/* Option 2: Image URL */}
                      <Input
                        type="url"
                        placeholder="https://example.com/saree.jpg"
                        value={productForm.image}
                        onChange={(e) => {
                          setProductForm({ ...productForm, image: e.target.value });
                          setImageFiles([]); // clear file if URL typed
                        }}
                        className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500"
                        disabled={imageFiles.length > 0}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Brief description of the saree..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      rows={3}
                      className="w-full bg-neutral-700 border border-neutral-600 text-neutral-100 placeholder-neutral-500 rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isAddingProduct || isUploading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold py-2"
                >
                  {isUploading ? "Uploading Image..." : isAddingProduct ? "Adding..." : "Add Product"}
                </Button>
              </form>
            </Card>

            {/* Search and Delete Product */}
            <Card className="bg-neutral-800 border-neutral-700 p-6">
              <h2 className="text-2xl font-bold text-amber-400 mb-6">Search & Delete Product</h2>

              <form onSubmit={handleSearchProduct} className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter product ID to search..."
                    value={searchProductId}
                    onChange={(e) => setSearchProductId(e.target.value)}
                    className="flex-1 bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500"
                  />
                  <Button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold"
                  >
                    Search
                  </Button>
                </div>
              </form>

              {foundProduct && (
                <div className="bg-neutral-700/50 border border-neutral-600 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-neutral-400">Product ID</p>
                      <p className="text-neutral-100 font-semibold">{foundProduct.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">Name</p>
                      <p className="text-neutral-100 font-semibold">{foundProduct.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">Category</p>
                      <p className="text-neutral-100 font-semibold">{foundProduct.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">Price</p>
                      <p className="text-neutral-100 font-semibold">₹{foundProduct.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDeleteProduct(foundProduct.id)}
                    disabled={isDeletingProduct}
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2"
                  >
                    {isDeletingProduct ? "Deleting..." : "Delete Product"}
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
