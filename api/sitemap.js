import { Client, Databases } from 'node-appwrite';

export default async function handler(req, res) {
  const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.VITE_APPWRITE_API_KEY); 

  const databases = new Databases(client);

  try {
    const products = await databases.listDocuments(
      process.env.VITE_APPWRITE_DATABASE_ID,
      process.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID,
      []
    );

    const baseUrl = 'https://mall.bytecores.in';
    
    // Static routes
    const staticRoutes = [
      '',
      '/products',
      '/about-us',
      '/contact',
      '/privacy-policy'
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add static routes
    staticRoutes.forEach((route) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}${route}</loc>\n`;
      sitemap += `    <changefreq>daily</changefreq>\n`;
      sitemap += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // Add dynamic product routes
    products.documents.forEach((product) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/product/${product.$id}</loc>\n`;
      sitemap += `    <lastmod>${new Date(product.$updatedAt).toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.9</priority>\n`;
      sitemap += `  </url>\n`;
    });

    sitemap += `</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}
