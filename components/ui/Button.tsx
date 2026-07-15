import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-300 will-change-transform hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  solid:
    "bg-gold text-ink hover:shadow-[0_12px_40px_-8px_rgba(212,168,83,0.55)]",
  outline:
    "border border-ink/20 text-ink hover:border-ink hover:bg-ink/5",
  ghost: "text-ink hover:text-gold",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type AsLink = Common & {
  href: string;
  external?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children" | "className">;

type AsButton = Common & {
  href?: undefined;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

export function Button(props: AsLink | AsButton) {
  const { variant = "solid", size = "md", className, children } = props;
  const cls = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    const { href, external, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    void _v; void _s; void _c; void _ch;
    if (external || href.startsWith("http")) {
      return (
        <a className={cls} href={href} target="_blank" rel="noreferrer noopener" {...rest}>
          {children}
        </a>
      );
    }
    // mailto:/tel: and static files (e.g. a PDF in /public) must use a plain
    // anchor, not Next's router-based Link. Files also get a download hint.
    const isProtocol = /^(mailto:|tel:)/.test(href);
    const isFile = href.startsWith("/") && /\.[a-z0-9]+$/i.test(href);
    if (isProtocol || isFile) {
      return (
        <a className={cls} href={href} {...(isFile ? { download: true } : {})} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link className={cls} href={href} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as AsButton;
  void _v; void _s; void _c; void _ch;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
