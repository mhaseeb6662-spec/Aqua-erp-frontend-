import logoImg from '../../assets/branding/aqua-fishing-logo.png';

/**
 * Official Aqua Fishing Academy Logo Component.
 * Ensures consistent branding, proper aspect ratio (object-contain),
 * and high contrast across dark and light surfaces.
 */
export default function AcademyLogo({
  variant = 'default',
  size,
  className = '',
  containerClassName = '',
  alt = 'Aqua Fishing Academy',
  ...props
}) {
  // Preset styling variants
  switch (variant) {
    case 'login':
      return (
        <div className={`flex items-center justify-center ${containerClassName}`}>
          <img
            src={logoImg}
            alt={alt}
            className={`h-16 sm:h-20 w-auto max-w-full object-contain filter drop-shadow-xs ${className}`}
            loading="eager"
            {...props}
          />
        </div>
      );

    case 'login-hero':
      return (
        <div className={`inline-flex items-center justify-center rounded-2xl bg-white/95 p-3 shadow-md backdrop-blur-md border border-white/30 ${containerClassName}`}>
          <img
            src={logoImg}
            alt={alt}
            className={`h-12 sm:h-14 w-auto max-w-full object-contain ${className}`}
            loading="eager"
            {...props}
          />
        </div>
      );

    case 'sidebar':
      return (
        <div className={`flex items-center justify-center rounded-xl bg-white/95 px-3 py-2 shadow-2xs border border-white/30 transition-all hover:bg-white ${containerClassName}`}>
          <img
            src={logoImg}
            alt={alt}
            className={`h-9 w-auto max-w-full object-contain ${className}`}
            loading="eager"
            {...props}
          />
        </div>
      );

    case 'navbar':
      return (
        <div className={`flex items-center ${containerClassName}`}>
          <img
            src={logoImg}
            alt={alt}
            className={`h-8 w-auto max-w-full object-contain ${className}`}
            loading="eager"
            {...props}
          />
        </div>
      );

    case 'invoice':
      return (
        <div className={`flex items-center ${containerClassName}`}>
          <img
            src={logoImg}
            alt={alt}
            className={`h-14 w-auto max-w-full object-contain ${className}`}
            loading="eager"
            {...props}
          />
        </div>
      );

    case 'receipt':
      return (
        <div className={`flex items-center justify-center ${containerClassName}`}>
          <img
            src={logoImg}
            alt={alt}
            className={`h-12 w-auto max-w-full object-contain ${className}`}
            loading="eager"
            {...props}
          />
        </div>
      );

    case 'report':
      return (
        <div className={`flex items-center ${containerClassName}`}>
          <img
            src={logoImg}
            alt={alt}
            className={`h-11 w-auto max-w-full object-contain ${className}`}
            loading="eager"
            {...props}
          />
        </div>
      );

    case 'compact':
      return (
        <img
          src={logoImg}
          alt={alt}
          className={`h-7 w-auto object-contain ${className}`}
          loading="eager"
          {...props}
        />
      );

    default:
      return (
        <img
          src={logoImg}
          alt={alt}
          className={`${size || 'h-10'} w-auto object-contain ${className}`}
          loading="eager"
          {...props}
        />
      );
  }
}
