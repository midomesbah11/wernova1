import { useState, useRef, useEffect } from "react";
import { Plus, X, UploadCloud, MoreHorizontal, Loader2, CheckCircle2, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { ChromePicker } from "react-color";
import { optimizeCloudinaryUrl } from "../../utils/cloudinary";

export default function Products() {
  const [isSlideOverOpen, setSlideOverOpen] = useState(false);

  // Form States
  const [uploadedImages, setUploadedImages] = useState([]);
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("ensemble");
  const [sizeStock, setSizeStock] = useState({ S: "", M: "", L: "", XL: "", XXL: "" });
  const [colors, setColors] = useState([]); 
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColorHex, setTempColorHex] = useState("#000000");
  const [newColorStock, setNewColorStock] = useState("");
  
  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleSizeStockChange = (size, value) => {
    setSizeStock({ ...sizeStock, [size]: value });
  };

  const addColor = () => {
    if (newColorHex && newColorStock !== "") {
      setColors([...colors, { hex: newColorHex, stock: parseInt(newColorStock) }]);
      setNewColorStock("");
    }
  };

  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  // Config: Using Environment Variables for Cloudinary
  const CLOUDINARY_UPLOAD_PRESET = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "your_unsigned_preset").replace(/['"]/g, ""); 
  const CLOUDINARY_CLOUD_NAME = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your_cloud_name").replace(/['"]/g, "");

  // Data States
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    console.log("Cloudinary Config Loaded:", {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET
    });
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch(err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const [editingProductId, setEditingProductId] = useState(null);

  const handleAddNew = () => {
    setEditingProductId(null);
    setProductName("");
    setProductDesc("");
    setProductPrice("");
    setProductCategory("ensemble");
    setSizeStock({ S: "", M: "", L: "", XL: "", XXL: "" });
    setColors([]);
    setUploadedImages([]);
    setSlideOverOpen(true);
  };

  const editProduct = (item) => {
    setEditingProductId(item.id);
    setProductName(item.name);
    setProductDesc(item.description || "");
    setProductPrice(item.price.toString());
    setProductCategory(item.category || "ensemble");
    setSizeStock(item.sizes_stock || { S: "", M: "", L: "", XL: "", XXL: "" });
    setColors(item.variants || []);
    setUploadedImages(item.images || []);
    setSlideOverOpen(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      showToast("Produit supprimé avec succès !");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du produit.");
    }
  };

  const openCloudinaryWidget = () => {
    let myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        multiple: true,
        clientAllowedFormats: ["png", "jpeg", "heic", "heif", "webp", "jpg"],
        maxImageFileSize: 10000000,
        cropping: false, // Disabled client-side cropping to support HEIC uploads on all browsers
        defaultSource: "local",
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          let secureUrl = result.info.secure_url;
          const optimizedUrl = optimizeCloudinaryUrl(secureUrl);
          setUploadedImages((prev) => [...prev, optimizedUrl]);
        }
      }
    );
    myWidget.open();
  };

  const handleRemoveImage = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (uploadedImages.length === 0 || !productName || !productPrice) {
      setError("Images, Name, and Price are required.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. We already have the uploaded URLs from Cloudinary Widget
      const optimizedUrls = uploadedImages;

      // Calculate a total stock aggregate if needed
      const calculatedTotalStock = 
        Object.values(sizeStock).reduce((acc, val) => acc + (parseInt(val) || 0), 0) + 
        colors.reduce((acc, c) => acc + c.stock, 0);

      const payload = {
        name: productName,
        description: productDesc,
        price: parseFloat(productPrice),
        category: productCategory,
        stock: calculatedTotalStock,
        images: optimizedUrls, // تأكد من أن اسم العمود في Supabase هو images (إذا كان images_urls قم بتغييرها هنا)
        sizes_stock: sizeStock,
        variants: colors
      };

      console.log("🚀 Payload ready to insert:", payload);

      // 2. Insert or Update to Supabase
      if (editingProductId) {
        const { error: supabaseError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProductId);

        if (supabaseError) {
          console.error("❌ Supabase Update Error:", supabaseError);
          throw new Error(supabaseError.message || "Failed to update in Supabase");
        }
        showToast("Le produit a été modifié avec succès !");
      } else {
        const { error: supabaseError } = await supabase
          .from('products')
          .insert([payload]);

        if (supabaseError) {
          console.error("❌ Supabase Insertion Error:", supabaseError);
          throw new Error(supabaseError.message || "Failed to insert into Supabase");
        }
        showToast("Le produit a été ajouté avec succès !");
      }

      setSuccess(true);
      fetchProducts();
      
      setTimeout(() => {
        setSlideOverOpen(false);
        setSuccess(false);
      }, 1500);

      // Reset Form
      setProductName("");
      setProductDesc("");
      setProductPrice("");
      setProductCategory("ensemble");
      setSizeStock({ S: "", M: "", L: "", XL: "", XXL: "" });
      setColors([]);
      setUploadedImages([]);
      
    } catch (err) {
      console.error("========== FULL ERROR DETAILS ==========");
      console.error("Error Object:", err);
      console.log("Error Name:", err?.name);
      console.log("Error Message:", err?.message);
      console.error("========================================");
      
      setError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-['Inter'] relative min-h-full pb-20">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-[slideLeft_0.3s_var(--ease-smooth)] transition-all flex items-center gap-3 bg-black text-white p-4 font-bold border-2 border-[#38bdf8] shadow-[4px_4px_0_0_#38bdf8]">
          <CheckCircle2 className="w-5 h-5 text-[#38bdf8]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold tracking-tighter uppercase mb-2 text-black">Inventory</h2>
        <p className="text-neutral-500 font-medium">Manage your streetwear pieces and stock levels.</p>
      </div>

      <div className="w-full">
        {/* Products Table */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold uppercase tracking-tight text-black">All Pieces</h3>
            <span className="text-sm font-bold text-neutral-500">{products.length} Items</span>
          </div>
          
          {isProductsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
              <p className="text-sm font-bold uppercase tracking-widest">Loading Inventory...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400">
              <p className="font-bold uppercase tracking-wider">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="pb-3 text-sm font-bold uppercase tracking-wider">Product</th>
                    <th className="pb-3 text-sm font-bold uppercase tracking-wider text-right">Price</th>
                    <th className="pb-3 text-sm font-bold uppercase tracking-wider text-right">Status</th>
                    <th className="pb-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => {
                    const statusText = item.stock > 10 ? "Active" : (item.stock > 0 ? "Low Stock" : "Out of Stock");
                    const statusColor = item.stock > 10 ? "text-black" : (item.stock > 0 ? "text-orange-500" : "text-red-500");
                    const coverImg = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.img;
                    const optimizedCoverImg = optimizeCloudinaryUrl(coverImg);
                    
                    return (
                      <tr key={item.id} className="border-b border-neutral-300 hover:bg-neutral-50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-4">
                            <img src={optimizedCoverImg} alt={item.name} className="w-12 h-12 object-cover rounded-none border border-black grayscale-[20%]" />
                            <div>
                              <p className="font-bold text-black uppercase tracking-tight">{item.name}</p>
                              <p className="text-xs font-medium text-neutral-500">{String(item.id).substring(0, 8)}... • {item.stock} in stock</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <span className="font-extrabold text-black">{item.price} DA</span>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-3 pr-4">
                            <button onClick={() => editProduct(item)} className="text-neutral-400 hover:text-blue-500 transition-colors" title="Modifier">
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => deleteProduct(item.id)} className="text-neutral-400 hover:text-red-500 transition-colors" title="Supprimer">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <button 
        onClick={handleAddNew}
        className="fixed bottom-8 right-8 z-40 bg-black text-white px-6 py-4 flex items-center gap-3 font-bold uppercase tracking-wider border-2 border-black hover:bg-white hover:text-black transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
      >
        <Plus className="w-5 h-5 stroke-[2.5px]" />
        <span>Add New Piece</span>
      </button>

      {/* Slide-over Panel Background Overlay */}
      {isSlideOverOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setSlideOverOpen(false)}
        />
      )}

      {/* Slide-over Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-black z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
        isSlideOverOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex justify-between items-center p-6 border-b border-black">
          <h2 className="text-2xl font-extrabold tracking-tight uppercase">
            {editingProductId ? "Edit Piece" : "New Piece"}
          </h2>
          <button 
            onClick={() => setSlideOverOpen(false)}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 flex-grow overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 border border-black bg-neutral-100 flex items-start gap-3 text-black">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-bold uppercase tracking-wide">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 border border-black bg-black text-white flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-bold uppercase tracking-wide">Product published successfully!</p>
            </div>
          )}

          <form id="addProductForm" className="flex flex-col gap-8" onSubmit={handleSubmit}>
            
            {/* Image Upload Area */}
            <button 
              type="button"
              className="relative py-12 w-full border-2 border-dashed border-black bg-neutral-50 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={openCloudinaryWidget}
              disabled={isLoading}
            >
              <UploadCloud className="w-10 h-10 mb-4 text-neutral-400 group-hover:text-black transition-colors" />
              <span className="font-bold uppercase tracking-wider text-sm">Add Images</span>
              <span className="text-xs text-neutral-500 mt-2 font-medium">JPEG, PNG, HEIC (Multiple allowed, Cropping enabled)</span>
            </button>

            {/* Image Previews */}
            {uploadedImages.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative w-24 h-24 shrink-0 border border-black bg-white group">
                    <img src={optimizeCloudinaryUrl(url)} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={(e) => handleRemoveImage(e, index)}
                      className="absolute -top-2 -right-2 bg-white border border-black p-1 hover:bg-black hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Inputs */}
            <div className="flex flex-col gap-6">
              
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="relative col-span-2 md:col-span-1">
                  <input 
                    type="text" 
                    id="productName" 
                    placeholder=" "
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    disabled={isLoading}
                    className="w-full border-b border-black py-2 bg-transparent text-lg font-bold focus:outline-none focus:border-black focus:border-b-2 peer placeholder-transparent disabled:opacity-50"
                    required
                  />
                  <label 
                    htmlFor="productName" 
                    className="absolute left-0 -top-3.5 text-xs font-bold uppercase tracking-wider text-neutral-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-placeholder-shown:text-black peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-neutral-500"
                  >
                    Piece Name
                  </label>
                </div>

                <div className="relative col-span-2 md:col-span-1 border-b border-black">
                  <select 
                    id="productCategory"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    disabled={isLoading}
                    required
                    className="w-full bg-transparent py-2 text-lg font-bold focus:outline-none disabled:opacity-50 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Category</option>
                    <option value="ensemble">ENSEMBLE</option>
                    <option value="hoodie">HOODIE</option>
                  </select>
                  <label 
                    htmlFor="productCategory" 
                    className="absolute left-0 -top-3.5 text-xs font-bold uppercase tracking-wider text-neutral-500"
                  >
                    Category
                  </label>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pt-2 text-black">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.5 7.5L10 12l4.5-4.5H5.5z"/></svg>
                  </div>
                </div>
              </div>

              <div className="relative">
                <input 
                  type="number" 
                  id="productPrice" 
                  placeholder=" "
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  disabled={isLoading}
                  className="w-full border-b border-black py-2 bg-transparent text-lg font-bold focus:outline-none focus:border-black focus:border-b-2 peer placeholder-transparent disabled:opacity-50"
                  required
                />
                <label 
                  htmlFor="productPrice" 
                  className="absolute left-0 -top-3.5 text-xs font-bold uppercase tracking-wider text-neutral-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-placeholder-shown:text-black peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-neutral-500"
                >
                  Price (DA)
                </label>
              </div>

              <div className="relative pt-2">
                <textarea 
                  id="productDesc" 
                  placeholder=" "
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                  className="w-full border-b border-black py-2 bg-transparent text-lg font-medium focus:outline-none focus:border-black focus:border-b-2 peer placeholder-transparent disabled:opacity-50 resize-none"
                />
                <label 
                  htmlFor="productDesc" 
                  className="absolute left-0 -top-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-placeholder-shown:text-black peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-neutral-500"
                >
                  Description (Optional)
                </label>
              </div>

              {/* Stock per Size */}
              <div className="flex flex-col gap-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-black">Stock per Size</span>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(sizeStock).map(size => (
                    <div key={size} className="flex flex-col border border-black">
                      <div className="bg-black text-white text-center py-1 text-xs font-bold">{size}</div>
                      <input 
                        type="number"
                        min="0"
                        value={sizeStock[size]}
                        onChange={(e) => handleSizeStockChange(size, e.target.value)}
                        className="w-full text-center py-2 text-sm font-bold focus:outline-none focus:bg-neutral-100 disabled:opacity-50"
                        placeholder="0"
                        disabled={isLoading}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors & Stock */}
              <div className="flex flex-col gap-3 pt-4 border-t border-dashed border-neutral-300">
                <span className="text-xs font-bold uppercase tracking-wider text-black">Colors & Stock</span>
                
                <div className="flex gap-4 items-end">
                  <div className="flex-1 flex flex-col">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Color Picker</label>
                    <div className="relative">
                      {/* Gradient Circle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setTempColorHex(newColorHex);
                          setShowColorPicker(!showColorPicker);
                        }}
                        disabled={isLoading}
                        className="w-10 h-10 rounded-full border-2 border-black focus:outline-none shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] transition-all"
                        style={{
                          background: `linear-gradient(135deg, ${newColorHex} 0%, ${newColorHex}80 100%)`
                        }}
                      ></button>
                      
                      {/* Color Picker Popup */}
                      {showColorPicker && (
                        <div className="absolute top-12 left-0 z-50 bg-white border-2 border-black p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-3 min-w-[240px]">
                          <ChromePicker 
                            color={tempColorHex} 
                            onChange={(color) => setTempColorHex(color.hex)}
                            disableAlpha={true}
                            width="100%"
                          />
                          <div className="flex gap-2 w-full mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setNewColorHex(tempColorHex);
                                setShowColorPicker(false);
                              }}
                              className="flex-1 bg-black text-white text-xs font-bold py-2 uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowColorPicker(false)}
                              className="flex-1 border border-black bg-white text-black text-xs font-bold py-2 uppercase tracking-wider hover:bg-neutral-100 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-24 flex flex-col border-b border-black">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Stock</label>
                    <input 
                      type="number" 
                      min="0"
                      value={newColorStock}
                      onChange={(e) => setNewColorStock(e.target.value)}
                      placeholder="0"
                      className="w-full py-1 text-sm font-bold focus:outline-none disabled:opacity-50"
                      disabled={isLoading}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={addColor}
                    disabled={isLoading}
                    className="bg-black text-white px-5 py-2 font-bold text-xs uppercase tracking-wider hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>

                {colors.length > 0 && (
                  <div className="mt-2 border border-black">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-neutral-100 border-b border-black">
                        <tr>
                          <th className="py-2 px-3 font-bold uppercase text-xs">Color</th>
                          <th className="py-2 px-3 font-bold uppercase text-xs w-24 text-center">Stock</th>
                          <th className="py-2 px-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {colors.map((c, i) => (
                          <tr key={i} className="border-b last:border-b-0 border-neutral-200">
                            <td className="py-2 px-3 font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border border-black" style={{ backgroundColor: c.hex }}></div>
                                <span className="uppercase tracking-wider font-bold text-xs">{c.hex}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center font-bold">{c.stock}</td>
                            <td className="py-2 px-3 text-right">
                              <button 
                                type="button" 
                                onClick={() => removeColor(i)} 
                                disabled={isLoading}
                                className="text-neutral-400 hover:text-black disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

          </form>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-black bg-white flex gap-4 mt-auto">
          <button 
            type="button" 
            onClick={() => setSlideOverOpen(false)}
            disabled={isLoading}
            className="flex-1 py-4 border border-black font-bold uppercase tracking-wider text-sm hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="addProductForm"
            disabled={isLoading}
            className="flex-[2] py-4 bg-black text-white border-2 border-black font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              editingProductId ? "Update Piece" : "Publish Piece"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
