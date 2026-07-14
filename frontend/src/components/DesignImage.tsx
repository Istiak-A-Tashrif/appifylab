import Image, { type ImageProps } from 'next/image';

type Props = Omit<ImageProps, 'width' | 'height'> & { width?: number; height?: number };

export default function DesignImage({ className, width, height, ...props }: Props) {
  const square = typeof className === 'string' && /(avatar|profile|people|ppl|mini|react|comment|post_img|txt_img|notify|story_img1)/i.test(className);
  const svg = typeof props.src === 'string' && props.src.endsWith('.svg');
  const legacyLocal = typeof props.src === 'string' && /^http:\/\/(localhost|127\.0\.0\.1):3000\/uploads\//.test(props.src);
  return <Image {...props} unoptimized={props.unoptimized ?? (svg || legacyLocal)} className={className} width={width ?? (square ? 100 : 1200)} height={height ?? (square ? 100 : 800)} sizes="(max-width: 768px) 100vw, 50vw" />;
}
