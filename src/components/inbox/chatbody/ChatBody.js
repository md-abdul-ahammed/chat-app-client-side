// import Blank from "./Blank";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { useGetMessagesQuery } from "../../../features/messages/messagesApi";
import { setParam } from "../../../features/messages/messagesSlice";
import Error from "../../ui/Error";
import ChatHead from "./ChatHead";
import Messages from "./Messages";
import Options from "./Options";

export default function ChatBody() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetMessagesQuery(id) || {};
  const { data: messages, totalCount } = data || {};
  const dispatch = useDispatch();

  useEffect(() =>{
    if(id){
      dispatch(setParam(id))
    }
  }, [id, dispatch])

  //decide what to render
  let content = null;
  if (isLoading) {
    content = <div>Loading...</div>;
  } else if (!isLoading && isError) {
    content = (
      <div>
        <Error message={error?.error} />
      </div>
    );
  } else if (!isLoading && !isError && messages?.length === 0) {
    content = <div>No messages found!.</div>;
  } else if (!isLoading && !isError && messages?.length > 0) {
    content = (
      <>
        <ChatHead message={messages[0]} />
        <Messages id={id} totalCount={totalCount} messages={messages} />
        <Options info={messages[0]} />
      </>
    );
  }

  return (
    <div className="w-full lg:col-span-2 lg:block">
      <div className="w-full grid conversation-row-grid">
        {content}
        {/* <Blank /> */}
      </div>
    </div>
  );
}
