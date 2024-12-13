import { AppRouter } from '@/trpc'
import { createTRPCReact } from '@trpc/react-query'
import { createTRPCClient, httpBatchLink, loggerLink  } from '@trpc/client';
import superjson from 'superjson'


// export const trpc = createTRPCClient<AppRouter>({
//     transformer: superjson,
//     links: [
//       /**
//        * The function passed to enabled is an example in case you want to the link to
//        * log to your console in development and only log errors in production
//        */
//       loggerLink({
//         enabled: (opts) =>
//           (process.env.NODE_ENV === 'development' &&
//             typeof window !== 'undefined') ||
//           (opts.direction === 'down' && opts.result instanceof Error),
//       }),
//       httpBatchLink({
//         url: 'http://localhost:3000',
//       }),
//     ],
//   });



export const trpc = createTRPCReact<AppRouter>({})
