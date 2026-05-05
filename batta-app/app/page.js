import Image from "next/image";

export default function Home() {
  return (
    <div className="relative w-full h-[calc(100dvh-4rem)] bg-black">
      <Image
        src="/images/sk-bricks.jpg"
        alt="SK Bricks"
        fill
        priority
        className="object-cover"
      />
    </div>
  );
}