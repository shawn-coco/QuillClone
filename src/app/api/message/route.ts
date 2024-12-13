import { db } from '@/db'
import { openai } from '@/lib/openai'
import { getPineconeClient } from '@/lib/pinecone'
import { SendMessageValidator } from '@/lib/validators/SendMessageValidator'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import { NextRequest } from 'next/server'

import { OpenAIStream, StreamingTextResponse } from 'ai'
import { error } from 'console'

export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file

  const body = await req.json()
  console.log('body :' , body)

  const { getUser } = getKindeServerSession()
  const user = getUser()

  const { id: userId } = user

  if (!userId)
    return new Response('Unauthorized', { status: 401 })

  const { fileId, message } =
    SendMessageValidator.parse(body)

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file)
    return new Response('Not found', { status: 404 })

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  })

  // 1: vectorize message
  const embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small',
    stripNewLines: true,
    timeout: 5000, // 5s timeout
    openAIApiKey: 'sk-Oo4zWlTnyKgkOGrn37D98fC6Fa374eF1Ae252d12DfD7EdD3',
    batchSize: 512, // Default value if omitted is 512. Max is 2048
    configuration: {
      baseURL: "https://api.vveai.com/v1/",
      // baseURL: 'https://api.openai.com'
    },
  });
  console.log('embeddings :' , embeddings)

  const pinecone = await getPineconeClient()
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME)

  console.log('pineconeIndex :' , pineconeIndex)

  let vectorStore = null
  try{
      vectorStore = await PineconeStore.fromExistingIndex(
      embeddings,
      {
        pineconeIndex,
      }
    )
  }catch (err) {
    console.log(err)
    throw new Error('Failed to get PineconeStore.fromExistingIndex');
  }

  // return new Response(null, { status: 200 })
  
  console.log('vectorStore :' , vectorStore)

  const results = await vectorStore.similaritySearch(
    message,
    4
  )

  console.log('results :' , results)

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6,
  })

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage
      ? ('user' as const)
      : ('assistant' as const),
    content: msg.text,
  }))

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    stream: true,
    messages: [
      {
        role: 'system',
        content:
          'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
      },
      {
        role: 'user',
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
    if (message.role === 'user')
      return `User: ${message.content}\n`
    return `Assistant: ${message.content}\n`
  })}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join('\n\n')}
  
  USER INPUT: ${message}`,
      },
    ],
  })

  console.log('response :  ',response)

  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId,
        },
      })
    },
  })

  console.log('stream :  ',stream)

  return new StreamingTextResponse(stream)
}
