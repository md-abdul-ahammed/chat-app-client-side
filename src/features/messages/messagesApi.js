import { apiSlice } from "../api/apiSlice";
import io from "socket.io-client";

export const messagesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // endpoints here
    getMessages: builder.query({
      query: (id) =>
        `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
      transformResponse(apiResponse, meta) {
        const totalCount = meta.response.headers.get("X-Total-Count");
        return {
          data: apiResponse,
          totalCount,
        };
      },
      async onCacheEntryAdded(
        { id },
        { updateCachedData, getState, cacheDataLoaded, cacheEntryRemoved }
      ) {
        //create socket
        const socket = io("http://localhost:9000/", {
          reconnectionDelay: 1000,
          reconnection: true,
          reconnectionAttempts: 10,
          transports: ["websocket"],
          agent: false,
          upgrade: false,
          rejectUnauthorized: false,
        });
        try {
          // wait for the initial query to resolve before proceeding
          await cacheDataLoaded;

          socket.on("message", (data) => {
            updateCachedData((draft) => {
              const { user } = getState().auth;
              const { email } = user;
              const receiverEmail = data.data.receiver.email;

              if (email === receiverEmail) {
                draft.data.push(data.data);
              }
            });
          });
        } catch {
          // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
          // in which case `cacheDataLoaded` will throw
        }
        await cacheEntryRemoved;
        socket.close();
      },
    }),
    getMoreMessages: builder.query({
      query: ({ page, id }) =>
        `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
      async onQueryStarted({ page, id }, { queryFulfilled, dispatch }) {
        try {
          const messages = await queryFulfilled;
          if (messages?.data?.length > 0) {
            // UPDATE CONVERSATION CACHE PESSIMISTICALLY START

            dispatch(
              apiSlice.util.updateQueryData(
                "getMessages",
                id /* because draft always string. so we need to convert it to string */,
                (draft) => {
                  return {
                    data: [...draft.data, ...messages.data],
                    totalCount: Number(draft.totalCount),
                  };
                }
              )
            );

            // udpate messages cache pessimistically end
          }
        } catch (err) {}
      },
    }),
    addMessage: builder.mutation({
      query: (data) => ({
        url: "/messages",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useGetMessagesQuery, useAddMessageMutation } = messagesApi;
