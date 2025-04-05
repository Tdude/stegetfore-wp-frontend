import Image from 'next/image';

interface WordPressImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export default function WordPressImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  className,
}: WordPressImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
