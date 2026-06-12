export const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

export const initPixel = () => {
  if (!PIXEL_ID) return;
  
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  
  fbq('init', PIXEL_ID);
};

export const trackPageView = () => {
  if (!PIXEL_ID || typeof window.fbq !== 'function') return;
  fbq('track', 'PageView');
};

export const trackViewContent = (product) => {
  if (!PIXEL_ID || typeof window.fbq !== 'function') return;
  fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'DZD'
  });
};

export const trackAddToCart = (product, quantity = 1) => {
  if (!PIXEL_ID || typeof window.fbq !== 'function') return;
  fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * quantity,
    currency: 'DZD'
  });
};

export const trackInitiateCheckout = (total) => {
  if (!PIXEL_ID || typeof window.fbq !== 'function') return;
  fbq('track', 'InitiateCheckout', {
    value: total,
    currency: 'DZD'
  });
};

export const trackPurchase = (orderData) => {
  if (!PIXEL_ID || typeof window.fbq !== 'function') return;
  
  const contentIds = orderData.items.map(item => item.id);
  
  fbq('track', 'Purchase', {
    content_ids: contentIds,
    content_type: 'product',
    value: orderData.total,
    currency: 'DZD',
    num_items: orderData.items.reduce((acc, item) => acc + item.quantity, 0)
  });
};
