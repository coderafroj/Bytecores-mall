import { Client, Databases } from 'node-appwrite';

export default async function handler(req, res) {
  const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID);

  const databases = new Databases(client);
  const baseUrl = 'https://mall.bytecores.in';
  
  const staticRoutes = [
    '',
    '/products',
    '/about-us',
    '/contact',
    '/privacy-policy'
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  staticRoutes.forEach((route) => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}${route}</loc>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;
    sitemap += `  </url>\n`;
  });

  try {
    const products = await databases.listDocuments(
      process.env.VITE_APPWRITE_DATABASE_ID,
      process.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || 'products',
      []
    );

    products.documents.forEach((product) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/product/${product.$id}</loc>\n`;
      sitemap += `    <lastmod>${new Date(product.$updatedAt).toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.9</priority>\n`;
      sitemap += `  </url>\n`;
    });
  } catch (error) {
    console.error('Sitemap product fetch error, but continuing with static routes:', error);
  }

  sitemap += `</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.status(200).send(sitemap);
}
