import { Webhook } from 'svix';
import { Client, Databases, ID } from 'appwrite';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET missing in environment');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Get the headers
  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Error occurred -- no svix headers' });
  }

  // Get the body
  let payload;
  try {
    // Collect stream chunks
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    payload = Buffer.concat(chunks).toString('utf8');
  } catch (err) {
    return res.status(400).json({ error: 'Could not read request body' });
  }

  // Verify payload
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).json({ error: 'Verification failed' });
  }

  const eventType = evt.type;
  console.log(`Webhook received: ${eventType}`);

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : '';
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    try {
      const client = new Client()
        .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.VITE_APPWRITE_PROJECT_ID);

      // We need API key here because we are WRITING to the database securely.
      // Unlike fetching public products, creating a user profile requires admin privileges.
      if (process.env.VITE_APPWRITE_API_KEY) {
        client.setKey(process.env.VITE_APPWRITE_API_KEY);
      } else {
        console.warn('VITE_APPWRITE_API_KEY is missing. Writing to users collection might fail if it is secured.');
      }

      const databases = new Databases(client);
      
      const collectionId = process.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users';

      await databases.createDocument(
        process.env.VITE_APPWRITE_DATABASE_ID,
        collectionId,
        id, // Using Clerk ID as Document ID for easy linking
        {
          clerkId: id,
          email: email,
          name: name,
          imageUrl: image_url || '',
          role: email === 'coderafroj@gmail.com' ? 'admin' : 'customer'
        }
      );
      
      console.log(`Successfully created deep profile in Appwrite for ${email}`);
    } catch (err) {
      console.error('Error saving user to Appwrite:', err);
      // We still return 200 so Clerk doesn't keep retrying forever if it's a structural DB issue
    }
  }

  res.status(200).json({ success: true });
}
