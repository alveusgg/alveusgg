export function SeenOnStreamBadge() {
  return (
    <div className="absolute right-0 top-0 flex aspect-square w-[80px] rotate-12 items-center text-sm leading-tight  text-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 aspect-square h-full w-full fill-alveus-green drop-shadow"
        viewBox="0 0 24 24"
      >
        <path d="m12 0 2.1 2.6 3.1-1.4.8 3.3h3.4l-.7 3.3 3 1.5-2 2.7 2 2.7-3 1.5.7 3.3H18l-.8 3.3-3-1.4L12 24l-2.1-2.6-3.1 1.4-.8-3.3H2.6l.7-3.3-3-1.5 2-2.7-2-2.7 3-1.5-.7-3.3H6l.8-3.3 3 1.4z" />
      </svg>
      <span className="relative text-center">Seen on stream</span>
    </div>
  );
}
