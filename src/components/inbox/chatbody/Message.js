export default function Message({ justify, message, shadow }) {
  return (
    <li className={`flex m-2 justify-${justify}`}>
      <div
        style={shadow}
        className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow"
      >
        <span className="block">{message}</span>
      </div>
    </li>
  );
}
