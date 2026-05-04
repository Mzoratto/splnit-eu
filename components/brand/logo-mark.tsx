import Image from "next/image";

export function LogoMark({
  className = "h-7 w-7",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/icon.svg"
      alt=""
      width={40}
      height={40}
      priority={priority}
      unoptimized
      aria-hidden="true"
      className={["shrink-0", className].join(" ")}
    />
  );
}
