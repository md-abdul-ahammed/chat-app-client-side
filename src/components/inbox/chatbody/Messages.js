import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { messagesApi } from "../../../features/messages/messagesApi";
import Message from "./Message";

export default function Messages({ messages = [], totalCount, id }) {
  const { user } = useSelector((state) => state.auth) || {};
  const { email } = user || {};
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const [hasMore, setHasMore] = useState(true);

  const fetchMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (page > 1) {
      dispatch(
        messagesApi.endpoints.getMoreMessages.initiate({
          id,
          page,
        })
      );
    }
  }, [page, dispatch, id]);

  useEffect(() => {
    if (totalCount > 0) {
      const more = Math.ceil(
        totalCount / Number(process.env.REACT_APP_MESSAGES_PER_PAGE) > page
      );
      setHasMore(more);
    }
  }, [totalCount, page]);

  return (
    <div
      className="relative w-full h-[calc(100vh_-_197px)] overflow-y-auto flex flex-col-reverse"
      id="scrollableDiv"
    >
      <ul className="space-y-2">
        <InfiniteScroll
          dataLength={messages?.length}
          next={fetchMore}
          style={{ display: "flex", flexDirection: "column-reverse" }}
          hasMore={hasMore}
          inverse
          loader={<h4>Loading....</h4>}
          scrollableTarget="scrollableDiv"
        >
          {messages
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((message, i) => {
              const { message: lastMessage, id, sender } = message;
              const justify = email !== sender.email ? "start" : "end";
              const shadow =
                email !== sender.email
                  ? { boxShadow: "0px 0px 5px red" }
                  : { boxShadow: "0px 0px 5px green" };
              return (
                <Message
                  shadow={shadow}
                  key={id}
                  justify={justify}
                  message={lastMessage}
                />
              );
            })}
        </InfiniteScroll>
      </ul>
    </div>
  );
}
