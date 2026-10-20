import { HeartIcon } from "@/components/icons/icon";

// The parent link carries the `group` class; the heart fills on its hover and focus.
export function HoverHeart() {
  return (
    <span className="relative size-6">
      <HeartIcon className="size-6" />
      <HeartIcon className="absolute inset-0 size-6 fill-red-600 text-red-600 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" />
    </span>
  );
}
