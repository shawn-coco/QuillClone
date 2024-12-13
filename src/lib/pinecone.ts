import { Pinecone as PineconeClient } from '@pinecone-database/pinecone'
// import { Pinecone } from '@pinecone-database/pinecone';

export const getPineconeClient = async () => {

  try {
    const client = new PineconeClient({
      apiKey:'pcsk_4Pnih2_MiTXQE9pMoz1uNjUdH7rGfcCEV7shZjRLSkqpHeP5duUNRUCh72WPN6cHRwG8du',
    });
  
    return client
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to initialize Pinecone Client');
  }
}

