import { useDispatch, useSelector } from "react-redux";
import {
  conversationsApi,
  useGetConversationsQuery,
} from "../../features/conversations/conversationsApi";
import Error from "../ui/Error";
import ChatItem from "./ChatItem";
import moment from "moment";
import getPartnerInfo from "../../utils/getPartnerInfo";
import gravatarUrl from "gravatar-url";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";

export default function ChatItems() {
  const { user } = useSelector((state) => state.auth) || {};
  const { email } = user || {};
  const { data, error, isLoading, isError } =
    useGetConversationsQuery(email) || {};
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dispatch = useDispatch();
  const { data: conversations, totalCount } = data || {};

  const fetchMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (page > 1) {
      dispatch(
        conversationsApi.endpoints.getMoreConversations.initiate({
          email,
          page,
        })
      );
    }
  }, [page, dispatch, email]);

  useEffect(() => {
    if (totalCount > 0) {
      const more = Math.ceil(
        totalCount / Number(process.env.REACT_APP_CONVERSATIONS_PER_PAGE) > page
      );
      setHasMore(more);
    }
  }, [totalCount, page]);

  // decide what to render
  let content = null;
  if (isLoading) {
    content = <li className="m-2 text-center">Loading....</li>;
  } else if (!isLoading && isError) {
    content = <Error message={error.error} />;
  } else if (!isLoading && !isError && conversations?.length === 0) {
    content = <li className="m-2 text-center">No Conversations Found!</li>;
  } else if (!isLoading && !isError && conversations?.length > 0) {
    content = (
      <InfiniteScroll
        dataLength={conversations?.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={<h4>Loading....</h4>}
        height={window.innerHeight - 129}
      >
        {conversations
          .slice()
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((conversation) => {
            const { id, message, timestamp, users } = conversation || {};
            const { name, email: partnerEmail } =
              getPartnerInfo(users, email) || {};
            return (
              <li key={id}>
                <Link to={`/inbox/${id}`}>
                  <ChatItem
                    avatar={gravatarUrl(partnerEmail, {
                      size: 80,
                    })}
                    name={name}
                    id={id}
                    lastMessage={message}
                    lastTime={moment(timestamp).fromNow()}
                  />
                </Link>
              </li>
            );
          })}
      </InfiniteScroll>
    );
  }

  return <ul>{content}</ul>;
}
