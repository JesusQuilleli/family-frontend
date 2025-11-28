export const getImageUrl = (url: string | undefined | null) => {
   if (!url) return '/not-image.jpg';

   const cleanUrl = url.trim();

   // Fix for corrupted URLs in DB (localhost prefixing cloudinary)
   if (cleanUrl.includes('cloudinary.com')) {
      const match = cleanUrl.match(/(https?:\/\/res\.cloudinary\.com.*)/i);
      if (match) return match[1];
      return cleanUrl;
   }

   if (cleanUrl.toLowerCase().startsWith('http') && !cleanUrl.includes('localhost')) return cleanUrl;
   if (cleanUrl.startsWith('blob:')) return cleanUrl;

   // Si no es una URL absoluta (Cloudinary) ni un blob, devolvemos la imagen por defecto
   return '/not-image.jpg';
};
