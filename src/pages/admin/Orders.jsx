import { useState, useEffect } from "react";
import { MoreHorizontal, Loader2, CheckCircle2, AlertCircle, ShoppingCart, User, Phone, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchOrders();
    
    // Setup Realtime subscription
    const subscription = supabase
      .channel('orders_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        // Add new order to top without reloading
        setOrders(prev => [payload.new, ...prev]);
        showToast("هناك طلب جديد وصل الآن!");
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateError) throw updateError;
      
      // Update local state for immediate feedback
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast("Statut de la commande mis à jour avec succès !");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'border-neutral-200 text-neutral-400';
    switch (status.toLowerCase()) {
      case 'pending': return 'border-neutral-300 text-neutral-500';
      case 'shipped': return 'border-black text-black bg-white';
      case 'delivered': return 'bg-black text-white border-black';
      case 'cancelled': return 'border-red-200 text-red-500';
      default: return 'border-neutral-200 text-neutral-400';
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
        <h2 className="text-3xl font-extrabold tracking-tighter uppercase mb-2 text-black">Orders</h2>
        <p className="text-neutral-500 font-medium">Manage incoming customer orders and shipping status.</p>
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-sm font-bold uppercase tracking-widest">Loading Orders...</p>
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="py-20 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400">
          <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-bold uppercase tracking-wider">No orders found</p>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="overflow-x-auto border border-black bg-white shadow-[4px_4px_0_0_#000]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-black">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Order ID</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-black w-64">Customer & Phone</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-black">Location</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-black">Product Details</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-right text-black">Total</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-right text-black">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors last:border-b-0">
                  <td className="py-6 px-6 align-top">
                    <span className="font-mono text-sm font-bold text-neutral-400">#{order.id}</span>
                  </td>
                  <td className="py-6 px-6 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 font-bold text-black group">
                        <User className="w-4 h-4 text-neutral-400" />
                        <span>{order.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{order.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6 align-top">
                    <div className="flex items-center gap-2 text-sm font-bold text-neutral-700">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      <span>{order.wilaya}</span>
                    </div>
                  </td>
                  <td className="py-6 px-6 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-black uppercase tracking-tight text-sm">
                        {Array.isArray(order.items) && order.items[0] ? order.items[0].name : order.product_name}
                      </span>
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                        Size: {Array.isArray(order.items) && order.items[0] ? order.items[0].size : order.size}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-right align-top">
                    <span className="font-extrabold text-black text-lg">{Number(order.total || order.total_price || 0).toLocaleString()} DA</span>
                  </td>
                  <td className="py-6 px-6 text-right align-top">
                    <div className="flex flex-col items-end gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-[10px] font-bold uppercase tracking-wider bg-transparent border-b border-black focus:outline-none cursor-pointer hover:bg-neutral-100 px-1"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
