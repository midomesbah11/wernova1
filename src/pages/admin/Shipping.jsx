import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, Save, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function Shipping() {
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [error, setError] = useState(null);

  // Fallback 58 Wilayas in case table is empty or missing
  const defaultWilayas = [
    "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna", 
    "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira", 
    "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", 
    "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda", 
    "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine", 
    "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla", 
    "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arreridj", "35 - Boumerdès", 
    "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela", 
    "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", 
    "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - Timimoun", "50 - Bordj Badji Mokhtar", 
    "51 - Ouled Djellal", "52 - Béni Abbès", "53 - In Salah", "54 - In Guezzam", "55 - Touggourt", 
    "56 - Djanet", "57 - El M'Ghair", "58 - El Meniaa"
  ];

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('shipping_rates')
        .select('*')
        .order('id', { ascending: true });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        // Init with defaults if empty
        const initialRates = defaultWilayas.map((w, i) => ({
          id: i + 1,
          wilaya_name: w,
          home_price: 800,
          office_price: 500
        }));
        setRates(initialRates);
        setError("Table 'shipping_rates' appears empty or doesn't exist. Showing default mock data. Please create the table in Supabase.");
      } else {
        setRates(data);
      }
    } catch (err) {
      console.error("Error fetching rates:", err);
      // Fallback to local state if table doesn't exist yet
      const initialRates = defaultWilayas.map((w, i) => ({
        id: i + 1,
        wilaya_name: w,
        home_price: 800,
        office_price: 500
      }));
      setRates(initialRates);
      setError("Could not fetch from Supabase. Showing default mock data. Please create the 'shipping_rates' table.");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePriceChange = (id, field, value) => {
    setRates(prev => prev.map(rate => 
      rate.id === id ? { ...rate, [field]: Number(value) } : rate
    ));
  };

  const saveRates = async () => {
    setIsSaving(true);
    try {
      const { error: upsertError } = await supabase
        .from('shipping_rates')
        .upsert(rates);

      if (upsertError) throw upsertError;
      showToast("Shipping rates updated successfully!");
      setError(null);
    } catch (err) {
      console.error("Failed to save rates:", err);
      setError("Failed to save to Supabase. Ensure 'shipping_rates' table exists with columns: id, wilaya_name, home_price, office_price.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="font-['Inter'] relative min-h-full pb-20">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-[slideLeft_0.3s_var(--ease-smooth)] transition-all flex items-center gap-3 bg-black text-white p-4 font-bold border-2 border-[#38bdf8] shadow-[4px_4px_0_0_#38bdf8]">
          <CheckCircle2 className="w-5 h-5 text-[#38bdf8]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tighter uppercase mb-2 text-black">Shipping Rates</h2>
          <p className="text-neutral-500 font-medium">Manage delivery costs across all 58 Wilayas.</p>
        </div>
        <button 
          onClick={saveRates}
          disabled={isSaving || isLoading}
          className="bg-black text-white px-6 py-3 font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>Save Changes</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 border-2 border-red-200 bg-red-50 text-red-600 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-sm font-bold uppercase tracking-widest">Loading Rates...</p>
        </div>
      ) : (
        <div className="border border-black bg-white shadow-[4px_4px_0_0_#000]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-black">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-black">Wilaya</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-black">Home Delivery (DA)</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-black">Office / Stop Desk (DA)</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors last:border-b-0">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 font-bold text-black">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        <span>{rate.wilaya_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <input 
                        type="number" 
                        value={rate.home_price}
                        onChange={(e) => handlePriceChange(rate.id, 'home_price', e.target.value)}
                        className="w-32 border-b border-black bg-transparent py-1 font-bold focus:outline-none focus:border-b-2 focus:bg-neutral-100 px-2"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <input 
                        type="number" 
                        value={rate.office_price}
                        onChange={(e) => handlePriceChange(rate.id, 'office_price', e.target.value)}
                        className="w-32 border-b border-black bg-transparent py-1 font-bold focus:outline-none focus:border-b-2 focus:bg-neutral-100 px-2"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
